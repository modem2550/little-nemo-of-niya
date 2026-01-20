export { renderers } from '../../../renderers.mjs';

async function GET({ params }) {
  const { path } = params;
  
  if (!path) {
    return new Response('Path is required', { status: 400 });
  }

  // Base URL ของ Supabase Storage
  const baseUrl = 'https://kqfnhyaktxgulhitdvqq.supabase.co/storage/v1/object/public/event-images';
  const fullUrl = `${baseUrl}/${path}`;
  
  // Redirect ไปยัง Supabase
  return Response.redirect(fullUrl, 302);
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
