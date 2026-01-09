import { c as createComponent, a as createAstro, m as maybeRenderHead, b as addAttribute, r as renderTemplate } from '../chunks/astro/server_Ji_6uJhi.mjs';
import 'kleur/colors';
import 'clsx';
import { s as supabaseAdmin } from '../chunks/supabaseAdmin_DVgvOtaj.mjs';
/* empty css                                 */
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { data: events, error } = await supabaseAdmin.from("event_data").select("*").order("date", { ascending: false });
  if (Astro2.request.method === "POST") {
    const formData = await Astro2.request.formData();
    const id = formData.get("id");
    await supabaseAdmin.from("event_data").delete().eq("id", id);
    return Astro2.redirect("/admin");
  } else if (error) {
    console.error("Error fetching events:", error);
  }
  return renderTemplate`<meta charset="UTF-8"><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">${maybeRenderHead()}<div class="container" data-astro-cid-u2h3djql> <section data-astro-cid-u2h3djql> <h1 data-astro-cid-u2h3djql>Event Management</h1> <a href="/admin/create" data-astro-cid-u2h3djql>เพิ่มกิจกรรมใหม่</a> <table data-astro-cid-u2h3djql> <thead data-astro-cid-u2h3djql> <tr data-astro-cid-u2h3djql> <th data-astro-cid-u2h3djql>Title</th> <th data-astro-cid-u2h3djql>Date</th> <th data-astro-cid-u2h3djql>End Date</th> <th data-astro-cid-u2h3djql>Location (option)</th> <th data-astro-cid-u2h3djql>Link</th> <th data-astro-cid-u2h3djql>Image URL</th> <th data-astro-cid-u2h3djql>Live</th> </tr> </thead> <tbody data-astro-cid-u2h3djql> ${events?.map((event) => renderTemplate`<tr data-astro-cid-u2h3djql> <td data-astro-cid-u2h3djql>${event.title}</td> <td data-astro-cid-u2h3djql>${event.date}</td> <td data-astro-cid-u2h3djql>${event.end_date}</td> <td data-astro-cid-u2h3djql>${event.location}</td> <td data-astro-cid-u2h3djql>${event.link}</td> <td data-astro-cid-u2h3djql>${event.image_url}</td> <td data-astro-cid-u2h3djql>${event.live}</td> <td data-astro-cid-u2h3djql> <a${addAttribute(`/admin/edit/${event.id}`, "href")} data-astro-cid-u2h3djql>แก้ไข</a> <form method="POST" style="display:inline;" data-astro-cid-u2h3djql> <input type="hidden" name="id"${addAttribute(event.id, "value")} data-astro-cid-u2h3djql> <button type="submit" onclick="return confirm('ยืนยันการลบ?')" data-astro-cid-u2h3djql>ลบ</button> </form> </td> </tr>`)} </tbody> </table> </section> </div> `;
}, "/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/admin/index.astro", void 0);

const $$file = "/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
