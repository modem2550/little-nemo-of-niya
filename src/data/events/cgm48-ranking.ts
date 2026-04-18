import type { EventPlugin } from '../../types/event';

export const cgm48Ranking: EventPlugin = {
    slug: "CGM48",
    name: "CGM48 Member Ranking",
    primaryColor: "#3CC2B1",
    primaryHover: "#2bb09f",
    theme: {
        primary: "#3CC2B1",
        primaryHover: "#2bb09f",
        bg: "#F7F7F8",
        surface: "#ffffff",
        surfaceAlt: "#f6f4fb",
        border: "#ede9f7",
        content: "#222233",
        textMuted: "#000000"
    },
    features: {
        ranking: {
            enabled: true,
            pageTitle: "CGM48 Member Ranking - Niya BNK48's",
            description: "เลือกเมมเบอร์ CGM48 ที่คุณชอบมากที่สุด",
            storageKey: "ranking_cgm48_results",
            brandTarget: "CGM48",
            rounds: 63,
            listingImage: "https://img2.pic.in.th/CGM48.png",
        }
    }
};