import { useState, useEffect, useCallback, useMemo, useRef, forwardRef, useImperativeHandle, memo } from 'react';
import { urlToBase64, ensureDomToImage, waitForFonts, waitForImageElement } from '@/shared/utils/imageCapture';
import type { Member } from '@/types/member';
import type { Song } from '@/types/song';

export interface ShareCardRef {
    generateImage: () => Promise<string>;
}

export type RankedMember = Member & { score: number; elo: number };
export type RankedSong = Song & { score: number; elo: number };

export type ResultShareCardProps = {
    cardId: string;
    primaryColor: string;
    primaryGradient?: string;
} & (
    | {
          variant: 'member';
          winner: RankedMember;
          rankResults: RankedMember[];
          brandName?: string;
      }
    | {
          variant: 'song';
          winner: RankedSong;
          rankResults: RankedSong[];
      }
);

// ═══════════════════════════════════════════════════════════════════════════
// MEMBER SHARE CARD
// ═══════════════════════════════════════════════════════════════════════════

const MemberShareCard = memo(forwardRef<ShareCardRef, Extract<ResultShareCardProps, { variant: 'member' }>>(
    ({ winner, rankResults, primaryColor, primaryGradient, brandName = '48th Group', cardId }, ref) => {
        const cardRef = useRef<HTMLDivElement>(null);
        const [bgBase64, setBgBase64] = useState<string | null>(null);
        const [winnerBase64, setWinnerBase64] = useState<string | null>(null);
        const [top10Base64, setTop10Base64] = useState<Record<number, string>>({});
        const resourcesReadyRef = useRef(false);

        useEffect(() => {
            let cancelled = false;
            
            const loadResources = async () => {
                try {
                    const [bg, winnerImg] = await Promise.all([
                        urlToBase64('/img/bg-ranking-member.png'),
                        urlToBase64(winner.profile_image_url || '')
                    ]);
                    
                    if (cancelled) return;
                    setBgBase64(bg);
                    setWinnerBase64(winnerImg);
                    
                    const top10 = rankResults.slice(1, 10);
                    const top10Results = await Promise.all(
                        top10.map(async (m) => ({ id: m.id, data: await urlToBase64(m.profile_image_url || '') }))
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
                const start = Date.now();
                while (!resourcesReadyRef.current && Date.now() - start < 15000) {
                    await new Promise(r => setTimeout(r, 200));
                }

                await Promise.all([
                    ensureDomToImage(),
                    waitForFonts(),
                ]);

                await new Promise(r => requestAnimationFrame(r));
                await new Promise(r => requestAnimationFrame(r));
                await new Promise(r => setTimeout(r, 800));

                const container = cardRef.current;
                const images = Array.from(container.querySelectorAll('img'));
                
                await Promise.all(images.map(img => waitForImageElement(img, 5000)));

                await new Promise(r => requestAnimationFrame(r));
                await new Promise(r => setTimeout(r, 500));

                const dataUrl = await (window as any).domtoimage.toPng(cardRef.current, {
                    width: 1080,
                    height: 1920,
                    style: {
                        transform: 'scale(1)',
                        transformOrigin: 'top left',
                        visibility: 'visible',
                    },
                    filter: (node: any) => {
                        if (node.tagName === 'SCRIPT') return false;
                        if (node.tagName === 'LINK' && node.rel === 'stylesheet') {
                            const href = node.href || '';
                            if (href.includes('fontawesome')) return false;
                        }
                        return true;
                    }
                });

                return dataUrl;
            } catch (err) {
                console.error('[generateImage] FAILED:', err);
                throw err;
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
                    <img
                        src={winnerBase64 || winner.profile_image_url || ''}
                        style={{
                            position: 'absolute',
                            top: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center top',
                            overflow: 'hidden',
                        }}
                        alt="winner"
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
                                    <img
                                        src={top10Base64[m.id] || m.profile_image_url || ''}
                                        style={{
                                            width: 125,
                                            height: 125,
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            objectPosition: 'center top',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                            display: 'block'
                                        }}
                                        alt={m.name}
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
MemberShareCard.displayName = 'MemberShareCard';

// ═══════════════════════════════════════════════════════════════════════════
// SONG SHARE CARD
// ═══════════════════════════════════════════════════════════════════════════

const SongShareCard = memo(forwardRef<ShareCardRef, Extract<ResultShareCardProps, { variant: 'song' }>>(
    ({ winner, rankResults, primaryColor, primaryGradient, cardId }, ref) => {
        const cardRef = useRef<HTMLDivElement>(null);
        const [bgBase64, setBgBase64] = useState<string | null>(null);
        const resourcesReadyRef = useRef(false);

        useEffect(() => {
            let cancelled = false;
            const loadResources = async () => {
                try {
                    const bg = await urlToBase64('/img/bg-ranking-song.png');
                    if (!cancelled) {
                        setBgBase64(bg);
                        resourcesReadyRef.current = true;
                    }
                } catch (err) {
                    console.error('[ResultShareCard] Failed to load background:', err);
                }
            };
            loadResources();
            return () => { cancelled = true; };
        }, []);

        const generateImage = useCallback(async () => {
            if (!cardRef.current) throw new Error("Ref not ready");

            try {
                if (!resourcesReadyRef.current) {
                    const start = Date.now();
                    while (!resourcesReadyRef.current && Date.now() - start < 10000) {
                        await new Promise(r => setTimeout(r, 100));
                    }
                }

                await Promise.all([
                    ensureDomToImage(),
                    waitForFonts(),
                ]);

                await new Promise(r => requestAnimationFrame(r));
                await new Promise(r => requestAnimationFrame(r));
                await new Promise(r => setTimeout(r, 600));

                const bgImg = cardRef.current.querySelector('img');
                if (bgImg) {
                    await waitForImageElement(bgImg as HTMLImageElement, 5000);
                }

                await new Promise(r => requestAnimationFrame(r));
                await new Promise(r => setTimeout(r, 400));

                const el = cardRef.current;
                const dataUrl = await (window as any).domtoimage.toPng(el, {
                    width: 1080,
                    height: 1920,
                    style: {
                        transform: 'scale(1)',
                        transformOrigin: 'top left',
                        visibility: 'visible',
                    },
                });

                return dataUrl;
            } catch (err) {
                console.error('[generateImage] FAILED:', err);
                throw err;
            }
        }, [bgBase64]);

        useImperativeHandle(ref, () => ({ generateImage }), [generateImage]);

        const top10 = useMemo(() => rankResults.slice(0, 10), [rankResults]);

        const groupTitle = useMemo(() => {
            const isBNK = rankResults.some(s => s.artist.includes('BNK48'));
            const isCGM = rankResults.some(s => s.artist.includes('CGM48'));
            if (isBNK && isCGM) return "48TH GROUP'S SONGS";
            if (isBNK) return "BNK48'S SONGS";
            if (isCGM) return "CGM48'S SONGS";
            return "MY TOP'S SONGS";
        }, [rankResults]);

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
                    fontFamily: "'ps_pimpdeediiM', serif",
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                }}
            >
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

                {/* Background */}
                <img
                    src={bgBase64 || '/img/bg-ranking-song.png'}
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
                    color: '#334155',
                    gap: '35px',
                    paddingTop: '0px'
                }}>
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
                                    <div style={{
                                        width: 70,
                                        fontWeight: 900,
                                        fontSize: 44,
                                        color: '#5e5952',
                                        textAlign: 'center',
                                    }}>
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
SongShareCard.displayName = 'SongShareCard';

const ResultShareCard = memo(forwardRef<ShareCardRef, ResultShareCardProps>((props, ref) => {
    if (props.variant === 'member') {
        return <MemberShareCard {...props} ref={ref} />;
    } else {
        return <SongShareCard {...props} ref={ref} />;
    }
}));
ResultShareCard.displayName = 'ResultShareCard';

export default ResultShareCard;
