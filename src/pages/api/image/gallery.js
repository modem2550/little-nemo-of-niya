import { supabase } from "../../../lib/supabase";

export async function GET({ request }) {
  const url = new URL(request.url);
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const limit = parseInt(url.searchParams.get('limit') || '16');

  try {
    const { data: events, error } = await supabase
      .from('event_gallery')
      .select('*')
      .order('Date-At', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ 
        error: error.message,
        events: [] 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify({ 
      events: events || [],
      offset,
      limit,
      count: events?.length || 0
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('API error:', err);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      events: []
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}