import { useState, useEffect, useCallback, useMemo, useRef, forwardRef, type CSSProperties } from 'react';

import {
    createPairState,
    getNextPair,
    submitSkip,
    submitResult,
    calculateFinalRanking,
    type PairingState,
} from '../pairing';

import type { Member } from '@/types/member';

const STORAGE_VERSION = 1;
const LONG_PRESS_THRESHOLD = 500; // ms

const brandNames: Record<string, string> = {
    BNK48: 'BNK48',
    CGM48: 'CGM48',
    '48th': '48th Group'
};

interface MemberRankingGameProps {
    members: Member[];
    storageKey: string;
    totalRounds: number;
    primaryColor: string;
    primaryGradient?: string;
    brand: 'BNK48' | 'CGM48' | '48th';
}

interface TopRankingResult {
    version: number;
    timestamp: string;
    totalRounds: number;
    topRanking: (Member & { score: number })[];
    allScores: Record<number, number>;
}

interface ShareCardRef {
    generateImage: () => Promise<string>;
}

interface ResultShareCardProps {
    winner: Member;
    rankResults: (Member & { score: number })[];
    primaryColor: string;
    primaryGradient?: string;
    brandName?: string;
    cardId: string;
}

type GameState = 'menu' | 'playing' | 'finished' | 'old-results' | 'view-all-ranking';

interface GameProgress extends PairingState {
    roundCount: number;
    currentPair: [number, number] | [];
}

type RankingThemeStyle = CSSProperties & {
    '--ranking-primary': string;
    '--ranking-primary-gradient': string;
    '--ranking-primary-alpha': string;
    '--rp-accent': string;
};

function createEmptyProgress(): GameProgress {
    return {
        scores: {},
        appearances: {},
        pairHistory: new Set(),
        wins: {},
        losses: {},
        elo: {},
        pairCounts: {},
        pairSeenCounts: {},
        memberSeenCounts: {},
        recentPairs: [],
        roundCount: 0,
        currentPair: [],
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// RESULT SHARE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const ResultShareCard = forwardRef<ShareCardRef, ResultShareCardProps>(
    ({ winner, rankResults, primaryColor, primaryGradient, brandName = '48th Group', cardId }, ref) => {
        const cardRef = useRef<HTMLDivElement>(null);
        const [isDownloading, setIsDownloading] = useState(false);
        const [errorMessage, setErrorMessage] = useState<string | null>(null);

        const generateImage = useCallback(async () => {
            if (!cardRef.current) throw new Error("Ref not ready");
            setIsDownloading(true);
            try {
                // Wait for images to fully load and render
                await new Promise(resolve => setTimeout(resolve, 800));

                const canvas = await new Promise<HTMLCanvasElement>((resolve, reject) => {
                    if ((window as any).html2canvas) {
                        (window as any).html2canvas(cardRef.current, {
                            scale: 2,
                            useCORS: true,
                            allowTaint: true,
                            backgroundColor: '#fff',
                            logging: false,
                            imageTimeout: 10000, // ⬆️ เพิ่มเวลา timeout สำหรับโหลดรูป
                            ignoreElements: (element: Element) => element.tagName === 'SCRIPT'
                        }).then(resolve).catch(reject);
                        return;
                    }
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                    script.onload = () => {
                        const html2canvas = (window as any).html2canvas;
                        html2canvas(cardRef.current, {
                            scale: 2,
                            useCORS: true,
                            allowTaint: true,
                            backgroundColor: '#fff',
                            logging: false,
                            imageTimeout: 10000,
                            ignoreElements: (element: Element) => element.tagName === 'SCRIPT'
                        }).then(resolve).catch(reject);
                    };
                    script.onerror = () => reject(new Error('Failed to load html2canvas'));
                    document.head.appendChild(script);
                });

                return canvas.toDataURL('image/png');
            } finally {
                setIsDownloading(false);
            }
        }, []);

        useEffect(() => {
            if (ref && typeof ref === 'object') {
                ref.current = { generateImage };
            }
        }, [generateImage, ref]);

        if (!winner) return null;

        const top10 = rankResults.slice(0, 10);
        const dateString = new Date().toLocaleDateString('en-GB');

        return (
            <div
                ref={cardRef}
                id={cardId}
                style={{
                    position: 'fixed',
                    top: -9999,
                    left: 0,
                    zIndex: -9999,
                    pointerEvents: 'none',
                    width: '1080px',
                    height: '1350px',
                    fontFamily: "'Outfit', 'Noto Sans Thai', sans-serif",
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                }}
            >
                {/* BACKGROUND IMAGE */}
                <img
                    src="/img/bg-ranking-member.png"
                    crossOrigin="anonymous"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center center',
                        zIndex: 0,
                        display: 'block',
                    }}
                    alt="card-background"
                    onError={() => { /* Background image failed to load */ }}
                />

                {/* CONTENT AREA */}
                <div
                    style={{
                        position: 'absolute',
                        top: '26%',
                        left: '7%',
                        right: '7%',
                        bottom: '13%',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2rem',
                        padding: '0 150px',
                        boxSizing: 'border-box',
                    }}
                >
                    {/* HEADER */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        <div>
                            <h1
                                style={{
                                    fontSize: 42,
                                    fontWeight: 900,
                                    margin: 0,
                                    lineHeight: 1,
                                    color: '#3d2c1e',
                                    letterSpacing: '-1px',
                                }}
                            >
                                {brandName}
                            </h1>
                            <p
                                style={{
                                    fontSize: 16,
                                    fontWeight: 600,
                                    margin: '4px 0 0',
                                    color: primaryColor,
                                }}
                            >
                                My Oshi Ranking Results
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: 12, fontWeight: 800, margin: 0, color: '#bbb', textTransform: 'uppercase', letterSpacing: 1 }}>
                                Date
                            </p>
                            <p style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#3d2c1e' }}>
                                {dateString}
                            </p>
                        </div>
                    </div>

                    {/* WINNER CARD */}
                    <div
                        style={{
                            padding: '0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3.5rem',
                            width: '100%',
                            boxSizing: 'border-box',
                        }}
                    >
                        {/* Profile */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div
                                style={{
                                    width: 220,
                                    height: 220,
                                    borderRadius: '50%',
                                    padding: 4,
                                    background: primaryGradient || primaryColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    boxSizing: 'border-box',
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        backgroundImage: `url(${winner.profile_image_url})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center top',
                                        border: '6px solid #fff',
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: 2,
                                    right: 8,
                                    background: '#FFD700',
                                    width: 65,
                                    height: 65,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '4px solid #fff',
                                }}
                            >
                                <span style={{ fontSize: 24 }}>👑</span>
                            </div>
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                                style={{
                                    fontSize: 13,
                                    fontWeight: 800,
                                    color: primaryColor,
                                    margin: 0,
                                    letterSpacing: 2,
                                    textTransform: 'uppercase',
                                }}
                            >
                                The #1 Pick
                            </p>
                            <h2
                                style={{
                                    fontSize: 58,
                                    fontWeight: 900,
                                    margin: '2px 0 10px',
                                    color: '#222233',
                                    lineHeight: 0.9,
                                    letterSpacing: '-2px',
                                }}
                            >
                                {winner.name}
                            </h2>
                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    background: primaryGradient || primaryColor,
                                    color: '#fff',
                                    padding: '6px 16px',
                                    borderRadius: 100,
                                    fontSize: 15,
                                    fontWeight: 700,
                                }}
                            >
                                {winner.brand}
                                <span style={{ margin: '0 8px', opacity: 0.5 }}>|</span>
                                {winner.gen}
                            </div>
                        </div>
                    </div>

                    {/* RANKING GRID 2-10 */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '32px',
                            width: '100%',
                        }}
                    >
                        {top10.slice(1).map((m, i) => {
                            const rank = i + 2;
                            return (
                                <div
                                    key={m.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 34,
                                            height: 34,
                                            background: rank === 2 ? '#E5E7EB' : rank === 3 ? '#FEF3C7' : '#f9fafb',
                                            color: rank === 2 ? '#374151' : rank === 3 ? '#92400E' : '#6b7280',
                                            borderRadius: 10,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 900,
                                            fontSize: 14,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {rank}
                                    </div>
                                    <div
                                        style={{
                                            width: 65,
                                            height: 65,
                                            minWidth: 65,
                                            minHeight: 65,
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '50%',
                                                backgroundImage: `url(${m.profile_image_url})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center top',
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontWeight: 800,
                                                fontSize: 32,
                                                color: '#222233',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {m.name}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 700,
                                                color: '#999',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            {m.brand} • {m.gen}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {errorMessage && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 20,
                            right: 20,
                            background: '#ef4444',
                            color: '#fff',
                            padding: '10px 20px',
                            borderRadius: 12,
                            zIndex: 100,
                            fontWeight: 700,
                        }}
                    >
                        {errorMessage}
                    </div>
                )}
            </div>
        );
    }
);

ResultShareCard.displayName = 'ResultShareCard';

// ═══════════════════════════════════════════════════════════════════════════
// DOWNLOAD BUTTON WITH LONG-PRESS DETECTION
// ═══════════════════════════════════════════════════════════════════════════

interface DownloadButtonProps {
    imageUrl: string;
    isLoading: boolean;
    primaryColor: string;
    primaryGradient?: string;
}

function DownloadButton({ imageUrl, isLoading, primaryColor, primaryGradient }: DownloadButtonProps) {
    const [isPressed, setIsPressed] = useState(false);
    const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const linkRef = useRef<HTMLAnchorElement>(null);

    const handleMouseDown = useCallback(() => {
        setIsPressed(true);
        pressTimerRef.current = setTimeout(() => {
            if (linkRef.current) {
                linkRef.current.click();
            }
        }, LONG_PRESS_THRESHOLD);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsPressed(false);
        if (pressTimerRef.current) {
            clearTimeout(pressTimerRef.current);
            pressTimerRef.current = null;
        }
    }, []);

    const handleTouchStart = useCallback(() => {
        setIsPressed(true);
        pressTimerRef.current = setTimeout(() => {
            if (linkRef.current) {
                linkRef.current.click();
            }
        }, LONG_PRESS_THRESHOLD);
    }, []);

    const handleTouchEnd = useCallback(() => {
        setIsPressed(false);
        if (pressTimerRef.current) {
            clearTimeout(pressTimerRef.current);
            pressTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            if (pressTimerRef.current) {
                clearTimeout(pressTimerRef.current);
            }
        };
    }, []);

    if (isLoading) {
        return (
            <button
                type="button"
                className="ranking-planner-skin__cta"
                style={{
                    background: primaryGradient ?? primaryColor,
                    opacity: 0.65,
                }}
                disabled
            >
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                กำลังเตรียมรูป...
            </button>
        );
    }

    return (
        <>
            <a
                ref={linkRef}
                href={imageUrl}
                download={`oshi-ranking-${new Date().getTime()}.png`}
                style={{ display: 'none' }}
            />
            <button
                type="button"
                className="ranking-planner-skin__ctaGhost"
                onClick={() => linkRef.current?.click()}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                aria-pressed={isPressed}
            >
                <i className="fa-solid fa-download" aria-hidden="true"></i>
                บันทึกภาพ
            </button>
        </>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW ALL RANKING SECTION
// ═══════════════════════════════════════════════════════════════════════════

interface ViewAllRankingProps {
    rankResults: (Member & { score: number })[];
    primaryColor: string;
    onBack: () => void;
}

function ViewAllRanking({ rankResults, primaryColor, onBack }: ViewAllRankingProps) {
    const skinStyle = {
        '--ranking-primary': primaryColor,
        '--rp-accent': primaryColor,
    } as CSSProperties;

    return (
        <section className="ranking-view-all d-flex flex-column" style={skinStyle}>
            <div className="ranking-view-all__shell d-flex flex-column">
                <div className="ranking-view-all__header">
                    <div className="d-flex align-items-center justify-content-between gap-3">
                        <h2 className="ranking-view-all__title">Oshi Ranking ทั้งหมด</h2>
                        <button type="button" className="ranking-view-all__close" onClick={onBack} aria-label="ปิด">
                            <i className="fa-solid fa-times" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>

                <div className="ranking-view-all__list">
                    {rankResults.map((member, index) => (
                        <RankingRow
                            key={member.id}
                            member={member}
                            rank={index + 1}
                            primaryColor={primaryColor}
                        />
                    ))}
                </div>

                <div className="ranking-view-all__footer">
                    <small>รวมทั้งหมด {rankResults.length} คน</small>
                </div>
            </div>
        </section>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GAME COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function MemberRankingGame({
    members = [],
    storageKey = 'ranking_results',
    totalRounds = 50,
    primaryColor = '#292848',
    primaryGradient,
    brand = '48th',
}: MemberRankingGameProps) {
    const [gameState, setGameState] = useState<GameState>('menu');
    const [gameProgress, setGameProgress] = useState<GameProgress>(createEmptyProgress());
    const [oldResults, setOldResults] = useState<TopRankingResult | null>(null);
    const [history, setHistory] = useState<GameProgress[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    useEffect(() => {
        if (gameState === 'finished' || gameState === 'old-results') {
            if (resultImageUrl || isGeneratingImage) return;

            const triggerGen = async () => {
                setIsGeneratingImage(true);
                setErrorMessage(null);

                let retries = 30; // ⬆️ เพิ่มจำนวนครั้งในการรอ ref
                while (!shareCardRef.current && retries > 0) {
                    await new Promise(r => setTimeout(r, 100));
                    retries--;
                }

                if (shareCardRef.current) {
                    try {
                        const url = await shareCardRef.current.generateImage();
                        setResultImageUrl(url);
                    } catch (err) {
                        // Image generation error — error message is set for user feedback
                        setErrorMessage('เกิดข้อผิดพลาดในการสร้างรูปผลลัพธ์ โปรดลองอีกครั้ง');
                    }
                } else {
                    setErrorMessage('ไม่สามารถสร้างรูปผลลัพธ์ได้ (Missing Ref)');
                }
                setIsGeneratingImage(false);
            };

            triggerGen();
        } else {
            setResultImageUrl(null);
            setIsGeneratingImage(false);
        }
    }, [gameState]);

    const shareCardRef = useRef<ShareCardRef>(null);

    const memberMap = useMemo(() => {
        const map = new Map<number, Member>();
        members.forEach((m) => map.set(m.id, m));
        return map;
    }, [members]);

    const memberIds = useMemo(() => members.map((m) => m.id), [members]);

    const loadOldResults = useCallback(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (!stored) return;

            const data = JSON.parse(stored) as TopRankingResult;
            if (data && (data.version === STORAGE_VERSION || !data.version)) {
                setOldResults(data);
            }
        } catch (e) {
            // Safe property access for results failed — silent failure for non-critical load
        }
    }, [storageKey]);

    useEffect(() => {
        loadOldResults();
    }, [loadOldResults]);

    const saveResults = useCallback(
        (finalState: PairingState) => {
            try {
                const topRanking = calculateFinalRanking(members, finalState)
                    .map((m) => ({
                        id: m.id,
                        name: m.name,
                        brand: m.brand,
                        gen: m.gen,
                        team: m.team,
                        profile_image_url: m.profile_image_url,
                        score: finalState.scores[m.id] || 0,
                    }));

                const data: TopRankingResult = {
                    version: STORAGE_VERSION,
                    timestamp: new Date().toISOString(),
                    totalRounds,
                    topRanking: topRanking.slice(0, 10),
                    allScores: finalState.scores,
                };

                localStorage.setItem(storageKey, JSON.stringify(data));
                setOldResults(data);
            } catch (e) {
                // Storage commit failed — silent failure for non-critical save
            }
        },
        [members, storageKey, totalRounds]
    );

    const startGame = () => {
        // Preload member images for capture readiness
        members.forEach((m) => {
            if (m.profile_image_url) {
                const img = new Image();
                img.src = m.profile_image_url;
            }
        });

        const initialState = createPairState(memberIds);
        setGameProgress({
            ...initialState,
            roundCount: 0,
            currentPair: getNextPair(memberIds, initialState) as [number, number],
        });
        setGameState('playing');
        setHistory([]);
    };

    const handleChoice = useCallback(
        (memberId: number) => {
            setGameProgress((prev) => {
                if (prev.currentPair.length !== 2) return prev;

                const [p1, p2] = prev.currentPair as [number, number];
                const loserId = memberId === p1 ? p2 : p1;

                const updatedState = submitResult(memberId, loserId, prev);
                const nextRound = prev.roundCount + 1;

                setHistory((h) => [...h, structuredClone(prev)]);

                if (nextRound >= totalRounds) {
                    saveResults(updatedState);
                    setTimeout(() => setGameState('finished'), 0);
                    return {
                        ...updatedState,
                        roundCount: nextRound,
                        currentPair: [],
                    };
                }

                const nextPair = getNextPair(memberIds, updatedState);
                return {
                    ...updatedState,
                    roundCount: nextRound,
                    currentPair: nextPair.length === 2 ? (nextPair as [number, number]) : [],
                };
            });
        },
        [memberIds, saveResults, totalRounds]
    );

    const resetGame = () => {
        setGameState('menu');
        setHistory([]);
        setGameProgress(createEmptyProgress());
        setErrorMessage(null);
    };

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

            setHistory((h) => [...h, structuredClone(prev)]);

            const nextRound = prev.roundCount + 1;

            if (nextRound >= totalRounds) {
                saveResults(prev);
                setTimeout(() => setGameState('finished'), 0);
                return {
                    ...prev,
                    roundCount: nextRound,
                    currentPair: [],
                };
            }

            const skippedState = submitSkip(prev.currentPair[0], prev.currentPair[1], prev);

            const nextPair = getNextPair(memberIds, skippedState);
            return {
                ...skippedState,
                roundCount: nextRound,
                currentPair: nextPair.length === 2 ? (nextPair as [number, number]) : [],
            };
        });
    }, [memberIds, totalRounds, saveResults]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== 'playing') return;

            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }

            if (gameProgress.currentPair.length === 2) {
                const [p1, p2] = gameProgress.currentPair;
                if (e.key === 'ArrowLeft') handleChoice(p1);
                else if (e.key === 'ArrowRight') handleChoice(p2);
                else if (e.key.toLowerCase() === 's') handleSkip();
            }

            if (e.key.toLowerCase() === 'z') {
                handleUndo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, gameProgress.currentPair, handleChoice, handleSkip, handleUndo]);

    const themeStyle: RankingThemeStyle = {
        '--ranking-primary': primaryColor,
        '--ranking-primary-gradient': primaryGradient ?? primaryColor,
        '--ranking-primary-alpha': `${primaryColor}33`,
        '--rp-accent': primaryColor,
    } as RankingThemeStyle;

    const currentTop10 = useMemo(() => {
        if (gameState !== 'finished') return [];
        return calculateFinalRanking(members, gameProgress)
            .slice(0, 10)
            .map((m) => ({ ...m, score: gameProgress.scores[m.id] || 0 }));
    }, [members, gameProgress, gameState]);

    const currentAllRanking = useMemo(() => {
        if (gameState !== 'finished' && gameState !== 'view-all-ranking') return [];
        return calculateFinalRanking(members, gameProgress)
            .map((m) => ({ ...m, score: gameProgress.scores[m.id] || 0 }));
    }, [members, gameProgress, gameState]);

    const progressPercent =
        totalRounds > 0 ? Math.min(100, Math.round((gameProgress.roundCount / totalRounds) * 100)) : 0;

    // VIEW ALL RANKING STATE
    if (gameState === 'view-all-ranking') {
        return (
            <ViewAllRanking
                rankResults={currentAllRanking}
                primaryColor={primaryColor}
                onBack={() => setGameState('finished')}
            />
        );
    }

    // MENU STATE
    if (gameState === 'menu') {
        return (
            <div
                className="ranking-container d-flex flex-column align-items-center justify-content-center w-100"
                style={themeStyle}
            >
                <div className="ranking-planner-skin ranking-menu-content w-100">
                    <header className="ranking-planner-skin__intro">
                        <h1 className="ranking-planner-skin__title">
                            พร้อมจะค้นพบโอชิอันดับ 1
                            <br />
                            ของคุณหรือยัง?
                        </h1>
                        <p className="ranking-planner-skin__lead">
                            ค้นหาว่าใครคือที่สุดของใจคุณ จากเมมเบอร์ {members.length} คน
                        </p>
                    </header>

                    <article className="ranking-planner-skin__card" aria-labelledby="ranking-menu-card-heading">
                        <div className="ranking-planner-skin__cardBody">
                            <h2 id="ranking-menu-card-heading" className="h6 fw-bold mb-0" style={{ color: 'var(--c-content)' }}>
                                พร้อมแล้วหรือยัง?
                            </h2>
                            <p className="ranking-planner-skin__desc">
                                ที่จะโอชิในตัวจิงของคุณณณณณ​ 🫵
                            </p>
                            <div className="ranking-planner-skin__actions" style={{ flexWrap: 'nowrap', flexDirection: 'row' }}>
                                <button
                                    type="button"
                                    className="ranking-planner-skin__ctaGhost"
                                    onClick={startGame}
                                >
                                    เริ่มเล่นเลย
                                </button>
                                {oldResults && (
                                    <button
                                        type="button"
                                        className="ranking-planner-skin__ctaGhost"
                                        onClick={() => setGameState('old-results')}
                                    >
                                        <i className="fa-solid fa-clock-rotate-left" aria-hidden="true"></i>
                                        ผลลัพธ์ก่อนหน้า
                                    </button>
                                )}
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        );
    }

    // FINISHED / OLD RESULTS STATE
    if (gameState === 'finished' || gameState === 'old-results') {
        const sourceData = gameState === 'finished' ? currentTop10 : oldResults?.topRanking;
        const winner = sourceData?.[0];

        return (
            <section
                className="sec-result pt-3 pb-5"
                id="sec_result"
                style={{ ...themeStyle, display: 'block' }}
            >
                <div className="ranking-planner-skin__resultBlock">
                    <header className="ranking-planner-skin__intro ranking-planner-skin__intro--tight">
                        <h2 className='h5' style={{ color: primaryGradient ?? primaryColor }}>
                            {brandNames[brand]}'s Member Ranking Sort
                        </h2>
                        <p className='h4 fw-bold'>
                            {gameState === 'finished' ? 'ผลการจัดอันดับของคุณ' : 'ผลลัพธ์ที่บันทึกไว้'}
                        </p>
                    </header>

                    {isGeneratingImage ? (
                        <div className="text-center py-5 my-4">
                            <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: primaryColor }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="fw-bold" style={{ color: 'var(--c-content-secondary)' }}>
                                กำลังประมวลผลรูปภาพผลลัพธ์...
                            </p>
                        </div>
                    ) : resultImageUrl ? (
                        <div className="text-center">
                            <div className="ranking-planner-skin__figure mb-4 mx-auto shadow-sm" style={{ maxWidth: '500px' }}>
                                <img
                                    className="img-fluid d-block mx-auto"
                                    src={resultImageUrl}
                                    alt="Ranking Results"
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                            <p className='mb-1'><small>(กดค้างเพื่อดาวน์โหลดรูป)</small></p>
                            <div className='ranking-planner-skin__actions'>
                                <DownloadButton
                                    imageUrl={resultImageUrl}
                                    isLoading={false}
                                    primaryColor={primaryColor}
                                    primaryGradient={primaryGradient}
                                />
                            </div>
                            <hr style={{ maxWidth: '500px', margin: '1rem auto' }} />
                            <p className='mb-1'>แชร์ Ranking ของคุณบน <i className="fa-brands fa-x-twitter"></i></p>
                            <h3 className="fw-bold mb-4" style={{ color: primaryGradient ?? primaryColor }}>#TheBestYouOshi</h3>
                            <div className="ranking-planner-skin__actions">
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('#TheBestYouOshi')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ranking-planner-skin__ctaX"
                                >
                                    แชร์ไปยัง <i className="fa-brands fa-x-twitter" aria-hidden="true"></i>
                                </a>
                                <button
                                    type="button"
                                    className="ranking-planner-skin__ctaGhost"
                                    onClick={() => setGameState('view-all-ranking')}
                                >
                                    <i className="fa-solid fa-list" aria-hidden="true"></i>
                                    ดู Ranking ทั้งหมด
                                </button>
                                <button type="button" className="ranking-planner-skin__ctaGhost" onClick={startGame}>
                                    <i className="fa-solid fa-rotate-right" aria-hidden="true"></i>
                                    เล่นใหม่อีกครั้ง
                                </button>
                            </div>
                        </div>
                    ) : errorMessage ? (
                        <div className="text-center text-danger fw-bolder mt-4">
                            {errorMessage}
                            <br />
                            <button type="button" className="ranking-planner-skin__ctaGhost mt-3" onClick={resetGame}>
                                กลับไปหน้าแรก
                            </button>
                        </div>
                    ) : null}

                    <ResultShareCard
                        ref={shareCardRef}
                        cardId="share-result-card"
                        winner={winner as Member}
                        rankResults={(sourceData || []) as (Member & { score: number })[]}
                        primaryColor={primaryColor}
                        primaryGradient={primaryGradient}
                        brandName={brandNames[brand]}
                    />
                </div>
            </section>
        );
    }

    // PLAYING STATE
    if (gameProgress.currentPair.length !== 2) return null;

    const [id1, id2] = gameProgress.currentPair as [number, number];
    const m1 = memberMap.get(id1);
    const m2 = memberMap.get(id2);

    if (!m1 || !m2) return null;

    return (
        <div className="ranking-game-play ranking-container w-100 px-3" style={themeStyle}>
            <div className="ranking-progress-panel">
                <div className="ranking-progress-panel__inner">
                    <div className="ranking-progress-group">
                        <span className="ranking-progress-label">
                            รอบ {gameProgress.roundCount + 1} / {totalRounds}
                        </span>
                        <span className="ranking-progress-percent" style={{ color: primaryColor }}>
                            {progressPercent}%
                        </span>
                    </div>
                </div>
            </div>

            <header className="ranking-planner-skin__intro ranking-planner-skin__intro--tight px-1">
                <h2 className="ranking-planner-skin__title ranking-planner-skin__title--sm">
                    ใครที่คุณชื่นชอบมากกว่ากัน?
                </h2>
            </header>

            <div
                className="ranking-arena mx-auto w-100 gap-3"
                style={{ animation: 'rankingChoiceScaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both' }}
            >
                <div className="flex-fill w-100">
                    <RankingChoice
                        member={m1}
                        onClick={() => handleChoice(m1.id)}
                        primaryColor={primaryColor}
                    />
                </div>
                <div className="ranking-vs d-flex align-items-center justify-content-center rounded-circle flex-shrink-0">
                    VS
                </div>
                <div className="flex-fill w-100">
                    <RankingChoice
                        member={m2}
                        onClick={() => handleChoice(m2.id)}
                        primaryColor={primaryColor}
                    />
                </div>
            </div>

            <div className="ranking-arena d-flex flex-wrap justify-content-center gap-2 mt-4">
                <button
                    type="button"
                    className="ranking-planner-skin__ctaGhost"
                    onClick={handleUndo}
                    disabled={history.length === 0}
                >
                    <i className="fa-solid fa-arrow-rotate-left" aria-hidden="true"></i>
                    ย้อนกลับ
                </button>
                <button type="button" className="ranking-planner-skin__ctaGhost" onClick={handleSkip}>
                    <i className="fa-solid fa-forward" aria-hidden="true"></i>
                    ไม่เลือก
                </button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface RankingChoiceProps {
    member: Member;
    onClick: () => void;
    primaryColor: string;
}

function RankingChoice({ member, onClick, primaryColor }: RankingChoiceProps) {
    const brandColors: Record<string, string> = {
        BNK48: '#cb96c2',
        CGM48: '#3CC2B1',
        '48th': primaryColor
    };
    const brandColor = brandColors[member.brand] ?? primaryColor;

    return (
        <button type="button" className="ranking-choice w-100 p-0 overflow-hidden text-start border-0" onClick={onClick}>
            <div className="position-relative w-100 h-100 ranking-choice-image">
                {member.profile_image_url ? (
                    <img
                        src={member.profile_image_url}
                        alt={member.name}
                        className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover pointer-events-none ranking-choice-img"
                        loading="eager"
                        crossOrigin="anonymous"
                    />
                ) : (
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-white fw-bold display-4 ranking-choice-fallback"
                        style={{ backgroundColor: brandColor }}
                    >
                        {member.name[0]}
                    </div>
                )}
            </div>
            <div className="p-3 bg-white ranking-choice-info">
                <div className="fw-bolder mb-1 text-truncate ranking-choice-name">
                    {member.name}
                </div>
                <div className="d-flex align-items-center gap-2 ranking-choice-meta">
                    <span className="badge rounded-pill text-white ranking-choice-brand" style={{ backgroundColor: brandColor }}>
                        {member.brand}
                    </span>
                    <span className="text-secondary ranking-choice-gen">{member.gen}</span>
                </div>
            </div>
        </button>
    );
}

interface RankingRowProps {
    member: Member & { score: number };
    rank: number;
    primaryColor: string;
}

function RankingRow({ member, rank, primaryColor }: RankingRowProps) {
    const brandColors: Record<string, string> = {
        BNK48: '#cb96c2',
        CGM48: '#3CC2B1',
        '48th': primaryColor
    };
    const brandColor = brandColors[member.brand] ?? primaryColor;

    return (
        <div
            className="d-flex align-items-center w-100 bg-white py-3 border-bottom ranking-result-row ranking-result-row--planner hover-lift"
            style={{
                transition: 'transform 0.2s',
                gap: '0.5rem'
            }}
        >
            <div
                className="fw-bolder text-center flex-shrink-0 me-3"
                style={{
                    width: '28px',
                    color: rank <= 3 ? '#111' : '#9ca3af',
                }}
            >
                {rank === 1 ? (
                    <i className="fa-solid fa-medal text-warning fs-3"></i>
                ) : rank === 2 ? (
                    <i className="fa-solid fa-medal text-secondary fs-3"></i>
                ) : rank === 3 ? (
                    <i className="fa-solid fa-medal" style={{ color: '#cd7f32', fontSize: '1.75rem' }}></i>
                ) : (
                    `#${rank}`
                )}
            </div>
            <div
                className="rounded-circle overflow-hidden flex-shrink-0 bg-light border me-3"
                style={{
                    width: '45px',
                    height: '45px',
                }}
            >
                {member.profile_image_url ? (
                    <img
                        src={member.profile_image_url}
                        alt={member.name}
                        className="w-100 h-100 object-fit-cover"
                        loading="lazy"
                        crossOrigin="anonymous"
                    />
                ) : (
                    <div
                        className="w-100 h-100 d-flex align-items-center justify-content-center text-white fw-bold fs-4"
                        style={{ backgroundColor: brandColor }}
                    >
                        {member.name[0]}
                    </div>
                )}
            </div>
            <div className="flex-grow-1 min-w-0">
                <div
                    className="fw-bolder text-truncate text-dark mb-1"
                    style={{ fontSize: '1.25rem' }}
                >
                    {member.name}
                </div>
                <div
                    className="fw-bold"
                    style={{ fontSize: '0.85rem', color: brandColor }}
                >
                    {member.brand} <span className="text-secondary mx-1">•</span> <span className="text-secondary">{member.gen}</span>
                </div>
            </div>
        </div>
    );
}