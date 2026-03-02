// ==================== UTILITY FUNCTIONS ====================

function toSlug(text) {
    return text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
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

        // Click handlers
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

        // Intersection Observer (Scrollspy)
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
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
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
            <svg viewBox="0 0 512 512" class="svg-inline--fa fa-${slug}" data-icon="${slug}" data-prefix="fab" role="img" aria-hidden="true"> 
                <use href="#${item.iconId}"></use> 
            </svg> 
        `;

        const arrowSvg = ` 
            <svg class="icon arrow-svg ms-1" width="24" height="24" aria-hidden="true"> 
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

    // Observe only elements below the fold
    container.querySelectorAll('.social-box').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top > window.innerHeight) {
            animationObserver.observe(el);
        } else {
            el.classList.add('show');
        }
    });
}

// ==================== POPUP FUNCTIONS ====================
function openPopup() {
    const overlay = document.getElementById('popup-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');

        const firstLink = overlay.querySelector('.social-link');
        if (firstLink) firstLink.focus();

        document.body.style.overflow = 'hidden';
    }
}

function closePopup() {
    const overlay = document.getElementById('popup-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';

        const openerBtn = document.getElementById('moreInfoBtn') || 
                         document.querySelector('[onclick*="openPopup"]');
        if (openerBtn) openerBtn.focus();
    }
}

// ==================== DOM READY ====================
document.addEventListener('DOMContentLoaded', function () {
    // 1. Page load progress
    const progressBar = document.createElement('div');
    progressBar.id = 'page-load-progress';
    progressBar.setAttribute('aria-hidden', 'true');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: var(--c-primary);
        z-index: 9999;
        transition: width 0.3s, opacity 0.3s;
    `;
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
                    setTimeout(() => progressBar.remove(), 300);
                }, 200);
            }, 100);
        }
    }, 50);

    // 2. Smooth scrolling for anchor links
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
                history.pushState(null, null, href);
            }
        });
    });

    // 3. Lazy load iframes
    const lazyIframeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                iframe.style.background = 'transparent';
                lazyIframeObserver.unobserve(iframe);
            }
        });
    }, { rootMargin: '50px' });

    document.querySelectorAll('iframe[data-lazy-iframe]').forEach(iframe => {
        lazyIframeObserver.observe(iframe);
    });

    // 4. Observe animation elements (only below fold)
    document.querySelectorAll(".slide-right, .fade-in, .social-box").forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top > window.innerHeight) {
            animationObserver.observe(el);
        } else {
            el.classList.add('show');
        }
    });

    // 5. Close popup with Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closePopup();
    });

    // 6. Video handling
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

    // 7. Image loading
    document.querySelectorAll('.img-box img').forEach(img => {
        const box = img.closest('.img-box');
        const reveal = () => {
            requestAnimationFrame(() => {
                box.classList.add('is-loaded');
            });
        };

        if (img.complete) {
            reveal();
        } else {
            img.addEventListener('load', reveal, { once: true });
            img.addEventListener('error', reveal, { once: true });
        }
    });
});

// ==================== EVENT LISTENERS ====================
document.addEventListener('astro:page-load', safeInitSwitcher);
document.addEventListener('DOMContentLoaded', safeInitSwitcher);

// ==================== EXPORT FUNCTIONS ====================
window.openPopup = openPopup;
window.closePopup = closePopup;
window.renderSocialLinks = renderSocialLinks;
window.toSlug = toSlug;

// ลบฟังก์ชันที่ไม่ได้ใช้ออก:
// - fetchAndRenderSplitEvents (ใช้ Astro server-side แทน)
// - renderEvents (ใช้ Astro server-side แทน)
// - formatDate (ย้ายไปที่ dateUtils.ts)