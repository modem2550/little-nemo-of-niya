// src/pages/JJjayda/member-schedule.ts
import type { APIRoute } from 'astro';
import { getSupabase } from '../../lib/supabase.server';

export const GET: APIRoute = async ({ url }) => {
  const memberName = url.searchParams.get('member');
  if (!memberName)
    return Response.json({ error: 'member param required' }, { status: 400 });

  try {
    const { data, error } = await getSupabase()
      .from('member_schedule')
      .select('*, slot:slot_id(member_name)')
      .eq('member_name', memberName);

    if (error) throw error;

    const result = (data ?? []).map(({ slot, ...r }) => ({
      ...r,
      slot_members: (slot as { member_name: string }[]).map((s) => s.member_name),
    }));

    return Response.json(result, {
      headers: { 'Cache-Control': 'public, max-age=300' },
    });

  } catch (e: any) {
    return Response.json({ error: e.message ?? 'unknown error' }, { status: 500 });
  }
};