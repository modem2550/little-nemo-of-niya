import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_B3Rps_87.mjs';
import { $ as $$MainLayout } from '../chunks/MainLayout_jDcjEGYK.mjs';
import { $ as $$EventCard } from '../chunks/EventCard_C4jNXqsv.mjs';
import { g as getSupabase } from '../chunks/supabase.server_DxCuIpeL.mjs';
export { renderers } from '../renderers.mjs';

const $$Schedule = createComponent(async ($$result, $$props, $$slots) => {
  const supabase = getSupabase();
  const { data: events, error } = await supabase.from("event_data").select("*").order("date", { ascending: false });
  if (error) {
    console.error("Error fetching events:", error);
  }
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = events ? events.filter((event) => new Date(event.date.replace(/-/g, "/")) >= today).reverse() : [];
  const pastEvents = events ? events.filter((event) => new Date(event.date.replace(/-/g, "/")) < today) : [];
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Schedule - Niya BNK48's" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div style="margin-top: 108px; background: var(--c-primary); padding: 30px 0 30px 0; color: white;" class="mb-3"> <header> <h1 class="text-center fw-800 h1"><strong>Niya BNK48's Schedule</strong></h1> <p class="text-center fw-600 mb-0" style="font-size:18px">ตารางงานและกิจกรรมของนีญ่า</p> </header> </div> <main class="page-main"> <h2 class="h1 text-center fw-800 h-sec mb-0"><strong>Upcoming Events</strong></h2> <p class="text-center mb-4 text-muted">กิจกรรมที่กำลังจะจัด</p> <section id="upcoming-events-section" style="padding: 0; background: none;"> <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4"> ${upcomingEvents.length > 0 ? upcomingEvents.map((event) => renderTemplate`<div class="col d-flex justify-content-center"> ${renderComponent($$result2, "EventCard", $$EventCard, { "event": event })} </div>`) : renderTemplate`<div class="w-100 text-center py-5"> <p class="text-muted italic">ยังไม่มีกิจกรรมประกาศในขณะนี้</p> </div>`} </div> </section> <div class="text-center mt-5"> <a class="btn btn-primary btn-rounded fw-600 px-4 mb-5" href="/"> <div class="d-flex align-items-center"> <strong>Back Home</strong> <svg class="icon arrow-svg ms-2" width="24" height="24" style="height:1em;width:1em"> <use href="#icon-arrow-right"></use> </svg> </div> </a> </div> <section id="past-events-section" style="padding: 0; background: none;"> <h2 class="h-sec h1 text-center mb-0">Past Events</h2> <p class="text-center mb-4 text-muted">กิจกรรมที่จัดไปแล้ว</p> <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 event-past"> ${pastEvents.map((event) => renderTemplate`<div class="col d-flex justify-content-center"> ${renderComponent($$result2, "EventCard", $$EventCard, { "event": event, "isPast": true })} </div>`)} </div> </section> </main> ` })}`;
}, "/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/schedule.astro", void 0);

const $$file = "/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/schedule.astro";
const $$url = "/schedule";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Schedule,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
