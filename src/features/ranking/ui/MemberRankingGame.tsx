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
    download: () => Promise<void>;
}

interface ResultShareCardProps {
    winner: Member;
    rankResults: (Member & { score: number })[];
    primaryColor: string;
    primaryGradient?: string;
    brandName?: string;
    cardId: string;
}

type GameState = 'menu' | 'playing' | 'finished' | 'old-results';

interface GameProgress extends PairingState {
    roundCount: number;
    currentPair: [number, number] | [];
}

type RankingThemeStyle = CSSProperties & {
    '--ranking-primary': string;
    '--ranking-primary-gradient': string;
    '--ranking-primary-alpha': string;
};

const RANKING_BTN_BASE =
    'btn ranking-ui-btn rounded-pill fw-bold d-inline-flex align-items-center justify-content-center gap-2';

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

        const download = useCallback(async () => {
            if (!cardRef.current) return;
            try {
                setIsDownloading(true);
                setErrorMessage(null);

                // Wait a bit for images to load
                await new Promise(resolve => setTimeout(resolve, 500));

                const canvas = await new Promise<HTMLCanvasElement>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                    script.onload = () => {
                        const html2canvas = (window as any).html2canvas;
                        html2canvas(cardRef.current, {
                            scale: 2,
                            useCORS: true,
                            allowTaint: true,
                            backgroundColor: '#fff',
                            logging: true,
                            imageTimeout: 5000,
                            ignoreElements: (element: Element) => {
                                return element.tagName === 'SCRIPT';
                            }
                        }).then(resolve).catch(reject);
                    };
                    script.onerror = () => reject(new Error('Failed to load html2canvas'));
                    document.head.appendChild(script);
                });

                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `oshi-ranking-${new Date().getTime()}.png`;
                link.click();
            } catch (err) {
                console.error('Download failed:', err);
                setErrorMessage('Failed to generate image. Please try again.');
            } finally {
                setIsDownloading(false);
            }
        }, []);

        useEffect(() => {
            if (ref && typeof ref === 'object') {
                ref.current = { download };
            }
        }, [download, ref]);

        if (!winner) return null;

        const top10 = rankResults.slice(0, 10);
        const dateString = new Date().toLocaleDateString('en-GB');

        return (
            <div
                ref={cardRef}
                id={cardId}
                style={{
                    position: 'absolute',
                    top: '-9999px',
                    left: 0,
                    opacity: 1,
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
                    onError={() => console.warn('Background image failed to load')}
                />

                {/* CONTENT AREA — วางบนกระดาษ */}
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
                    {/* HEADER — Brand + Date */}
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
    const [isSharing, setIsSharing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            console.error('Safe property access for results failed:', e);
        }
    }, [storageKey]);

    useEffect(() => {
        loadOldResults();
    }, [loadOldResults]);

    const saveResults = useCallback(
        (finalState: PairingState) => {
            try {
                const topRanking = calculateFinalRanking(members, finalState)
                    .slice(0, 10)
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
                    topRanking,
                    allScores: finalState.scores,
                };

                localStorage.setItem(storageKey, JSON.stringify(data));
                setOldResults(data);
            } catch (e) {
                console.error('Storage commit failed:', e);
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

    const handleShareResult = useCallback(async () => {
        if (!shareCardRef.current || isSharing) return;

        try {
            setIsSharing(true);
            setErrorMessage(null);
            await shareCardRef.current.download();
        } catch (err) {
            console.error('Could not generate image', err);
            setErrorMessage('Failed to generate image. Please try again.');
        } finally {
            setIsSharing(false);
        }
    }, [isSharing]);

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
    } as any;

    const currentTop10 = useMemo(() => {
        if (gameState !== 'finished') return [];
        return calculateFinalRanking(members, gameProgress)
            .slice(0, 10)
            .map((m) => ({ ...m, score: gameProgress.scores[m.id] || 0 }));
    }, [members, gameProgress, gameState]);

    const progressPercent =
        totalRounds > 0 ? Math.min(100, Math.round((gameProgress.roundCount / totalRounds) * 100)) : 0;

    // MENU STATE
    if (gameState === 'menu') {
        return (
            <div
                className="ranking-container d-flex flex-column align-items-center justify-content-center w-100 px-3 py-5"
                style={themeStyle}
            >
                <div className="text-center ranking-menu-content">
                    <h1 className="fw-bolder mb-3 ranking-title">
                        ค้นพบโอชิอันดับ 1
                        <br />ของคุณหรือยัง?
                    </h1>
                    <p className="mb-5 mx-auto text-secondary ranking-subtitle">
                        ค้นหาว่าใครคือที่สุดของใจคุณ จากเมมเบอร์ {members.length} คน
                    </p>
                    <div className="ranking-actions">
                        <button
                            className={`${RANKING_BTN_BASE} ranking-btn ranking-btn-primary text-white border-0`}
                            onClick={startGame}
                            style={{
                                background: primaryGradient ?? primaryColor,
                            }}
                        >
                            เริ่มเล่นเลย
                        </button>
                        {oldResults && (
                            <button
                                className={`${RANKING_BTN_BASE} ranking-btn ranking-btn-secondary border bg-light text-dark`}
                                onClick={() => setGameState('old-results')}
                            >
                                <i className="fa-solid fa-clock-rotate-left"></i> ผลลัพธ์ก่อนหน้า
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // FINISHED / OLD RESULTS STATE
    if (gameState === 'finished' || gameState === 'old-results') {
        const sourceData = gameState === 'finished' ? currentTop10 : oldResults?.topRanking;
        const winner = sourceData?.[0];
        const subtitle =
            gameState === 'finished'
                ? `จากการประมวลผลอย่างละเอียด ${totalRounds} รอบ`
                : new Date(oldResults?.timestamp || '').toLocaleString('th-TH');

        return (
            <div className="ranking-container py-5 px-3" style={{ ...themeStyle, pointerEvents: isSharing ? 'none' : 'auto' }}>
                <div className="text-center mb-5 ranking-results-header">
                    <h1 className="fw-bolder m-0 ranking-title">
                        {gameState === 'finished' ? 'นี่คืออันดับของคุณ' : 'ผลลัพธ์ที่บันทึกไว้'}
                    </h1>
                    <p className="mt-2 fw-medium text-secondary ranking-date">
                        {subtitle}
                    </p>
                </div>

                {winner && (
                    <div
                        className="ranking-winner-highlight bg-white rounded-4 py-3 px-5 mb-5 text-center position-relative overflow-hidden"
                        style={{
                            border: `1.5px solid ${primaryColor}`,
                            animation: 'rankingFadeUp 0.6s var(--anim-easing) both',
                        }}
                    >
                        <div
                            className="mx-auto mb-4 overflow-hidden rounded-circle ranking-winner-photo"
                        >
                            <img
                                src={winner.profile_image_url || '/placeholder.png'}
                                alt={winner.name}
                                className="w-100 h-100 object-fit-cover pointer-events-none ranking-img-top"
                            />
                        </div>
                        <div
                            className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill text-white fw-bold mb-3 text-uppercase ranking-winner-pill"
                            style={{
                                background: primaryGradient ?? primaryColor,
                            }}
                        >
                            Oshi No. 1
                        </div>
                        <h2 className="fw-bolder mb-1 ranking-winner-name">
                            {winner.name}
                        </h2>
                        <p className="mb-0 text-secondary ranking-result-subtitle">
                            {winner.brand} · {winner.gen}
                        </p>
                    </div>
                )}

                <div className="d-flex flex-column gap-2 mb-5 mx-auto ranking-result-list">
                    {sourceData?.slice(winner ? 1 : 0).map((m, i) => (
                        <RankingRow
                            key={m.id}
                            member={m}
                            rank={(winner ? 2 : 1) + i}
                            primaryColor={primaryColor}
                        />
                    ))}
                </div>

                <div
                    className="d-flex align-items-center justify-content-center gap-2 mt-4 flex-wrap"
                    style={{ margin: '0 auto' }}
                >
                    <button
                        className={`${RANKING_BTN_BASE} ranking-btn ranking-btn-primary text-white border-0`}
                        onClick={startGame}
                        style={{
                            background: primaryGradient ?? primaryColor,
                        }}
                    >
                        เล่นใหม่อีกครั้ง
                    </button>
                    <button
                        className={`${RANKING_BTN_BASE} ranking-btn ranking-btn-secondary border bg-light text-dark`}
                        onClick={resetGame}
                    >
                        หน้าเมนู
                    </button>
                    <button
                        className={`${RANKING_BTN_BASE} ranking-ui-btn ranking-share-btn rounded-pill fw-bold d-inline-flex align-items-center justify-content-center gap-2 border bg-white text-dark`}
                        onClick={handleShareResult}
                        disabled={isSharing}
                    >
                        {isSharing ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>{' '}
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-share-nodes"></i>
                            </>
                        )}
                    </button>
                </div>

                {errorMessage && (
                    <div className="text-center mt-3 text-danger fw-bold ranking-note-text">
                        {errorMessage}
                    </div>
                )}

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
        );
    }

    // PLAYING STATE
    if (gameProgress.currentPair.length !== 2) return null;

    const [id1, id2] = gameProgress.currentPair as [number, number];
    const m1 = memberMap.get(id1);
    const m2 = memberMap.get(id2);

    if (!m1 || !m2) return null;

    return (
        <div className="ranking-container w-100 px-3" style={themeStyle}>
            <div
                className="w-100 position-sticky top-0 text-center bg-white py-3 mb-4 z-3 ranking-progress-head"
            >
                <div
                    className="d-flex justify-content-center gap-3 align-items-center mb-2 mx-auto ranking-note-text ranking-progress-meta"
                >
                    <span className="text-secondary">
                        รอบปัจจุบัน: {gameProgress.roundCount + 1} / {totalRounds}
                    </span>
                    <span style={{ color: primaryColor }}>{progressPercent}%</span>
                </div>
                <div className="progress mx-auto ranking-progress-track">
                    <div
                        className="progress-bar"
                        role="progressbar"
                        style={{
                            width: `${progressPercent}%`,
                            background: primaryGradient ?? primaryColor,
                            transition: 'width 0.4s ease',
                        }}
                    />
                </div>
            </div>

            <h2 className="text-center fw-bolder mb-4 ranking-game-title">
                ใครที่คุณชื่นชอบมากกว่ากัน?
            </h2>

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

            <div className="row" style={{ width: 'fit-content', margin: '0 auto' }}>
                <div className="col-6">
                    <button
                        className={`${RANKING_BTN_BASE} ranking-control-btn border bg-white text-dark`}
                        onClick={handleUndo}
                        disabled={history.length === 0}
                        style={{
                            textWrap: 'nowrap',
                        }}
                    >
                        <i className="fa-solid fa-arrow-rotate-left"></i> ย้อนกลับ
                    </button>
                </div>
                <div className="col-6">
                    <button
                        className={`${RANKING_BTN_BASE} ranking-control-btn  border bg-white text-dark`}
                        onClick={handleSkip}
                    >
                        <i className="fa-solid fa-forward"></i> ไม่เลือก
                    </button>
                </div>
            </div>

            <p className="text-center text-secondary mt-5 mx-auto ranking-note-text">
                <div className="d-flex justify-content-center gap-3 flex-wrap mb-2">
                    <kbd className="me-1 bg-light text-dark border px-2 rounded">←</kbd> choose left
                    <span className="mx-2">|</span>
                    <kbd className="me-1 bg-light text-dark border px-2 rounded">→</kbd> choose right
                </div>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <kbd className="me-1 bg-light text-dark border px-2 rounded">S</kbd> skip
                    <span className="mx-2">|</span>
                    <kbd className="me-1 bg-light text-dark border px-2 rounded">Z</kbd> undo
                </div>
            </p>
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
        <button className="ranking-choice btn w-100 bg-white p-0 overflow-hidden text-start" onClick={onClick}>
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
        <div className="d-flex align-items-center bg-white py-3 px-5 rounded-4 border mb-2 ranking-result-row" style={{ borderLeft: `5px solid ${rank === 1 ? primaryColor : 'var(--c-border)'}` }}>
            <div className="fw-bolder text-center me-3 ranking-result-rank" style={{ color: rank <= 3 ? primaryColor : 'var(--c-content-muted)' }}>
                {rank === 1 ? (
                    <i className="fa-solid fa-medal text-warning"></i>
                ) : rank === 2 ? (
                    <i className="fa-solid fa-medal text-secondary"></i>
                ) : rank === 3 ? (
                    <i className="fa-solid fa-medal" style={{ color: '#cd7f32' }}></i>
                ) : (
                    `#${rank}`
                )}
            </div>
            <div className="rounded-circle overflow-hidden flex-shrink-0 me-3 bg-light border ranking-result-avatar">
                {member.profile_image_url ? (
                    <img
                        src={member.profile_image_url}
                        alt={member.name}
                        className="w-100 h-100 object-fit-cover ranking-img-top"
                        loading="eager"
                        crossOrigin="anonymous"
                    />
                ) : (
                    <div
                        className="w-100 h-100 d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ backgroundColor: brandColor }}
                    >
                        {member.name[0]}
                    </div>
                )}
            </div>
            <div className="flex-grow-1 min-w-0">
                <div className="fw-bolder text-truncate text-dark ranking-result-name">
                    {member.name}
                </div>
                <div className="text-secondary mt-1 ranking-result-meta">
                    <span className="d-inline-block rounded-circle me-1 ranking-result-dot" style={{ backgroundColor: brandColor }}></span>
                    {member.brand} · {member.gen}
                </div>
            </div>
        </div>
    );
}