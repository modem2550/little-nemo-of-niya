import { useState, useEffect, useCallback, useMemo, useRef, forwardRef, memo, type CSSProperties } from 'react';
import { useRankingEngine, STORAGE_VERSION } from '../logic/rankingEngine';
import type { Song } from '@/types/song';

const LONG_PRESS_THRESHOLD = 500; // ms

interface SongRankingGameProps {
  songs: Song[];
  storageKey: string;
  totalRounds: number;
  primaryColor: string;
  primaryGradient?: string;
}

interface RankedSong extends Song {
  score: number;
}

interface ShareCardRef {
  generateImage: () => Promise<string>;
}

interface ResultShareCardProps {
  winner: RankedSong;
  rankResults: RankedSong[];
  primaryColor: string;
  primaryGradient?: string;
  cardId: string;
}

type RankingThemeStyle = CSSProperties & {
  '--ranking-primary': string;
  '--ranking-primary-gradient': string;
  '--ranking-primary-alpha': string;
  '--rp-accent': string;
};

const _artistColorCache = new Map<string, string>();
function getArtistColor(artist: string): string {
  if (_artistColorCache.has(artist)) return _artistColorCache.get(artist)!;
  const hasBNK = artist.includes('BNK48');
  const hasCGM = artist.includes('CGM48');
  let color: string;
  if (hasBNK && hasCGM) {
    color = 'linear-gradient(90deg, #cb96c2 0%, #3cc2b1 100%)';
  } else if (hasCGM) {
    color = '#3cc2b1';
  } else {
    color = '#cb96c2';
  }
  _artistColorCache.set(artist, color);
  return color;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESULT SHARE CARD COMPONENT (Song Version)
// ═══════════════════════════════════════════════════════════════════════════

const ResultShareCard = memo(forwardRef<ShareCardRef, ResultShareCardProps>(
  ({ winner, rankResults, primaryColor, primaryGradient, cardId }, ref) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // ✅ Preload background image เพื่อให้ browser cache ก่อน capture
    useEffect(() => {
      const img = new Image();
      img.src = '/img/bg-ranking-song.png';
    }, []);

    const generateImage = useCallback(async () => {
      if (!cardRef.current) throw new Error("Ref not ready");
      setIsDownloading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));

        if (!(window as any).domtoimage) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/dom-to-image-more/3.4.0/dom-to-image-more.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load dom-to-image-more'));
            document.head.appendChild(script);
          });
        }

        const dataUrl = await (window as any).domtoimage.toPng(cardRef.current, {
          width: 1080,
          height: 1920,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
          },
        });

        return dataUrl;
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

    const top10 = useMemo(() => rankResults.slice(0, 10), [rankResults]);

    const groupTitle = useMemo(() => {
      const isBNK = rankResults.some(s => s.artist.includes('BNK48'));
      const isCGM = rankResults.some(s => s.artist.includes('CGM48'));
      if (isBNK && isCGM) return "48TH GROUP'S SONGS";
      if (isBNK) return "BNK48'S SONGS";
      if (isCGM) return "CGM48'S SONGS";
      return "MY TOP'S SONGS";
    }, [rankResults]);

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
          fontFamily: "'ps_pimpdeediiM', serif",
          boxSizing: 'border-box',
          overflow: 'hidden',
          backgroundColor: '#fff',
        }}
      >
        {/* Import Local Font */}
        <style>
          {`
            @font-face {
              font-family: 'ps_pimpdeediiM';
              src: url('/font/ps_pimpdeediiM.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
            }
          `}
        </style>

        {/* Background Frame */}
        <img
          src="/img/bg-ranking-song.png"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
          alt=""
        />

        {/* Paper Content Wrapper */}
        <div style={{
          position: 'absolute',
          top: '470px',
          left: '130px',
          right: '130px',
          height: '1300px',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: '#334155', gap: '35px',
          paddingTop: '0px'
        }}>
          {/* Group Title */}
          <div style={{
            fontSize: 42,
            fontWeight: 900,
            color: '#5e5952',
            marginBottom: '25px',
            textAlign: 'center',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            paddingBottom: '5px',
            width: 'fit-content'
          }}>
            {groupTitle}
          </div>

          {/* Top 1-10 List on the paper */}
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            padding: '0 40px'
          }}>
            {top10.map((s, i) => {
              const rank = i + 1;
              return (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 30,
                    padding: '5px 0',
                    borderBottom: '1px dashed rgba(0,0,0,0.1)',
                  }}
                >
                  <div
                    style={{
                      width: 70,
                      fontWeight: 900,
                      fontSize: 44,
                      color: '#5e5952',
                      textAlign: 'center',
                    }}
                  >
                    {rank}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontWeight: 800,
                      fontSize: 36,
                      color: '#5e5952',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {s.name}
                    </div>
                    <div style={{
                      fontSize: 22,
                      fontWeight: 600,
                      color: '#747475ff',
                      textTransform: 'uppercase',
                      letterSpacing: 1
                    }}>
                      {s.artist}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
));

ResultShareCard.displayName = 'SongResultShareCard';

// ═══════════════════════════════════════════════════════════════════════════
// DOWNLOAD BUTTON
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

  const downloadName = `song-ranking-${Date.now()}.png`;

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

const ViewAllRanking = memo(function ViewAllRanking({
  rankResults,
  primaryColor,
  onBack,
}: {
  rankResults: RankedSong[];
  primaryColor: string;
  onBack: () => void;
}) {
  const skinStyle = useMemo(() => ({
    '--ranking-primary': primaryColor,
    '--rp-accent': primaryColor,
  } as CSSProperties), [primaryColor]);

  return (
    <section className="ranking-view-all d-flex flex-column align-items-center" style={skinStyle}>
      <div className="ranking-view-all__shell d-flex flex-column w-100">
        <div className="ranking-view-all__header">
          <div className="d-flex align-items-center justify-content-between gap-3">
            <h2 className="ranking-view-all__title">Song Ranking ทั้งหมด</h2>
            <button type="button" className="ranking-view-all__close" onClick={onBack} aria-label="ปิด">
              <i className="fa-solid fa-times" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div className="ranking-view-all__list w-100">
          {rankResults.map((song, index) => (
            <RankingRow
              key={song.id}
              song={song}
              rank={index + 1}
              primaryColor={primaryColor}
            />
          ))}
        </div>

        <div className="ranking-view-all__footer">
          <small>รวมทั้งหมด {rankResults.length} เพลง</small>
        </div>
      </div>
    </section>
  );
});

const RankingRow = memo(function RankingRow({ song, rank, primaryColor }: { song: RankedSong; rank: number; primaryColor: string }) {
  const rankStyle = useMemo(() => ({
    width: '40px',
    color: rank <= 3 ? primaryColor : '#9ca3af'
  }), [rank, primaryColor]);

  return (
    <div className="d-flex align-items-center w-100 py-2 border-bottom ranking-result-row" style={{ gap: '0.75rem' }}>
      <div className="fw-bolder text-center flex-shrink-0" style={rankStyle}>
        {rank === 1 ? <i className="fa-solid fa-medal text-warning fs-3"></i> : `#${rank}`}
      </div>
      <div className="flex-grow-1 min-w-0">
        <div className="fw-bolder text-wrap mb-1" style={{ fontSize: '1.1rem' }}>{song.name}</div>
        <div className="fw-bold text-secondary" style={{ fontSize: '0.85rem' }}>{song.artist}</div>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GAME COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const SongGame = memo(function SongGame({
  songs = [],
  storageKey = 'song_ranking_results',
  totalRounds,
  primaryColor = '#cb96c2',
  primaryGradient,
}: SongRankingGameProps) {
  const {
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
  } = useRankingEngine(songs, storageKey, totalRounds || Math.floor(songs.length * 2.5));

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const shareCardRef = useRef<ShareCardRef>(null);
  const generationStartedRef = useRef(false);

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
    return () => { mounted = false; };
  }, [gameState, resultImageUrl]);

  const themeStyle: RankingThemeStyle = useMemo(() => ({
    '--ranking-primary': primaryColor,
    '--ranking-primary-gradient': primaryGradient ?? primaryColor,
    '--ranking-primary-alpha': `${primaryColor}33`,
    '--rp-accent': primaryColor,
  } as RankingThemeStyle), [primaryColor, primaryGradient]);

  const viewAllSourceData = useMemo(
    () => viewAllSource === 'old' ? (oldRankedItems as RankedSong[]) : (rankedItems as RankedSong[]),
    [viewAllSource, oldRankedItems, rankedItems]
  );

  const handleBackFromViewAll = useCallback(
    () => setGameState(viewAllSource === 'old' ? 'old-results' : 'finished'),
    [setGameState, viewAllSource]
  );

  const handleShowOldResults = useCallback(() => setGameState('old-results'), [setGameState]);
  const handleShowViewAll = useCallback(() => {
    setViewAllSource(gameState === 'old-results' ? 'old' : 'current');
    setGameState('view-all-ranking');
  }, [gameState, setGameState, setViewAllSource]);

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
            <h1 className="ranking-planner-skin__title">เพลงไหนคือที่สุดในใจคุณ?</h1>
            <p className="ranking-planner-skin__lead">คัดสรรเพลงโปรดจากทั้งหมด {songs.length} เพลง</p>
          </header>
          <article className="ranking-planner-skin__card">
            <div className="ranking-planner-skin__cardBody">
              <h2 className="h6 fw-bold mb-0">พร้อมแล้วหรือยัง?</h2>
              <p className="ranking-planner-skin__desc">ที่จะหาเพลงอันดับ 1 ของคุณ 🎵</p>
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
    const sourceData = (gameState === 'finished' ? rankedItems.slice(0, 10) : (oldResults?.topRanking ?? [])) as RankedSong[];
    const winner = sourceData[0];
    return (
      <section className="sec-result py-3" style={themeStyle}>
        <div className="ranking-planner-skin__resultBlock">
          <header className="ranking-planner-skin__intro ranking-planner-skin__intro--tight">
            <h2 className="h5 fw-bold" style={{ color: primaryGradient ?? primaryColor }}>Song Ranking Results</h2>
            <p className="h4 fw-bold">{gameState === 'finished' ? 'ผลการจัดอันดับเพลงของคุณ' : 'ผลลัพธ์ที่บันทึกไว้'}</p>
          </header>

          {isGeneratingImage ? (
            <div className="text-center py-5 my-4">
              <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: primaryColor }} />
              <p className="fw-bold">กำลังประมวลผลรูปภาพผลลัพธ์...</p>
            </div>
          ) : resultImageUrl ? (
            <div className="text-center">
              <div className="ranking-planner-skin__figure mb-4 mx-auto shadow-sm" style={{ maxWidth: '500px' }}>
                <img className="img-fluid d-block mx-auto" src={resultImageUrl} alt="Song Ranking Results" />
              </div>
              <p className='mb-1'><small>(กดค้างที่รูปเพื่อดาวน์โหลดรูป)</small></p>
              <div className="ranking-planner-skin__actions">
                <DownloadButton imageUrl={resultImageUrl} isLoading={isGeneratingImage} primaryColor={primaryColor} primaryGradient={primaryGradient} />
              </div>
              <hr style={{ maxWidth: '500px', margin: '1.5rem auto' }} />
              <p className='mb-1'>แชร์ Ranking ของคุณบน <i className="fa-brands fa-x-twitter"></i></p>
              <a className="h3 fw-bold" style={{ color: primaryGradient ?? primaryColor }} href='https://x.com/hashtag/TheBestmySong?src=hashtag_click'>#TheBestmySong</a>
              <div className="ranking-planner-skin__actions">
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('#TheBestmySong')}`} target="_blank" rel="noopener noreferrer" className="ranking-planner-skin__ctaX">แชร์ไปยัง <i className="fa-brands fa-x-twitter"></i></a>
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
              cardId="song-share-result-card"
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
  const s1 = itemMap.get(id1) as Song;
  const s2 = itemMap.get(id2) as Song;
  if (!s1 || !s2) return null;

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
        <h2 className="ranking-planner-skin__title ranking-planner-skin__title--sm">เพลงไหนที่คุณชอบมากกว่ากัน?</h2>
      </header>
      <div className="ranking-arena mx-auto w-100 gap-2">
        <div className="flex-fill w-100">
          <SongChoice song={s1} onClick={() => handleChoice(s1.id)} />
        </div>
        <div className="ranking-vs d-flex align-items-center justify-content-center rounded-circle flex-shrink-0">VS</div>
        <div className="flex-fill w-100">
          <SongChoice song={s2} onClick={() => handleChoice(s2.id)} />
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

export default SongGame;

const SongChoice = memo(function SongChoice({ song, onClick }: { song: Song; onClick: () => void }) {
  const artistColor = getArtistColor(song.artist);
  const isGradient = artistColor.includes('gradient');

  return (
    <button type="button" className="ranking-choice w-100 p-0 overflow-hidden text-start border-0" onClick={onClick}>
      <div className="flex-grow-1 ranking-choice-info" style={{ minHeight: '170px', borderRadius: 'var(--r-large) !important' }}>
        <div className='p-3 px-4'>
          <div
            className="fw-bolder text-wrap mb-1"
            style={{ fontSize: '1.1rem', color: 'var(--c-content)', lineHeight: 1.2 }}
          >
            {song.name}
          </div>
          <div className="fw-bold" style={{ fontSize: '0.9rem', color: isGradient ? '#cb96c2' : artistColor }}>{song.artist}</div>
        </div>
      </div>
    </button>
  );
});
