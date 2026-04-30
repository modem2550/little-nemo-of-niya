import type { UnifiedEventConfig } from '../logic/types';

export const eventConfig: UnifiedEventConfig = {
    id: "48th-song",
    type: "ranking",
    rounds: "auto",
    data: [],
    plugin: {
        slug: "48th-song",
        name: "48th Song Ranking",
        primaryColor: "#cb96c2",
        primaryHover: "#3CC2B1",
        primaryGradient: "linear-gradient(90deg, #cb96c2 0%, #3CC2B1 100%)",
        theme: {
            primary: "linear-gradient(90deg, #cb96c2 0%, #3CC2B1 100%)",
            primaryHover: "linear-gradient(90deg, #cb96c2 0%, #3CC2B1 100%)",
            primaryGradient: "linear-gradient(90deg, #cb96c2 0%, #3CC2B1 100%)",
            bg: "#F7F7F8",
            surface: "#ffffff",
            surfaceAlt: "#f6f4fb",
            border: "#ede9f7",
            content: "#222233",
            textMuted: "#000000"
        },
        features: {
            songRanking: {
                enabled: true,
                pageTitle: "48th Song Ranking - Niya BNK48's",
                description: "จัดอันดับเพลง BNK48 และ CGM48 ที่คุณชอบที่สุด",
                storageKey: "ranking_48th_songs_results",
                primaryGradient: "linear-gradient(90deg, #cb96c2 0%, #3CC2B1 100%)",
                listingImage: "/img/Ranking-song-48th.png",
            },
        }
    }
};

export default eventConfig;
