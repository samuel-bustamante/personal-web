/*
 * Theme bootstrap, plus the one flag the stylesheet needs before it paints.
 *
 * Loaded synchronously from <head> (no `defer`) so both land on <html> before
 * the first paint. Deferring it would let the browser paint the default light
 * theme first, producing a white flash for dark-theme visitors.
 *
 * Nothing else lives here; the rest is in main.js.
 */
(() => {
  const root = document.documentElement;

  // Tells layout.css that scripting is available, which is what lets it hide a
  // panel's contents until they are revealed. Without this class nothing is
  // ever hidden, so a page with scripting off still shows everything.
  root.classList.add('js');

  try {
    const saved = localStorage.getItem('theme');
    // Validate rather than trust: anything else leaves the markup default.
    if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
  } catch {
    // Storage can throw in private mode or when cookies are blocked.
    // Nothing to recover: the light theme in the markup stands.
  }
})();
