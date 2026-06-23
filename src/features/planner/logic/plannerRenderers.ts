import { findAct, ticketsFor, priceFor } from './scheduleUtils';
import type { ActivityConfig, PriceConfig } from './plannerUtils';

export function buildActInfoHtml(cfg: any) {
    if (!cfg.desc && !cfg.warning) return "";
    const warnIcon =
        cfg.warningLevel === "danger"
            ? `<i class="fa-solid fa-ban"></i>`
            : `<i class="fa-solid fa-triangle-exclamation"></i>`;
    return `<div class="act-info-bar">
        ${cfg.desc ? `<div class="act-info-desc">${cfg.desc}</div>` : ""}
        ${cfg.warning ? `<div class="act-warn act-warn--${cfg.warningLevel ?? "warn"}">${warnIcon}${cfg.warning}</div>` : ""}
    </div>`;
}

export function renderActCardsHtml(
    time: string, 
    byTime: Record<string, any[]>, 
    opts: { 
        past?: boolean; 
        ACTIVITIES: ActivityConfig[];
        memberImg: (name: string) => string;
        isSelected: (name: string) => boolean;
    }
) {
    const { ACTIVITIES, memberImg, isSelected } = opts;
    const slots = byTime[time];
    const byAct: Record<string, any> = {};
    slots.forEach((s) => {
        byAct[s.actSlug] ??= {
            actName: s.actName,
            members: [],
            actSlug: s.actSlug,
        };
        s.members.forEach((m: string) => {
            if (!byAct[s.actSlug].members.includes(m))
                byAct[s.actSlug].members.push(m);
        });
    });
    return Object.values(byAct)
        .map((a) => {
            const cfg = findAct(ACTIVITIES, a.actName, a.actSlug);
            const memberPills = a.members
                .map((m: string) => {
                    const img = memberImg(m);
                    const sel = isSelected(m);
                    const imgEl = img
                        ? `<img src="${img}" alt="${m}" style="width:20px;height:20px;border-radius:50%;object-fit:cover;object-position:top;flex-shrink:0${opts.past ? ";opacity:.5" : ""}" onerror="this.style.display='none'">`
                        : `<span style="width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;background:${cfg.color}22;color:${cfg.color};flex-shrink:0${opts.past ? ";opacity:.5" : ""}"><span style="color: ${cfg.color}">${m[0]}</span></span>`;
                    return `<span class="now-member-pill ${sel ? "now-member-pill--sel" : ""}">${imgEl}${m}</span>`;
                })
                .join("");
            return `<div class="now-act-card${opts.past ? " now-act-card--past" : ""}">
            <div class="now-act-card__header">
                <span class="now-act-card__icon" style="background:${cfg.color}${opts.past ? ";opacity:.5" : ""}"><i class="${cfg.icon}"></i></span>
                <span class="now-act-card__name"${opts.past ? ' style="opacity:.5"' : ""}>${a.actName}</span>
            </div>
            <div class="now-member-wrap">${memberPills}</div>
        </div>`;
        })
        .join("");
}

export function renderSummaryRowHtml(
    c: any,
    opts: {
        ACTIVITIES: ActivityConfig[];
        PRICES: PriceConfig;
        memberImg: (name: string) => string;
        memberMeta: (name: string) => any;
    }
) {
    const { ACTIVITIES, PRICES, memberImg, memberMeta } = opts;
    if (!c.actSlug) c.actSlug = c.sid.split("__")[0];
    const isBNK = memberMeta(c.member)?.brand === "BNK48";
    const img = memberImg(c.member);
    const avHTML = img
        ? `<img src="${img}" alt="${c.member}" class="tbl-av" loading="lazy" onerror="this.outerHTML='<div class=\'tbl-av-fallback ${isBNK ? "av--bnk" : "av--cgm"}\'>${c.member[0]}</div>'">`
        : `<div class="tbl-av-fallback ${isBNK ? "av--bnk" : "av--cgm"}">${c.member[0]}</div>`;
    const tix = ticketsFor(ACTIVITIES, c.actType, c.actName, c.actSlug, c.ticketsReq) * c.rounds;
    const price = priceFor(ACTIVITIES, PRICES, c.actType, c.actName, c.actSlug, c.ticketsReq) * c.rounds;
    const priceStr = price > 0 ? `฿${price.toLocaleString()}` : "—";
    const cfg = findAct(ACTIVITIES, c.actName, c.actSlug);
    return `<tr>
    <td><div class="tbl-member-cell">${avHTML}<span class="tbl-name">${c.member}</span></div></td>
    <td><div class="d-flex align-items-center gap-2" style="font-size:12px"><span style="width:20px;height:20px;border-radius:6px;background:${cfg.color};display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"><i class="${cfg.icon}" style="font-size:9px;color:#fff"></i></span>${c.actName}</div></td>
    <td style="text-align:center"><span class="day-chip ${c.day}">${c.dayLabel}</span></td>
    <td style="font-variant-numeric:tabular-nums;font-size:12px;text-align:center">${c.time}</td>
    <td class="text-center"><span class="tbl-ticket-badge">${c.rounds}</span>${tix > 0 ? `<div style="font-size:10px;color:#b0a8c4;margin-top:2px">${tix} Ticket</div>` : ""}</td>
    <td class="text-end"><div class="d-flex align-items-center justify-content-end gap-2"><span style="font-weight:700;color:var(--c-primary)">${priceStr}</span><button class="tbl-del-btn" onclick="APP.removeFromCart('${c.sid}')" title="Remove"><i class="fa-solid fa-xmark"></i></button></div></td>
</tr>`;
}

export function buildSlotRowHTML(
    actSlug: string,
    slotId: string,
    day: string,
    entry: any,
    firstRow: any,
    aType: string,
    opts: {
        ACTIVITIES: ActivityConfig[];
        cartQty: (sid: string) => number;
    }
) {
    const { ACTIVITIES, cartQty } = opts;
    const memberName = entry.members[0];
    const sid = `${actSlug}__${slotId}__${memberName}`;
    const qty = cartQty(sid);
    const cfg = findAct(ACTIVITIES, firstRow.activity_name, actSlug);

    const p = [
        `'${sid}'`,
        `'${actSlug}'`,
        `'${slotId}'`,
        `'${memberName}'`,
        `'${encodeURIComponent(firstRow.activity_name)}'`,
        `'${day}'`,
        `'${encodeURIComponent(entry.row.time_range)}'`,
        `'${encodeURIComponent(aType)}'`,
        firstRow.tickets_required ?? "null",
        `'${encodeURIComponent((entry.row.slot_members ?? []).join(","))}'`,
    ].join(",");

    const slotMembers = entry.row.slot_members?.length
        ? entry.row.slot_members
        : entry.members;
    const memberBadges = slotMembers
        .map((m: string) => {
            const isSelected = entry.members.includes(m);
            if (isSelected) {
                return `<span style="background: var(--c-primary);color:#fff;border-radius:100px;padding:1px 8px;font-size:11px;font-weight:700">${m}</span>`;
            } else {
                return `<span style="background:var(--c-surface-alt);color:var(--c-content);border-radius:100px;padding:1px 8px;font-size:11px;font-weight:500">${m}</span>`;
            }
        })
        .join("");

    return `<div class="slot-row ${qty > 0 ? "has-rounds" : ""}" style="--act-color:${cfg.color}">
                <div class="slot-left">
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                        <span class="slot-time">${entry.row.time_range}</span>
                        ${memberBadges}
                    </div>
                    ${entry.row.note ? `<div class="act-warn act-warn--warn slot-note"><i class="fa-solid fa-triangle-exclamation"></i> ${entry.row.note}</div>` : ""}
                </div>
                <div class="slot-right">
                    <div class="ticket-form">
                        <button type="button" class="ticket-btn" ${qty === 0 ? "disabled" : ""} onclick="APP.changeRounds(${p},-1)"><i class="fa-solid fa-minus"></i></button>
                        <input type="number" class="ticket-qty" value="${qty}" min="0" inputmode="numeric"
                            data-sid="${sid}" data-actslug="${actSlug}" data-slotid="${slotId}"
                            data-member="${memberName}" data-actname="${encodeURIComponent(firstRow.activity_name)}"
                            data-day="${day}" data-time="${encodeURIComponent(entry.row.time_range)}"
                            data-atype="${encodeURIComponent(aType)}"
                            data-ticketsreq="${firstRow.tickets_required ?? "null"}"
                            data-slotmembers="${encodeURIComponent((entry.row.slot_members ?? []).join(","))}"
                            onchange="APP.setRoundsFromInput(this)">
                        <button type="button" class="ticket-btn" onclick="APP.changeRounds(${p},1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            </div>`;
}

export function renderSummaryFooterHtml(
    cart: Map<string, any>,
    opts: {
        ACTIVITIES: ActivityConfig[];
        PRICES: PriceConfig;
    }
) {
    const { ACTIVITIES, PRICES } = opts;
    const memberTotals = new Map<string, { rounds: number; tix: number; price: number }>();
    cart.forEach((c) => {
        if (!c.actSlug) c.actSlug = c.sid.split("__")[0];
        const t = memberTotals.get(c.member) ?? { rounds: 0, tix: 0, price: 0 };
        memberTotals.set(c.member, {
            rounds: t.rounds + c.rounds,
            tix: t.tix + ticketsFor(ACTIVITIES, c.actType, c.actName, c.actSlug, c.ticketsReq) * c.rounds,
            price: t.price + priceFor(ACTIVITIES, PRICES, c.actType, c.actName, c.actSlug, c.ticketsReq) * c.rounds,
        });
    });
    const rows = [...memberTotals.entries()]
        .map(
            ([name, t]) =>
                `<div class="sfooter-member-row"><span class="sfooter-name">${name}</span><span class="sfooter-slots">${t.rounds} Round · ${t.tix} Ticket</span><span class="sfooter-price">฿${t.price.toLocaleString()}</span></div>`,
        )
        .join("");
    let grand = 0, grandTix = 0, grandRounds = 0;
    memberTotals.forEach((t) => {
        grand += t.price;
        grandTix += t.tix;
        grandRounds += t.rounds;
    });
    return `<div>${rows}</div><div class="sfooter-grand"><div><div class="sfooter-grand-label">Grand Total</div><div style="font-size:12px;color:#b0a8c4;margin-top:2px">${grandTix} Ticket · ${grandRounds} Round</div></div><div class="d-flex align-items-baseline gap-1"><div class="sfooter-grand-val">${grand.toLocaleString()}</div><div class="sfooter-grand-unit">บาท</div></div></div>`;
}
