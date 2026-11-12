// Shared by every page. Apply the saved theme before the first paint.
(() => {
  const storageKey = 'sdr-lab-theme';
  const root = document.documentElement;
  const requested = new URLSearchParams(location.search).get('theme');
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch { /* Storage is optional. */ }
  // No saved or requested choice: follow the system setting. 'glass' is the stored name of the dark theme.
  const systemDark = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
  let current = (requested === 'glass' || requested === 'light') ? requested
    : (saved === 'glass' || saved === 'light') ? saved : (systemDark ? 'glass' : 'light');

  function applyTheme(theme) {
    current = theme;
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'glass' ? '#12161a' : '#f3f5f7');
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-pressed', String(theme === 'glass'));
      button.title = theme === 'glass' ? '切換回淺色主題' : '切換到深色主題';
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
    if (url.origin === location.origin && /\/(index|evidence|lab03-ota)\.html$/.test(url.pathname)) {
      url.searchParams.set('theme', current);
      link.href = url.href;
    }
  }, true);
})();
