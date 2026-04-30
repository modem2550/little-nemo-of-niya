import type { UnifiedEventConfig } from '../logic/types';

export const eventConfig: UnifiedEventConfig = {
    id: "cgm48-member",
    type: "ranking",
    rounds: "auto",
    data: [],
    plugin: {
        slug: "cgm48-member",
        name: "CGM48",
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
            ranking: {
                enabled: true,
                pageTitle: "CGM48 Ranking - Niya BNK48's",
                description: "จัดอันดับเมมเบอร์ CGM48 ที่คุณชอบที่สุด",
                storageKey: "ranking_cgm48_results",
                brandTarget: "CGM48",
                listingImage: "/img/Ranking-member-cgm.png",
            }
        }
    }
};

export default eventConfig;