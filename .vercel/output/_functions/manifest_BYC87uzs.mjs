import 'piccolore';
import { v as decodeKey } from './chunks/astro/server_Jst4A1od.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_ZSJH1dXY.mjs';
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

const manifest = deserializeManifest({"hrefRoot":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/","cacheDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/node_modules/.astro/","outDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/dist/","srcDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/src/","publicDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/public/","buildClientDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/dist/client/","buildServerDir":"file:///Users/dem._.mo/Desktop/little-nemo-of-niya/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/image/gallery","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/image\\/gallery\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"image","dynamic":false,"spread":false}],[{"content":"gallery","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/image/gallery.js","pathname":"/api/image/gallery","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/image/[...path]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/image(?:\\/(.*?))?\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"image","dynamic":false,"spread":false}],[{"content":"...path","dynamic":true,"spread":true}]],"params":["...path"],"component":"src/pages/api/image/[...path].js","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/events/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/events\\/([^/]+?)\\/?$","segments":[[{"content":"events","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/events/[id].js","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"redirect","isIndex":false,"route":"/events-images/[...slug]","pattern":"^\\/events-images(?:\\/(.*?))?\\/?$","segments":[[{"content":"events-images","dynamic":false,"spread":false}],[{"content":"...slug","dynamic":true,"spread":true}]],"params":["...slug"],"component":"/events-images/[...slug]","prerender":false,"redirect":"https://kqfnhyaktxgulhitdvqq.supabase.co/storage/v1/object/public/event-images/events/[...slug]","fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/gallery.BNj6rSmt.css"},{"type":"inline","content":"#sentinel[data-astro-cid-sahthylw]{height:1px}\n"}],"routeData":{"route":"/gallery","isIndex":false,"type":"page","pattern":"^\\/gallery\\/?$","segments":[[{"content":"gallery","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/gallery.astro","pathname":"/gallery","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/gallery.BNj6rSmt.css"},{"type":"inline","content":".hero-section[data-astro-cid-erpkhpuz]{min-height:100vh;background-image:url(https://pbs.twimg.com/media/G_A0oRXWMAAPuHu?format=jpg&name=large);background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;padding:3rem 1.5rem;position:relative;overflow:hidden}.glass-button[data-astro-cid-erpkhpuz]{position:relative;padding:20px 40px;font-size:18px;font-weight:600;color:#fff;text-decoration:none;text-align:center;background:#ffffff26;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);clip-path:polygon(10px 0%,calc(100% - 10px) 0%,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0% calc(100% - 10px),0% 10px);box-shadow:0 8px 32px #0003,inset 0 1px #fff6,0 0 40px #ffffff1a,inset 0 0 20px #ffffff1a;transition:all .3s ease;overflow:hidden;z-index:10}.glass-button[data-astro-cid-erpkhpuz]:after{content:\"\";position:absolute;inset:0;border:2px solid rgba(255,255,255,.5);clip-path:polygon(10px 0%,calc(100% - 10px) 0%,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0% calc(100% - 10px),0% 10px);opacity:0;transition:opacity .3s ease;pointer-events:none}.glass-button[data-astro-cid-erpkhpuz]:before{content:\"\";position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);transition:left .5s ease}.glass-button[data-astro-cid-erpkhpuz]:hover:before{left:100%}.glass-button[data-astro-cid-erpkhpuz]:hover{background:#ffffff40;border-color:#ffffff80;box-shadow:0 12px 48px #0000004d,inset 0 1px #fff9,0 0 60px #ffffff4d,inset 0 0 30px #fff3}.glass-button[data-astro-cid-erpkhpuz]:hover:after{opacity:1}.glass-button[data-astro-cid-erpkhpuz]:active{transform:translateY(0)}.sparkles[data-astro-cid-erpkhpuz]{position:absolute;width:100%;height:100%;top:0;left:0;pointer-events:none;background-image:radial-gradient(2px 2px at 20% 30%,white,transparent),radial-gradient(2px 2px at 60% 70%,white,transparent),radial-gradient(1px 1px at 50% 50%,white,transparent),radial-gradient(1px 1px at 80% 10%,white,transparent),radial-gradient(2px 2px at 90% 60%,white,transparent),radial-gradient(1px 1px at 33% 80%,white,transparent),radial-gradient(1px 1px at 15% 90%,white,transparent);background-size:200% 200%;animation:sparkle 8s linear infinite;opacity:.6}.sparkles-2[data-astro-cid-erpkhpuz]{background-image:radial-gradient(2px 2px at 40% 20%,rgba(255,255,255,.8),transparent),radial-gradient(1px 1px at 70% 80%,rgba(255,255,255,.8),transparent),radial-gradient(2px 2px at 10% 60%,rgba(255,255,255,.8),transparent),radial-gradient(1px 1px at 85% 40%,rgba(255,255,255,.8),transparent);animation:sparkle 6s linear infinite reverse}.sparkles-3[data-astro-cid-erpkhpuz]{background-image:radial-gradient(1px 1px at 25% 45%,rgba(255,255,255,.9),transparent),radial-gradient(2px 2px at 55% 15%,rgba(255,255,255,.9),transparent),radial-gradient(1px 1px at 75% 85%,rgba(255,255,255,.9),transparent),radial-gradient(2px 2px at 95% 25%,rgba(255,255,255,.9),transparent);animation:sparkle 10s linear infinite}@keyframes sparkle{0%,to{background-position:0% 0%,100% 100%,50% 50%,80% 20%,10% 90%,30% 70%,60% 40%;opacity:.3}50%{background-position:100% 100%,0% 0%,25% 75%,70% 30%,40% 60%,90% 10%,20% 80%;opacity:.8}}.button-shine[data-astro-cid-erpkhpuz]{position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:linear-gradient(45deg,transparent 30%,rgba(255,255,255,.1) 50%,transparent 70%);transform:rotate(45deg);animation:shine 3s infinite}@keyframes shine{0%{transform:rotate(45deg) translate(-100%,-100%)}50%,to{transform:rotate(45deg) translate(100%,100%)}}\n"}],"routeData":{"route":"/postlink","isIndex":false,"type":"page","pattern":"^\\/postlink\\/?$","segments":[[{"content":"postlink","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/postlink.astro","pathname":"/postlink","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/gallery.BNj6rSmt.css"}],"routeData":{"route":"/schedule","isIndex":false,"type":"page","pattern":"^\\/schedule\\/?$","segments":[[{"content":"schedule","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/schedule.astro","pathname":"/schedule","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/gallery.BNj6rSmt.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/gallery.astro",{"propagation":"none","containsHead":true}],["/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/postlink.astro",{"propagation":"none","containsHead":true}],["/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/schedule.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/api/image/gallery@_@js":"pages/api/image/gallery.astro.mjs","\u0000@astro-page:src/pages/api/image/[...path]@_@js":"pages/api/image/_---path_.astro.mjs","\u0000@astro-page:src/pages/events/[id]@_@js":"pages/events/_id_.astro.mjs","\u0000@astro-page:src/pages/gallery@_@astro":"pages/gallery.astro.mjs","\u0000@astro-page:src/pages/postlink@_@astro":"pages/postlink.astro.mjs","\u0000@astro-page:src/pages/schedule@_@astro":"pages/schedule.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_BYC87uzs.mjs","/Users/dem._.mo/Desktop/little-nemo-of-niya/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_D07uqKhf.mjs","/Users/dem._.mo/Desktop/little-nemo-of-niya/src/layouts/MainLayout.astro?astro&type=script&index=0&lang.ts":"_astro/MainLayout.astro_astro_type_script_index_0_lang.zYmbPBNK.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/Users/dem._.mo/Desktop/little-nemo-of-niya/src/layouts/MainLayout.astro?astro&type=script&index=0&lang.ts","function A(){document.querySelectorAll(\".switcher\").forEach(c=>{const S=c.querySelector(\".switcher__track\"),a=Array.from(c.querySelectorAll(\".switcher__option\")),i=a.map(t=>t.querySelector('input[type=\"radio\"]')),l=c.querySelector(\".switcher__indicator\");let m=!1,y;function w(t,r=!0){const n=a[t];if(!n||!l)return;const e=n.getBoundingClientRect(),d=S.getBoundingClientRect(),f=e.left-d.left-18/2;if(r){const s=i.findIndex(g=>g.getAttribute(\"data-prev\")===\"true\"),p=Math.abs(t-(s!==-1?s:t)),I=Math.min(300+p*70,600);l.style.transition=`all ${I}ms cubic-bezier(0.25, 1, 0.5, 1)`}else l.style.transition=\"none\";l.style.width=`${e.width+18}px`,l.style.height=`${e.height+10}px`,l.style.transform=`translateX(${f+9}px)`,i.forEach((s,p)=>s.setAttribute(\"data-prev\",p===t))}a.forEach((t,r)=>{const n=i[r];t.addEventListener(\"click\",e=>{const d=t.getAttribute(\"data-href\");if(!d)return;const[u,f]=d.split(\"#\"),s=window.location.pathname,p=s===\"/\"||s.endsWith(\"index.html\"),I=u===\"\"||u===\"/\"||u.endsWith(\"index.html\");if((s===u||p&&I)&&f){const g=document.getElementById(f);g&&(e.preventDefault(),m=!0,clearTimeout(y),n&&(n.checked=!0),w(r,!0),g.scrollIntoView({behavior:\"smooth\",block:\"start\"}),y=setTimeout(()=>{m=!1},800))}else f&&sessionStorage.setItem(\"scrollTarget\",f),window.location.href=u||\"/\"})});const k=new IntersectionObserver(t=>{m||t.forEach(r=>{if(r.isIntersecting){const n=r.target.id,e=a.findIndex(d=>d.getAttribute(\"data-href\").includes(`#${n}`));e!==-1&&i[e]&&!i[e].checked&&(i[e].checked=!0,w(e,!0))}})},{rootMargin:\"-30% 0px -60% 0px\"});a.forEach(t=>{const r=t.getAttribute(\"data-href\")?.split(\"#\").pop(),n=document.getElementById(r);n&&k.observe(n)});const v=window.location.hash.replace(\"#\",\"\"),b=v?a.findIndex(t=>t.getAttribute(\"data-href\").includes(`#${v}`)):i.findIndex(t=>t.checked);b!==-1&&setTimeout(()=>w(b,!1),150)});const h=sessionStorage.getItem(\"scrollTarget\");if(h){const c=document.getElementById(h);c&&setTimeout(()=>{c.scrollIntoView({behavior:\"smooth\",block:\"start\"})},300),sessionStorage.removeItem(\"scrollTarget\")}}let E=!1;function x(){E||(E=!0,A())}document.addEventListener(\"astro:page-load\",x);document.addEventListener(\"DOMContentLoaded\",x);const T=new IntersectionObserver(o=>{o.forEach(h=>{h.isIntersecting&&h.target.classList.add(\"show\")})},{threshold:.2});document.querySelectorAll(\".slide-right, .fade-in\").forEach(o=>T.observe(o));function B(){const o=document.getElementById(\"popup-overlay\");o&&(o.style.display=\"flex\")}function P(){const o=document.getElementById(\"popup-overlay\");o&&(o.style.display=\"none\")}window.openPopup=B;window.closePopup=P;"]],"assets":["/_astro/gallery.BNj6rSmt.css","/Brand Identity Manual.pdf","/googlefc743a8cb0747add.html","/robots.txt","/site.webmanifest","/sitemap.xml","/img/h-body.png","/img/lit-img.png","/img/profile.jpg","/logo/android-chrome-192x192.png","/logo/android-chrome-512x512.png","/logo/apple-touch-icon.png","/logo/logo 16x16.png","/logo/logo 32x32.png","/logo/tw.png","/video/BG-video.mp4"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"GUUScYACMiqt1xvCuz6lAM0I8oDtPWfWG733aar1QFs="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
