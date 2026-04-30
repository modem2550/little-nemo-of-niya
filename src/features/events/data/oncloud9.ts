import type { UnifiedEventConfig } from '../logic/types';

export const eventConfig: UnifiedEventConfig = {
    id: "oncloud9", // changed to lowercase
    type: "planner",
    rounds: "auto",
    data: [],
    plugin: {
        slug: "oncloud9", // changed to lowercase
        name: "BNK48 & CGM48 On Cloud 9 Festival",
        primaryColor: "#8e6bc4",
        primaryHover: "#7e5fa8",
        theme: {
            primary: "#8e6bc4",
            primaryHover: "#7e5fa8",
            bg: "#0e0e10",
            surface: "#1e1e24",
            surfaceAlt: "#2a2a33",
            border: "#3d3d4a",
            content: "#ffffff",
            textMuted: "#a1a1aa"
        },
        features: {
            planner: {
                enabled: true,
                forcedTheme: "dark",
                pageTitle: "BNK48 & CGM48 On Cloud 9 Festival - Niya BNK48's",
                description: "วางแผนตารางเวลาของคุณสำหรับ On Cloud 9 Festival",
                officialLink: "https://www.facebook.com/share/p/1EQ4Q2NyjM/",
                storageKey: "oncloud9_planner", // changed to lowercase
                heroImage: "https://img2.pic.in.th/679067820_1538138747670766_1349428160000992650_n.png",
                listingImage: "/img/OnCloud9Fest.png",
                primaryHover: "#7e5fa8",
                prices: { ticket: 250, hub: 200 },
                days: [
                    { key: "sat", label: "SAT 30", short: "SAT 30", date: "2026-05-30" },
                    { key: "sun", label: "SUN 31", short: "SUN 31", date: "2026-05-31" },
                    { key: "mon", label: "MON 01", short: "MON 01", date: "2026-06-01" },
                ],
                activities: [],
                schedule: [],
                fallbackEmbedHtml: `<blockquote class="twitter-tweet" data-theme="dark" data-dnt="true" align="center"><p lang="en" dir="ltr">[💜💚] <a href="https://twitter.com/hashtag/BNK48CGM48OnCloud9Festival?src=hash&amp;ref_src=twsrc%5Etfw">#BNK48CGM48OnCloud9Festival</a><br><br>SAVE THE DATE!<br><br>BNK48 &amp; CGM48: On Cloud 9 Festival -9th Anniversary-<br>🗓️ 30 MAY - 1 JUN 2026<br>📍 MCC Hall, The Mall Lifestore Bangkae<a href="https://twitter.com/hashtag/PonytailtoShushuTH?src=hash&amp;ref_src=twsrc%5Etfw">#PonytailtoShushuTH</a><a href="https://twitter.com/hashtag/MCCHall?src=hash&amp;ref_src=twsrc%5Etfw">#MCCHall</a> <a href="https://twitter.com/hashtag/TheMallLifestoreBangkae?src=hash&amp;ref_src=twsrc%5Etfw">#TheMallLifestoreBangkae</a><a href="https://twitter.com/hashtag/BNK48?src=hash&amp;ref_src=twsrc%5Etfw">#BNK48</a> <a href="https://twitter.com/hashtag/CGM48?src=hash&amp;ref_src=twsrc%5Etfw">#CGM48</a> <a href="https://t.co/lXdtrxNUjj">pic.twitter.com/lXdtrxNUjj</a></p>&mdash; BNK48 (@bnk48official) <a href="https://twitter.com/bnk48official/status/2048739263739748360?ref_src=twsrc%5Etfw">April 27, 2026</a></blockquote>`
            }
        },
    }
}

export default eventConfig;