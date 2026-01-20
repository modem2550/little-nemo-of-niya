export { renderers } from '../../renderers.mjs';

async function GET({ params }) {
  const { id } = params;

  if (!id) {
    return new Response('Bad Request', { status: 400 })
  }

  const imageUrl =
    `https://kqfnhyaktxgulhitdvqq.supabase.co/storage/v1/object/public/event-images/events/${id}/cover.webp`;

  const res = await fetch(imageUrl);

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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
