// ============================================================
// CONFIGURATION
// ============================================================

// Make this file a module so `declare global` is valid
export {};

declare global {
  interface Window {
    openPopup: () => void;
    closePopup: () => void;
  }
}

type Theme = 'light' | 'dark';

interface AnimConfig {
  staggerStep: number;
  sectionDelay: number;
  offsetX: number;
  offsetY: number;
  duration: number;
}

interface AnimVarsConfig {
  sectionIndex?: number;
  staggerStep?: number;
  offsetX?: number;
  offsetY?: number;
  duration?: number;
}

const HEADER_HEIGHT = 60;
const SCROLL_THRESHOLD = 0.5; // Trigger at 50% of hero height
const ANIMATION_CONFIG: AnimConfig = {
  staggerStep: 80,
  sectionDelay: 60,
  offsetX: 60,
  offsetY: 30,
  duration: 500,
};
const THEME_STORAGE_KEY = 'niya-theme';
const THEME_COLORS: Record<Theme, string> = {
  light: '#ffffff',
  dark: '#10131a',
};

// ============================================================
// THEME (LIGHT / DARK)
// ============================================================

function resolveTheme(): Theme {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function updateThemeToggles(theme: Theme): void {
  const isDark = theme === 'dark';
  const toggles = document.querySelectorAll<HTMLElement>('[data-theme-toggle]');

  toggles.forEach((el) => {
    if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      el.checked = isDark;
    }
    el.setAttribute('aria-pressed', String(isDark));
    el.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

function applyTheme(theme: Theme, { persist = true } = {}): void {
  const root = document.documentElement;
  
  // ✅ IMPORTANT: If page has a forced theme, do NOT apply anything else
  const forcedTheme = root.getAttribute('data-forced-theme');
  if (forcedTheme === 'light' || forcedTheme === 'dark') {
    theme = forcedTheme;
    persist = false; // Never persist forced theme
  }

  root.setAttribute('data-theme', theme);
  root.style.colorScheme = theme;

  if (persist) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  const themeMeta = document.getElementById('themeColorMeta');
  if (themeMeta) {
    themeMeta.setAttribute("content", theme === "dark" ? "#10131a" : "#ffffff");
  }

  updateThemeToggles(theme);
}

function initThemeToggle() {
  const root = document.documentElement;
  const forcedTheme = root.getAttribute('data-forced-theme');
  const toggles = document.querySelectorAll('[data-theme-toggle]');

  // Case 1: Forced Theme (Hidden toggles or disabled toggles)
  if (forcedTheme === 'light' || forcedTheme === 'dark') {
    applyTheme(forcedTheme, { persist: false });
    return;
  }

  // Case 2: Standard Theme Logic
  const activeTheme = resolveTheme();
  applyTheme(activeTheme, { persist: false });

  if (!toggles.length) return;

  toggles.forEach((el) => {
    const eventType = (el instanceof HTMLInputElement && el.type === 'checkbox') ? 'change' : 'click';
    el.addEventListener(eventType, () => {
      const currentTheme: Theme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  });
}


// ============================================================
// HEADER & NAVIGATION - IMPROVED
// ============================================================

function isHomePath(): boolean {
  const p = window.location.pathname;
  return p === '/' || p === '';
}

function initHeader(): void {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const navMobile = document.querySelector<HTMLElement>('.nav-mobile');
  const backdrop = document.querySelector('.nav-backdrop');
  const allNavLinks = document.querySelectorAll('.nav-link, .nav-link-mobile');
  const heroSection = document.querySelector('#home');
  const onHome = isHomePath();

  if (!header || !toggle || !navMobile) return;

  // State management
  let isMenuOpen = false;
  let headerActive = false;

  // หน้าอื่นที่ไม่มี hero — ให้แถบหัวอ่านง่ายตลอด (ไม่ทับเนื้อหาแบบโปร่งใส)
  if (!onHome || !heroSection) {
    header.classList.add('active');
    headerActive = true;
  }

  // rAF-based scroll handler: sync กับ browser paint cycle พอดี ไม่เกิน 1 ครั้ง/frame
  let rafId = 0;
  const handleScroll = () => {
    if (rafId) return; // มี frame pending อยู่แล้ว ไม่ต้องเพิ่ม
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      if (!onHome || !heroSection) return;

      const scrollY = window.scrollY;
      const heroHeight = (heroSection as HTMLElement).offsetHeight;
      const shouldActivate = scrollY > heroHeight * SCROLL_THRESHOLD;

      if (shouldActivate !== headerActive) {
        headerActive = shouldActivate;
        header.classList.toggle('active', headerActive);
      }
    });
  };

  // Toggle menu with prevent body scroll
  function openMenu(): void {
    isMenuOpen = true;
    toggle!.classList.add('active');
    navMobile!.classList.add('active');
    backdrop?.classList.add('active');
    toggle!.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = getScrollbarWidth() + 'px';
  }

  function closeMenu(): void {
    isMenuOpen = false;
    toggle!.classList.remove('active');
    navMobile!.classList.remove('active');
    backdrop?.classList.remove('active');
    toggle!.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  // Get scrollbar width to prevent layout shift
  function getScrollbarWidth(): number {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  // Toggle menu
  toggle.addEventListener('click', () => {
    isMenuOpen ? closeMenu() : openMenu();
  });

  // Close menu on backdrop click
  backdrop?.addEventListener('click', closeMenu);

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
  navMobile!.addEventListener('focusout', (e: FocusEvent) => {
    if (isMenuOpen && !navMobile!.contains(e.relatedTarget as Node) && !toggle!.contains(e.relatedTarget as Node)) {
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

function initActiveNav(): void {
  const sectionIds = ['home', 'info', 'event', 'social', 'library', 'fanclub'];
  const navLinks = document.querySelectorAll('.nav-link, .nav-link-mobile');
  let currentActive = 'home';

  function setSectionActive(id: string): void {
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

function scrollToSection(sectionId: string): void {
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
function initSmoothScroll(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#' || !href) return;
      const id = href.slice(1);
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      scrollToSection(id);
    });
  });

  document.querySelectorAll<HTMLAnchorElement>('a[href^="/#"]').forEach(link => {
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

function assignAnimVars(elements: NodeListOf<Element>, config: AnimVarsConfig = {}): void {
  const {
    sectionIndex = 0,
    staggerStep = ANIMATION_CONFIG.staggerStep,
    offsetX = ANIMATION_CONFIG.offsetX,
    offsetY = ANIMATION_CONFIG.offsetY,
    duration = ANIMATION_CONFIG.duration,
  } = config;

  const baseDelay = sectionIndex * ANIMATION_CONFIG.sectionDelay;

  Array.from(elements).forEach((el, i) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.setProperty('--anim-delay', `${baseDelay + i * staggerStep}ms`);
    htmlEl.style.setProperty('--anim-offset-x', `${offsetX}px`);
    htmlEl.style.setProperty('--anim-offset-y', `${offsetY}px`);
    htmlEl.style.setProperty('--anim-duration', `${duration}ms`);
  });
}

function initAnimations(): void {
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
    animationObserver.observe(el);
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

function initProgressBar(): void {
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

function initLazyImages(): void {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
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

function initLazyIframes(): void {
  const iframeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const iframe = entry.target as HTMLIFrameElement;
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

function initMobileEnhancements(): void {
  // Detect if device supports touch
  const isTouchDevice = (): boolean => {
    return (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0));
  };

  // Add touch class to body for CSS targeting
  if (isTouchDevice()) {
    document.body.classList.add('touch-enabled');

    // Event delegation: ใช้ 2 listeners แทน N listeners บน element แต่ละตัว
    // ลด memory footprint และรองรับ dynamic elements ด้วย
    document.body.addEventListener('touchstart', (e: TouchEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>('button, a.btn, a.social-link');
      if (target) target.style.opacity = '0.8';
    }, { passive: true });

    document.body.addEventListener('touchend', (e: TouchEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>('button, a.btn, a.social-link');
      if (target) target.style.opacity = '';
    }, { passive: true });
  }
}

// ============================================================
// POPUP MANAGEMENT - IMPROVED
// ============================================================

function openPopup(): void {
  const overlay = document.getElementById('popup-overlay');
  if (!overlay) return;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = (window.innerWidth - document.documentElement.clientWidth) + 'px';

  // Focus first interactive element in popup
  const firstFocusable = overlay.querySelector<HTMLElement>('a, button, input');
  if (firstFocusable) firstFocusable.focus();
}

function closePopup(): void {
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

// Re-apply theme after Astro client-side navigation.
// This ensures forcedTheme on /planner/[event] always wins over previous page theme.
document.addEventListener('astro:page-load', () => {
  initThemeToggle();
});

// ============================================================
// INIT - IMPROVED TIMING
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Priority order for initialization
  initThemeToggle();
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