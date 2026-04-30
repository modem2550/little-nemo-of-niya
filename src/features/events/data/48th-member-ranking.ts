import type { UnifiedEventConfig } from '../logic/types';

export const eventConfig: UnifiedEventConfig = {
    id: "48th-member",
    type: "ranking",
    rounds: "auto",
    data: [],
    plugin: {
        slug: "48th-member",
        name: "48th Group",
        primaryColor: "#cb96c2",
        primaryHover: "#3CC2B1",
        primaryGradient: "linear-gradient(90deg, #cb96c2 0%, #3CC2B1 100%)",
        theme: {
            primary: "linear-gradient(90deg, #cb96c2 0%, #3CC2B1 100%)",
            primaryHover: "linear-gradient(90deg, #cb96c2 0%, #3CC2B1 100%)",
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
                pageTitle: "48th Group Ranking - Niya BNK48's",
                description: "จัดอันดับเมมเบอร์ BNK48 และ CGM48 ที่คุณชอบที่สุด",
                storageKey: "ranking_48th_results",
                brandTarget: "48th",
                listingImage: "/img/Ranking-member-48th.png",
            }
        }
    }
};

export default eventConfig;