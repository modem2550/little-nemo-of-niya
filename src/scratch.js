const SCHEDULE = [
    {
        activitySlug: "mai_prom",
        slots: [
            { day: "fri", time: "16:00–17:45", members: ["Blythe", "Patt", "Praifa"] }
        ]
    }
];

const MEMBER_SCHEDULE_MAP = new Map();
for (const { activitySlug, slots } of SCHEDULE) {
    const actName = "Test";
    for (const { day, time, members, note } of slots) {
        const slotId = `${activitySlug}__${day}__${time}`;
        for (const m of (members || [])) {
            const key = m.trim().toLowerCase();
            const rows = MEMBER_SCHEDULE_MAP.get(key) ?? [];
            rows.push({
                member_name: m,
                activity_slug: activitySlug,
                activity_name: actName,
                activity_icon: "",
                tickets_required: null,
                is_merch: false,
                slot_id: slotId,
                day,
                time_range: time,
                slot_members: members,
                note: note ?? null,
            });
            MEMBER_SCHEDULE_MAP.set(key, rows);
        }
    }
}


function fetchSchedule(name) {
    const key = name.trim().toLowerCase();
    const rows = MEMBER_SCHEDULE_MAP.get(key) ?? [];
    return rows.map(r => ({ ...r, member_name: name }));
}


