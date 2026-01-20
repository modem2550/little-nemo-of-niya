import { e as createComponent, f as createAstro, m as maybeRenderHead, h as addAttribute, r as renderTemplate } from './astro/server_Jst4A1od.mjs';
import 'piccolore';
import 'clsx';

/**
 * แปลง image URL/path ให้เป็น path ที่ใช้งานได้
 * Support ทั้งข้อมูลเก่า (full URL) และใหม่ (path only)
 */
function getImagePath(urlOrPath) {
    if (!urlOrPath) return null;

    // ถ้าเป็น full URL -> แยกเอาแค่ path
    if (urlOrPath.includes('supabase.co')) {
        const match = urlOrPath.match(/event-images\/(.+)$/);
        return match ? match[1] : urlOrPath;
    }

    // ถ้าเป็น path อยู่แล้ว -> ใช้เลย
    return urlOrPath;
}

/**
 * สร้าง URL สำหรับแสดงรูป (ผ่าน proxy API)
 */
function getImageUrl(urlOrPath) {
    const path = getImagePath(urlOrPath);
    return path ? `/api/image/${path}` : null;
}

const $$Astro = createAstro();
const $$EventCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$EventCard;
  const { event, isPast = false } = Astro2.props;
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const formatSmartEventDate = (event2) => {
    if (!event2?.date) return "";
    const start = new Date(event2.date.replace(/-/g, "/"));
    const end = event2.end_date ? new Date(event2.end_date.replace(/-/g, "/")) : null;
    const d1 = start.getDate().toString().padStart(2, "0");
    const m1 = months[start.getMonth()];
    const y1 = start.getFullYear();
    if (!end) return `${d1} ${m1} ${y1}`;
    const d2 = end.getDate().toString().padStart(2, "0");
    const m2 = months[end.getMonth()];
    const y2 = end.getFullYear();
    if (start.getTime() === end.getTime()) {
      return `${d1} ${m1} ${y1}`;
    }
    if (y1 === y2) {
      if (m1 === m2) {
        return `${d1}\u2013${d2} ${m1} ${y1}`;
      }
      return `${d1} ${m1} \u2013 ${d2} ${m2} ${y1}`;
    }
    return `${d1} ${m1} ${y1} \u2013 ${d2} ${m2} ${y2}`;
  };
  let backgroundImage = "/img/placeholder.jpg";
  let hoverImage = "/img/placeholder.jpg";
  if (event.image_urls) {
    backgroundImage = getImageUrl(event.image_urls.medium) || getImageUrl(event.image_urls.small) || backgroundImage;
    hoverImage = getImageUrl(event.image_urls.large) || getImageUrl(event.image_urls.medium) || backgroundImage;
  } else if (event.image_url) {
    backgroundImage = event.image_url;
    hoverImage = event.image_url;
  }
  return renderTemplate`${maybeRenderHead()}<article${addAttribute(`slide-right show carded ${isPast ? "event-past" : ""}`, "class")}> <!-- Background image: ใช้ medium สำหรับ default --> <div class="card__img"${addAttribute(`background-image: url(${backgroundImage});`, "style")}></div> <a${addAttribute(event.link, "href")} class="card_link" target="_blank" rel="noopener noreferrer"> <!-- Hover image: ใช้ large เพื่อความคมชัด --> <div class="card__img--hover"${addAttribute(`background-image: url(${hoverImage});`, "style")}></div> </a> <div class="card__info"> <a${addAttribute(event.link, "href")} class="card_link" target="_blank" rel="noopener noreferrer"> <div class="da-sp"> <div class="h5">${event.title}</div> ${event.location && renderTemplate`<div class="ct-da"> <svg class="icon" width="16" height="16"> <use href="#icon-pin"></use> </svg> <p>${event.location}</p> </div>`} ${event.live && renderTemplate`<div class="ct-da"> <svg class="icon" width="16" height="16"> <use href="#icon-live"></use> </svg> <p>${event.live}</p> </div>`} <div class="ct-da"> <svg class="icon" width="16" height="16"> <use href="#icon-calendar"></use> </svg> <p>${formatSmartEventDate(event)}</p> </div> </div> </a> </div> </article>`;
}, "/Users/dem._.mo/Desktop/little-nemo-of-niya/src/components/EventCard.astro", void 0);

export { $$EventCard as $ };
