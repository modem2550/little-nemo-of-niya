// src/pages/JJjayda/[slug].ts
import type { APIRoute } from 'astro';
import { getSupabase } from '../../lib/supabase.server';

// ── Helpers ───────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200, extra?: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  });
}

const CACHE_5M  = { 'Cache-Control': 'public, max-age=300' };
const CACHE_1H  = { 'Cache-Control': 'public, max-age=3600' };
const CACHE_1D  = { 'Cache-Control': 'public, max-age=86400' };

// ── Route handlers ────────────────────────────────────────────────────────────

async function handleMemberSchedule(url: URL) {
  const memberName = url.searchParams.get('member');
  const eventSlug  = url.searchParams.get('event') ?? 'summerfest-2026';

  if (!memberName) return json({ error: 'member param required' }, 400);

  const supabase = getSupabase();

  const { data: memberRows, error: memberErr } = await supabase
    .from('member_schedule')
    .select('*')
    .eq('member_name', memberName)
    .eq('is_active', true)
    .eq('event_slug', eventSlug);

  if (memberErr) throw memberErr;
  if (!memberRows?.length) return json([], 200);

  const slotIds = [...new Set(memberRows.map((r: any) => r.slot_id))];

  const { data: coRows, error: coErr } = await supabase
    .from('member_schedule')
    .select('slot_id, member_name')
    .in('slot_id', slotIds);

  if (coErr) throw coErr;

  // Build slot → members map
  const slotMembersMap = (coRows ?? []).reduce<Record<number, string[]>>((acc, r: any) => {
    if (!acc[r.slot_id]) acc[r.slot_id] = [];
    if (!acc[r.slot_id].includes(r.member_name)) acc[r.slot_id].push(r.member_name);
    return acc;
  }, {});

  const result = memberRows.map((r: any) => ({
    member_name:      r.member_name,
    activity_slug:    r.activity_slug,
    activity_name:    r.activity_name,
    activity_icon:    r.activity_icon    ?? 'fa-solid fa-ticket',
    activity_color:   r.activity_color   ?? '#8b5cf6',
    ticket_type:      r.ticket_type      ?? 'ticket',
    tickets_required: r.tickets_required ?? null,
    price_per_round:  r.price_per_round  ?? null,
    is_merch:         r.ticket_type === 'free',
    slot_id:          r.slot_id,
    day:              r.day,
    time_range:       r.time_range,
    slot_members:     slotMembersMap[r.slot_id] ?? [],
  }));

  return json(result, 200, CACHE_5M);
}

async function handleMembers() {
  const { data, error } = await getSupabase()
    .from('members')
    .select('id, name, brand, gen, team, profile_image_url, graduated_at')
    .is('graduated_at', null)
    .order('name');

  if (error) throw error;
  return json(data ?? [], 200, CACHE_1H);
}

async function handleEvents() {
  const { data, error } = await getSupabase()
    .from('events')
    .select('slug, name, venue, date_start, date_end')
    .eq('is_active', true)
    .order('date_start', { ascending: false });

  if (error) throw error;
  return json(data ?? [], 200, CACHE_1H);
}

async function handleImageProxy(id: number) {
  const supabase = getSupabase();

  const { data: upcoming } = await supabase
    .from('events_upcoming')
    .select('image_url, image_urls')
    .eq('id', id)
    .maybeSingle();

  const { data: eventData } = !upcoming
    ? await supabase.from('event_data').select('image_url, image_urls').eq('id', id).maybeSingle()
    : { data: null };

  const event = upcoming ?? eventData;
  if (!event) return new Response('Not found', { status: 404 });

  const imageUrl = event.image_urls?.medium ?? event.image_urls?.large ?? event.image_url;
  if (!imageUrl) return new Response('No image', { status: 404 });

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error('upstream error');

  return new Response(imgRes.body, {
    status: 200,
    headers: {
      'Content-Type': imgRes.headers.get('Content-Type') ?? 'image/jpeg',
      ...CACHE_1D,
    },
  });
}

// ── Entry point ───────────────────────────────────────────────────────────────

export const GET: APIRoute = async ({ params, url }) => {
  const slug = params.slug ?? '';

  try {
    if (slug === 'member-schedule') return await handleMemberSchedule(url);
    if (slug === 'members')         return await handleMembers();
    if (slug === 'events')          return await handleEvents();

    const id = Number(slug);
    if (isNaN(id)) return new Response('Not found', { status: 404 });
    return await handleImageProxy(id);
  } catch (e: any) {
    return json({ error: e?.message ?? 'unknown error' }, 500);
  }
};