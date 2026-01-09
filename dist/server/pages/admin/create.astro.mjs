import { c as createComponent, a as createAstro, m as maybeRenderHead, r as renderTemplate } from '../../chunks/astro/server_Ji_6uJhi.mjs';
import 'kleur/colors';
import 'clsx';
import { s as supabaseAdmin } from '../../chunks/supabaseAdmin_DVgvOtaj.mjs';
/* empty css                                    */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Create = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Create;
  if (Astro2.request.method === "POST") {
    const form = await Astro2.request.formData();
    const payload = {
      title: form.get("title"),
      date: form.get("date"),
      end_date: form.get("end_date") || null,
      location: form.get("location"),
      link: form.get("link"),
      image_url: form.get("image_url"),
      live: form.get("live") || null
      // text
    };
    const { error } = await supabaseAdmin.from("event_data").insert(payload);
    if (error) {
      return new Response(error.message, { status: 500 });
    }
    return Astro2.redirect("/admin");
  }
  return renderTemplate`<meta charset="UTF-8"><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">${maybeRenderHead()}<h1>เพิ่ม Event ใหม่</h1> <form method="POST"> <label>ชื่อกิจกรรม <input name="title" required></label> <label>วันที่ <input type="date" name="date" required></label> <label>ถึงวันที่ <input type="date" name="end_date"></label> <label>สถานที่ <input name="location"></label> <label>ลิงก์ <input name="link"></label> <label>รูปภาพ (URL) <input name="image_url"></label> <label>Live <input name="live"></label> <button type="submit">บันทึก</button> </form>`;
}, "/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/admin/create.astro", void 0);

const $$file = "/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/admin/create.astro";
const $$url = "/admin/create";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Create,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
