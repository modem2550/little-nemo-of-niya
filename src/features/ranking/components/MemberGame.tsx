import { useState, useEffect, useCallback, useMemo, useRef, forwardRef, useImperativeHandle, memo, type CSSProperties } from 'react';
import { useRankingEngine, STORAGE_VERSION, type GameState, type GameProgress, type TopRankingResult } from '../logic/rankingEngine';
import type { Member } from '@/types/member';
import { urlToBase64, ensureDomToImage, waitForFonts } from '@/shared/utils/imageCapture';

const LONG_PRESS_THRESHOLD = 500; // ms

interface MemberRankingGameProps {
    members: Member[];
    storageKey: string;
    totalRounds: number;
    primaryColor: string;
    primaryGradient?: string;
    brand: 'BNK48' | 'CGM48' | '48th';
}

interface ShareCardRef {
    generateImage: () => Promise<string>;
}

interface ResultShareCardProps {
    winner: Member;
    rankResults: (Member & { score: number; elo: number })[];
    primaryColor: string;
    primaryGradient?: string;
    brandName?: string;
    cardId: string;
}

type RankingThemeStyle = CSSProperties & {
    '--ranking-primary': string;
    '--ranking-primary-gradient': string;
    '--ranking-primary-alpha': string;
    '--rp-accent': string;
};

// ═══════════════════════════════════════════════════════════════════════════
// RESULT SHARE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const ResultShareCard = memo(forwardRef<ShareCardRef, ResultShareCardProps>(
    ({ winner, rankResults, primaryColor, primaryGradient, brandName = '48th Group', cardId }, ref) => {
        const cardRef = useRef<HTMLDivElement>(null);
        const [bgBase64, setBgBase64] = useState<string | null>(null);
        const [winnerBase64, setWinnerBase64] = useState<string | null>(null);
        const [top10Base64, setTop10Base64] = useState<Record<number, string>>({});
        const resourcesReadyRef = useRef(false);

        // ✅ Preload background and images to Base64
        useEffect(() => {
            let cancelled = false;
            
            const loadResources = async () => {
                try {
                    const [bg, winnerImg] = await Promise.all([
                        urlToBase64('/img/bg-ranking-member.png'),
                        urlToBase64(winner.profile_image_url)
                    ]);
                    
                    if (cancelled) return;
                    setBgBase64(bg);
                    setWinnerBase64(winnerImg);
                    
                    const top10 = rankResults.slice(1, 10);
                    const top10Results = await Promise.all(
                        top10.map(async (m) => ({ id: m.id, data: await urlToBase64(m.profile_image_url) }))
                    );
                    
                    if (cancelled) return;
                    const top10Map: Record<number, string> = {};
                    top10Results.forEach(r => top10Map[r.id] = r.data);
                    setTop10Base64(top10Map);
                    resourcesReadyRef.current = true;
                } catch (err) {
                    console.error('[ResultShareCard] Failed to load resources:', err);
                }
            };

            loadResources();
            return () => { cancelled = true; };
        }, [winner.id, winner.profile_image_url, rankResults]);

        const generateImage = useCallback(async () => {
            if (!cardRef.current) throw new Error("Ref not ready");
            
            try {
                // Wait for resources if not ready
                if (!resourcesReadyRef.current) {
                    const start = Date.now();
                    while (!resourcesReadyRef.current && Date.now() - start < 10000) {
                        await new Promise(r => setTimeout(r, 200));
                    }
                    if (!resourcesReadyRef.current) throw new Error("Resources timeout");
                }

                await Promise.all([
                    ensureDomToImage(),
                    waitForFonts(),
                    new Promise(r => requestAnimationFrame(r)),
                    new Promise(r => setTimeout(r, 500)) // Extra buffer for layout
                ]);

                const dataUrl = await (window as any).domtoimage.toPng(cardRef.current, {
                    width: 1080,
                    height: 1920,
                    style: {
                        transform: 'scale(1)',
                        transformOrigin: 'top left',
                        visibility: 'visible', // Ensure it's visible during capture
                    },
                });

                return dataUrl;
            } finally {
                // Done
            }
        }, []);

        useImperativeHandle(ref, () => ({ generateImage }), [generateImage]);

        const top10 = useMemo(() => rankResults.slice(0, 10), [rankResults]);
        const dateString = useMemo(() => new Date().toLocaleDateString('en-GB'), []);

        if (!winner) return null;

        return (
            <div
                ref={cardRef}
                id={cardId}
                style={{
                    position: 'fixed',
                    zIndex: -9999,
                    top: '-9999px',
                    left: '-9999px',
                    pointerEvents: 'none',
                    width: '1080px',
                    height: '1920px',
                    fontFamily: "'Outfit', 'Noto Sans Thai', sans-serif",
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                }}
            >
                {/* Background */}
                <img
                    src={bgBase64 || "/img/bg-ranking-member.png"}
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
                />

                {/* Winner Image */}
                <div
                    style={{
                        position: 'absolute',
                        top: '744px',
                        left: '185px',
                        width: '226px',
                        height: '232px',
                        transform: 'rotate(2.7deg)',
                        zIndex: 1,
                        overflow: 'hidden',
                        backgroundColor: 'transparent',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${winnerBase64 || winner.profile_image_url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center top',
                            overflow: 'hidden',
                        }}
                    />
                </div>

                {/* Winner Info */}
                <div
                    style={{
                        position: 'absolute',
                        top: '750px',
                        left: '480px',
                        width: '520px',
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                    }}
                >
                    <p
                        style={{
                            fontSize: 20,
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
                            fontSize: 72,
                            fontWeight: 900,
                            margin: '5px 0 15px',
                            color: '#222233',
                            lineHeight: 0.9,
                            letterSpacing: '-2px',
                            wordBreak: 'break-word',
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
                            padding: '8px 24px',
                            borderRadius: 100,
                            fontSize: 18,
                            fontWeight: 700,
                        }}
                    >
                        {winner.brand}
                        <span style={{ margin: '0 12px', opacity: 0.5 }}>|</span>
                        {winner.gen}
                    </div>
                </div>

                {/* Top 10 Grid */}
                <div
                    style={{
                        position: 'absolute',
                        top: '1060px',
                        left: '170px',
                        right: '120px',
                        zIndex: 2,
                        display: 'grid',
                        transform: 'rotate(-2.7deg)',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '10px',
                    }}
                >
                    {top10.slice(1).map((m, i) => {
                        const rank = i + 2;
                        return (
                            <div
                                key={m.id}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 12,
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ position: 'relative' }}>
                                    <div
                                        style={{
                                            width: 125,
                                            height: 125,
                                            borderRadius: '50%',
                                            backgroundImage: `url(${top10Base64[m.id] || m.profile_image_url})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center top',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: -10,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            background: rank === 2 ? '#E5E7EB' : rank === 3 ? '#FEF3C7' : '#f9fafb',
                                            color: rank === 2 ? '#374151' : rank === 3 ? '#92400E' : '#6b7280',
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 900,
                                            fontSize: 18,
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {rank}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 26, color: '#222233', lineHeight: 1.2 }}>
                                        {m.name}
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        {m.brand} • {m.gen}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Date */}
                <div style={{ position: 'absolute', top: '50px', right: '70px', textAlign: 'start', zIndex: 2 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, margin: 0, color: '#d8d8d8ff', textTransform: 'uppercase', letterSpacing: 2 }}>
                        Date
                    </p>
                    <p style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#ffffffff' }}>
                        {dateString}
                    </p>
                </div>
            </div>
        );
    }
));

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

const DownloadButton = memo(function DownloadButton({ imageUrl, isLoading, primaryColor, primaryGradient }: DownloadButtonProps) {
    const [isPressed, setIsPressed] = useState(false);
    const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const linkRef = useRef<HTMLAnchorElement>(null);

    const handlePressStart = useCallback(() => {
        setIsPressed(true);
        pressTimerRef.current = setTimeout(() => {
            if (linkRef.current) linkRef.current.click();
        }, LONG_PRESS_THRESHOLD);
    }, []);

    const handlePressEnd = useCallback(() => {
        setIsPressed(false);
        if (pressTimerRef.current) {
            clearTimeout(pressTimerRef.current);
            pressTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
        };
    }, []);

    if (isLoading) {
        return (
            <button
                type="button"
                className="ranking-planner-skin__cta"
                style={{ background: primaryGradient ?? primaryColor, opacity: 0.65 }}
                disabled
            >
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                กำลังเตรียมรูป...
            </button>
        );
    }

    const downloadName = `oshi-ranking-${Date.now()}.png`;

    return (
        <>
            <a
                ref={linkRef}
                href={imageUrl}
                download={downloadName}
                style={{ display: 'none' }}
            >
            </a>
            <button
                type="button"
                className="ranking-planner-skin__ctaGhost"
                onClick={() => linkRef.current?.click()}
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                aria-pressed={isPressed}
            >
                <i className="fa-solid fa-download" aria-hidden="true" />
                บันทึกภาพ
            </button>
        </>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// VIEW ALL RANKING SECTION
// ═══════════════════════════════════════════════════════════════════════════

interface ViewAllRankingProps {
    rankResults: (Member & { score: number; elo: number })[];
    primaryColor: string;
    onBack: () => void;
}

const ViewAllRanking = memo(function ViewAllRanking({ rankResults, primaryColor, onBack }: ViewAllRankingProps) {
    const skinStyle = useMemo(() => ({
        '--ranking-primary': primaryColor,
        '--rp-accent': primaryColor,
    } as CSSProperties), [primaryColor]);

    return (
        <section className="ranking-view-all d-flex flex-column align-items-center" style={skinStyle}>
            <div className="ranking-view-all__shell d-flex flex-column w-100">
                <div className="ranking-view-all__header">
                    <div className="d-flex align-items-center justify-content-between gap-3">
                        <h2 className="ranking-view-all__title">The Best my Oshi in Member Ranking ทั้งหมด</h2>
                        <button type="button" className="ranking-view-all__close" onClick={onBack} aria-label="ปิด">
                            <i className="fa-solid fa-times" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>

                <div className="ranking-view-all__list w-100">
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
});

const RankingRow = memo(function RankingRow({ member, rank, primaryColor }: { member: Member & { score: number; elo: number }; rank: number; primaryColor: string }) {
    const rankStyle = useMemo(() => ({
        width: '40px',
        color: rank <= 3 ? primaryColor : '#9ca3af'
    }), [rank, primaryColor]);

    return (
        <div className="d-flex align-items-center w-100 py-2 border-bottom ranking-result-row" style={{ gap: '0.75rem' }}>
            <div className="fw-bolder text-center flex-shrink-0" style={rankStyle}>
                {rank === 1 ? <i className="fa-solid fa-medal text-warning fs-3"></i> : `#${rank}`}
            </div>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <img src={member.profile_image_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            </div>
            <div className="flex-grow-1 min-w-0">
                <div className="fw-bolder text-truncate mb-1" style={{ fontSize: '1.1rem' }}>{member.name}</div>
                <div className="fw-bold text-secondary" style={{ fontSize: '0.85rem' }}>{member.brand} • {member.gen}</div>
            </div>
            <div className="flex-shrink-0 text-end d-flex flex-column" style={{ minWidth: '60px' }}>
                <div className="fw-bolder" style={{ color: primaryColor, fontSize: '1rem' }}>{member.score} <small style={{ fontSize: '0.65rem', opacity: 0.7 }}>WINS</small></div>
                <div className="fw-bold text-muted" style={{ fontSize: '0.7rem' }}>{member.elo} <small style={{ fontSize: '0.55rem', opacity: 0.6 }}>ELO</small></div>
            </div>
        </div>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GAME COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const MemberGame = memo(function MemberGame({
    members = [],
    storageKey = 'ranking_results',
    totalRounds,
    primaryColor = '#292848',
    primaryGradient,
    brand = '48th',
}: MemberRankingGameProps) {
    const {
        gameState,
        setGameState,
        gameProgress,
        oldResults,
        history,
        viewAllSource,
        setViewAllSource,
        startGame: startGameEngine,
        handleChoice,
        handleUndo,
        handleSkip,
        rankedItems,
        oldRankedItems,
        progressPercent,
        itemMap
    } = useRankingEngine(members, storageKey, totalRounds || Math.floor(members.length * 2.5));

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    const shareCardRef = useRef<ShareCardRef>(null);
    const generationStartedRef = useRef(false);

    const startGame = useCallback(() => {
        generationStartedRef.current = false;
        setResultImageUrl(null);
        startGameEngine();
    }, [startGameEngine]);

    useEffect(() => {
        const isFinished = gameState === 'finished' || gameState === 'old-results';
        if (!isFinished || resultImageUrl || generationStartedRef.current) return;

        let mounted = true;

        const triggerGen = async () => {
            generationStartedRef.current = true;
            setIsGeneratingImage(true);
            setErrorMessage(null);

            await new Promise(r => requestAnimationFrame(r));

            if (!mounted) return;

            const executeGeneration = async () => {
                if (shareCardRef.current) {
                    try {
                        const url = await shareCardRef.current.generateImage();
                        if (mounted) {
                            setResultImageUrl(url);
                            setIsGeneratingImage(false);
                        }
                    } catch {
                        if (mounted) {
                            setErrorMessage('เกิดข้อผิดพลาดในการสร้างรูปผลลัพธ์ โปรดลองอีกครั้ง');
                            setIsGeneratingImage(false);
                            generationStartedRef.current = false;
                        }
                    }
                } else {
                    setTimeout(async () => {
                        if (!mounted) return;
                        if (shareCardRef.current) {
                            try {
                                const url = await shareCardRef.current.generateImage();
                                if (mounted) {
                                    setResultImageUrl(url);
                                    setIsGeneratingImage(false);
                                }
                            } catch {
                                if (mounted) {
                                    setErrorMessage('เกิดข้อผิดพลาดในการสร้างรูปผลลัพธ์ โปรดลองอีกครั้ง');
                                    setIsGeneratingImage(false);
                                    generationStartedRef.current = false;
                                }
                            }
                        } else {
                            if (mounted) {
                                setErrorMessage('ไม่สามารถสร้างรูปผลลัพธ์ได้ (Missing Ref)');
                                setIsGeneratingImage(false);
                                generationStartedRef.current = false;
                            }
                        }
                    }, 800);
                }
            };

            await executeGeneration();
        };

        triggerGen();

        return () => {
            mounted = false;
        };
    }, [gameState, resultImageUrl]);

    const themeStyle: RankingThemeStyle = useMemo(() => ({
        '--ranking-primary': primaryColor,
        '--ranking-primary-gradient': primaryGradient ?? primaryColor,
        '--ranking-primary-alpha': `${primaryColor}33`,
        '--rp-accent': primaryColor,
    } as RankingThemeStyle), [primaryColor, primaryGradient]);

    const handleBackFromViewAll = useCallback(() => setGameState(viewAllSource === 'old' ? 'old-results' : 'finished'), [setGameState, viewAllSource]);
    const handleShowOldResults = useCallback(() => setGameState('old-results'), [setGameState]);
    const handleShowViewAll = useCallback(() => {
        setViewAllSource(gameState === 'old-results' ? 'old' : 'current');
        setGameState('view-all-ranking');
    }, [gameState, setGameState, setViewAllSource]);

    const viewAllSourceData = useMemo(
        () => viewAllSource === 'old' ? (oldRankedItems as (Member & { score: number; elo: number })[]) : (rankedItems as (Member & { score: number; elo: number })[]),
        [viewAllSource, oldRankedItems, rankedItems]
    );

    if (gameState === 'view-all-ranking') {
        return (
            <ViewAllRanking
                rankResults={viewAllSourceData}
                primaryColor={primaryColor}
                onBack={handleBackFromViewAll}
            />
        );
    }

    if (gameState === 'menu') {
        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center w-100" style={themeStyle}>
                <div className="ranking-planner-skin ranking-menu-content w-100">
                    <header className="ranking-planner-skin__intro">
                        <h1 className="ranking-planner-skin__title">พร้อมจะค้นพบโอชิอันดับ 1 ของคุณหรือยัง?</h1>
                        <p className="ranking-planner-skin__lead">ค้นหาว่าใครคือที่สุดของใจคุณ จากเมมเบอร์ {members.length} คน</p>
                    </header>
                    <article className="ranking-planner-skin__card">
                        <div className="ranking-planner-skin__cardBody">
                            <h2 className="h6 fw-bold mb-0">พร้อมแล้วหรือยัง?</h2>
                            <p className="ranking-planner-skin__desc">ที่จะโอชิในตัวจิงของคุณณณณณ​ 🫵</p>
                            <div className="ranking-planner-skin__actions" style={{ flexWrap: 'nowrap', flexDirection: 'row' }}>
                                <button type="button" className="ranking-planner-skin__ctaGhost" onClick={startGame}>เริ่มเล่นเลย</button>
                                {oldResults && (
                                    <button type="button" className="ranking-planner-skin__ctaGhost" onClick={handleShowOldResults}>
                                        <i className="fa-solid fa-clock-rotate-left" aria-hidden="true"></i> ผลลัพธ์ก่อนหน้า
                                    </button>
                                )}
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        );
    }

    if (gameState === 'finished' || gameState === 'old-results') {
        const sourceData = (gameState === 'finished' ? rankedItems.slice(0, 10) : (oldResults?.topRanking ?? [])) as (Member & { score: number; elo: number })[];
        const winner = sourceData[0];
        const twitterText = encodeURIComponent('TheBestmyOshi');

        return (
            <section className="sec-result py-3" style={themeStyle}>
                <div className="ranking-planner-skin__resultBlock">
                    <header className="ranking-planner-skin__intro ranking-planner-skin__intro--tight">
                        <h2 className="h5 fw-bold" style={{ color: primaryGradient ?? primaryColor }}>{brand}'s The best your Oshi</h2>
                        <p className="h4 fw-bold">{gameState === 'finished' ? 'ผลการจัดอันดับโอชิของคุณ' : 'ผลลัพธ์ที่บันทึกไว้'}</p>
                    </header>

                    {isGeneratingImage ? (
                        <div className="text-center py-5 my-4">
                            <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: primaryColor }} />
                            <p className="fw-bold">กำลังประมวลผลรูปภาพผลลัพธ์...</p>
                        </div>
                    ) : resultImageUrl ? (
                        <div className="text-center">
                            <div className="ranking-planner-skin__figure mb-4 mx-auto shadow-sm" style={{ maxWidth: '500px' }}>
                                <img className="img-fluid d-block mx-auto" src={resultImageUrl} alt="Ranking Results" />
                            </div>
                            <p className='mb-1'><small>(กดค้างที่รูปเพื่อดาวน์โหลดรูป)</small></p>
                            <div className="ranking-planner-skin__actions">
                                <DownloadButton imageUrl={resultImageUrl} isLoading={isGeneratingImage} primaryColor={primaryColor} primaryGradient={primaryGradient} />
                            </div>
                            <hr style={{ maxWidth: '500px', margin: '1.5rem auto' }} />
                            <p className='mb-1'>แชร์ Ranking ของคุณบน <i className="fa-brands fa-x-twitter"></i></p>
                            <a className="h3 fw-bold" style={{ color: primaryGradient ?? primaryColor }} href='https://x.com/hashtag/TheBestmyOshi?src=hashtag_click'>#TheBestmyOshi</a>
                            <div className="ranking-planner-skin__actions mt-4">
                                <a href={`https://twitter.com/intent/tweet?text=${twitterText}`} target="_blank" rel="noopener noreferrer" className="ranking-planner-skin__ctaX">แชร์ไปยัง <i className="fa-brands fa-x-twitter"></i></a>
                                <button type="button" className="ranking-planner-skin__ctaGhost" onClick={handleShowViewAll}>
                                    <i className="fa-solid fa-list" aria-hidden="true"></i> ดู Ranking ทั้งหมด
                                </button>
                                <button type="button" className="ranking-planner-skin__ctaGhost" onClick={startGame}>
                                    <i className="fa-solid fa-rotate-right" aria-hidden="true"></i> เล่นใหม่อีกครั้ง
                                </button>
                            </div>
                        </div>
                    ) : errorMessage ? (
                        <div className="text-center text-danger fw-bolder mt-4">{errorMessage}</div>
                    ) : null}

                    {winner && (
                        <ResultShareCard
                            ref={shareCardRef}
                            cardId="member-share-result-card"
                            winner={winner}
                            rankResults={sourceData}
                            primaryColor={primaryColor}
                            primaryGradient={primaryGradient}
                        />
                    )}
                </div>
            </section>
        );
    }

    if (gameProgress.currentPair.length !== 2) return null;
    const [id1, id2] = gameProgress.currentPair as [number, number];
    const m1 = itemMap.get(id1);
    const m2 = itemMap.get(id2);
    if (!m1 || !m2) return null;

    return (
        <div className="ranking-game-play w-100 px-3" style={themeStyle}>
            <div className="ranking-progress-panel">
                <div className="ranking-progress-panel__inner">
                    <div className="ranking-progress-group">
                        <span className="ranking-progress-label">ความคืบหน้า</span>
                        <span className="ranking-progress-percent" style={{ color: primaryColor }}>{progressPercent}%</span>
                    </div>
                </div>
            </div>
            <header className="ranking-planner-skin__intro ranking-planner-skin__intro--tight px-1">
                <h2 className="ranking-planner-skin__title ranking-planner-skin__title--sm">เมมเบอร์คนไหนที่คุณโอชิมากกว่า?</h2>
            </header>
            <div className="ranking-arena mx-auto w-100 gap-2">
                <div className="flex-fill w-100">
                    <MemberChoice member={m1} onClick={() => handleChoice(m1.id)} />
                </div>
                <div className="ranking-vs d-flex align-items-center justify-content-center rounded-circle flex-shrink-0">VS</div>
                <div className="flex-fill w-100">
                    <MemberChoice member={m2} onClick={() => handleChoice(m2.id)} />
                </div>
            </div>
            <div className="ranking-arena d-flex flex-wrap justify-content-center gap-2 mt-4">
                <button type="button" className="ranking-planner-skin__ctaGhost" onClick={handleUndo} disabled={history.length === 0}>
                    <i className="fa-solid fa-arrow-rotate-left" aria-hidden="true"></i> ย้อนกลับ
                </button>
                <button type="button" className="ranking-planner-skin__ctaGhost" onClick={handleSkip}>
                    <i className="fa-solid fa-forward" aria-hidden="true"></i> ไม่เลือก
                </button>
            </div>
        </div>
    );
});

export default MemberGame;

const MemberChoice = memo(function MemberChoice({ member, onClick }: { member: Member; onClick: () => void }) {
    const brandColor = useMemo(() =>
        member.brand === 'BNK48' ? 'var(--c-bnk)' : member.brand === 'CGM48' ? 'var(--c-cgm)' : 'var(--c-primary)',
        [member.brand]);

    return (
        <button type="button" className="ranking-choice w-100 p-0 overflow-hidden text-start border-0" onClick={onClick}>
            <div className="ranking-choice__figure overflow-hidden">
                <img src={member.profile_image_url} alt={member.name} className="ranking-choice__img" loading="lazy" />
            </div>
            <div className="flex-grow-1 ranking-choice-info">
                <div className='p-3 px-4'>
                    <span className="fw-bolder text-truncate mb-1" style={{ fontSize: '1rem', color: 'var(--c-content)' }}>{member.name}</span>
                    <span className="ms-2 fw-bold" style={{ fontSize: '1rem', color: brandColor }}>{member.brand}</span>
                </div>
            </div>
        </button>
    );
});
