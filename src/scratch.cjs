
const { execSync } = require('child_process');

const selectors = [
  'act-block', 'act-chip', 'act-info-bar', 'act-info-desc', 'act-warn', 'active', 'arrow-icon', 'av', 'back', 'bb', 
  'bio-info-box', 'bio-section-inner', 'block-center', 'bnk48-color', 'brand-badge', 'card-content', 'card-cover-img', 
  'card-cover-img--hover', 'card-detail-link', 'card-info', 'card-meta-row', 'chip', 'col-custom-3', 'collaboration', 
  'cs-bg-dark', 'day-chip', 'day-ftab', 'day-tab', 'delay-s', 'duration-fast', 'duration-slow', 'embed-block', 
  'embed-ig', 'embed-row', 'embed-tiktok', 'empty-state', 'event-card-wrapper', 'event-count', 'event-grid-auto', 
  'events-section', 'fa-iam48', 'fade-in', 'fanclub-btn', 'filter-bar', 'filter-box', 'filter-divider', 'footer-bottom', 
  'footer-license', 'footer-logo', 'front', 'ftab', 'gen-text', 'has-rounds', 'header-container', 'hero-button', 
  'hero-half-body-img', 'hero-text-wrapper', 'hero-title', 'icon-tiktok', 'ig-banner', 'img-fluid', 'instagram-media', 
  'is-active', 'is-past-event', 'last-updated', 'line', 'live', 'logo-brand', 'logo-img', 'logo-img--on-bar', 
  'logo-img--on-hero', 'logo-text', 'member-card', 'member-cards-grid', 'member-slot-row', 'menu-toggle', 'mobile-toggle', 
  'mobile-toggle-group', 'nav-backdrop', 'nav-desktop', 'nav-icon', 'nav-link', 'nav-link--app', 'nav-link-mobile', 
  'nav-link-mobile--theme', 'nav-mobile', 'nav-mobile-divider', 'navbar-footer', 'now-act-card', 'now-act-grid', 
  'now-date-row', 'now-live-badge', 'now-live-dot', 'now-member-pill', 'now-member-wrap', 'now-nothing-icon', 
  'now-nothing-live', 'now-section-label', 'now-time-block', 'now-time-label', 'offset-lg', 'offset-sm', 'open', 
  'overlay', 'page-main', 'page-shell', 'panel-empty', 'planner-card', 'planner-card__article', 'planner-card__cta', 
  'planner-card__media', 'planner-empty', 'planner-hub', 'planner-muted-text', 'planner-section', 'platform-icon', 
  'policy-container', 'policy-page', 'policy-section', 'policy-title', 'popup-close', 'popup-container', 'profile', 
  'ranking-actions', 'ranking-actions-stacked', 'ranking-ad', 'ranking-arena', 'ranking-badge', 'ranking-btn', 
  'ranking-choice', 'ranking-choice-info', 'ranking-choice-wrapper', 'ranking-container', 'ranking-control-btn', 
  'ranking-crown', 'ranking-date', 'ranking-disclaimer', 'ranking-divider', 'ranking-game', 'ranking-game-header', 
  'ranking-game-play', 'ranking-game-title', 'ranking-img-top', 'ranking-keyboard-hint', 'ranking-list', 'ranking-menu', 
  'ranking-menu-content', 'ranking-note-text', 'ranking-page-shell', 'ranking-planner-skin', 'ranking-progress-bar', 
  'ranking-progress-fill', 'ranking-progress-group', 'ranking-progress-head', 'ranking-progress-label', 
  'ranking-progress-meta', 'ranking-progress-panel', 'ranking-progress-percent', 'ranking-progress-track', 
  'ranking-result-avatar', 'ranking-result-dot', 'ranking-result-list', 'ranking-result-meta', 'ranking-result-name', 
  'ranking-result-rank', 'ranking-result-row', 'ranking-result-row--planner', 'ranking-result-subtitle', 
  'ranking-results', 'ranking-results-header', 'ranking-row', 'ranking-row-brand-dot', 'ranking-row-fallback', 
  'ranking-row-image', 'ranking-row-img', 'ranking-row-info', 'ranking-row-meta', 'ranking-row-name', 'ranking-row-rank', 
  'ranking-row-score', 'ranking-share-btn', 'ranking-sub-nav', 'ranking-sub-nav-back', 'ranking-sub-nav-container', 
  'ranking-sub-nav-link', 'ranking-sub-nav-links', 'ranking-subtitle', 'ranking-title', 'ranking-view-all', 
  'ranking-vs', 'ranking-winner-highlight', 'ranking-winner-name', 'ranking-winner-photo', 'ranking-winner-pill', 
  'recap-overlay', 'sched-day-block', 'sched-day-header', 'schedule-page', 'sec-result', 'section-heading', 
  'section-intro', 'sel-pill', 'sf-disclaimer', 'sf-hero', 'sf-hero-card', 'sf-panel', 'sf-section', 'sf-section-shell', 
  'sf-tab', 'sf-table', 'sf-tabs', 'sf-tabs-wrap', 'sf-toast', 'sfooter', 'show', 'site-footer', 'site-footer__bottom', 
  'site-footer__license', 'site-header', 'site-info', 'slide-left', 'slide-right', 'slide-up', 'slot-left', 'slot-note', 
  'slot-right', 'slot-row', 'slot-time', 'social-box', 'social-circle', 'social-label', 'sort-active-label', 'sort-menu', 
  'sort-menu-item', 'sort-toggle-btn', 'stat-card', 'stat-grid', 'summary-empty-subtitle', 'summary-empty-title', 
  'tab-badge', 'tbl-av', 'tbl-del-btn', 'tbl-member-cell', 'tbl-name', 'tbl-ticket-badge', 'theme-toggle-icon', 
  'theme-toggle-icon--moon', 'theme-toggle-icon--sun', 'theme-toggle-input', 'theme-toggle-v2', 'ticket-btn', 
  'ticket-form', 'ticket-qty', 'tiktok-banner', 'tiktok-embed', 'touch-enabled', 'u-fs-10', 'video-container', 
  'wp-block-heading', 'youtube-block'
];

const results = [];

selectors.forEach(sel => {
    try {
        // Search in .astro, .tsx, .jsx, .js, .html files only
        const command = `grep -r "${sel}" src --include="*.astro" --include="*.tsx" --include="*.jsx" --include="*.js" --include="*.html" | grep -v "scratch" | head -n 1`;
        const output = execSync(command).toString();
        if (output.trim()) {
            results.push({ selector: sel, used: true, reason: 'Found in markup/logic' });
        } else {
            results.push({ selector: sel, used: false, reason: 'No match in markup/logic' });
        }
    } catch (e) {
        results.push({ selector: sel, used: false, reason: 'No match in markup/logic' });
    }
});

console.log(JSON.stringify(results, null, 2));
