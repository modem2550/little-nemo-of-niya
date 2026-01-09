import 'piccolore';
import { p as decodeKey } from './chunks/astro/server_cZ6mB_Wd.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_Clz5GT_M.mjs';
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

const manifest = deserializeManifest({"hrefRoot":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/","cacheDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/node_modules/.astro/","outDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/dist/","srcDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/src/","publicDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/public/","buildClientDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/dist/client/","buildServerDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.D26GFCV3.css"}],"routeData":{"route":"/admin/create","isIndex":false,"type":"page","pattern":"^\\/admin\\/create\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"create","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/create.astro","pathname":"/admin/create","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.D26GFCV3.css"}],"routeData":{"route":"/admin/edit/[id]","isIndex":false,"type":"page","pattern":"^\\/admin\\/edit\\/([^/]+?)\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"edit","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/admin/edit/[id].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.D26GFCV3.css"},{"type":"inline","content":"body{overflow:scroll}section[data-astro-cid-u2h3djql]{background-color:none}\n"}],"routeData":{"route":"/admin","isIndex":true,"type":"page","pattern":"^\\/admin\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/index.astro","pathname":"/admin","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.D26GFCV3.css"},{"type":"external","src":"/_astro/index.Boaz3MEl.css"}],"routeData":{"route":"/schedule","isIndex":false,"type":"page","pattern":"^\\/schedule\\/?$","segments":[[{"content":"schedule","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/schedule.astro","pathname":"/schedule","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.D26GFCV3.css"},{"type":"external","src":"/_astro/index.Boaz3MEl.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/schedule.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/admin/create@_@astro":"pages/admin/create.astro.mjs","\u0000@astro-page:src/pages/admin/edit/[id]@_@astro":"pages/admin/edit/_id_.astro.mjs","\u0000@astro-page:src/pages/admin/index@_@astro":"pages/admin.astro.mjs","\u0000@astro-page:src/pages/schedule@_@astro":"pages/schedule.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_Bgl0YmnU.mjs","/Users/dem._.mo/Desktop/little-nemo-of-niya/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_Bj2RWUb3.mjs","/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/admin/edit/[id].astro?astro&type=script&index=0&lang.ts":"_astro/_id_.astro_astro_type_script_index_0_lang.DGDv3omu.js","/Users/dem._.mo/Desktop/little-nemo-of-niya/src/layouts/MainLayout.astro?astro&type=script&index=0&lang.ts":"_astro/MainLayout.astro_astro_type_script_index_0_lang.BBR2qeM9.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/admin/edit/[id].astro?astro&type=script&index=0&lang.ts","const t=document.getElementById(\"date\"),e=document.getElementById(\"end_date\");t&&e&&t.addEventListener(\"change\",()=>{e.min=t.value,e.value&&e.value<t.value&&(e.value=\"\")});"],["/Users/dem._.mo/Desktop/little-nemo-of-niya/src/layouts/MainLayout.astro?astro&type=script&index=0&lang.ts","function k(){document.querySelectorAll(\".switcher\").forEach(c=>{const x=c.querySelector(\".switcher__track\"),a=Array.from(c.querySelectorAll(\".switcher__option\")),r=a.map(t=>t.querySelector('input[type=\"radio\"]')),l=c.querySelector(\".switcher__indicator\");let I=!1,w;function g(t,s=!0){const n=a[t];if(!n||!l)return;const e=n.getBoundingClientRect(),d=x.getBoundingClientRect(),f=e.left-d.left-18/2;if(s){const i=r.findIndex(m=>m.getAttribute(\"data-prev\")===\"true\"),p=Math.abs(t-(i!==-1?i:t)),y=Math.min(300+p*70,600);l.style.transition=`all ${y}ms cubic-bezier(0.25, 1, 0.5, 1)`}else l.style.transition=\"none\";l.style.width=`${e.width+18}px`,l.style.height=`${e.height+10}px`,l.style.transform=`translateX(${f+9}px)`,r.forEach((i,p)=>i.setAttribute(\"data-prev\",p===t))}a.forEach((t,s)=>{const n=r[s];t.addEventListener(\"click\",e=>{const d=t.getAttribute(\"data-href\");if(!d)return;const[u,f]=d.split(\"#\"),i=window.location.pathname,p=i===\"/\"||i.endsWith(\"index.html\"),y=u===\"\"||u===\"/\"||u.endsWith(\"index.html\");if((i===u||p&&y)&&f){const m=document.getElementById(f);m&&(e.preventDefault(),I=!0,clearTimeout(w),n&&(n.checked=!0),g(s,!0),m.scrollIntoView({behavior:\"smooth\",block:\"start\"}),w=setTimeout(()=>{I=!1},800))}else f&&sessionStorage.setItem(\"scrollTarget\",f),window.location.href=u||\"/\"})});const A=new IntersectionObserver(t=>{I||t.forEach(s=>{if(s.isIntersecting){const n=s.target.id,e=a.findIndex(d=>d.getAttribute(\"data-href\").includes(`#${n}`));e!==-1&&r[e]&&!r[e].checked&&(r[e].checked=!0,g(e,!0))}})},{rootMargin:\"-30% 0px -60% 0px\"});a.forEach(t=>{const s=t.getAttribute(\"data-href\")?.split(\"#\").pop(),n=document.getElementById(s);n&&A.observe(n)});const v=window.location.hash.replace(\"#\",\"\"),b=v?a.findIndex(t=>t.getAttribute(\"data-href\").includes(`#${v}`)):r.findIndex(t=>t.checked);b!==-1&&setTimeout(()=>g(b,!1),150)});const h=sessionStorage.getItem(\"scrollTarget\");if(h){const c=document.getElementById(h);c&&setTimeout(()=>{c.scrollIntoView({behavior:\"smooth\",block:\"start\"})},300),sessionStorage.removeItem(\"scrollTarget\")}}let E=!1;function S(){E||(E=!0,k())}document.addEventListener(\"astro:page-load\",S);document.addEventListener(\"DOMContentLoaded\",S);const B=new IntersectionObserver(o=>{o.forEach(h=>{h.isIntersecting&&h.target.classList.add(\"show\")})},{threshold:.2});document.querySelectorAll(\".slide-right, .fade-in\").forEach(o=>B.observe(o));function C(){const o=document.getElementById(\"popup-overlay\");o&&(o.style.display=\"flex\")}function T(){const o=document.getElementById(\"popup-overlay\");o&&(o.style.display=\"none\")}window.openPopup=C;window.closePopup=T;const q=\"https://kqfnhyaktxgulhitdvqq.supabase.co\",J=\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZm5oeWFrdHhndWxoaXRkdnFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NTIxMzQsImV4cCI6MjA4MzIyODEzNH0.pwtVfQJ2vmJCTLOYW8p8FH9M56qXBJL_rDCvfNWvvmA\";typeof supabase<\"u\"&&supabase.createClient(q,J);"]],"assets":["/_astro/index.Boaz3MEl.css","/_astro/index.D26GFCV3.css","/Brand Identity Manual.pdf","/googlefc743a8cb0747add.html","/robots.txt","/site.webmanifest","/sitemap.xml","/img/h-body.png","/img/lit-img.png","/img/profile.jpg","/logo/android-chrome-192x192.png","/logo/android-chrome-512x512.png","/logo/apple-touch-icon.png","/logo/event.json","/logo/logo 16x16.png","/logo/logo 32x32.png","/logo/tw.png","/video/BG-video.mp4"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"4Ym3JXd2gzXpAUSnC75f2Sjl03et/Ez9abi0oidruCk="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
