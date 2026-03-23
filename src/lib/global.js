// ==================== UTILITY ====================

const toSlug = (text) =>
  text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-').trim();

// ==================== SWITCHER ====================

function initSwitcher() {
  document.querySelectorAll('.switcher').forEach((switcher) => {
    const track     = switcher.querySelector('.switcher__track');
    const options   = [...switcher.querySelectorAll('.switcher__option')];
    const radios    = options.map((o) => o.querySelector('input[type="radio"]'));
    const indicator = switcher.querySelector('.switcher__indicator');

    let isClickScrolling = false;
    let scrollTimeout;

    function moveIndicator(index, animate = true) {
      const opt = options[index];
      if (!opt || !indicator) return;

      const optRect   = opt.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      const pad       = 18;

      indicator.style.transition = animate
        ? `all ${Math.min(300 + Math.abs(index - (radios.findIndex((r) => r.getAttribute('data-prev') === 'true') || index)) * 70, 600)}ms cubic-bezier(0.25,1,0.5,1)`
        : 'none';

      indicator.style.width     = `${optRect.width + pad}px`;
      indicator.style.height    = `${optRect.height + 10}px`;
      indicator.style.transform = `translateX(${(optRect.left - trackRect.left) - pad / 2 + 9}px)`;

      radios.forEach((r, i) => r.setAttribute('data-prev', String(i === index)));
    }

    // Click
    options.forEach((opt, idx) => {
      opt.addEventListener('click', (e) => {
        const href = opt.getAttribute('data-href') || '';
        const [targetPath, targetId] = href.split('#');
        const currentPath = window.location.pathname;
        const isHome      = currentPath === '/' || currentPath.endsWith('index.html');
        const targetIsHome = !targetPath || targetPath === '/' || targetPath.endsWith('index.html');

        if ((currentPath === targetPath || (isHome && targetIsHome)) && targetId) {
          const el = document.getElementById(targetId);
          if (el) {
            e.preventDefault();
            isClickScrolling = true;
            clearTimeout(scrollTimeout);
            radios[idx].checked = true;
            moveIndicator(idx);
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            scrollTimeout = setTimeout(() => { isClickScrolling = false; }, 800);
          }
        } else {
          if (targetId) sessionStorage.setItem('scrollTarget', targetId);
          window.location.href = targetPath || '/';
        }
      });
    });

    // Scrollspy
    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling) return;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = options.findIndex((o) => o.getAttribute('data-href')?.includes(`#${entry.target.id}`));
          if (idx !== -1 && !radios[idx].checked) {
            radios[idx].checked = true;
            moveIndicator(idx);
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );

    options.forEach((opt) => {
      const id  = opt.getAttribute('data-href')?.split('#').pop();
      const sec = id && document.getElementById(id);
      if (sec) observer.observe(sec);
    });

    // Init position
    const hash     = window.location.hash.replace('#', '');
    const startIdx = hash
      ? options.findIndex((o) => o.getAttribute('data-href')?.includes(`#${hash}`))
      : radios.findIndex((r) => r.checked);
    if (startIdx !== -1) setTimeout(() => moveIndicator(startIdx, false), 150);
  });

  // Pending scroll
  const pending = sessionStorage.getItem('scrollTarget');
  if (pending) {
    sessionStorage.removeItem('scrollTarget');
    setTimeout(() => document.getElementById(pending)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  }
}

let switcherInitialized = false;
const safeInitSwitcher = () => { if (!switcherInitialized) { switcherInitialized = true; initSwitcher(); } };

// ==================== ANIMATION ====================

const animationObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('show'); }),
  { threshold: 0.2 }
);

function observeWhenBelow(els) {
  const vh = window.innerHeight;
  els.forEach((el) => {
    el.getBoundingClientRect().top > vh ? animationObserver.observe(el) : el.classList.add('show');
  });
}

// ==================== SOCIAL LINKS ====================

function renderSocialLinks(socialLinks) {
  const container = document.getElementById('social-links-container');
  if (!container) return;

  container.innerHTML = socialLinks.map(({ platform, iconId, url, username }) => {
    const slug = toSlug(platform);
    return `
      <div class="d-grid">
        <a href="${url}" class="social-box -${slug}" target="_blank" title="${platform}" aria-label="${platform}">
          <svg viewBox="0 0 512 512" class="svg-inline--fa fa-${slug}" aria-hidden="true">
            <use href="#${iconId}"></use>
          </svg>
          <div>
            <div class="fw-bold social-margin h6">
              ${platform}
              <svg class="icon arrow-svg ms-1" width="24" height="24" aria-hidden="true"><use href="#icon-arrow-right"></use></svg>
            </div>
            <div class="fw-bold social-margin h4">${username}</div>
          </div>
        </a>
      </div>`;
  }).join('');

  observeWhenBelow(container.querySelectorAll('.social-box'));
}

// ==================== POPUP ====================

const getOverlay = () => document.getElementById('popup-overlay');

function openPopup() {
  const overlay = getOverlay();
  if (!overlay) return;
  overlay.style.display = 'flex';
  overlay.setAttribute('aria-hidden', 'false');
  overlay.querySelector('.social-link')?.focus();
  document.body.style.overflow = 'hidden';
}

function closePopup() {
  const overlay = getOverlay();
  if (!overlay) return;
  overlay.style.display = 'none';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  (document.getElementById('moreInfoBtn') || document.querySelector('[onclick*="openPopup"]'))?.focus();
}

// ==================== DOM READY ====================

document.addEventListener('DOMContentLoaded', () => {
  // Progress bar
  const bar = Object.assign(document.createElement('div'), {
    id: 'page-load-progress',
    style: 'position:fixed;top:0;left:0;width:0%;height:3px;background:var(--c-primary);z-index:9999;transition:width .3s,opacity .3s',
  });
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  let pct = 0;
  const iv = setInterval(() => {
    bar.style.width = `${(pct += 10)}%`;
    if (pct >= 90) {
      clearInterval(iv);
      setTimeout(() => {
        bar.style.width = '100%';
        setTimeout(() => { bar.style.opacity = '0'; setTimeout(() => bar.remove(), 300); }, 200);
      }, 100);
    }
  }, 50);

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.pushState(null, '', href); }
    });
  });

  // Lazy iframes
  const lazyObserver = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.style.background = 'transparent'; lazyObserver.unobserve(entry.target); }
    }),
    { rootMargin: '50px' }
  );
  document.querySelectorAll('iframe[data-lazy-iframe]').forEach((el) => lazyObserver.observe(el));

  // Animate on scroll
  observeWhenBelow(document.querySelectorAll('.slide-right, .fade-in, .social-box'));

  // Escape closes popup
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopup(); });

  // Video fallback
  const video = document.querySelector('.video-bg');
  if (video) {
    video.addEventListener('loadeddata', () => video.classList.add('loaded'));
    video.addEventListener('error', () => {
      video.style.display = 'none';
      const poster = video.getAttribute('poster');
      if (poster) {
        const img = Object.assign(document.createElement('img'), { src: poster, className: 'w-100', alt: 'Niya BNK48' });
        video.after(img);
      }
    });
  }

  // Image box reveal
  document.querySelectorAll('.img-box img').forEach((img) => {
    const box = img.closest('.img-box');
    const reveal = () => requestAnimationFrame(() => box.classList.add('is-loaded'));
    img.complete ? reveal() : img.addEventListener('load', reveal, { once: true });
    img.addEventListener('error', reveal, { once: true });
  });
});

// ==================== INIT ====================

document.addEventListener('astro:page-load', safeInitSwitcher);
document.addEventListener('DOMContentLoaded', safeInitSwitcher);

window.openPopup       = openPopup;
window.closePopup      = closePopup;
window.renderSocialLinks = renderSocialLinks;
window.toSlug          = toSlug;