import type { EventPlugin } from '@/types/event';

const niyaLevelUp: EventPlugin = {
    slug: "NiyaLevelUp",
    name: "Niya Level Up Project",
    primaryColor: "#fc809f",
    primaryHover: "#fb4774",
    theme: {
        primary: "#fc809f",
        primaryHover: "#fb4774",
        bg: "#ffffff",
        surface: "#ffffff",
        surfaceAlt: "#f8fafc",
        border: "#e2e8f0",
        content: "#0f172a",
        textMuted: "#64748b"
    },
    features: {
        planner: {
            enabled: true,
            href: "/project/NiyaLevelUp",
            pageTitle: "Niya Level Up Project",
            description: "General Election ให้นีญ่าได้ไปติด Senbatsu",
            heroImage: "https://img2.pic.in.th/Untitled-1656a008758cf5461.png", // fallback placeholder from summerfest
            listingImage: "https://img2.pic.in.th/New-Project004abcd1037680ae.png", // fallback placeholder
            primaryHover: "#fb4774",
        }
    }
};

export default niyaLevelUp;
