import type { UnifiedEventConfig } from '../logic/types';

export const eventConfig: UnifiedEventConfig = {
    id: "bnk48-song",
    type: "ranking",
    rounds: "auto",
    data: [],
    plugin: {
        slug: "bnk48-song",
        name: "BNK48 Song Ranking",
        primaryColor: "#cb96c2",
        primaryHover: "#d5efff",
        theme: {
            primary: "#cb96c2",
            primaryHover: "#d5efff",
            bg: "#ffffff",
            surface: "#ffffff",
            surfaceAlt: "#f6f4fb",
            border: "#ede9f7",
            content: "#222233",
            textMuted: "#000000"
        },
        features: {
            songRanking: {
                enabled: true,
                pageTitle: "BNK48 Song Ranking - Niya BNK48's",
                description: "จัดอันดับเพลง BNK48 ที่คุณชอบที่สุด",
                storageKey: "ranking_bnk48_songs_results",
                brandTarget: "BNK48",
                listingImage: "/img/Ranking-song-bnk.png",
            }
        }
    }
};

export default eventConfig;
