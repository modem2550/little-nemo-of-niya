import { useState, useEffect, useCallback, useMemo, useRef, memo, type CSSProperties, type ReactNode } from 'react';
import { useRankingEngine } from '../logic/rankingEngine';
import ResultShareCard, { type ShareCardRef } from './ResultShareCard';

type RankingThemeStyle = CSSProperties & {
    '--ranking-primary': string;
    '--ranking-primary-gradient': string;
    '--ranking-primary-alpha': string;
    '--rp-accent': string;
};

interface DownloadButtonProps {
    imageUrl: string;
    isLoading: boolean;
    primaryColor: string;
    primaryGradient?: string;
    downloadNamePrefix: string;
}

const DownloadButton = memo(function DownloadButton({ imageUrl, isLoading, primaryColor, primaryGradient, downloadNamePrefix }: DownloadButtonProps) {
    const downloadName = `${downloadNamePrefix}-${Date.now()}.png`;

    const handleDownload = useCallback(() => {
        fetch(imageUrl)
            .then(res => res.blob())
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = downloadName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            })
            .catch(err => console.error('Download failed:', err));
    }, [imageUrl, downloadName]);

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

    return (
        <button
            type="button"
            className="ranking-planner-skin__ctaGhost"
            onClick={handleDownload}
        >
            <i className="fa-solid fa-download" aria-hidden="true" />
            บันทึกภาพ
        </button>
    );
});

interface ViewAllRankingProps<T> {
    rankResults: (T & { score: number; elo: number })[];
    primaryColor: string;
    onBack: () => void;
    title: string;
    renderRow: (item: T & { score: number; elo: number }, rank: number, primaryColor: string) => ReactNode;
    totalLabel: (total: number) => string;
}

function ViewAllRanking<T extends { id: number | string }>({
    rankResults,
    primaryColor,
    onBack,
    title,
    renderRow,
    totalLabel
}: ViewAllRankingProps<T>) {
    const skinStyle = useMemo(() => ({
        '--ranking-primary': primaryColor,
        '--rp-accent': primaryColor,
    } as CSSProperties), [primaryColor]);

    return (
        <section className="ranking-view-all d-flex flex-column align-items-center" style={skinStyle}>
            <div className="ranking-view-all__shell d-flex flex-column w-100">
                <div className="ranking-view-all__header">
                    <div className="d-flex align-items-center justify-content-between gap-3">
                        <h2 className="ranking-view-all__title">{title}</h2>
                        <button type="button" className="ranking-view-all__close" onClick={onBack} aria-label="ปิด">
                            <i className="fa-solid fa-times" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>

                <div className="ranking-view-all__list w-100">
                    {rankResults.map((item, index) => (
                        <div key={item.id} className="w-100">
                            {renderRow(item, index + 1, primaryColor)}
                        </div>
                    ))}
                </div>

                <div className="ranking-view-all__footer">
                    <small>{totalLabel(rankResults.length)}</small>
                </div>
            </div>
        </section>
    );
}
const MemoizedViewAllRanking = memo(ViewAllRanking) as typeof ViewAllRanking;

export interface RankingGameConfig<T> {
    items: T[];
    storageKey: string;
    totalRounds?: number;
    primaryColor: string;
    primaryGradient?: string;
    
    // Result card options
    gameType: 'member' | 'song';
    brandName?: string; // For member game
    
    // Texts
    menuTitle: string;
    menuSubtitle: string;
    menuActionDesc: string;
    arenaTitle: string;
    resultTitle: string;
    resultSubtitle: string;
    twitterHashtag: string;
    twitterText: string;
    downloadNamePrefix: string;
    viewAllTitle: string;
    viewAllTotalLabel: (total: number) => string;
    
    // Render Functions
    renderChoice: (item: T, onClick: () => void) => ReactNode;
    renderRankingRow: (item: T & { score: number; elo: number }, rank: number, primaryColor: string) => ReactNode;
}

export function RankingGame<T extends { id: number; name: string }>(config: RankingGameConfig<T>) {
    const {
        items, storageKey, totalRounds, primaryColor, primaryGradient,
        gameType, brandName,
        menuTitle, menuSubtitle, menuActionDesc, arenaTitle, resultTitle, resultSubtitle,
        twitterHashtag, twitterText, downloadNamePrefix, viewAllTitle, viewAllTotalLabel,
        renderChoice, renderRankingRow
    } = config;

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
    } = useRankingEngine(items, storageKey, totalRounds || Math.floor(items.length * 2.5));

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
                    } catch (err) {
                        console.error('[RankingGame] Failed to generate result card:', err);
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
                            } catch (err) {
                                console.error('[RankingGame] Failed to generate result card (retry):', err);
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
    const handleShowOldResults = useCallback(() => {
        setResultImageUrl(null);
        setGameState('old-results');
    }, [setGameState]);
    const handleShowViewAll = useCallback(() => {
        import('react').then(({ startTransition }) => {
            startTransition(() => {
                setViewAllSource(gameState === 'old-results' ? 'old' : 'current');
                setGameState('view-all-ranking');
            });
        });
    }, [gameState, setGameState, setViewAllSource]);

    useEffect(() => {
        if (gameState !== 'playing') return;
        const handler = (e: BeforeUnloadEvent) => { 
            e.preventDefault(); 
            e.returnValue = ''; 
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [gameState]);

    const viewAllSourceData = useMemo(
        () => viewAllSource === 'old' ? (oldRankedItems as (T & { score: number; elo: number })[]) : (rankedItems as (T & { score: number; elo: number })[]),
        [viewAllSource, oldRankedItems, rankedItems]
    );

    if (gameState === 'view-all-ranking') {
        return (
            <MemoizedViewAllRanking
                rankResults={viewAllSourceData}
                primaryColor={primaryColor}
                onBack={handleBackFromViewAll}
                title={viewAllTitle}
                renderRow={renderRankingRow}
                totalLabel={viewAllTotalLabel}
            />
        );
    }

    if (gameState === 'menu') {
        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center w-100" style={themeStyle}>
                <div className="ranking-planner-skin ranking-menu-content w-100">
                    <header className="ranking-planner-skin__intro">
                        <h1 className="ranking-planner-skin__title">{menuTitle}</h1>
                        <p className="ranking-planner-skin__lead">{menuSubtitle}</p>
                    </header>
                    <article className="ranking-planner-skin__card">
                        <div className="ranking-planner-skin__cardBody">
                            <h2 className="h6 fw-bold mb-0">พร้อมแล้วหรือยัง?</h2>
                            <p className="ranking-planner-skin__desc">{menuActionDesc}</p>
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
        const sourceData = (gameState === 'finished' ? rankedItems.slice(0, 10) : (oldResults?.topRanking ?? [])) as (T & { score: number; elo: number })[];
        const winner = sourceData[0];

        return (
            <section className="sec-result py-3" style={themeStyle}>
                <div className="ranking-planner-skin__resultBlock">
                    <header className="ranking-planner-skin__intro ranking-planner-skin__intro--tight">
                        <h2 className="h5 fw-bold" style={{ color: primaryGradient ?? primaryColor }}>{resultTitle}</h2>
                        <p className="h4 fw-bold">{gameState === 'finished' ? resultSubtitle : 'ผลลัพธ์ที่บันทึกไว้'}</p>
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
                                <DownloadButton imageUrl={resultImageUrl} isLoading={isGeneratingImage} primaryColor={primaryColor} primaryGradient={primaryGradient} downloadNamePrefix={downloadNamePrefix} />
                            </div>
                            <hr style={{ maxWidth: '500px', margin: '1.5rem auto' }} />
                            <p className='mb-1'>แชร์ Ranking ของคุณบน <i className="fa-brands fa-x-twitter"></i></p>
                            <a className="h3 fw-bold" style={{ color: primaryGradient ?? primaryColor }} href={`https://x.com/hashtag/${twitterHashtag}?src=hashtag_click`}>#{twitterHashtag}</a>
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
                            cardId={`${gameType}-share-result-card`}
                            variant={gameType as any}
                            winner={winner as any}
                            rankResults={sourceData as any}
                            primaryColor={primaryColor}
                            primaryGradient={primaryGradient}
                            brandName={brandName}
                        />
                    )}
                </div>
            </section>
        );
    }

    if (gameProgress.currentPair.length !== 2) return null;
    const [id1, id2] = gameProgress.currentPair as [number, number];
    const item1 = itemMap.get(id1) as T;
    const item2 = itemMap.get(id2) as T;
    if (!item1 || !item2) return null;

    return (
        <div className="ranking-game-play w-100 px-3" style={themeStyle}>
            <div className="ranking-progress-panel">
                <div className="ranking-progress-panel__inner">
                    <div className="ranking-progress-group">
                        <span className="ranking-progress-label">ความคืบหน้า</span>
                        <span className="ranking-progress-percent" style={{ color: primaryColor }}>{progressPercent}%</span>
                    </div>
                    <div className="ranking-progress-bar mt-2">
                        <div className="ranking-progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: primaryColor }} />
                    </div>
                </div>
            </div>
            <header className="ranking-planner-skin__intro ranking-planner-skin__intro--tight px-1">
                <h2 className="ranking-planner-skin__title ranking-planner-skin__title--sm">{arenaTitle}</h2>
            </header>
            <div className="ranking-arena mx-auto w-100 gap-2" key={`${id1}-${id2}`} style={{ animation: 'rankingChoiceScaleIn 0.3s ease-out' }}>
                <div className="flex-fill w-100">
                    {renderChoice(item1, () => handleChoice(item1.id))}
                </div>
                <div className="ranking-vs d-flex align-items-center justify-content-center rounded-circle flex-shrink-0">VS</div>
                <div className="flex-fill w-100">
                    {renderChoice(item2, () => handleChoice(item2.id))}
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
}

export const MemoizedRankingGame = memo(RankingGame) as typeof RankingGame;
export default MemoizedRankingGame;
