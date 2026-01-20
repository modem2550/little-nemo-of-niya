import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_Jst4A1od.mjs';
import 'piccolore';
import { $ as $$MainLayout } from '../chunks/MainLayout_CWPVgMBp.mjs';
/* empty css                                    */
export { renderers } from '../renderers.mjs';

const $$Postlink = createComponent(($$result, $$props, $$slots) => {
  const tweetText = `[\u{1F3EE}\u2728]

\u{1F5D3}\uFE0F TODAY
\u{1F558} 18.00

\u{1F4E2} \u0E02\u0E2D\u0E0A\u0E27\u0E19\u0E41\u0E1F\u0E19\u0E04\u0E25\u0E31\u0E1A\u0E23\u0E48\u0E27\u0E21\u0E01\u0E31\u0E19\u0E2A\u0E48\u0E07\u0E01\u0E33\u0E25\u0E31\u0E07\u0E43\u0E08\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A Character Teaser & Concept Photo
\u0E42\u0E14\u0E22 quote \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21 \u0E02\u0E2D\u0E07 official \u0E1E\u0E23\u0E49\u0E2D\u0E21 2 Hashtag

#BNK48TSH48_SkyLanternWish
#GraceBNK48`;
  const twitterShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "data-astro-cid-erpkhpuz": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="hero-section" data-astro-cid-erpkhpuz> <div class="sparkles" data-astro-cid-erpkhpuz></div> <div class="sparkles sparkles-2" data-astro-cid-erpkhpuz></div> <div class="sparkles sparkles-3" data-astro-cid-erpkhpuz></div> <div data-astro-cid-erpkhpuz> <div class="row justify-content-center align-items-center w-auto" data-astro-cid-erpkhpuz> <a${addAttribute(twitterShareUrl, "href")} target="_blank" rel="noopener noreferrer" class="glass-button" data-astro-cid-erpkhpuz> <span class="button-shine" data-astro-cid-erpkhpuz></span>
BNK48 & TSH48 Sky Lantern Wish<br data-astro-cid-erpkhpuz>#GraceBNK48
</a> </div> </div> </section>  ` })}`;
}, "/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/postlink.astro", void 0);

const $$file = "/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/postlink.astro";
const $$url = "/postlink";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Postlink,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
