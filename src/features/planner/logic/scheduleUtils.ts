import type { ActivityConfig, DayConfig, PriceConfig } from './plannerUtils';

export function findAct(activities: ActivityConfig[], name: string, slug: string): ActivityConfig {
    const n = name ?? "";
    const s = slug ?? "";
    return (
        activities.find(
            (a) =>
                a.slug === s ||
                (a.match ?? []).some(
                    (k) =>
                        n.toLowerCase().includes(k.toLowerCase()) ||
                        s.toLowerCase().includes(k.toLowerCase()),
                ),
        ) ?? {
            icon: "fa-solid fa-ticket",
            color: "#8b5cf6",
            desc: "",
            slug: s,
            name: name,
            match: []
        }
    );
}

export function actType(activities: ActivityConfig[], name: string, slug: string): string {
    return findAct(activities, name, slug).type ?? "normal";
}

export function ticketsFor(activities: ActivityConfig[], type: string, name: string, slug: string, override?: number | null): number {
    if (type === "merch" || type === "hub") return 0;
    return override ?? findAct(activities, name, slug).tickets ?? 1;
}

export function priceFor(
    activities: ActivityConfig[],
    prices: PriceConfig,
    type: string,
    name: string,
    slug: string,
    override?: number | null
): number {
    if (type === "merch") return 0;
    if (type === "hub") return prices.hub;
    return ticketsFor(activities, type, name, slug, override) * prices.ticket;
}

export function parseTimeRange(range: string): { startMin: number; endMin: number } {
    const parts = range.replace(/–|-/g, "–").split("–");
    const toMin = (s: string) => {
        if (!s) return 0;
        const [h, m] = s.trim().split(":").map(Number);
        return h * 60 + (m || 0);
    };
    return {
        startMin: toMin(parts[0]),
        endMin: toMin(parts[1] ?? parts[0]),
    };
}

export function bkkNow(): Date {
    return new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" }),
    );
}

export function nowMinutes(): number {
    const b = bkkNow();
    return b.getHours() * 60 + b.getMinutes();
}

export function detectTodayKey(days: DayConfig[]): string | null {
    const b = bkkNow();
    const y = b.getFullYear();
    const m = String(b.getMonth() + 1).padStart(2, "0");
    const d = String(b.getDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;

    const found = days.find((day) => day.date === todayStr);
    return found?.key ?? null;
}


export function groupSlotsByTime(daySlots: any[]) {
    const byTime: Record<string, any[]> = {};
    daySlots.forEach((s) => {
        byTime[s.time] ??= [];
        byTime[s.time].push(s);
    });
    return byTime;
}

export function findCurrentAndNextTime(sortedTimes: string[], nowMin: number) {
    let currentTime = null;
    let nextTime = null;
    for (const time of sortedTimes) {
        const { startMin, endMin } = parseTimeRange(time);
        if (nowMin >= startMin && nowMin < endMin) {
            currentTime = time;
        } else if (nowMin < startMin && nextTime === null) {
            nextTime = time;
        }
    }
    return { currentTime, nextTime };
}

export function filterAndSortCart(
    cartMap: Map<string, any>,
    summaryDay: string,
    sortOpts: { key: string; dir: string },
    opts: { DAY_ORDER: Record<string, number>; ACTIVITIES: ActivityConfig[]; PRICES: PriceConfig }
) {
    const { DAY_ORDER, ACTIVITIES, PRICES } = opts;
    return [...cartMap.values()]
        .filter((c) => summaryDay === "all" || c.day === summaryDay)
        .sort((a, b) => {
            let cmp = 0;
            switch (sortOpts.key) {
                case "day":
                    cmp = (DAY_ORDER[a.day] ?? 0) - (DAY_ORDER[b.day] ?? 0);
                    if (!cmp) cmp = a.time.localeCompare(b.time);
                    break;
                case "member":
                    cmp = a.member.localeCompare(b.member, "th");
                    break;
                case "activity":
                    cmp = a.actName.localeCompare(b.actName, "th");
                    break;
                case "round":
                    cmp = a.rounds - b.rounds;
                    break;
                case "price":
                    cmp =
                        priceFor(ACTIVITIES, PRICES, a.actType, a.actName, a.actSlug, a.ticketsReq) * a.rounds -
                        priceFor(ACTIVITIES, PRICES, b.actType, b.actName, b.actSlug, b.ticketsReq) * b.rounds;
                    break;
            }
            return sortOpts.dir === "asc" ? cmp : -cmp;
        });
}
