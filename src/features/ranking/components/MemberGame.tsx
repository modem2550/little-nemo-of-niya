import { memo, useMemo } from 'react';
import type { Member } from '@/types/member';
import RankingGame from './RankingGame';

interface MemberRankingGameProps {
    members: Member[];
    storageKey: string;
    totalRounds: number;
    primaryColor: string;
    primaryGradient?: string;
    brand: 'BNK48' | 'CGM48' | '48th';
}

const MemberChoice = memo(function MemberChoice({ member, onClick }: { member: Member; onClick: () => void }) {
    const brandColor = useMemo(() =>
        member.brand === 'BNK48' ? 'var(--c-bnk)' : member.brand === 'CGM48' ? 'var(--c-cgm)' : 'var(--c-primary)',
        [member.brand]);

    return (
        <button type="button" className="ranking-choice w-100 p-0 overflow-hidden text-start border-0" onClick={onClick}>
            <div className="ranking-choice__figure overflow-hidden">
                <img src={member.profile_image_url || ''} alt={member.name} className="ranking-choice__img" loading="lazy" />
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

const MemberRankingRow = memo(function MemberRankingRow({ item: member, rank, primaryColor }: { item: Member & { score: number; elo: number }; rank: number; primaryColor: string }) {
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
                <img src={member.profile_image_url || ''} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
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

const MemberGame = memo(function MemberGame({
    members = [],
    storageKey = 'ranking_results',
    totalRounds,
    primaryColor = '#292848',
    primaryGradient,
    brand = '48th',
}: MemberRankingGameProps) {
    return (
        <RankingGame
            items={members}
            storageKey={storageKey}
            totalRounds={totalRounds}
            primaryColor={primaryColor}
            primaryGradient={primaryGradient}
            gameType="member"
            brandName={brand}
            menuTitle="พร้อมจะค้นพบโอชิอันดับ 1 ของคุณหรือยัง?"
            menuSubtitle={`ค้นหาว่าใครคือที่สุดของใจคุณ จากเมมเบอร์ ${members.length} คน`}
            menuActionDesc="ที่จะโอชิในตัวจิงของคุณณณณณ​ 🫵"
            arenaTitle="เมมเบอร์คนไหนที่คุณโอชิมากกว่า?"
            resultTitle={`${brand}'s The best your Oshi`}
            resultSubtitle="ผลการจัดอันดับโอชิของคุณ"
            twitterHashtag="TheBestmyOshi"
            twitterText={encodeURIComponent('TheBestmyOshi')}
            downloadNamePrefix="oshi-ranking"
            viewAllTitle="The Best my Oshi in Member Ranking ทั้งหมด"
            viewAllTotalLabel={(total) => `รวมทั้งหมด ${total} คน`}
            renderChoice={(item, onClick) => <MemberChoice member={item} onClick={onClick} />}
            renderRankingRow={(item, rank, color) => <MemberRankingRow item={item} rank={rank} primaryColor={color} />}
        />
    );
});

export default MemberGame;
