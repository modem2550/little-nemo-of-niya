import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CpL0OkF8.mjs';
import { manifest } from './manifest_FYtyr0xG.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/image/gallery.astro.mjs');
const _page2 = () => import('./pages/api/image/_---path_.astro.mjs');
const _page3 = () => import('./pages/events/_id_.astro.mjs');
const _page4 = () => import('./pages/gallery.astro.mjs');
const _page5 = () => import('./pages/schedule.astro.mjs');
const _page6 = () => import('./pages/sky lantern wich - grace bnk48.astro.mjs');
const _page7 = () => import('./pages/sky lantern wich - hoop bnk48.astro.mjs');
const _page8 = () => import('./pages/sky lantern wich - wei xiaoya tsh48.astro.mjs');
const _page9 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/image/gallery.js", _page1],
    ["src/pages/api/image/[...path].js", _page2],
    ["src/pages/events/[id].js", _page3],
    ["src/pages/gallery.astro", _page4],
    ["src/pages/schedule.astro", _page5],
    ["src/pages/Sky Lantern Wich - Grace BNK48.astro", _page6],
    ["src/pages/Sky Lantern Wich - Hoop BNK48.astro", _page7],
    ["src/pages/Sky Lantern Wich - Wei Xiaoya TSH48.astro", _page8],
    ["src/pages/index.astro", _page9]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "eaba8c9d-50ca-4719-b3a9-e0c3dfcbdd0c",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
