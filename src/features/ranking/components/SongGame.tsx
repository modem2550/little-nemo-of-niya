import { memo, useMemo } from 'react';
import type { Song } from '@/types/song';
import RankingGame from './RankingGame';

interface SongRankingGameProps {
  songs: Song[];
  storageKey: string;
  totalRounds: number;
  primaryColor: string;
  primaryGradient?: string;
}

function getArtistColor(artist: string): string {
  const hasBNK = artist.includes('BNK48');
  const hasCGM = artist.includes('CGM48');
  if (hasBNK && hasCGM) {
    return 'linear-gradient(90deg, #cb96c2 0%, #3cc2b1 100%)';
  } else if (hasCGM) {
    return '#3cc2b1';
  } else {
    return '#cb96c2';
  }
}

const SongChoice = memo(function SongChoice({ song, onClick }: { song: Song; onClick: () => void }) {
  const artistColor = getArtistColor(song.artist);
  const isGradient = artistColor.includes('gradient');

  return (
    <button type="button" className="ranking-choice w-100 p-0 overflow-hidden text-start border-0" onClick={onClick}>
      <div className="flex-grow-1 ranking-choice-info" style={{ minHeight: '170px', borderRadius: 'var(--r-large)' }}>
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

const SongRankingRow = memo(function SongRankingRow({ item: song, rank, primaryColor }: { item: Song & { score: number; elo: number }; rank: number; primaryColor: string }) {
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
      <div className="flex-shrink-0 text-end d-flex flex-column" style={{ minWidth: '60px' }}>
        <div className="fw-bolder" style={{ color: primaryColor, fontSize: '1rem' }}>{song.score} <small style={{ fontSize: '0.65rem', opacity: 0.7 }}>WINS</small></div>
        <div className="fw-bold text-muted" style={{ fontSize: '0.7rem' }}>{song.elo} <small style={{ fontSize: '0.55rem', opacity: 0.6 }}>ELO</small></div>
      </div>
    </div>
  );
});

const SongGame = memo(function SongGame({
  songs = [],
  storageKey = 'song_ranking_results',
  totalRounds,
  primaryColor = '#cb96c2',
  primaryGradient,
}: SongRankingGameProps) {
  return (
    <RankingGame
      items={songs}
      storageKey={storageKey}
      totalRounds={totalRounds}
      primaryColor={primaryColor}
      primaryGradient={primaryGradient}
      gameType="song"
      menuTitle="เพลงไหนคือที่สุดในใจคุณ?"
      menuSubtitle={`คัดสรรเพลงโปรดจากทั้งหมด ${songs.length} เพลง`}
      menuActionDesc="ที่จะหาเพลงอันดับ 1 ของคุณ 🎵"
      arenaTitle="เพลงไหนที่คุณชอบมากกว่ากัน?"
      resultTitle="Song Ranking Results"
      resultSubtitle="ผลการจัดอันดับเพลงของคุณ"
      twitterHashtag="TheBestmySong"
      twitterText={encodeURIComponent('#TheBestmySong')}
      downloadNamePrefix="song-ranking"
      viewAllTitle="The Best my Oshi in Song Ranking ทั้งหมด"
      viewAllTotalLabel={(total) => `รวมทั้งหมด ${total} เพลง`}
      renderChoice={(item, onClick) => <SongChoice song={item} onClick={onClick} />}
      renderRankingRow={(item, rank, color) => <SongRankingRow item={item} rank={rank} primaryColor={color} />}
    />
  );
});

export default SongGame;
