const ELO_INITIAL = 1200;
const RECENT_WINDOW = 12;
const ELO_VOLATILITY_THRESHOLD = 400;
const CONVERGENCE_SAMPLE_SIZE = 60;
const EXPLORATION_SAMPLE_SIZE = 30;
const ELO_RANK_PROXIMITY_DIVISOR = 50;
const ELO_VOLATILITY_DIVISOR_CONVERGENCE = 40;
const ELO_VOLATILITY_DIVISOR_EXPLORATION = 20;
const PAIR_SEEN_PENALTY_EXPLORATION = 5;
const PAIR_SEEN_PENALTY_BALANCED = 2;
const CONVERGENCE_TOP_BONUS = 35;
const RANK_PROXIMITY_MULTIPLIER = 10;
const CONVERGENCE_RANDOMNESS = 0.3;
const EXPLORATION_RANDOMNESS = 2;
const ANCHOR_SELECTION_PERCENTILE = 0.35;
const ANCHOR_SELECTION_MIN = 20;

export const ROUND_CAP_MULTIPLIER = 2.5;

export type PairingStrategy = 'exploration' | 'balanced' | 'convergence' | 'adaptive';

export interface StabilityOptions {
    topN: number;
    threshold: number;
    tolerance: number;
}

export interface EngineOptions {
    strategy?: PairingStrategy;
    seed?: string;
    stability?: StabilityOptions;
}

const DEFAULT_OPTIONS: Required<EngineOptions> = {
    strategy: 'adaptive',
    seed: '',
    stability: {
        topN: 10,
        threshold: 5,
        tolerance: 4,
    }
};

export interface PairingState {
    scores: Record<number, number>;
    wins: Record<number, number>;
    losses: Record<number, number>;
    appearances: Record<number, number>;
    totalAppearances: number;
    elo: Record<number, number>;
    pairHistory: Set<string>;
    pairCounts: Record<string, number>;
    pairSeenCounts: Record<string, number>;
    memberSeenCounts: Record<number, number>;
    recentPairs: Set<string>;

    lastRankings?: number[][];
    isStable?: boolean;

    options: Required<EngineOptions>;
    currentPhase: PairingStrategy;
    justBecameStable?: boolean;

    // cache
    topCache?: number[];
    cachedProgress?: number;
    cachedProgressRound?: number;
}

export interface RankedItem {
    score: number;
    wins: number;
    losses: number;
    winRate: number;
    elo: number;
}

function pairKey(a: number, b: number): string {
    if (a === b) throw new Error(`Cannot pair identical member: ${a}`);
    return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function trimRecentPairs(pairs: Set<string>): Set<string> {
    if (pairs.size <= RECENT_WINDOW) return pairs;
    const iter = pairs.values();
    const next = iter.next();
    if (!next.done) pairs.delete(next.value);
    return pairs;
}

/* ================= IMPROVED RANDOMNESS & FAIRNESS ================= */

/**
 * A robust 32-bit scramble for high-quality randomness.
 * Ensures fair distribution even with linear seeds.
 */
function scramble(n: number): number {
    n = Math.imul(n, 0xb5297a4d) ^ (n >> 8);
    n = Math.imul(n, 0x68e31da4) ^ (n << 8);
    n = Math.imul(n, 0x1b56c4e9) ^ (n >> 8);
    return (n >>> 0) / 4294967296;
}

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
    }
    return hash;
}

function getSeed(state: PairingState, round: number): number | undefined {
    if (!state.options.seed) return;
    return hashString(state.options.seed + round);
}

function createRandom(seed?: number) {
    if (seed === undefined) return Math.random;
    let s = seed;
    return () => scramble(s++);
}

/**
 * Fisher-Yates Partial Shuffle for Subset Selection.
 * Ensures perfect fairness and O(K) efficiency.
 */
function getRandomSubset<T>(arr: T[], count: number, rand: () => number): T[] {
    const n = arr.length;
    if (n === 0) return [];
    const k = Math.min(count, n);
    
    if (k < n * 0.1) {
        const result: T[] = [];
        const seen = new Set<number>();
        while (result.length < k) {
            const idx = Math.floor(rand() * n);
            if (!seen.has(idx)) {
                seen.add(idx);
                result.push(arr[idx]);
            }
        }
        return result;
    }

    const copy = [...arr];
    for (let i = 0; i < k; i++) {
        const j = Math.floor(rand() * (n - i)) + i;
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
    }
    return copy.slice(0, k);
}

/* ================= ELO ================= */

function getK(apps: number) {
    if (apps < 10) return 64;
    if (apps < 25) return 32;
    return 16;
}

function eloUpdate(wElo: number, lElo: number, wApps: number, lApps: number): [number, number] {
    const expected = 1 / (1 + Math.pow(10, (lElo - wElo) / 400));
    return [
        Math.round(wElo + getK(wApps) * (1 - expected)),
        Math.round(lElo + getK(lApps) * (0 - (1 - expected))),
    ];
}

/* ================= CORE ================= */

function getTopIds(ids: number[], state: PairingState, n: number): number[] {
    if (ids.length <= n) {
        return [...ids].sort((a, b) => (state.elo[b] ?? ELO_INITIAL) - (state.elo[a] ?? ELO_INITIAL));
    }
    return [...ids]
        .sort((a, b) => (state.elo[b] ?? ELO_INITIAL) - (state.elo[a] ?? ELO_INITIAL))
        .slice(0, n);
}

export function getProgress(state: PairingState): number {
    if (state.cachedProgress !== undefined && state.cachedProgressRound === state.totalAppearances) {
        return state.cachedProgress;
    }

    const ids = Object.keys(state.elo);
    if (ids.length < 2) return 0;

    const total = state.totalAppearances;
    const target = ids.length * Math.max(Math.log2(ids.length), 15);
    const coverage = Math.min(1, total / target);

    const top = getTopIds(ids.map(Number), state, state.options.stability.topN);
    let diff = 0;
    for (let i = 0; i < top.length - 1; i++) {
        diff += Math.abs(state.elo[top[i]] - state.elo[top[i + 1]]);
    }
    const separation = top.length > 1 ? Math.min(1, (diff / top.length) / 20) : 0;

    const res = Math.min(1, coverage * 0.6 + separation * 0.4);
    
    // We update the state object only when progress is calculated
    state.cachedProgress = res;
    state.cachedProgressRound = state.totalAppearances;
    
    return res;
}

export function isStable(state: PairingState): boolean {
    const { threshold, tolerance } = state.options.stability;
    const hist = state.lastRankings;
    if (!hist || hist.length < threshold) return false;

    const current = hist[hist.length - 1];
    const pos = new Map<number, number>();
    for (let i = 0; i < current.length; i++) pos.set(current[i], i);

    for (let h = 0; h < hist.length - 1; h++) {
        const prev = hist[h];
        let disp = 0;
        for (let i = 0; i < prev.length; i++) {
            const curIdx = pos.get(prev[i]);
            if (curIdx === undefined) return false;
            disp += Math.abs(i - curIdx);
        }
        if (disp > tolerance) return false;
    }
    return true;
}

export function isRoundCapped(state: PairingState): boolean {
    const ids = Object.keys(state.elo);
    if (ids.length < 2) return false;
    return state.totalAppearances >= ids.length * ROUND_CAP_MULTIPLIER * 2;
}

export function shouldStop(state: PairingState): boolean {
    const stable = isStable(state);
    if (isRoundCapped(state) && stable) return true;
    return stable && getProgress(state) > 0.85;
}

function phase(state: PairingState): PairingStrategy {
    if (state.options.strategy !== 'adaptive') return state.options.strategy;
    const p = getProgress(state);
    if (p < 0.4) return 'exploration';
    if (p < 0.75) return 'balanced';
    return 'convergence';
}

/* ================= STATE ================= */

export function createPairState(ids: number[], options?: EngineOptions): PairingState {
    const opt = {
        strategy: options?.strategy ?? DEFAULT_OPTIONS.strategy,
        seed: options?.seed ?? DEFAULT_OPTIONS.seed,
        stability: { ...DEFAULT_OPTIONS.stability, ...options?.stability }
    };

    const s: PairingState = {
        scores: {}, wins: {}, losses: {}, appearances: {},
        totalAppearances: 0,
        elo: {}, pairHistory: new Set(), pairCounts: {},
        pairSeenCounts: {}, memberSeenCounts: {}, recentPairs: new Set(),
        lastRankings: [], isStable: false,
        options: opt,
        currentPhase: 'exploration',
    };

    for (const id of ids) {
        s.scores[id] = 0; s.wins[id] = 0; s.losses[id] = 0;
        s.appearances[id] = 0; s.elo[id] = ELO_INITIAL;
        s.memberSeenCounts[id] = 0;
    }

    return s;
}

/* ================= PAIRING ================= */

export function getNextPair(ids: number[], state: PairingState): [number, number] | [] {
    if (ids.length < 2 || isRoundCapped(state)) return [];

    const round = state.pairHistory.size;
    const rand = createRandom(getSeed(state, round));
    const currentPhase = phase(state);
    const isConv = currentPhase === 'convergence';
    const isExp = currentPhase === 'exploration';

    const anchorLimit = Math.max(ANCHOR_SELECTION_MIN, Math.floor(ids.length * ANCHOR_SELECTION_PERCENTILE));
    let anchor: number;

    if (ids.length > 300) {
        const candidates = getRandomSubset(ids, 20, rand);
        anchor = candidates[0];
        let bestVal = isExp ? (state.appearances[anchor] || 0) : (state.elo[anchor] || ELO_INITIAL);
        for (let i = 1; i < candidates.length; i++) {
            const c = candidates[i];
            const val = isExp ? (state.appearances[c] || 0) : (state.elo[c] || ELO_INITIAL);
            if (isExp ? (val < bestVal) : (val > bestVal)) {
                bestVal = val; anchor = c;
            }
        }
    } else {
        const sorted = [...ids].sort((a, b) => {
            if (isExp) return (state.appearances[a] || 0) - (state.appearances[b] || 0);
            return (state.elo[b] ?? ELO_INITIAL) - (state.elo[a] ?? ELO_INITIAL);
        });
        anchor = sorted[Math.floor(rand() * Math.min(anchorLimit, sorted.length))];
    }

    const aElo = state.elo[anchor] ?? ELO_INITIAL;
    const recent = state.recentPairs;
    const sample = getRandomSubset(ids, isConv ? CONVERGENCE_SAMPLE_SIZE : EXPLORATION_SAMPLE_SIZE, rand);
    const top = isConv ? new Set(getTopIds(ids, state, state.options.stability.topN)) : null;

    let best = -1;
    let bestScore = -Infinity;

    for (let i = 0; i < sample.length; i++) {
        const b = sample[i];
        if (b === anchor) continue;
        
        const key = pairKey(anchor, b);
        if (recent.has(key)) continue;

        const bElo = state.elo[b] ?? ELO_INITIAL;
        const diff = Math.abs(aElo - bElo);

        let score = (ELO_VOLATILITY_THRESHOLD - (diff > ELO_VOLATILITY_THRESHOLD ? ELO_VOLATILITY_THRESHOLD : diff)) / 
                    (isConv ? ELO_VOLATILITY_DIVISOR_CONVERGENCE : ELO_VOLATILITY_DIVISOR_EXPLORATION);

        const seen = state.pairSeenCounts[key] || 0;
        if (seen > 0) score -= seen * (isExp ? PAIR_SEEN_PENALTY_EXPLORATION : PAIR_SEEN_PENALTY_BALANCED);

        if (top && top.has(anchor) && top.has(b)) score += CONVERGENCE_TOP_BONUS;
        if (isConv) score += RANK_PROXIMITY_MULTIPLIER / (1 + (diff * 0.02));
        
        score += rand() * (isConv ? CONVERGENCE_RANDOMNESS : EXPLORATION_RANDOMNESS);

        if (score > bestScore) {
            bestScore = score; best = b;
        }
    }

    if (best === -1) {
        for (const x of ids) if (x !== anchor) return [anchor, x];
    }

    return [anchor, best];
}

/* ================= ACTIONS ================= */

export function submitSkip(a: number, b: number, s: PairingState): PairingState {
    const key = pairKey(a, b);
    const updatedRecentPairs = new Set(s.recentPairs);
    updatedRecentPairs.delete(key); updatedRecentPairs.add(key);
    trimRecentPairs(updatedRecentPairs);

    return {
        ...s,
        pairSeenCounts: { ...s.pairSeenCounts, [key]: (s.pairSeenCounts[key] || 0) + 1 },
        recentPairs: updatedRecentPairs,
        cachedProgress: undefined
    };
}

export function submitResult(w: number, l: number, s: PairingState): PairingState {
    const key = pairKey(w, l);
    const [we, le] = eloUpdate(s.elo[w], s.elo[l], s.appearances[w], s.appearances[l]);
    const nextElo = { ...s.elo, [w]: we, [l]: le };

    const top = getTopIds(Object.keys(nextElo).map(Number), s, s.options.stability.topN);
    const hist = [...(s.lastRankings || []), top].slice(-s.options.stability.threshold);

    const updatedRecentPairs = new Set(s.recentPairs);
    updatedRecentPairs.delete(key); updatedRecentPairs.add(key);
    trimRecentPairs(updatedRecentPairs);

    const next: PairingState = {
        ...s,
        scores: { ...s.scores, [w]: (s.scores[w] || 0) + 1 },
        wins: { ...s.wins, [w]: (s.wins[w] || 0) + 1 },
        losses: { ...s.losses, [l]: (s.losses[l] || 0) + 1 },
        appearances: { ...s.appearances, [w]: (s.appearances[w] || 0) + 1, [l]: (s.appearances[l] || 0) + 1 },
        totalAppearances: s.totalAppearances + 2,
        elo: nextElo,
        pairHistory: new Set(s.pairHistory).add(key),
        pairSeenCounts: { ...s.pairSeenCounts, [key]: (s.pairSeenCounts[key] || 0) + 1 },
        recentPairs: updatedRecentPairs,
        lastRankings: hist,
        cachedProgress: undefined
    };

    next.isStable = isStable(next);
    next.justBecameStable = next.isStable && !s.isStable;
    next.currentPhase = phase(next);

    return next;
}

/* ================= FINAL ================= */

export function calculateFinalRanking<T extends { id: number; name: string }>(
    items: T[],
    state: PairingState
): (T & RankedItem)[] {
    return [...items]
        .map(i => {
            const w = state.wins[i.id] || 0;
            const l = state.losses[i.id] || 0;
            return {
                ...i,
                score: state.scores[i.id] || 0,
                wins: w,
                losses: l,
                winRate: w + l > 0 ? w / (w + l) : 0,
                elo: state.elo[i.id] ?? ELO_INITIAL
            } as unknown as T & RankedItem;
        })
        .sort((a, b) => {
            if (b.elo !== a.elo) return b.elo - a.elo;
            if (b.wins !== a.wins) return b.wins - a.wins;
            return a.name.localeCompare(b.name);
        });
}