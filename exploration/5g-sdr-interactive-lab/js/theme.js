// Shared by both pages. Apply the saved theme before the first paint.
(() => {
  const storageKey = 'sdr-lab-theme';
  const root = document.documentElement;
  const requested = new URLSearchParams(location.search).get('theme');
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch { /* Storage is optional. */ }
  let current = (requested === 'glass' || requested === 'light') ? requested : (saved === 'glass' ? 'glass' : 'light');

  function applyTheme(theme) {
    current = theme;
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'glass' ? '#0b1322' : '#ffffff');
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-pressed', String(theme === 'glass'));
      button.title = theme === 'glass' ? '切換回白底主題' : '切換到霧面玻璃主題';
    });
  }
  applyTheme(current);
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(current);
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        applyTheme(current === 'glass' ? 'light' : 'glass');
        try { localStorage.setItem(storageKey, current); } catch { /* Navigation still carries the theme. */ }
        // Keep reloads consistent when this page was opened with an explicit theme.
        if (new URLSearchParams(location.search).has('theme')) {
          const url = new URL(location.href);
          url.searchParams.set('theme', current);
          try { history.replaceState(null, '', url); } catch { /* Some file URLs restrict history. */ }
        }
      });
    });
  });
  // Scene controls may replace link URLs, so add the current theme at navigation time.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && /\/(index|evidence)\.html$/.test(url.pathname)) {
      url.searchParams.set('theme', current);
      link.href = url.href;
    }
  }, true);
})();
