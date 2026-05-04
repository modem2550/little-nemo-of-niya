import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  createPairState,
  getNextPair,
  submitSkip,
  submitResult,
  calculateFinalRanking,
  type PairingState,
} from './pairing';

export const STORAGE_VERSION = 1;


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

  const itemMap = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  const saveResults = useCallback(
    (finalState: PairingState) => {
      const topRanking = calculateFinalRanking(items, finalState)
        .map((item) => ({ ...item, score: finalState.scores[item.id] || 0 }))
        .slice(0, 10) as (T & RankedItemBase)[];

      const data: TopRankingResult<T & RankedItemBase> = {
        version: STORAGE_VERSION,
        timestamp: new Date().toISOString(),
        totalRounds,
        topRanking,
        allScores: finalState.scores,
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
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
    const initialState = createPairState(itemIds);
    setGameProgress({
      ...initialState,
      roundCount: 0,
      currentPair: getNextPair(itemIds, initialState) as [number, number],
    });
    setGameState('playing');
    setHistory([]);
  }, [itemIds]);

  const handleChoice = useCallback(
    (itemId: number) => {
      setGameProgress((prev) => {
        if (prev.currentPair.length !== 2) return prev;
        const [p1, p2] = prev.currentPair as [number, number];
        const loserId = itemId === p1 ? p2 : p1;
        const updatedState = submitResult(itemId, loserId, prev);
        const nextRound = prev.roundCount + 1;

        // Use a shallow copy for history since we are already creating new objects in submitResult
        setHistory((h) => [...h, prev]);

        if (nextRound >= totalRounds) {
          saveResults(updatedState);
          // Prefer requestAnimationFrame or microtask for state transitions
          queueMicrotask(() => setGameState('finished'));
          return { ...updatedState, roundCount: nextRound, currentPair: [] };
        }

        const nextPair = getNextPair(itemIds, updatedState);
        if (nextPair.length !== 2) {
          saveResults(updatedState);
          queueMicrotask(() => setGameState('finished'));
          return { ...updatedState, roundCount: nextRound, currentPair: [] };
        }

        return {
          ...updatedState,
          roundCount: nextRound,
          currentPair: nextPair as [number, number],
        };
      });
    },
    [itemIds, totalRounds, saveResults]
  );

  const handleUndo = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory;
      const previousState = prevHistory[prevHistory.length - 1];
      setGameProgress(previousState);
      return prevHistory.slice(0, -1);
    });
  }, []);

  const handleSkip = useCallback(() => {
    setGameProgress((prev) => {
      if (prev.currentPair.length !== 2) return prev;

      setHistory((h) => [...h, prev]);
      const nextRound = prev.roundCount + 1;

      if (nextRound >= totalRounds) {
        saveResults(prev);
        queueMicrotask(() => setGameState('finished'));
        return { ...prev, roundCount: nextRound, currentPair: [] };
      }

      const skippedState = submitSkip(prev.currentPair[0], prev.currentPair[1], prev);
      const nextPair = getNextPair(itemIds, skippedState);

      if (nextPair.length !== 2) {
        saveResults(skippedState);
        queueMicrotask(() => setGameState('finished'));
        return { ...skippedState, roundCount: nextRound, currentPair: [] };
      }

      return {
        ...skippedState,
        roundCount: nextRound,
        currentPair: nextPair as [number, number],
      };
    });
  }, [itemIds, totalRounds, saveResults]);

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

  // ดึงเฉพาะ scores ออกมาเป็น dependency เพื่อไม่ให้ recalculate ทุกครั้งที่ currentPair เปลี่ยน
  const scores = gameProgress.scores;
  const rankedItems = useMemo(
    () => calculateFinalRanking(items, gameProgress)
      .map((item) => ({ ...item, score: scores[item.id] || 0 }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;  // score first
        if (b.elo !== a.elo) return b.elo - a.elo;           // then ELO
        return a.name.localeCompare(b.name);
      }) as (T & RankedItemBase)[],
    [items, scores]
  );

  const oldRankedItems = useMemo(() => {
    const allScores = oldResults?.allScores ?? {};
    return [...items]
      .map((item) => ({ ...item, score: allScores[item.id] || 0 }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
      }) as (T & RankedItemBase)[];
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
