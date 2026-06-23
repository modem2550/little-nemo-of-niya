import { findAct, ticketsFor, priceFor } from './scheduleUtils';
import type { ActivityConfig, PriceConfig } from './plannerUtils';

export async function drawRecapCanvas(
    canvas: HTMLCanvasElement,
    cart: Map<string, any>,
    opts: {
        DAY_ORDER: Record<string, number>;
        ACTIVITIES: ActivityConfig[];
        PRICES: PriceConfig;
        memberImg: (name: string) => string;
        memberMeta: (name: string) => any;
    }
): Promise<void> {
    const { DAY_ORDER, ACTIVITIES, PRICES, memberImg, memberMeta } = opts;
    
    await document.fonts.ready;

    const items = [...cart.values()].sort((a, b) => {
        const dCmp = (DAY_ORDER[a.day] ?? 0) - (DAY_ORDER[b.day] ?? 0);
        return dCmp || a.time.localeCompare(b.time);
    });
    items.forEach((c) => {
        if (!c.actSlug) c.actSlug = c.sid.split("__")[0];
    });

    let totalTix = 0,
        totalPrice = 0;
    const memberSet = new Set();
    items.forEach((c) => {
        totalTix +=
            ticketsFor(ACTIVITIES, c.actType, c.actName, c.actSlug, c.ticketsReq) *
            c.rounds;
        totalPrice +=
            priceFor(ACTIVITIES, PRICES, c.actType, c.actName, c.actSlug, c.ticketsReq) *
            c.rounds;
        memberSet.add(c.member);
    });

    const PAD = 20;
    const HDR_H = 64;
    const STAT_H = 72;
    const THEAD_H = 32;
    const ROW_H = 46;
    const FOOT_H = 56;
    const W = 800;
    const H = HDR_H + STAT_H + THEAD_H + items.length * ROW_H + FOOT_H;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2D context");
    ctx.scale(dpr, dpr);

    const C = {
        bg: "#ffffff",
        surface: "#f6f4fb",
        border: "#ede9f7",
        primary: "#292848",
        text: "#222233",
        muted: "#999999",
        fri: "#0ea5e9",
        sat: "#8b5cf6",
        sun: "#ef4444",
    };
    const DAY_COLOR: Record<string, string> = { fri: C.fri, sat: C.sat, sun: C.sun };

    function pill(color: string, x: number, y: number, w: number, h: number, r: number) {
        if (!ctx) return;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.fillStyle = color;
        ctx.fill();
    }

    function line(x1: number, y1: number, x2: number, y2: number, color = C.border) {
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }

    function txt(
        str: string,
        x: number,
        y: number,
        {
            size = 12,
            weight = "400",
            color = C.text,
            align = "left",
            font = "Outfit",
        }: {
            size?: number;
            weight?: string;
            color?: string;
            align?: CanvasTextAlign;
            font?: string;
        } = {},
    ) {
        if (!ctx) return;
        ctx.font = `${weight} ${size}px "${font}"`;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = "middle";
        ctx.fillText(str, x, y);
    }

    function hasThai(str: string) {
        return /[\u0E00-\u0E7F]/.test(str);
    }
    function smartFont(str: string) {
        return hasThai(str) ? "Noto Sans Thai" : "Outfit";
    }

    let y = 0;
    ctx.fillStyle = C.primary;
    ctx.fillRect(0, y, W, HDR_H);
    txt("BNK48 & CGM48 Siam-Nippon Summer Fest 2026", PAD, y + 22, {
        size: 14,
        weight: "700",
        color: "#ffffff",
    });
    txt("My Activity Recap  ·  little-nemo-of-niya", PAD, y + 44, {
        size: 11,
        color: "rgba(255,255,255,0.45)",
    });
    y += HDR_H;

    ctx.fillStyle = C.surface;
    ctx.fillRect(0, y, W, STAT_H);
    line(0, y + STAT_H, W, y + STAT_H);

    const stats = [
        { label: "ROUNDS", value: String(items.length) },
        { label: "MEMBERS", value: String(memberSet.size) },
        { label: "TICKETS", value: String(totalTix), big: true },
        { label: "TOTAL", value: `฿${totalPrice.toLocaleString()}` },
    ];
    const sw = W / stats.length;
    stats.forEach(({ label, value, big }, i) => {
        const sx = i * sw + sw / 2;
        txt(value, sx, y + 28, {
            size: big ? 26 : 22,
            weight: "700",
            color: C.primary,
            align: "center",
        });
        txt(label, sx, y + 54, {
            size: 10,
            color: C.muted,
            align: "center",
        });
        if (i < stats.length - 1)
            line(i * sw + sw, y + 12, i * sw + sw, y + STAT_H - 12);
    });
    y += STAT_H;

    ctx.fillStyle = C.surface;
    ctx.fillRect(0, y, W, THEAD_H);
    line(0, y + THEAD_H, W, y + THEAD_H);

    const cols = [
        { label: "MEMBER", x: PAD },
        { label: "ACTIVITY", x: PAD + 150 },
        { label: "DAY", x: PAD + 345 },
        { label: "TIME", x: PAD + 420 },
        { label: "ROUND", x: PAD + 530 },
        { label: "PRICE", x: W - PAD },
    ];
    cols.forEach(({ label, x }) => {
        const align: CanvasTextAlign = label === "PRICE" ? "right" : "left";
        txt(label, x, y + THEAD_H / 2, {
            size: 10,
            weight: "700",
            color: C.muted,
            align,
        });
    });
    y += THEAD_H;

    const loadImg = (src: string): Promise<HTMLImageElement | null> =>
        new Promise((resolve) => {
            if (!src) return resolve(null);
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });

    for (let idx = 0; idx < items.length; idx++) {
        const c = items[idx];
        const price =
            priceFor(ACTIVITIES, PRICES, c.actType, c.actName, c.actSlug, c.ticketsReq) *
            c.rounds;
        const cfg = findAct(ACTIVITIES, c.actName, c.actSlug);
        const ry = y + idx * ROW_H;
        const mid = ry + ROW_H / 2;

        ctx.fillStyle = C.surface;
        ctx.fillRect(0, ry, W, ROW_H);
        line(0, ry + ROW_H, W, ry + ROW_H);

        const isBNK = memberMeta(c.member).brand === "BNK48";
        ctx.beginPath();
        ctx.arc(cols[0].x + 13, mid, 13, 0, Math.PI * 2);

        const mImgSrc = memberImg(c.member);
        const mImg = await loadImg(mImgSrc);

        if (mImg) {
            ctx.save();
            ctx.clip();
            const sw = mImg.naturalWidth;
            const sh = mImg.naturalHeight;
            const side = Math.min(sw, sh);
            const sx = (sw - side) / 2;
            const sy = Math.max(0, (sh - side) * 0.15); // bias toward top (face)
            ctx.drawImage(
                mImg,
                sx,
                sy,
                side,
                side,
                cols[0].x,
                mid - 13,
                26,
                26,
            );
            ctx.restore();
            ctx.lineWidth = 1;
            ctx.strokeStyle = isBNK ? "#e8e4f8" : "#fce8f0";
            ctx.stroke();
        } else {
            ctx.fillStyle = isBNK ? "#e8e4f8" : "#fce8f0";
            ctx.fill();
            txt(c.member[0], cols[0].x + 13, mid, {
                size: 11,
                weight: "700",
                color: isBNK ? C.primary : "#c0397a",
                align: "center",
            });
        }

        txt(c.member, cols[0].x + 32, mid, { size: 12, weight: "700" });

        ctx.beginPath();
        ctx.arc(cols[1].x + 5, mid, 4, 0, Math.PI * 2);
        ctx.fillStyle = cfg.color;
        ctx.fill();
        txt(c.actName, cols[1].x + 14, mid, {
            size: 12,
            weight: "700",
            font: smartFont(c.actName),
        });

        const dc = DAY_COLOR[c.day] ?? "#9b90b8";
        pill(dc + "22", cols[2].x, mid - 10, 62, 20, 10);
        txt(c.dayLabel ?? c.day.toUpperCase(), cols[2].x + 31, mid, {
            size: 10,
            weight: "700",
            color: dc,
            align: "center",
        });

        txt(c.time, cols[3].x, mid, { size: 12, weight: "700" });

        pill(C.primary, cols[4].x, mid - 12, 24, 24, 12);
        txt(String(c.rounds), cols[4].x + 12, mid, {
            size: 11,
            weight: "700",
            color: "#fff",
            align: "center",
        });

        txt(
            price > 0 ? `฿${price.toLocaleString()}` : "—",
            W - PAD,
            mid,
            { size: 12, weight: "700", align: "right" },
        );
    }

    y += items.length * ROW_H;

    ctx.fillStyle = C.primary;
    ctx.fillRect(0, y, W, FOOT_H);
    txt("GRAND TOTAL", PAD, y + 20, {
        size: 10,
        color: "rgba(255,255,255,0.45)",
    });
    txt(`${totalTix} tickets · ${items.length} rounds`, PAD, y + 38, {
        size: 11,
        color: "rgba(255,255,255,0.35)",
    });
    txt(`฿${totalPrice.toLocaleString()}`, W - PAD, y + FOOT_H / 2, {
        size: 22,
        weight: "700",
        color: "#fff",
        align: "right",
    });
}
