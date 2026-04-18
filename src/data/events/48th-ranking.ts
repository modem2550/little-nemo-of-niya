import type { EventPlugin } from '../../types/event';

export const fortyEightRanking: EventPlugin = {
    slug: "48th",
    name: "48th Member Ranking",
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
        ranking: {
            enabled: true,
            pageTitle: "48th Member Ranking - Niya BNK48's",
            description: "เลือกเมมเบอร์จากทั้ง BNK48 และ CGM48 ที่คุณชอบมากที่สุด",
            storageKey: "ranking_48th_results",
            brandTarget: "48th",
            rounds: 174,
            primaryGradient: "linear-gradient(90deg, #cb96c2 0%, #3CC2B1 100%)",
            listingImage: "https://img1.pic.in.th/images/BNK48CGM48.png",
        }
    }
};