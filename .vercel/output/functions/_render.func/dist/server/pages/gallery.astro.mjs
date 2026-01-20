import { e as createComponent, k as renderComponent, r as renderTemplate, l as defineScriptVars, n as Fragment, m as maybeRenderHead } from '../chunks/astro/server_B3Rps_87.mjs';
import { $ as $$MainLayout } from '../chunks/MainLayout_jDcjEGYK.mjs';
import { $ as $$GalleryCard } from '../chunks/GalleryCard_QdqTf2Mb.mjs';
import { g as getSupabase } from '../chunks/supabase.server_DxCuIpeL.mjs';
/* empty css                                   */
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Gallery = createComponent(async ($$result, $$props, $$slots) => {
  const supabase = getSupabase();
  const { data: allEvents, error } = await supabase.from("event_gallery").select("*").order("Date-At", { ascending: false });
  if (error) {
    console.error("Error fetching events:", error);
  }
  const ITEMS_PER_PAGE = 16;
  const initialEvents = allEvents?.slice(0, ITEMS_PER_PAGE) || [];
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Gallery - Niya BNK48's", "data-astro-cid-sahthylw": true }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", `<div style="margin-top: 108px; background: var(--c-primary); padding: 30px 0 30px 0; color: white;" class="mb-3" data-astro-cid-sahthylw> <header data-astro-cid-sahthylw> <h1 class="text-center fw-800 h1" data-astro-cid-sahthylw><strong data-astro-cid-sahthylw>Niya BNK48's Gallery</strong></h1> <p class="text-center fw-600 mb-0" style="font-size:18px" data-astro-cid-sahthylw>\u0E04\u0E25\u0E31\u0E07\u0E23\u0E39\u0E1B\u0E02\u0E2D\u0E07\u0E19\u0E35\u0E0D\u0E48\u0E32</p> </header> </div> <main class="py-5 px-5" data-astro-cid-sahthylw> <div data-astro-cid-sahthylw> `, " </div> </main> <script>(function(){", `
        if (allEventsData && allEventsData.length > ITEMS_PER_PAGE) {
            let currentIndex = ITEMS_PER_PAGE;
            let isLoading = false;
            const events = allEventsData;
            let hasMoreData = currentIndex < events.length;

            const galleryContainer = document.getElementById('gallery-container');
            const loadingIndicator = document.getElementById('loading-indicator');
            const noMoreDataIndicator = document.getElementById('no-more-data');

            function formatDate(dateString) {
                if (!dateString) return '';
                const date = new Date(dateString);
                const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                const day = String(date.getDate()).padStart(2, '0');
                const month = months[date.getMonth()];
                const year = date.getFullYear();
                return \`\${day} \${month} \${year}\`;
            }

            function loadMoreEvents() {
                if (isLoading || !hasMoreData) return;

                isLoading = true;
                loadingIndicator.style.display = 'block';

                setTimeout(() => {
                    const nextEvents = events.slice(currentIndex, currentIndex + ITEMS_PER_PAGE);

                    nextEvents.forEach(event => {
                        const colDiv = document.createElement('div');
                        colDiv.className = 'col d-flex justify-content-center';
                        
                        const formattedDate = formatDate(event['Date-At']);
                        const photoPageLink = event['Photo-page-link'] || '#';
                        const imgLink = event['IMG_link'] || event['Cover-Image'] || 'https://via.placeholder.com/400x300?text=Image+Error';
                        const photoPage = event['Phot-page'] || event['Photo-page'] || 'Unknown';
                        const eventName = event.Event || event.Name || 'Untitled Event';
                        
                        colDiv.innerHTML = \`
                            <div class="img-box tabcontent Event" style="display: block;">
                                <a href="\${photoPageLink}" target="_blank" rel="noopener noreferrer">
                                    <img src="\${imgLink}" 
                                         alt="\${eventName}" 
                                         class="gallery" 
                                         loading="lazy"
                                         onerror="this.src='https://via.placeholder.com/400x300?text=Image+Error'">
                                    <div class="transparent-box">
                                        <div class="caption mb-0">
                                            <p><strong>\${eventName}</strong></p>
                                            <div class="ct-ga">
                                                <svg class="icon" width="16" height="16">
                                                    <use href="#icon-post"></use>
                                                </svg>
                                                <p class="opacity-low mb-0">\${photoPage}</p>
                                            </div>
                                            <div class="ct-ga">
                                                <svg class="icon" width="16" height="16">
                                                    <use href="#icon-calendar"></use>
                                                </svg>
                                                <p>\${formattedDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        \`;
                        
                        galleryContainer.appendChild(colDiv);
                    });

                    currentIndex += nextEvents.length;
                    hasMoreData = currentIndex < events.length;

                    if (!hasMoreData) {
                        noMoreDataIndicator.style.display = 'block';
                    }

                    isLoading = false;
                    loadingIndicator.style.display = 'none';
                }, 300);
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && hasMoreData && !isLoading) {
                        loadMoreEvents();
                    }
                });
            }, {
                rootMargin: '200px'
            });

            const sentinel = document.getElementById('sentinel');
            if (sentinel) {
                observer.observe(sentinel);
            }
        }
    })();<\/script>  `], [" ", `<div style="margin-top: 108px; background: var(--c-primary); padding: 30px 0 30px 0; color: white;" class="mb-3" data-astro-cid-sahthylw> <header data-astro-cid-sahthylw> <h1 class="text-center fw-800 h1" data-astro-cid-sahthylw><strong data-astro-cid-sahthylw>Niya BNK48's Gallery</strong></h1> <p class="text-center fw-600 mb-0" style="font-size:18px" data-astro-cid-sahthylw>\u0E04\u0E25\u0E31\u0E07\u0E23\u0E39\u0E1B\u0E02\u0E2D\u0E07\u0E19\u0E35\u0E0D\u0E48\u0E32</p> </header> </div> <main class="py-5 px-5" data-astro-cid-sahthylw> <div data-astro-cid-sahthylw> `, " </div> </main> <script>(function(){", `
        if (allEventsData && allEventsData.length > ITEMS_PER_PAGE) {
            let currentIndex = ITEMS_PER_PAGE;
            let isLoading = false;
            const events = allEventsData;
            let hasMoreData = currentIndex < events.length;

            const galleryContainer = document.getElementById('gallery-container');
            const loadingIndicator = document.getElementById('loading-indicator');
            const noMoreDataIndicator = document.getElementById('no-more-data');

            function formatDate(dateString) {
                if (!dateString) return '';
                const date = new Date(dateString);
                const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                const day = String(date.getDate()).padStart(2, '0');
                const month = months[date.getMonth()];
                const year = date.getFullYear();
                return \\\`\\\${day} \\\${month} \\\${year}\\\`;
            }

            function loadMoreEvents() {
                if (isLoading || !hasMoreData) return;

                isLoading = true;
                loadingIndicator.style.display = 'block';

                setTimeout(() => {
                    const nextEvents = events.slice(currentIndex, currentIndex + ITEMS_PER_PAGE);

                    nextEvents.forEach(event => {
                        const colDiv = document.createElement('div');
                        colDiv.className = 'col d-flex justify-content-center';
                        
                        const formattedDate = formatDate(event['Date-At']);
                        const photoPageLink = event['Photo-page-link'] || '#';
                        const imgLink = event['IMG_link'] || event['Cover-Image'] || 'https://via.placeholder.com/400x300?text=Image+Error';
                        const photoPage = event['Phot-page'] || event['Photo-page'] || 'Unknown';
                        const eventName = event.Event || event.Name || 'Untitled Event';
                        
                        colDiv.innerHTML = \\\`
                            <div class="img-box tabcontent Event" style="display: block;">
                                <a href="\\\${photoPageLink}" target="_blank" rel="noopener noreferrer">
                                    <img src="\\\${imgLink}" 
                                         alt="\\\${eventName}" 
                                         class="gallery" 
                                         loading="lazy"
                                         onerror="this.src='https://via.placeholder.com/400x300?text=Image+Error'">
                                    <div class="transparent-box">
                                        <div class="caption mb-0">
                                            <p><strong>\\\${eventName}</strong></p>
                                            <div class="ct-ga">
                                                <svg class="icon" width="16" height="16">
                                                    <use href="#icon-post"></use>
                                                </svg>
                                                <p class="opacity-low mb-0">\\\${photoPage}</p>
                                            </div>
                                            <div class="ct-ga">
                                                <svg class="icon" width="16" height="16">
                                                    <use href="#icon-calendar"></use>
                                                </svg>
                                                <p>\\\${formattedDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        \\\`;
                        
                        galleryContainer.appendChild(colDiv);
                    });

                    currentIndex += nextEvents.length;
                    hasMoreData = currentIndex < events.length;

                    if (!hasMoreData) {
                        noMoreDataIndicator.style.display = 'block';
                    }

                    isLoading = false;
                    loadingIndicator.style.display = 'none';
                }, 300);
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && hasMoreData && !isLoading) {
                        loadMoreEvents();
                    }
                });
            }, {
                rootMargin: '200px'
            });

            const sentinel = document.getElementById('sentinel');
            if (sentinel) {
                observer.observe(sentinel);
            }
        }
    })();<\/script>  `])), maybeRenderHead(), !allEvents || allEvents.length === 0 ? renderTemplate`<div class="row" data-astro-cid-sahthylw> <div class="col-12" data-astro-cid-sahthylw> <div class="alert alert-info text-center" role="alert" data-astro-cid-sahthylw> <i class="bi bi-info-circle me-2" data-astro-cid-sahthylw></i>
ไม่พบข้อมูลรูปภาพ
</div> </div> </div>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-sahthylw": true }, { "default": async ($$result3) => renderTemplate` <div id="gallery-container" class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4" data-astro-cid-sahthylw> ${initialEvents.map((event) => renderTemplate`${renderComponent($$result3, "GalleryCard", $$GalleryCard, { "event": event, "data-astro-cid-sahthylw": true })}`)} </div> ${allEvents.length > ITEMS_PER_PAGE && renderTemplate`${renderComponent($$result3, "Fragment", Fragment, { "data-astro-cid-sahthylw": true }, { "default": async ($$result4) => renderTemplate` <div id="loading-indicator" class="text-center mt-4" style="display: none;" data-astro-cid-sahthylw> <div class="spinner-border text-primary" role="status" data-astro-cid-sahthylw> <span class="visually-hidden" data-astro-cid-sahthylw>กำลังโหลด...</span> </div> <p class="mt-2" data-astro-cid-sahthylw>กำลังโหลดรูปภาพเพิ่มเติม...</p> </div> <div id="no-more-data" class="text-center mt-4" style="display: none;" data-astro-cid-sahthylw> <p class="text-muted" data-astro-cid-sahthylw></p> </div> <div id="sentinel" data-astro-cid-sahthylw></div> ` })}`}` })}`, defineScriptVars({ allEventsData: allEvents, ITEMS_PER_PAGE })) })}`;
}, "/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/gallery.astro", void 0);

const $$file = "/Users/dem._.mo/Desktop/little-nemo-of-niya/src/pages/gallery.astro";
const $$url = "/gallery";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Gallery,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
