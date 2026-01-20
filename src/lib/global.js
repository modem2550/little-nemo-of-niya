// ==================== SWITCHER ====================
function initSwitcher() {
    const switchers = document.querySelectorAll(".switcher");

    switchers.forEach((switcher) => {
        const track = switcher.querySelector(".switcher__track");
        const options = Array.from(switcher.querySelectorAll(".switcher__option"));
        const radios = options.map(opt => opt.querySelector('input[type="radio"]'));
        const indicator = switcher.querySelector(".switcher__indicator");

        let isClickScrolling = false; // ตัวแปรคุมสถานะการคลิก
        let scrollTimeout;

        function moveIndicator(index, animate = true) {
            const opt = options[index];
            if (!opt || !indicator) return;

            const optRect = opt.getBoundingClientRect();
            const trackRect = track.getBoundingClientRect();

            // ใช้ค่าระยะเผื่อที่คุณตั้งไว้
            const widthOffset = 18;
            const xPosition = (optRect.left - trackRect.left) - (widthOffset / 2);

            // คำนวณความเร็วตามระยะทาง (เพื่อให้สมูทขึ้นเวลาข้ามไกลๆ)
            if (animate) {
                const prevIdx = radios.findIndex(r => r.getAttribute('data-prev') === 'true');
                const distance = Math.abs(index - (prevIdx !== -1 ? prevIdx : index));
                const duration = Math.min(300 + (distance * 70), 600);
                indicator.style.transition = `all ${duration}ms cubic-bezier(0.25, 1, 0.5, 1)`;
            } else {
                indicator.style.transition = "none";
            }

            indicator.style.width = `${optRect.width + 18}px`;
            indicator.style.height = `${optRect.height + 10}px`;
            indicator.style.transform = `translateX(${xPosition + 9}px)`;

            radios.forEach((r, i) => r.setAttribute('data-prev', i === index));
        }

        // --- ส่วนการคลิก ---
        options.forEach((opt, idx) => {
            const radio = radios[idx];
            opt.addEventListener("click", (e) => {
                const href = opt.getAttribute("data-href");
                if (!href) return;

                const [targetPath, targetId] = href.split('#');
                const currentPath = window.location.pathname;
                const isHome = currentPath === "/" || currentPath.endsWith("index.html");
                const targetIsHome = targetPath === "" || targetPath === "/" || targetPath.endsWith("index.html");

                if ((currentPath === targetPath || (isHome && targetIsHome)) && targetId) {
                    const el = document.getElementById(targetId);
                    if (el) {
                        e.preventDefault();

                        // ล็อก Observer ไว้ก่อน
                        isClickScrolling = true;
                        clearTimeout(scrollTimeout);

                        if (radio) radio.checked = true;
                        moveIndicator(idx, true);
                        el.scrollIntoView({ behavior: "smooth", block: "start" });


                        // ปลดล็อกหลังจากเลื่อนเสร็จ (ประมาณ 800ms)
                        scrollTimeout = setTimeout(() => {
                            isClickScrolling = false;
                        }, 800);
                    }
                } else {
                    if (targetId) {
                        sessionStorage.setItem("scrollTarget", targetId);
                    }
                    window.location.href = targetPath || "/";
                }
            });
        });

        // --- ส่วน Observer (Scrollspy) ---
        const observer = new IntersectionObserver((entries) => {
            // ถ้าเราเป็นคนคลิกเอง (isClickScrolling) ให้ Observer ไม่ต้องทำงาน
            if (isClickScrolling) return;

            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    const targetIdx = options.findIndex(o => o.getAttribute("data-href").includes(`#${id}`));

                    if (targetIdx !== -1 && radios[targetIdx] && !radios[targetIdx].checked) {
                        radios[targetIdx].checked = true;
                        moveIndicator(targetIdx, true);
                    }
                }
            });
        }, { rootMargin: '-30% 0px -60% 0px' });

        options.forEach(opt => {
            const id = opt.getAttribute("data-href")?.split("#").pop();
            const sec = document.getElementById(id);
            if (sec) observer.observe(sec);
        });

        // Sync ตอนโหลดหน้า
        const hash = window.location.hash.replace('#', '');
        const startIdx = hash ? options.findIndex(o => o.getAttribute("data-href").includes(`#${hash}`)) : radios.findIndex(r => r.checked);
        if (startIdx !== -1) setTimeout(() => moveIndicator(startIdx, false), 150);
    });
    const pendingTarget = sessionStorage.getItem("scrollTarget");

    if (pendingTarget) {
        const el = document.getElementById(pendingTarget);
        if (el) {
            setTimeout(() => {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 300);
        }
        sessionStorage.removeItem("scrollTarget");
    }
}

let switcherInitialized = false;

function safeInitSwitcher() {
    if (switcherInitialized) return;
    switcherInitialized = true;
    initSwitcher();
}

document.addEventListener('astro:page-load', safeInitSwitcher);
document.addEventListener('DOMContentLoaded', safeInitSwitcher);

// ==================== INTERSECTION OBSERVER ====================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("show");
    });
}, { threshold: 0.2 });

// สังเกต element ที่ต้องการ animation
document.querySelectorAll(".slide-right, .fade-in").forEach(el => observer.observe(el));

function renderSocialLinks(socialLinks) {
    const container = document.getElementById('social-links-container');
    if (!container) return;

    let htmlContent = '';

    socialLinks.forEach(item => {
        // ใช้ toSlug เพื่อสร้างชื่อคลาสจาก platform
        const slug = toSlug(item.platform);

        // 🔸 โครงสร้าง SVG Icon ถูกปรับให้มีคลาสตามตัวอย่างของคุณ
        const socialIconSvg = ` 
            <svg viewBox="0 0 512 512" class="svg-inline--fa fa-${slug}" data-icon="${slug}" data-prefix="fab" role="img" aria-hidden="true" data-fa-i2svg=""> 
                <use href="#${item.iconId}"></use> 
            </svg> 
        `;

        // SVG Arrow (ใช้ icon-arrow-right เดิม) 
        const arrowSvg = ` 
            <svg class="icon arrow-svg ms-1" width="24" height="24" style="height:1em;width:1em"> 
                <use href="#icon-arrow-right"></use> 
            </svg> 
        `;

        // 🔸 โครงสร้าง HTML ที่ใช้คลาส CSS เดิมทั้งหมด และใช้ tag <a> โดยตรง
        const linkHtml = ` 
            <div class="d-grid"> 
                <a href="${item.url}" class="social-box -${slug}" target="_blank" title="${item.platform}">
                    ${socialIconSvg} 
                    <div> 
                        <div class="fw-bold social-margin h6"> 
                            ${item.platform}${arrowSvg} 
                        </div> 
                        <div class="fw-bold social-margin h4">${item.username}</div> 
                    </div> 
                </a> 
            </div> 
        `;
        htmlContent += linkHtml;
    });
    container.innerHTML = htmlContent;
}

function formatDate(startDateString, endDateString) {
    if (!startDateString) return '';
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const parse = (str) => {
        const d = new Date(str.replace(/-/g, '/'));
        return { day: d.getDate().toString().padStart(2, '0'), month: months[d.getMonth()], year: d.getFullYear() };
    };
    const s = parse(startDateString);
    if (!endDateString) return `${s.day} ${s.month} ${s.year}`;
    const e = parse(endDateString);
    return (s.month === e.month && s.year === e.year)
        ? `${s.day}-${e.day} ${s.month} ${s.year}`
        : `${s.day} ${s.month} ${s.year} - ${e.day} ${e.month} ${e.year}`;
}

function openPopup() {
    const overlay = document.getElementById('popup-overlay');
    if (overlay) overlay.style.display = 'flex';
}

function closePopup() {
    const overlay = document.getElementById('popup-overlay');
    if (overlay) overlay.style.display = 'none';
}

// ผูกเข้ากับ window เพื่อให้ HTML เรียกใช้งานได้
window.openPopup = openPopup;
window.closePopup = closePopup;

// 2. ฟังก์ชันหลักสำหรับแสดงผล Event (แก้ไข Logic การกรอง)
function renderEvents(eventData, containerId, filterUpcoming) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    // สร้าง "วันนี้" โดยตัดเวลาทิ้ง (00:00:00)
    const d = new Date();
    const todayMS = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    let finalHtml = '';
    const isBootstrapRow = container.classList.contains('row');

    const filteredEvents = eventData.filter(event => {
        const toMS = (str) => {
            if (!str) return null;
            // ตัดเอาเฉพาะ YYYY-MM-DD
            const datePart = str.split('T')[0].split(' ')[0].replace(/-/g, '/');
            const parts = datePart.split('/');
            
            // สร้าง Date โดยระบุเวลาเป็น 00:00:00 เพื่อให้เทียบกับ todayMS ได้แม่นยำ
            // และใช้ค่านั้นเป็นตัวเลข MS
            return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0).getTime();
        };

        const startMS = toMS(event.date);
        // ตรวจสอบทั้ง end_date และ endDate (เผื่อชื่อคอลัมน์ไม่ตรง)
        const rawEndDate = event.end_date || event.endDate || null;
        const endMS = rawEndDate ? toMS(rawEndDate) : startMS;

        if (filterUpcoming) {
            // งานจะอยู่ Upcoming ถ้า "วันสิ้นสุด" มากกว่าหรือเท่ากับ "วันนี้ (00:00:00)"
            return endMS !== null && endMS >= todayMS;
        } else {
            // งานจะอยู่ Past ถ้า "วันสิ้นสุด" น้อยกว่า "วันนี้"
            return endMS !== null && endMS < todayMS;
        }
    });

    if (filteredEvents.length === 0) {
        container.innerHTML = `<p class="text-center text-muted w-100">ไม่มีรายการในขณะนี้</p>`;
        return;
    }

    // --- ส่วนสร้าง HTML (คงเดิมตามโค้ดของคุณ) ---
    filteredEvents.forEach(event => {
        const formattedDate = formatDate(event.date, event.end_date);
        const imageStyle = event.image_url ? `style="background-image: url('${event.image_url}')"` : '';
        const specialClass = !filterUpcoming ? 'event-past' : '';
        const locationHtml = event.location ? `<div class="ct-da"><svg class="icon" width="16" height="16"><use href="#icon-pin"></use></svg><p>${event.location}</p></div>` : '';
        const liveHtml = event.live ? `<div class="ct-da text-danger"><svg class="icon" width="16" height="16"><use href="#icon-live"></use></svg><p>LIVE: ${event.live.toUpperCase()}</p></div>` : '';

        const articleHtml = `
            <article class="slide-right show carded ${specialClass}">
                <div class="card__img" ${imageStyle}></div>
                <a href="${event.link}" class="card_link" target="_blank">
                    <div class="card__img--hover" ${imageStyle}></div>
                </a>
                <div class="card__info">
                    <a href="${event.link}" class="card_link" target="_blank">
                        <div class="da-sp">
                            <div class="h5">${event.title}</div>
                            ${locationHtml}
                            <div class="ct-da">
                                <svg class="icon" width="16" height="16"><use href="#icon-calendar"></use></svg>
                                <p>${formattedDate}</p>
                            </div>
                            ${liveHtml}
                        </div>
                    </a>
                </div>
            </article>`;
        finalHtml += isBootstrapRow ? `<div class="col d-flex justify-content-center">${articleHtml}</div>` : articleHtml;
    });

    container.innerHTML = finalHtml;
    if (typeof observer !== 'undefined') {
        document.querySelectorAll(".slide-right").forEach(el => observer.observe(el));
    }
}
// ==================== CORE FUNCTIONS ====================

// 1. ฟังก์ชันดึงข้อมูลหลัก
async function fetchAndRenderSplitEvents() {
    if (!_supabase) {
        console.error("Supabase library not found! ติดตั้ง <script src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'></script> ในไฟล์ HTML ด้วยครับ");
        return;
    }

    try {
        console.log("Fetching events from Supabase...");
        const { data: eventData, error } = await _supabase
            .from('event_data')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;

        if (eventData) {
            // ดึง ID ของ Container (เช็คว่ามีอยู่ในหน้านั้นๆ ไหม)
            const upcomingContainer = document.getElementById('upcoming-events-container');
            const pastContainer = document.getElementById('past-events-container');

            if (upcomingContainer) {
                renderEvents(eventData, 'upcoming-events-container', true);
            }
            if (pastContainer) {
                renderEvents(eventData, 'past-events-container', false);
            }
        }
    } catch (error) {
        console.error('Error loading data from Supabase:', error.message);
    }
}

