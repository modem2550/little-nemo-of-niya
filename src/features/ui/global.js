// ============================================================
// CONFIGURATION
// ============================================================

const HEADER_HEIGHT = 70;
const SCROLL_THRESHOLD = 0.5; // Trigger at 50% of hero height
const ANIMATION_CONFIG = {
  staggerStep: 80,
  sectionDelay: 60,
  offsetX: 60,
  offsetY: 30,
  duration: 500,
};

// ============================================================
// HEADER & NAVIGATION - IMPROVED
// ============================================================

function isHomePath() {
  const p = window.location.pathname;
  return p === '/' || p === '';
}

function initHeader() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const navMobile = document.querySelector('.nav-mobile');
  const backdrop = document.querySelector('.nav-backdrop');
  const allNavLinks = document.querySelectorAll('.nav-link, .nav-link-mobile');
  const heroSection = document.querySelector('#home');
  const onHome = isHomePath();

  if (!header || !toggle || !navMobile) return;

  // State management
  let isMenuOpen = false;
  let headerActive = false;
  let scrollTimeout;

  // หน้าอื่นที่ไม่มี hero — ให้แถบหัวอ่านง่ายตลอด (ไม่ทับเนื้อหาแบบโปร่งใส)
  if (!onHome || !heroSection) {
    header.classList.add('active');
    headerActive = true;
  }

  // Throttled scroll handler
  const handleScroll = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (!onHome || !heroSection) return;

      const scrollY = window.scrollY;
      const heroHeight = heroSection.offsetHeight;
      const shouldActivate = scrollY > heroHeight * SCROLL_THRESHOLD;

      if (shouldActivate !== headerActive) {
        headerActive = shouldActivate;
        header.classList.toggle('active', headerActive);
      }
    }, 10);
  };

  // Toggle menu with prevent body scroll
  function openMenu() {
    isMenuOpen = true;
    toggle.classList.add('active');
    navMobile.classList.add('active');
    backdrop.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = getScrollbarWidth() + 'px';
  }

  function closeMenu() {
    isMenuOpen = false;
    toggle.classList.remove('active');
    navMobile.classList.remove('active');
    backdrop.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  // Get scrollbar width to prevent layout shift
  function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  // Toggle menu
  toggle.addEventListener('click', () => {
    isMenuOpen ? closeMenu() : openMenu();
  });

  // Close menu on backdrop click
  backdrop.addEventListener('click', closeMenu);

  // ปิดเมนูมือถือทุกครั้งที่เลือกลิงก์ (การเลื่อนไปยัง # จัดการใน initSmoothScroll)
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isMenuOpen) closeMenu();
    });
  });

  // Scroll listener with better performance (เฉพาะหน้าแรก)
  if (onHome && heroSection) {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMenuOpen) {
      closeMenu();
    }
  });

  // Close menu on focus out (accessibility)
  navMobile.addEventListener('focusout', (e) => {
    if (isMenuOpen && !navMobile.contains(e.relatedTarget) && !toggle.contains(e.relatedTarget)) {
      closeMenu();
    }
  });

  // Prevent scroll while menu is open
  document.addEventListener('touchmove', (e) => {
    if (!isMenuOpen) return;
    e.preventDefault();
  }, { passive: false });
}

// ============================================================
// ACTIVE NAV TRACKING - IMPROVED
// ============================================================

function initActiveNav() {
  const sectionIds = ['home', 'info', 'event', 'social', 'library', 'fanclub'];
  const navLinks = document.querySelectorAll('.nav-link, .nav-link-mobile');
  let currentActive = 'home';

  function setSectionActive(id) {
    if (currentActive === id) return;
    currentActive = id;

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      const isActive = href === `/#${id}`;
      link.classList.toggle('is-active', isActive);
    });
  }

  if (!isHomePath()) {
    const path = window.location.pathname;
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.remove('is-active');
      if (href === '/schedule' && path.startsWith('/schedule')) {
        link.classList.add('is-active');
      }
      if (href === '/planner' && path.startsWith('/planner')) {
        link.classList.add('is-active');
      }
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setSectionActive(entry.target.id);
      }
    });
  }, {
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0,
  });

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  setSectionActive('home');
}

// ============================================================
// SMOOTH SCROLL - IMPROVED
// ============================================================

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const targetPosition = section.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;

  // Use native smooth scroll with fallback
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });

  // Update URL without showing hash
  window.history.replaceState(null, '', window.location.pathname);
}

// Handle in-page anchors และลิงก์ /#section เมื่ออยู่หน้าแรก
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#' || !href) return;
      const id = href.slice(1);
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      scrollToSection(id);
    });
  });

  document.querySelectorAll('a[href^="/#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (!isHomePath()) return;
      const id = link.hash ? link.hash.slice(1) : '';
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      scrollToSection(id);
    });
  });
}

// ============================================================
// ANIMATIONS - OPTIMIZED
// ============================================================

function assignAnimVars(elements, config = {}) {
  const {
    sectionIndex = 0,
    staggerStep = ANIMATION_CONFIG.staggerStep,
    offsetX = ANIMATION_CONFIG.offsetX,
    offsetY = ANIMATION_CONFIG.offsetY,
    duration = ANIMATION_CONFIG.duration,
  } = config;

  const baseDelay = sectionIndex * ANIMATION_CONFIG.sectionDelay;

  Array.from(elements).forEach((el, i) => {
    el.style.setProperty('--anim-delay', `${baseDelay + i * staggerStep}ms`);
    el.style.setProperty('--anim-offset-x', `${offsetX}px`);
    el.style.setProperty('--anim-offset-y', `${offsetY}px`);
    el.style.setProperty('--anim-duration', `${duration}ms`);
  });
}

function initAnimations() {
  // Use passive observer with improved threshold
  const animationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          // Optionally unobserve after animation
          animationObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  // Observe animation elements
  const animElements = document.querySelectorAll('.slide-right, .fade-in, .slide-left, .slide-up');

  animElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      el.classList.add('show');
    } else {
      animationObserver.observe(el);
    }
  });

  // Configure animations by section
  const sections = [
    { id: 'home', index: 0 },
    { id: 'event', index: 0 },
    { id: 'info', index: 1 },
    { id: 'social', index: 2 },
    { id: 'library', index: 3 },
    { id: 'fanclub', index: 4 },
  ];

  sections.forEach(({ id, index }) => {
    const section = document.getElementById(id);
    if (!section) return;

    const elements = section.querySelectorAll('.slide-right, .fade-in, .slide-left, .slide-up');
    assignAnimVars(elements, {
      sectionIndex: index,
      staggerStep: ANIMATION_CONFIG.staggerStep,
    });
  });
}

// ============================================================
// PROGRESS BAR - IMPROVED
// ============================================================

function initProgressBar() {
  const bar = document.createElement('div');
  bar.id = 'page-load-progress';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Page loading');
  document.body.appendChild(bar);

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 30;
    progress = Math.min(progress, 90);
    bar.style.width = `${progress}%`;

    if (progress >= 90) {
      clearInterval(interval);
      setTimeout(() => {
        bar.style.width = '100%';
        setTimeout(() => {
          bar.style.opacity = '0';
          setTimeout(() => bar.remove(), 300);
        }, 200);
      }, 100);
    }
  }, 150);

  // Complete on page load
  window.addEventListener('load', () => {
    bar.style.width = '100%';
  });
}

// ============================================================
// LAZY LOAD IMAGES - IMPROVED
// ============================================================

function initLazyImages() {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          // Add loading class for CSS transitions
          img.classList.add('loading');
          img.src = img.dataset.src;

          img.onload = () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
          };

          img.onerror = () => {
            img.classList.remove('loading');
            img.classList.add('error');
          };

          delete img.dataset.src;
        }
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '50px' });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// ============================================================
// LAZY LOAD IFRAMES - IMPROVED
// ============================================================

function initLazyIframes() {
  const iframeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const iframe = entry.target;
        if (iframe.dataset.src) {
          iframe.src = iframe.dataset.src;
          delete iframe.dataset.src;
          iframe.classList.add('loaded');
        }
        observer.unobserve(iframe);
      }
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('iframe[data-src]').forEach(iframe => {
    iframeObserver.observe(iframe);
  });
}

// ============================================================
// ENHANCE MOBILE EXPERIENCE
// ============================================================

function initMobileEnhancements() {
  // Detect if device supports touch
  const isTouchDevice = () => {
    return (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0));
  };

  // Add touch class to body for CSS targeting
  if (isTouchDevice()) {
    document.body.classList.add('touch-enabled');
  }

  // Improve button responsiveness on mobile
  const buttons = document.querySelectorAll('button, a.btn, a.social-link');
  buttons.forEach(btn => {
    btn.addEventListener('touchstart', function () {
      this.style.opacity = '0.8';
    });
    btn.addEventListener('touchend', function () {
      this.style.opacity = '1';
    });
  });
}

// ============================================================
// POPUP MANAGEMENT - IMPROVED
// ============================================================

function openPopup() {
  const overlay = document.getElementById('popup-overlay');
  if (!overlay) return;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = getScrollbarWidth() + 'px';

  // Focus first interactive element in popup
  const firstFocusable = overlay.querySelector('a, button, input');
  if (firstFocusable) firstFocusable.focus();
}

function closePopup() {
  const overlay = document.getElementById('popup-overlay');
  if (!overlay) return;

  overlay.classList.remove('active');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

// Handle popup close button
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('closePopupBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePopup);
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePopup();
    }
  });

  // Close on backdrop click
  const overlay = document.getElementById('popup-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closePopup();
      }
    });
  }
});

// ============================================================
// INIT - IMPROVED TIMING
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Priority order for initialization
  initHeader();
  initActiveNav();
  initSmoothScroll();
  initAnimations();
  initProgressBar();
  initLazyImages();
  initLazyIframes();
  initMobileEnhancements();

  // Preload first visible images
  const firstImage = document.querySelector('img');
  if (firstImage && firstImage.dataset.src) {
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'image';
    preloadLink.href = firstImage.dataset.src;
    document.head.appendChild(preloadLink);
  }
});

// ============================================================
// EXPORTS
// ============================================================

if (typeof window !== 'undefined') {
  window.openPopup = openPopup;
  window.closePopup = closePopup;
}