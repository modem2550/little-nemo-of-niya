import type { UnifiedEventConfig } from '../logic/types';

export const eventConfig: UnifiedEventConfig = {
    id: "niya-levelup",
    type: "fan_project",
    rounds: "auto",
    data: [],
    plugin: {
        slug: "niya-levelup",
        name: "Niya Level Up Fan Project",
        primaryColor: "#ff2e63",
        primaryHover: "#d5efff",
        theme: {
            primary: "#ff2e63",
            primaryHover: "#d5efff",
            bg: "#ffffff",
            surface: "#ffffff",
            surfaceAlt: "#f6f4fb",
            border: "#ede9f7",
            content: "#222233",
            textMuted: "#000000"
        },
        features: {
            planner: {
                enabled: true,
                href: "/projects/niya-levelup",
                pageTitle: "Niya Level Up Fan Project - Niya BNK48's",
                description: "ร่วมโปรเจกต์พิเศษสำหรับ Niya BNK48",
                officialLink: "https://www.facebook.com/share/p/16K1Y8Z7qW/",
                storageKey: "niya_levelup",
                heroImage: "https://img2.pic.in.th/Untitled-1656a008758cf5461.png",
                listingImage: "https://img2.pic.in.th/New-Project004abcd1037680ae.png",
                primaryHover: "#d5efff",
            }
        }
    }
};

export default eventConfig;
