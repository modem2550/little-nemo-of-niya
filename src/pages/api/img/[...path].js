export async function GET(req, params) {
  const eventId = params.id

  const imageUrl =
    `https://kqfnhyaktxgulhitdvqq.supabase.co/storage/v1/object/public/event-images/events/${eventId}/cover.webp`

  const res = await fetch(imageUrl)

  if (!res.ok) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(res.body, {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
