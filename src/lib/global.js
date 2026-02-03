// ==================== UTILITY FUNCTIONS ====================

function toSlug(text) {
    return text.toLowerCase()
        .replace(/[^\w\s-]/g, '') // ลบอักขระพิเศษ
        .replace(/\s+/g, '-')     // แทนที่ช่องว่างด้วย -
        .replace(/--+/g, '-')     // ลบ -- ที่ติดกัน
        .trim();
}

// ==================== SWITCHER ====================
function initSwitcher() {
    const switchers = document.querySelectorAll(".switcher");

    switchers.forEach((switcher) => {
        const track = switcher.querySelector(".switcher__track");
        const options = Array.from(switcher.querySelectorAll(".switcher__option"));
        const radios = options.map(opt => opt.querySelector('input[type="radio"]'));
        const indicator = switcher.querySelector(".switcher__indicator");

        let isClickScrolling = false;
        let scrollTimeout;

        function moveIndicator(index, animate = true) {
            const opt = options[index];
            if (!opt || !indicator) return;

            const optRect = opt.getBoundingClientRect();
            const trackRect = track.getBoundingClientRect();
            const widthOffset = 18;
            const xPosition = (optRect.left - trackRect.left) - (widthOffset / 2);

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

        // --- Click handlers ---
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
                        isClickScrolling = true;
                        clearTimeout(scrollTimeout);

                        if (radio) radio.checked = true;
                        moveIndicator(idx, true);
                        el.scrollIntoView({ behavior: "smooth", block: "start" });

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

        // --- Intersection Observer (Scrollspy) ---
        const observer = new IntersectionObserver((entries) => {
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

        // Sync on page load
        const hash = window.location.hash.replace('#', '');
        const startIdx = hash ? options.findIndex(o => o.getAttribute("data-href").includes(`#${hash}`)) : radios.findIndex(r => r.checked);
        if (startIdx !== -1) setTimeout(() => moveIndicator(startIdx, false), 150);
    });

    // Handle pending scroll target
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

// ==================== ANIMATION OBSERVER ====================
const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("show");
    });
}, { threshold: 0.2 });

// ==================== SOCIAL LINKS ====================
function renderSocialLinks(socialLinks) {
    const container = document.getElementById('social-links-container');
    if (!container) return;

    let htmlContent = '';

    socialLinks.forEach(item => {
        const slug = toSlug(item.platform);

        const socialIconSvg = ` 
            <svg viewBox="0 0 512 512" class="svg-inline--fa fa-${slug}" data-icon="${slug}" data-prefix="fab" role="img" aria-hidden="true" data-fa-i2svg=""> 
                <use href="#${item.iconId}"></use> 
            </svg> 
        `;

        const arrowSvg = ` 
            <svg class="icon arrow-svg ms-1" width="24" height="24" style="height:1em;width:1em"> 
                <use href="#icon-arrow-right"></use> 
            </svg> 
        `;

        const linkHtml = ` 
            <div class="d-grid"> 
                <a href="${item.url}" class="social-box -${slug}" target="_blank" title="${item.platform}" aria-label="${item.platform}">
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

    // Observe newly added elements for animations
    container.querySelectorAll('.social-box').forEach(el => {
        animationObserver.observe(el);
    });
}

// ==================== DATE FORMATTING ====================
function formatDate(startDateString, endDateString) {
    if (!startDateString) return '';

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    const parse = (str) => {
        const d = new Date(str.replace(/-/g, '/'));
        return {
            day: d.getDate().toString().padStart(2, '0'),
            month: months[d.getMonth()],
            year: d.getFullYear()
        };
    };

    const s = parse(startDateString);
    if (!endDateString) return `${s.day} ${s.month} ${s.year}`;

    const e = parse(endDateString);
    return (s.month === e.month && s.year === e.year)
        ? `${s.day}-${e.day} ${s.month} ${s.year}`
        : `${s.day} ${s.month} ${s.year} - ${e.day} ${e.month} ${e.year}`;
}

// ==================== EVENT RENDERING ====================
function renderEvents(eventData, containerId, filterUpcoming) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    // Create "today" at 00:00:00
    const d = new Date();
    const todayMS = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    let finalHtml = '';
    const isBootstrapRow = container.classList.contains('row');

    const filteredEvents = eventData.filter(event => {
        const toMS = (str) => {
            if (!str) return null;
            const datePart = str.split('T')[0].split(' ')[0].replace(/-/g, '/');
            const parts = datePart.split('/');
            return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0).getTime();
        };

        const startMS = toMS(event.date);
        const rawEndDate = event.end_date || event.endDate || null;
        const endMS = rawEndDate ? toMS(rawEndDate) : startMS;

        if (filterUpcoming) {
            return endMS !== null && endMS >= todayMS;
        } else {
            return endMS !== null && endMS < todayMS;
        }
    });

    if (filteredEvents.length === 0) {
        container.innerHTML = `<p class="text-center text-muted w-100" aria-live="polite">ไม่มีรายการในขณะนี้</p>`;
        return;
    }

    filteredEvents.forEach(event => {
        const formattedDate = formatDate(event.date, event.end_date);
        const imageStyle = event.image_url ? `style="background-image: url('${event.image_url}')"` : '';
        const specialClass = !filterUpcoming ? 'event-past' : '';
        const locationHtml = event.location ? `<div class="ct-da"><svg class="icon" width="16" height="16" aria-hidden="true"><use href="#icon-pin"></use></svg><p>${event.location}</p></div>` : '';
        const liveHtml = event.live ? `<div class="ct-da text-danger"><svg class="icon" width="16" height="16" aria-hidden="true"><use href="#icon-live"></use></svg><p>LIVE: ${event.live.toUpperCase()}</p></div>` : '';

        const articleHtml = `
            <article class="slide-right carded ${specialClass}" data-event-date="${event.date}" aria-label="${event.title}">
                <div class="card__img" ${imageStyle} role="img" aria-label="ภาพปกกิจกรรม"></div>
                <a href="${event.link}" class="card_link" target="_blank" rel="noopener noreferrer">
                    <div class="card__img--hover" ${imageStyle}></div>
                </a>
                <div class="card__info">
                    <a href="${event.link}" class="card_link" target="_blank" rel="noopener noreferrer">
                        <div class="da-sp">
                            <div class="h5">${event.title}</div>
                            ${locationHtml}
                            <div class="ct-da">
                                <svg class="icon" width="16" height="16" aria-hidden="true"><use href="#icon-calendar"></use></svg>
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

    // Observe newly added elements for animations
    container.querySelectorAll(".slide-right").forEach(el => {
        animationObserver.observe(el);

        // Add hover effects
        el.addEventListener('mouseenter', function () {
            this.style.transform = 'scale(1.02)';
        });

        el.addEventListener('mouseleave', function () {
            this.style.transform = 'scale(1)';
        });
    });
}

// ==================== DATA FETCHING ====================
async function fetchAndRenderSplitEvents() {
    if (!_supabase) {
        console.error("Supabase library not found!");
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

// ==================== POPUP FUNCTIONS ====================
function openPopup() {
    const overlay = document.getElementById('popup-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');

        // Focus trap for accessibility
        const firstLink = overlay.querySelector('.social-link');
        if (firstLink) firstLink.focus();

        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
    }
}

function closePopup() {
    const overlay = document.getElementById('popup-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');

        // Restore scrolling
        document.body.style.overflow = '';

        // Return focus to the button that opened the popup
        const openerBtn = document.getElementById('moreInfoBtn') || document.querySelector('[onclick*="openPopup"]');
        if (openerBtn) openerBtn.focus();
    }
}

// ==================== DOM READY ====================
document.addEventListener('DOMContentLoaded', function () {
    // 1. Page load progress indicator
    const progressBar = document.createElement('div');
    progressBar.id = 'page-load-progress';
    progressBar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progressBar);

    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 10;
        progressBar.style.width = progress + '%';

        if (progress >= 90) {
            clearInterval(progressInterval);
            setTimeout(() => {
                progressBar.style.width = '100%';
                setTimeout(() => {
                    progressBar.style.opacity = '0';
                    setTimeout(() => {
                        progressBar.remove();
                    }, 300);
                }, 200);
            }, 100);
        }
    }, 50);

    // 2. Scroll to top button
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.id = 'scrollToTop';
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.title = 'กลับสู่ด้านบน';
    scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
    scrollToTopBtn.setAttribute('aria-hidden', 'true');
    document.body.appendChild(scrollToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('show');
            scrollToTopBtn.setAttribute('aria-hidden', 'false');
        } else {
            scrollToTopBtn.classList.remove('show');
            scrollToTopBtn.setAttribute('aria-hidden', 'true');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 3. Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update URL hash without scrolling
                history.pushState(null, null, href);
            }
        });
    });

    // 4. Lazy load iframes
    const lazyIframes = document.querySelectorAll('iframe[data-lazy-iframe]');
    const lazyIframeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                iframe.style.background = 'transparent';
                lazyIframeObserver.unobserve(iframe);
            }
        });
    }, { rootMargin: '50px' });

    lazyIframes.forEach(iframe => {
        lazyIframeObserver.observe(iframe);
    });

    // 5. Observe animation elements
    document.querySelectorAll(".slide-right, .fade-in, .social-box").forEach(el => {
        animationObserver.observe(el);
    });

    // 6. Button tracking
    const trackButtons = ['moreEventsBtn', 'moreGalleryBtn', 'moreInfoBtn'];
    trackButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', function () {
                const action = btnId === 'moreEventsBtn' ? 'view_more_events' :
                    btnId === 'moreGalleryBtn' ? 'view_more_gallery' :
                        'view_more_info';
                console.log(`User clicked: ${action}`);
            });
        }
    });

    // 7. Close popup with Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closePopup();
        }
    });

    // 8. Popup accessibility improvements
    const closePopupBtn = document.getElementById('closePopupBtn');
    if (closePopupBtn) {
        closePopupBtn.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                closePopup();
            }
        });
    }

    // 9. Video handling
    const video = document.querySelector('.video-bg');
    if (video) {
        video.addEventListener('loadeddata', function () {
            this.classList.add('loaded');
        });

        video.addEventListener('error', function () {
            this.style.display = 'none';
            const poster = this.getAttribute('poster');
            if (poster) {
                const img = document.createElement('img');
                img.src = poster;
                img.className = 'w-100';
                img.alt = 'Niya BNK48';
                this.parentNode.insertBefore(img, this.nextSibling);
            }
        });
    }

    // 10. Performance monitoring
    window.addEventListener('load', function () {
        const loadTime = window.performance.timing.domContentLoadedEventEnd -
            window.performance.timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
        document.documentElement.classList.add('page-loaded');
    });
});

// ==================== EVENT LISTENERS ====================
document.addEventListener('astro:page-load', safeInitSwitcher);
document.addEventListener('DOMContentLoaded', safeInitSwitcher);

// ==================== EXPORT FUNCTIONS ====================
window.openPopup = openPopup;
window.closePopup = closePopup;
window.fetchAndRenderSplitEvents = fetchAndRenderSplitEvents;
window.renderSocialLinks = renderSocialLinks;
window.toSlug = toSlug;
window.formatDate = formatDate;

document.querySelectorAll('.img-box img').forEach(img => {
    const box = img.closest('.img-box');

    const reveal = () => {
        // ใช้ requestAnimationFrame เพื่อให้ Class เพิ่มในจังหวะที่ Browser พร้อมวาดรูปพอดี
        requestAnimationFrame(() => {
            box.classList.add('is-loaded');            
        });
    };

    if (img.complete) {
        reveal();
    } else {
        img.addEventListener('load', reveal, { once: true });
        // เพิ่ม Error handling เพื่อไม่ให้คอนเทนเนอร์ "ค้าง" ถ้าโหลดรูปไม่สำเร็จ
        img.addEventListener('error', reveal, { once: true });
    }
});