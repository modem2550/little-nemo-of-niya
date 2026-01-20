import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_DFRa6ONt.mjs';
import { manifest } from './manifest_BYC87uzs.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/image/gallery.astro.mjs');
const _page2 = () => import('./pages/api/image/_---path_.astro.mjs');
const _page3 = () => import('./pages/events/_id_.astro.mjs');
const _page4 = () => import('./pages/gallery.astro.mjs');
const _page5 = () => import('./pages/postlink.astro.mjs');
const _page6 = () => import('./pages/schedule.astro.mjs');
const _page7 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/image/gallery.js", _page1],
    ["src/pages/api/image/[...path].js", _page2],
    ["src/pages/events/[id].js", _page3],
    ["src/pages/gallery.astro", _page4],
    ["src/pages/postlink.astro", _page5],
    ["src/pages/schedule.astro", _page6],
    ["src/pages/index.astro", _page7]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "023de460-e6e6-4ff6-87b8-95ba5f6f38b3",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
