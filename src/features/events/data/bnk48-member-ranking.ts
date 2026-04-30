import type { UnifiedEventConfig } from '../logic/types';

export const eventConfig: UnifiedEventConfig = {
    id: "bnk48-member",
    type: "ranking",
    rounds: "auto",
    data: [],
    plugin: {
        slug: "bnk48-member",
        name: "BNK48",
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
            ranking: {
                enabled: true,
                pageTitle: "BNK48 Ranking - Niya BNK48's",
                description: "จัดอันดับเมมเบอร์ BNK48 ที่คุณชอบที่สุด",
                storageKey: "ranking_bnk48_results",
                brandTarget: "BNK48",
                listingImage: "/img/Ranking-member-bnk.png",
            }
        }
    }
};

export default eventConfig;