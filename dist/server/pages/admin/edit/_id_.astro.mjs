import { c as createComponent, a as createAstro, m as maybeRenderHead, b as addAttribute, r as renderTemplate } from '../../../chunks/astro/server_Ji_6uJhi.mjs';
import 'kleur/colors';
import 'clsx';
import { s as supabaseAdmin } from '../../../chunks/supabaseAdmin_DVgvOtaj.mjs';
/* empty css                                       */
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  const { data: event, error: fetchError } = await supabaseAdmin.from("event_data").select("*").eq("id", Number(id)).single();
  if (fetchError || !event) {
    return new Response("Not found", { status: 404 });
  }
  if (Astro2.request.method === "POST") {
    const form = await Astro2.request.formData();
    const date = form.get("date") || null;
    const end_date = form.get("end_date") || null;
    form.get("live") === "on";
    if (date && end_date && end_date < date) {
      return new Response("end_date \u0E2B\u0E49\u0E32\u0E21\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32 date", { status: 400 });
    }
    const payload = {
      title: form.get("title"),
      date: form.get("date") || null,
      end_date: form.get("end_date") || null,
      location: form.get("location"),
      link: form.get("link"),
      image_url: form.get("image_url"),
      live: form.get("live") || null
      // text
    };
    const { data, error } = await supabaseAdmin.from("event_data").update(payload).eq("id", Number(id)).select();
    console.log(data, error);
    if (error) {
      return new Response(
        JSON.stringify(error, null, 2),
        { status: 500 }
      );
    }
    return Astro2.redirect("/admin");
  }
  return renderTemplate`<meta charset="UTF-8"><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">${maybeRenderHead()}<div class="container"> <form method="POST" class="POST"> <p>ชื่อกิจกรรม </p> <input name="title"${addAttribute(event.title, "value")}> <p>วันที่ </p> <input type="date" id="date" name="date"${addAttribute(event.date, "value")}> <p>ถึงวันที่ </p> <input type="date" id="end_date" name="end_date"${addAttribute(event.end_date, "value")}> <p>สถานที่ </p> <input name="location"${addAttribute(event.location, "value")}> <p>ลิงก์ </p> <input name="link"${addAttribute(event.link, "value")}> <p>รูปภาพ </p> <input name="image_url"${addAttribute(event.image_url, "value")}> <p>ช่องไลฟ์ </p> <input name="live"${addAttribute(event.live, "value")}> <button type="submit" class="btn btn-primary btn-rounded fw-600 px-4">บันทึก</button> </form> </div> `;
}, "/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/admin/edit/[id].astro", void 0);

const $$file = "/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/admin/edit/[id].astro";
const $$url = "/admin/edit/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
