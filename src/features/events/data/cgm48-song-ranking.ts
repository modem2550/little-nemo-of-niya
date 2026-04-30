import type { UnifiedEventConfig } from '../logic/types';

export const eventConfig: UnifiedEventConfig = {
    id: "cgm48-song",
    type: "ranking",
    rounds: "auto",
    data: [],
    plugin: {
        slug: "cgm48-song",
        name: "CGM48 Song Ranking",
        primaryColor: "#3CC2B1",
        primaryHover: "#d5efff",
        theme: {
            primary: "#3CC2B1",
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
                pageTitle: "CGM48 Song Ranking - Niya BNK48's",
                description: "จัดอันดับเพลง CGM48 ที่คุณชอบที่สุด",
                storageKey: "ranking_cgm48_songs_results",
                brandTarget: "CGM48",
                listingImage: "/img/Ranking-song-cgm.png",
            }
        }
    }
};

export default eventConfig;
