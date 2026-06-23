import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  createPairState,
  getNextPair,
  submitSkip,
  submitResult,
  calculateFinalRanking,
  type PairingState,
} from './pairing';

export const STORAGE_VERSION = 1;

const MAX_UNDO_HISTORY = 20;

export type GameState = 'menu' | 'playing' | 'finished' | 'old-results' | 'view-all-ranking';

export interface GameProgress extends PairingState {
  roundCount: number;
  currentPair: [number, number] | [];
}

export interface RankedItemBase {
  id: number;
  name: string;
  score: number;
}

export interface TopRankingResult<T extends RankedItemBase> {
  version: number;
  timestamp: string;
  totalRounds: number;
  topRanking: T[];
  allScores: Record<number, number>;
  allElo: Record<number, number>;
}

export function createEmptyProgress(): GameProgress {
  return {
    ...createPairState([]),
    roundCount: 0,
    currentPair: [],
  };
}

export function useRankingEngine<T extends { id: number; name: string }>(
  items: T[],
  storageKey: string,
  totalRounds: number
) {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [gameProgress, setGameProgress] = useState<GameProgress>(createEmptyProgress());
  const [oldResults, setOldResults] = useState<TopRankingResult<T & RankedItemBase> | null>(null);
  const [history, setHistory] = useState<GameProgress[]>([]);
  const [viewAllSource, setViewAllSource] = useState<'current' | 'old'>('current');

  // Fix #8: Guard against double saveResults calls
  const hasSavedRef = useRef(false);

  const itemMap = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  const saveResults = useCallback(
    (finalState: PairingState) => {
      console.log(`[RankingEngine] Calculating final ranking for ${items.length} items...`);
      const ranked = calculateFinalRanking(items, finalState);
      const topRanking = ranked
        .map((item) => ({ ...item, score: finalState.scores[item.id] || 0 }))
        .slice(0, 10) as (T & RankedItemBase)[];

      console.log(`[RankingEngine] Top 10 calculated. Winner: ${topRanking[0]?.name}`);

      const data: TopRankingResult<T & RankedItemBase> = {
        version: STORAGE_VERSION,
        timestamp: new Date().toISOString(),
        totalRounds,
        topRanking,
        allScores: finalState.scores,
        allElo: finalState.elo,
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log(`[RankingEngine] Results saved to localStorage: ${storageKey}`);
      setOldResults(data);
    },
    [items, storageKey, totalRounds]
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return;
      const data = JSON.parse(stored) as TopRankingResult<T & RankedItemBase>;
      if (data && (data.version === STORAGE_VERSION || !data.version)) {
        setOldResults(data);
      }
    } catch {
      // ignore invalid data
    }
  }, [storageKey]);

  // useCallback: ป้องกัน children ที่รับ startGame เป็น prop re-render โดยไม่จำเป็น
  const startGame = useCallback(() => {
    console.log(`[RankingEngine] Starting game with ${itemIds.length} items. Storage key: ${storageKey}`);
    const initialState = createPairState(itemIds);
    setGameProgress({
      ...initialState,
      roundCount: 0,
      currentPair: getNextPair(itemIds, initialState) as [number, number],
    });
    setGameState('playing');
    setHistory([]);
    hasSavedRef.current = false;
  }, [itemIds, storageKey]);

  // Fix #4: แยก nested state setters — ใช้ ref เก็บ state ก่อนหน้า
  const prevProgressRef = useRef<GameProgress | null>(null);

  const handleChoice = useCallback(
    (itemId: number) => {
      setGameProgress((prev) => {
        if (prev.currentPair.length !== 2) return prev;
        const [p1, p2] = prev.currentPair as [number, number];
        const winner = itemMap.get(itemId);
        const loserId = itemId === p1 ? p2 : p1;
        const loser = itemMap.get(loserId);
        
        console.log(`[RankingEngine] Choice: ${winner?.name} beat ${loser?.name} (Round ${prev.roundCount + 1}/${totalRounds})`);
        
        const updatedState = submitResult(itemId, loserId, prev);
        const nextRound = prev.roundCount + 1;

        // Fix #4: Store prev in ref for history update (done outside this setter)
        prevProgressRef.current = prev;

        if (nextRound >= totalRounds) {
          console.log(`[RankingEngine] Reached total rounds (${totalRounds}). Ending game.`);
          return { ...updatedState, roundCount: nextRound, currentPair: [] };
        }

        const nextPair = getNextPair(itemIds, updatedState);
        if (nextPair.length !== 2) {
          console.log(`[RankingEngine] No more pairs available. Ending game early.`);
          return { ...updatedState, roundCount: nextRound, currentPair: [] };
        }

        return {
          ...updatedState,
          roundCount: nextRound,
          currentPair: nextPair as [number, number],
        };
      });

      // Fix #4 & #5: Update history outside of setGameProgress, with limit
      setHistory((h) => {
        const prev = prevProgressRef.current;
        if (!prev) return h;
        const newHistory = [...h, prev];
        return newHistory.length > MAX_UNDO_HISTORY ? newHistory.slice(-MAX_UNDO_HISTORY) : newHistory;
      });
    },
    [itemIds, totalRounds, itemMap]
  );

  // Fix #4: handleUndo — ไม่ซ้อน state setters อีกต่อไป
  const handleUndo = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory;
      const previousState = prevHistory[prevHistory.length - 1];
      // Fix #4: Use ref to pass data to separate setGameProgress call
      prevProgressRef.current = previousState;
      return prevHistory.slice(0, -1);
    });
    // Read from ref set by the history updater above — React batches these
    // so we need to use a separate mechanism
    setGameProgress((current) => {
      if (!prevProgressRef.current) return current;
      const restored = prevProgressRef.current;
      prevProgressRef.current = null;
      return restored;
    });
  }, []);

  const handleSkip = useCallback(() => {
    setGameProgress((prev) => {
      if (prev.currentPair.length !== 2) return prev;

      // Fix #4: Store prev in ref for history update
      prevProgressRef.current = prev;

      const nextRound = prev.roundCount + 1;

      // Fix #2: Always apply submitSkip before checking finish condition
      const skippedState = submitSkip(prev.currentPair[0], prev.currentPair[1], prev);

      if (nextRound >= totalRounds) {
        return { ...skippedState, roundCount: nextRound, currentPair: [] };
      }

      const nextPair = getNextPair(itemIds, skippedState);

      if (nextPair.length !== 2) {
        return { ...skippedState, roundCount: nextRound, currentPair: [] };
      }

      return {
        ...skippedState,
        roundCount: nextRound,
        currentPair: nextPair as [number, number],
      };
    });

    // Fix #4 & #5: Update history outside, with limit
    setHistory((h) => {
      const prev = prevProgressRef.current;
      if (!prev) return h;
      const newHistory = [...h, prev];
      return newHistory.length > MAX_UNDO_HISTORY ? newHistory.slice(-MAX_UNDO_HISTORY) : newHistory;
    });
  }, [itemIds, totalRounds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (gameProgress.currentPair.length !== 2) return;
      const [leftItem, rightItem] = gameProgress.currentPair;
      if (e.key === 'ArrowLeft') handleChoice(leftItem);
      if (e.key === 'ArrowRight') handleChoice(rightItem);
      if (e.key.toLowerCase() === 's') handleSkip();
      if (e.key.toLowerCase() === 'z') handleUndo();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, gameProgress.currentPair, handleChoice, handleSkip, handleUndo]);

  // Fix #8: Finish condition with guard to prevent double save
  // Also handles early termination when pairing engine runs out of pairs
  // (e.g. isRoundCapped triggers before totalRounds is reached)
  useEffect(() => {
    if (gameState !== 'playing' || hasSavedRef.current) return;

    const reachedTotalRounds = gameProgress.roundCount >= totalRounds;
    const noPairsLeft =
      gameProgress.roundCount > 0 && gameProgress.currentPair.length === 0;

    if (reachedTotalRounds || noPairsLeft) {
      hasSavedRef.current = true;
      console.log(
        `[RankingEngine] Game finished! (rounds: ${gameProgress.roundCount}/${totalRounds}, pairsLeft: ${gameProgress.currentPair.length}) Saving results to ${storageKey}`
      );
      saveResults(gameProgress);
      setGameState('finished');
    }
  }, [gameState, gameProgress, totalRounds, saveResults, storageKey]);

  // Fix #1: เพิ่ม gameProgress.elo เป็น dependency เพื่อให้ ranking อัพเดตตาม ELO ล่าสุด
  const rankedItems = useMemo(
    () => calculateFinalRanking(items, gameProgress)
      .map((item) => ({ ...item, score: gameProgress.scores[item.id] || 0 }))
      .sort((a, b) => {
        if (b.elo !== a.elo) return b.elo - a.elo;           // ELO first (Scientific Real Ranking)
        if (b.score !== a.score) return b.score - a.score;  // then Score
        return a.name.localeCompare(b.name);
      }) as (T & RankedItemBase & { elo: number })[],
    [items, gameProgress.scores, gameProgress.elo]
  );

  const oldRankedItems = useMemo(() => {
    const allScores = oldResults?.allScores ?? {};
    const allElo = oldResults?.allElo ?? {};
    return [...items]
      .map((item) => ({ 
        ...item, 
        score: allScores[item.id] || 0,
        elo: allElo[item.id] ?? 1200 
      }))
      .sort((a, b) => {
        if (b.elo !== a.elo) return b.elo - a.elo;
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
      }) as (T & RankedItemBase & { elo: number })[];
  }, [items, oldResults]);

  // useMemo: หลีกเลี่ยงการหารซ้ำทุก render เมื่อ roundCount ไม่เปลี่ยน
  const progressPercent = useMemo(
    () => totalRounds > 0 ? Math.min(100, Math.round((gameProgress.roundCount / totalRounds) * 100)) : 0,
    [gameProgress.roundCount, totalRounds]
  );

  return {
    gameState,
    setGameState,
    gameProgress,
    oldResults,
    history,
    viewAllSource,
    setViewAllSource,
    startGame,
    handleChoice,
    handleUndo,
    handleSkip,
    rankedItems,
    oldRankedItems,
    progressPercent,
    itemMap
  };
}
