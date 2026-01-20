import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_B3Rps_87.mjs';
import { $ as $$MainLayout } from '../chunks/MainLayout_jDcjEGYK.mjs';
export { renderers } from '../renderers.mjs';

const $$SkyLanternWichGraceBNK48 = createComponent(($$result, $$props, $$slots) => {
  const tweetText = `[\u{1F3EE}\u2728]

\u{1F5D3}\uFE0F TODAY
\u{1F558} 18.00

\u{1F4E2} \u0E02\u0E2D\u0E0A\u0E27\u0E19\u0E41\u0E1F\u0E19\u0E04\u0E25\u0E31\u0E1A\u0E23\u0E48\u0E27\u0E21\u0E01\u0E31\u0E19\u0E2A\u0E48\u0E07\u0E01\u0E33\u0E25\u0E31\u0E07\u0E43\u0E08\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A Character Teaser & Concept Photo
\u0E42\u0E14\u0E22 quote \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21 \u0E02\u0E2D\u0E07 official \u0E1E\u0E23\u0E49\u0E2D\u0E21 2 Hashtag

#BNK48TSH48_SkyLanternWish
#GraceBNK48`;
  const twitterShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Sky Lantern Wish - Grace BNK48" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="hero-section"> <div class="sparkles"></div> <div class="sparkles sparkles-2"></div> <div class="sparkles sparkles-3"></div> <div> <div class="row justify-content-center align-items-center w-auto"> <a${addAttribute(twitterShareUrl, "href")} target="_blank" rel="noopener noreferrer" class="glass-button"> <span class="button-shine"></span>
BNK48 & TSH48 Sky Lantern Wish<br>#GraceBNK48
</a> </div> </div> </section> ` })}`;
}, "/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/Sky Lantern Wich - Grace BNK48.astro", void 0);

const $$file = "/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/Sky Lantern Wich - Grace BNK48.astro";
const $$url = "/Sky Lantern Wich - Grace BNK48";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$SkyLanternWichGraceBNK48,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
