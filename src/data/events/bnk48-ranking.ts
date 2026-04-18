import type { EventPlugin } from '../../types/event';

export const bnk48Ranking: EventPlugin = {
    slug: "BNK48",
    name: "BNK48 Member Ranking",
    primaryColor: "#cb96c2",
    primaryHover: "#cb96c2",
    theme: {
        primary: "#cb96c2",
        primaryHover: "#cb96c2",
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
            pageTitle: "BNK48 Member Ranking - Niya BNK48's",
            description: "เลือกเมมเบอร์ BNK48 ที่คุณชอบมากที่สุด",
            storageKey: "ranking_bnk48_results",
            brandTarget: "BNK48",
            rounds: 111,
            listingImage: "https://img2.pic.in.th/BNK48.png",
        }
    }
};