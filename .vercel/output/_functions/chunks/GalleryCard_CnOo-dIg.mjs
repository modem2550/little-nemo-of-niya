import { e as createComponent, f as createAstro, m as maybeRenderHead, h as addAttribute, u as unescapeHTML, r as renderTemplate } from './astro/server_Dm_8-9sK.mjs';

const $$Astro = createAstro();
const $$GalleryCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$GalleryCard;
  const { event } = Astro2.props;
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const formatSmartEventDate = (dateString) => {
    if (!dateString) return "";
    const start = new Date(dateString.replace(/-/g, "/"));
    const d1 = start.getDate().toString().padStart(2, "0");
    const m1 = months[start.getMonth()];
    const y1 = start.getFullYear();
    return `${d1} ${m1} ${y1}`;
  };
  const eventDate = formatSmartEventDate(event["Date-At"]);
  return renderTemplate`${maybeRenderHead()}<div class="col d-flex justify-content-center"> <div class="img-box tabcontent Event" style="display: block;"> <a${addAttribute(event["Photo-page-link"] || "#", "href")} target="_blank" rel="noopener noreferrer"> <img${addAttribute(event["IMG_link"] || "https://via.placeholder.com/400x300?text=No+Image", "src")}${addAttribute(event.Event || "Event", "alt")} class="gallery" onerror="this.src='https://via.placeholder.com/400x300?text=Image+Error'"> <div class="transparent-box"> <div class="caption mb-0"> <p><strong>${unescapeHTML(event.Event)}</strong></p> <div class="ct-ga"> <svg class="icon" width="16" height="16"> <use href="#icon-post"></use> </svg> <p class="opacity-low mb-0">${event["Phot-page"] || "By Niya BNK48"}</p> </div> <div class="ct-ga"> <svg class="icon" width="16" height="16"> <use href="#icon-calendar"></use> </svg> <p>${eventDate}</p> </div> </div> </div> </a> </div> </div>`;
}, "/Users/dem._.mo/Desktop/little-nemo-of-niya/src/components/GalleryCard.astro", void 0);

export { $$GalleryCard as $ };
