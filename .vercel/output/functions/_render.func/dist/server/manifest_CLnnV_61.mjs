import { q as decodeKey } from './chunks/astro/server_B3Rps_87.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_DD-NbCwx.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/","cacheDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/node_modules/.astro/","outDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/dist/","srcDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/src/","publicDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/public/","buildClientDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/dist/client/","buildServerDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/image/gallery","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/image\\/gallery\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"image","dynamic":false,"spread":false}],[{"content":"gallery","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/image/gallery.js","pathname":"/api/image/gallery","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/image/[...path]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/image(?:\\/(.*?))?\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"image","dynamic":false,"spread":false}],[{"content":"...path","dynamic":true,"spread":true}]],"params":["...path"],"component":"src/pages/api/image/[...path].js","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/events/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/events\\/([^/]+?)\\/?$","segments":[[{"content":"events","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/events/[id].js","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/events-images/[...slug]","pattern":"^\\/events-images(?:\\/(.*?))?\\/?$","segments":[[{"content":"events-images","dynamic":false,"spread":false}],[{"content":"...slug","dynamic":true,"spread":true}]],"params":["...slug"],"component":"/events-images/[...slug]","prerender":false,"redirect":"https://kqfnhyaktxgulhitdvqq.supabase.co/storage/v1/object/public/event-images/events/[...slug]","fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/Sky Lantern Wich - Grace BNK48.DHERJ_cF.css"},{"type":"inline","content":"#sentinel[data-astro-cid-sahthylw]{height:1px}\n"}],"routeData":{"route":"/gallery","isIndex":false,"type":"page","pattern":"^\\/gallery\\/?$","segments":[[{"content":"gallery","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/gallery.astro","pathname":"/gallery","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/Sky Lantern Wich - Grace BNK48.DHERJ_cF.css"}],"routeData":{"route":"/schedule","isIndex":false,"type":"page","pattern":"^\\/schedule\\/?$","segments":[[{"content":"schedule","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/schedule.astro","pathname":"/schedule","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/Sky Lantern Wich - Grace BNK48.DHERJ_cF.css"}],"routeData":{"route":"/sky lantern wich - grace bnk48","isIndex":false,"type":"page","pattern":"^\\/Sky Lantern Wich - Grace BNK48\\/?$","segments":[[{"content":"Sky Lantern Wich - Grace BNK48","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/Sky Lantern Wich - Grace BNK48.astro","pathname":"/Sky Lantern Wich - Grace BNK48","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/Sky Lantern Wich - Grace BNK48.DHERJ_cF.css"}],"routeData":{"route":"/sky lantern wich - hoop bnk48","isIndex":false,"type":"page","pattern":"^\\/Sky Lantern Wich - Hoop BNK48\\/?$","segments":[[{"content":"Sky Lantern Wich - Hoop BNK48","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/Sky Lantern Wich - Hoop BNK48.astro","pathname":"/Sky Lantern Wich - Hoop BNK48","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/Sky Lantern Wich - Grace BNK48.DHERJ_cF.css"}],"routeData":{"route":"/sky lantern wich - wei xiaoya tsh48","isIndex":false,"type":"page","pattern":"^\\/Sky Lantern Wich - Wei Xiaoya TSH48\\/?$","segments":[[{"content":"Sky Lantern Wich - Wei Xiaoya TSH48","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/Sky Lantern Wich - Wei Xiaoya TSH48.astro","pathname":"/Sky Lantern Wich - Wei Xiaoya TSH48","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/Sky Lantern Wich - Grace BNK48.DHERJ_cF.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/api/image/gallery@_@js":"pages/api/image/gallery.astro.mjs","\u0000@astro-page:src/pages/api/image/[...path]@_@js":"pages/api/image/_---path_.astro.mjs","\u0000@astro-page:src/pages/events/[id]@_@js":"pages/events/_id_.astro.mjs","\u0000@astro-page:src/pages/gallery@_@astro":"pages/gallery.astro.mjs","\u0000@astro-page:src/pages/schedule@_@astro":"pages/schedule.astro.mjs","\u0000@astro-page:src/pages/Sky Lantern Wich - Grace BNK48@_@astro":"pages/sky lantern wich - grace bnk48.astro.mjs","\u0000@astro-page:src/pages/Sky Lantern Wich - Hoop BNK48@_@astro":"pages/sky lantern wich - hoop bnk48.astro.mjs","\u0000@astro-page:src/pages/Sky Lantern Wich - Wei Xiaoya TSH48@_@astro":"pages/sky lantern wich - wei xiaoya tsh48.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_CLnnV_61.mjs","/Users/dem._.mo/Desktop/little-nemo-of-niya/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_BMEOAABi.mjs","/Users/dem._.mo/Desktop/little-nemo-of-niya/src/layouts/MainLayout.astro?astro&type=script&index=0&lang.ts":"_astro/MainLayout.astro_astro_type_script_index_0_lang.zYmbPBNK.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/Users/dem._.mo/Desktop/little-nemo-of-niya/src/layouts/MainLayout.astro?astro&type=script&index=0&lang.ts","function A(){document.querySelectorAll(\".switcher\").forEach(c=>{const S=c.querySelector(\".switcher__track\"),a=Array.from(c.querySelectorAll(\".switcher__option\")),i=a.map(t=>t.querySelector('input[type=\"radio\"]')),l=c.querySelector(\".switcher__indicator\");let m=!1,y;function w(t,r=!0){const n=a[t];if(!n||!l)return;const e=n.getBoundingClientRect(),d=S.getBoundingClientRect(),f=e.left-d.left-18/2;if(r){const s=i.findIndex(g=>g.getAttribute(\"data-prev\")===\"true\"),p=Math.abs(t-(s!==-1?s:t)),I=Math.min(300+p*70,600);l.style.transition=`all ${I}ms cubic-bezier(0.25, 1, 0.5, 1)`}else l.style.transition=\"none\";l.style.width=`${e.width+18}px`,l.style.height=`${e.height+10}px`,l.style.transform=`translateX(${f+9}px)`,i.forEach((s,p)=>s.setAttribute(\"data-prev\",p===t))}a.forEach((t,r)=>{const n=i[r];t.addEventListener(\"click\",e=>{const d=t.getAttribute(\"data-href\");if(!d)return;const[u,f]=d.split(\"#\"),s=window.location.pathname,p=s===\"/\"||s.endsWith(\"index.html\"),I=u===\"\"||u===\"/\"||u.endsWith(\"index.html\");if((s===u||p&&I)&&f){const g=document.getElementById(f);g&&(e.preventDefault(),m=!0,clearTimeout(y),n&&(n.checked=!0),w(r,!0),g.scrollIntoView({behavior:\"smooth\",block:\"start\"}),y=setTimeout(()=>{m=!1},800))}else f&&sessionStorage.setItem(\"scrollTarget\",f),window.location.href=u||\"/\"})});const k=new IntersectionObserver(t=>{m||t.forEach(r=>{if(r.isIntersecting){const n=r.target.id,e=a.findIndex(d=>d.getAttribute(\"data-href\").includes(`#${n}`));e!==-1&&i[e]&&!i[e].checked&&(i[e].checked=!0,w(e,!0))}})},{rootMargin:\"-30% 0px -60% 0px\"});a.forEach(t=>{const r=t.getAttribute(\"data-href\")?.split(\"#\").pop(),n=document.getElementById(r);n&&k.observe(n)});const v=window.location.hash.replace(\"#\",\"\"),b=v?a.findIndex(t=>t.getAttribute(\"data-href\").includes(`#${v}`)):i.findIndex(t=>t.checked);b!==-1&&setTimeout(()=>w(b,!1),150)});const h=sessionStorage.getItem(\"scrollTarget\");if(h){const c=document.getElementById(h);c&&setTimeout(()=>{c.scrollIntoView({behavior:\"smooth\",block:\"start\"})},300),sessionStorage.removeItem(\"scrollTarget\")}}let E=!1;function x(){E||(E=!0,A())}document.addEventListener(\"astro:page-load\",x);document.addEventListener(\"DOMContentLoaded\",x);const T=new IntersectionObserver(o=>{o.forEach(h=>{h.isIntersecting&&h.target.classList.add(\"show\")})},{threshold:.2});document.querySelectorAll(\".slide-right, .fade-in\").forEach(o=>T.observe(o));function B(){const o=document.getElementById(\"popup-overlay\");o&&(o.style.display=\"flex\")}function P(){const o=document.getElementById(\"popup-overlay\");o&&(o.style.display=\"none\")}window.openPopup=B;window.closePopup=P;"]],"assets":["/_astro/Sky Lantern Wich - Grace BNK48.DHERJ_cF.css","/Brand Identity Manual.pdf","/googlefc743a8cb0747add.html","/robots.txt","/site.webmanifest","/sitemap.xml","/img/h-body.png","/img/lit-img.png","/img/profile.jpg","/video/BG-video.mp4","/logo/android-chrome-192x192.png","/logo/android-chrome-512x512.png","/logo/apple-touch-icon.png","/logo/logo 16x16.png","/logo/logo 32x32.png","/logo/tw.png"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"QszgqaQLNUIAYr2v8pBzAKhW28XX8cyIWfLV/ez9Io8="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
