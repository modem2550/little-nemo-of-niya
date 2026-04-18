import type { Member } from '@/types/member';

const ELO_INITIAL = 1200;
const ELO_K = 32;

export interface PairingState {
    scores: Record<number, number>;
    wins: Record<number, number>;
    losses: Record<number, number>;
    appearances: Record<number, number>;
    elo: Record<number, number>;
    pairHistory: Set<string>;
    pairCounts: Record<string, number>;
    pairSeenCounts: Record<string, number>;
    memberSeenCounts: Record<number, number>;
    recentPairs: string[];
}

export interface RankedMember extends Member {
    score: number;
    wins: number;
    losses: number;
    winRate: number;
    elo: number;
}

function pairKey(a: number, b: number): string {
    return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function eloUpdate(winnerElo: number, loserElo: number): [number, number] {
    const expectedWin = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedLoss = 1 - expectedWin;
    return [
        winnerElo + ELO_K * (1 - expectedWin),
        loserElo + ELO_K * (0 - expectedLoss),
    ];
}

const RECENT_WINDOW = 6;

type PairingPhase = 'exploration' | 'balancing' | 'convergence';

interface PairCandidate {
    pair: [number, number];
    key: string;
    pairSeen: number;
    memberSeen: number;
    eloDiff: number;
    recentIndex: number;
    score: number;
}

function getPhase(state: PairingState, memberIds: number[]): PairingPhase {
    const pairSpace = (memberIds.length * (memberIds.length - 1)) / 2;
    if (pairSpace === 0) return 'exploration';
    const uniqueShown = Object.keys(state.pairSeenCounts).length;
    const coverage = uniqueShown / pairSpace;
    if (coverage < 0.45) return 'exploration';
    if (coverage < 0.85) return 'balancing';
    return 'convergence';
}

function getPhaseWeights(phase: PairingPhase) {
    if (phase === 'exploration') {
        return { pairSeen: 4.0, memberSeen: 6.0, eloDiff: 0.4, cooldown: 12, jitter: 0.05 };
    }
    if (phase === 'balancing') {
        return { pairSeen: 2.0, memberSeen: 7.0, eloDiff: 1.0, cooldown: 10, jitter: 0.04 };
    }
    return { pairSeen: 1.0, memberSeen: 4.0, eloDiff: 3.0, cooldown: 8, jitter: 0.02 };
}

function getMinMaxElo(memberIds: number[], state: PairingState): [number, number] {
    let min = Infinity;
    let max = -Infinity;
    for (const id of memberIds) {
        const value = state.elo[id] ?? ELO_INITIAL;
        if (value < min) min = value;
        if (value > max) max = value;
    }
    return [min, max];
}

function scoreCandidate(
    candidate: PairCandidate,
    phase: PairingPhase,
    maxPairSeen: number,
    maxMemberSeen: number,
    eloRange: number,
): number {
    const w = getPhaseWeights(phase);
    const pairSeenNorm = maxPairSeen > 0 ? candidate.pairSeen / maxPairSeen : 0;
    const memberSeenNorm = maxMemberSeen > 0 ? candidate.memberSeen / maxMemberSeen : 0;
    const eloDiffNorm = eloRange > 0 ? candidate.eloDiff / eloRange : 0;
    const cooldownPenalty = candidate.recentIndex >= 0
        ? (RECENT_WINDOW - candidate.recentIndex) / RECENT_WINDOW
        : 0;
    const jitter = Math.random() * w.jitter;
    return (
        w.pairSeen * pairSeenNorm +
        w.memberSeen * memberSeenNorm +
        w.eloDiff * eloDiffNorm +
        w.cooldown * cooldownPenalty +
        jitter
    );
}

function pickWeightedTop(candidates: PairCandidate[]): [number, number] | [] {
    if (candidates.length === 0) return [];
    const sorted = [...candidates].sort((a, b) => a.score - b.score);
    const topK = Math.max(3, Math.ceil(sorted.length * 0.12));
    const pool = sorted.slice(0, Math.min(topK, sorted.length));
    const weights = pool.map((c) => 1 / (1 + c.score));
    const total = weights.reduce((sum, w) => sum + w, 0);
    let r = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
        r -= weights[i];
        if (r <= 0) return pool[i].pair;
    }
    return pool[0].pair;
}

function withRecentPair(key: string, recentPairs: string[]): string[] {
    const next = [...recentPairs, key];
    if (next.length > RECENT_WINDOW) {
        next.splice(0, next.length - RECENT_WINDOW);
    }
    return next;
}

function withSeenPair(a: number, b: number, state: PairingState): PairingState {
    const key = pairKey(a, b);
    const pairSeenCounts = { ...state.pairSeenCounts };
    const memberSeenCounts = { ...state.memberSeenCounts };
    pairSeenCounts[key] = (pairSeenCounts[key] || 0) + 1;
    memberSeenCounts[a] = (memberSeenCounts[a] || 0) + 1;
    memberSeenCounts[b] = (memberSeenCounts[b] || 0) + 1;
    const recentPairs = withRecentPair(key, state.recentPairs);
    return { ...state, pairSeenCounts, memberSeenCounts, recentPairs };
}

export function createPairState(memberIds: number[]): PairingState {
    const scores: Record<number, number> = {};
    const wins: Record<number, number> = {};
    const losses: Record<number, number> = {};
    const appearances: Record<number, number> = {};
    const elo: Record<number, number> = {};
    const memberSeenCounts: Record<number, number> = {};

    for (const id of memberIds) {
        scores[id] = 0;
        wins[id] = 0;
        losses[id] = 0;
        appearances[id] = 0;
        elo[id] = ELO_INITIAL;
        memberSeenCounts[id] = 0;
    }

    return {
        scores,
        wins,
        losses,
        appearances,
        elo,
        pairHistory: new Set<string>(),
        pairCounts: {},
        pairSeenCounts: {},
        memberSeenCounts,
        recentPairs: [],
    };
}

export function getNextPair(memberIds: number[], state: PairingState): [number, number] | [] {
    if (memberIds.length < 2) return [];
    const phase = getPhase(state, memberIds);
    const [minElo, maxElo] = getMinMaxElo(memberIds, state);
    const eloRange = Math.max(1, maxElo - minElo);

    const candidates: PairCandidate[] = [];
    let maxPairSeen = 0;
    let maxMemberSeen = 0;

    for (let i = 0; i < memberIds.length; i++) {
        for (let j = i + 1; j < memberIds.length; j++) {
            const a = memberIds[i];
            const b = memberIds[j];
            const key = pairKey(a, b);
            const pairSeen = state.pairSeenCounts[key] || 0;
            const memberSeen = (state.memberSeenCounts[a] || 0) + (state.memberSeenCounts[b] || 0);
            const eloDiff = Math.abs((state.elo[a] ?? ELO_INITIAL) - (state.elo[b] ?? ELO_INITIAL));
            const recentIndex = state.recentPairs.lastIndexOf(key);

            if (pairSeen > maxPairSeen) maxPairSeen = pairSeen;
            if (memberSeen > maxMemberSeen) maxMemberSeen = memberSeen;

            candidates.push({
                pair: [a, b],
                key,
                pairSeen,
                memberSeen,
                eloDiff,
                recentIndex,
                score: 0,
            });
        }
    }

    const nonRecent = candidates.filter((c) => c.recentIndex < 0);
    const usable = nonRecent.length > 0 ? nonRecent : candidates;
    const minMemberSeen = Math.min(...memberIds.map((id) => state.memberSeenCounts[id] || 0));
    const underexposed = new Set(
        memberIds.filter((id) => (state.memberSeenCounts[id] || 0) === minMemberSeen),
    );
    const bothUnderexposedPool = usable.filter(
        (c) => underexposed.has(c.pair[0]) && underexposed.has(c.pair[1]),
    );
    const anchorPool = usable.filter(
        (c) => underexposed.has(c.pair[0]) || underexposed.has(c.pair[1]),
    );
    const pool = bothUnderexposedPool.length > 0
        ? bothUnderexposedPool
        : anchorPool.length > 0
            ? anchorPool
            : usable;

    for (const c of pool) {
        c.score = scoreCandidate(c, phase, maxPairSeen, maxMemberSeen, eloRange);
    }

    return pickWeightedTop(pool);
}

export function submitSkip(firstId: number, secondId: number, state: PairingState): PairingState {
    return withSeenPair(firstId, secondId, state);
}

export function submitResult(winnerId: number, loserId: number, state: PairingState): PairingState {
    const seenState = withSeenPair(winnerId, loserId, state);
    const scores = { ...seenState.scores };
    const wins = { ...seenState.wins };
    const losses = { ...seenState.losses };
    const appearances = { ...seenState.appearances };
    const elo = { ...seenState.elo };
    const pairHistory = new Set(seenState.pairHistory);
    const pairCounts = { ...seenState.pairCounts };

    scores[winnerId] = (scores[winnerId] || 0) + 1;
    wins[winnerId] = (wins[winnerId] || 0) + 1;
    losses[loserId] = (losses[loserId] || 0) + 1;
    appearances[winnerId] = (appearances[winnerId] || 0) + 1;
    appearances[loserId] = (appearances[loserId] || 0) + 1;

    const [newWinnerElo, newLoserElo] = eloUpdate(
        elo[winnerId] ?? ELO_INITIAL,
        elo[loserId] ?? ELO_INITIAL,
    );
    elo[winnerId] = newWinnerElo;
    elo[loserId] = newLoserElo;

    const key = pairKey(winnerId, loserId);
    pairHistory.add(key);
    pairCounts[key] = (pairCounts[key] || 0) + 1;

    return {
        ...seenState,
        scores,
        wins,
        losses,
        appearances,
        elo,
        pairHistory,
        pairCounts,
    };
}

function winRate(memberId: number, state: PairingState): number {
    const w = state.wins[memberId] || 0;
    const l = state.losses[memberId] || 0;
    return w + l === 0 ? 0 : w / (w + l);
}

export function calculateFinalRanking(members: Member[], state: PairingState): RankedMember[] {
    return members
        .map((member) => ({
            ...member,
            score: state.scores[member.id] || 0,
            wins: state.wins[member.id] || 0,
            losses: state.losses[member.id] || 0,
            winRate: winRate(member.id, state),
            elo: state.elo[member.id] ?? ELO_INITIAL,
        }))
        .sort((a, b) => {
            if (b.elo !== a.elo) return b.elo - a.elo;
            if (b.wins !== a.wins) return b.wins - a.wins;
            if (b.winRate !== a.winRate) return b.winRate - a.winRate;
            const appA = state.appearances[a.id] || 0;
            const appB = state.appearances[b.id] || 0;
            if (appB !== appA) return appB - appA;
            return a.name.localeCompare(b.name);
        });
}
