/*
 * Page interactions: the theme switch, the current year, and the navigation
 * highlight that follows the panel on screen.
 *
 * Scrolling is left entirely to the browser. The menu and the pager arrows are
 * ordinary in-page anchors, so jumping between panels is the browser's smooth
 * scroll, not a behaviour implemented here.
 *
 * None of this is load-bearing. With scripting off the page still renders in
 * full, the menu and the arrows still work, nothing is hidden, and the site
 * stays on the light theme.
 *
 * Wrapped in an IIFE so nothing leaks into the global scope.
 */
(() => {
  'use strict';

  const root = document.documentElement;

  // ---------- Light / dark theme ----------
  //
  // The theme lives in one place: the `data-theme` attribute on <html>, which
  // base.css reads to pick its palette. The button mirrors that state through
  // `aria-pressed`, which doubles as the CSS hook for the sun/moon icons.
  // theme.js has already applied any stored value by the time we get here.

  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    const isDark = () => root.dataset.theme === 'dark';
    toggle.setAttribute('aria-pressed', String(isDark()));

    let shiftTimer = 0;
    toggle.addEventListener('click', () => {
      const next = isDark() ? 'light' : 'dark';

      // Let the surfaces cross-fade instead of cutting. The class is dropped
      // again afterwards so the transition never applies to anything else.
      root.classList.add('theme-shifting');
      clearTimeout(shiftTimer);
      shiftTimer = setTimeout(() => root.classList.remove('theme-shifting'), 450);

      root.dataset.theme = next;
      toggle.setAttribute('aria-pressed', String(next === 'dark'));
      try {
        localStorage.setItem('theme', next);
      } catch {
        // No storage available: the change lasts for this visit only.
      }
    });
  }

  // ---------- Colophon year ----------
  //
  // Kept in sync automatically so the line never goes stale. The markup ships
  // a plausible year, so it still reads correctly if this script never runs.

  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
    year.dateTime = year.textContent; // keeps <time> machine-readable
  }

  // ---------- Getting out of the way ----------
  //
  // Flags the document while the page is in motion, which is layout.css's cue
  // to withdraw the arrows. The timer is restarted by every event, so the flag
  // lifts a second and a half after the scrolling has actually stopped rather
  // than between two frames of it. Passive: this listener never blocks a
  // scroll, it only watches one.

  let stillTimer = 0;
  window.addEventListener('scroll', () => {
    root.classList.add('is-scrolling');
    clearTimeout(stillTimer);
    stillTimer = setTimeout(() => root.classList.remove('is-scrolling'), 1500);
  }, { passive: true });

  // ---------- Active navigation link ----------
  //
  // `aria-current="location"` marks the matching link. That is both the
  // accessible state and the only hook the styling needs: in the rail the
  // active label grows and comes up to full ink, and in the laid-down layout
  // it takes a tinted pill instead.

  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  // Four menu links for six panels. Both sides name a section through
  // `data-nav` rather than through the link's target, which is what lets the
  // About entry cover two panels while opening on the first of them. The
  // opening screen names no section, so nothing is marked while it is up.
  const links = new Map(
    [...nav.querySelectorAll('a[data-nav]')].map((a) => [a.dataset.nav, a]),
  );
  const panels = [...document.querySelectorAll('.panel')];

  // When the menu runs out of room it scrolls — down the column in the rail
  // layout, sideways in the laid-down one. Either way, bring the active link
  // into view so it is never hidden off the edge. Both axes are handled
  // because which one applies is a question of CSS.
  function centerInNav(link) {
    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    if (nav.scrollWidth > nav.clientWidth) {
      nav.scrollLeft += linkRect.left - navRect.left - (navRect.width - linkRect.width) / 2;
    }
    if (nav.scrollHeight > nav.clientHeight) {
      nav.scrollTop += linkRect.top - navRect.top - (navRect.height - linkRect.height) / 2;
    }
  }

  // The marker is moved into the current entry rather than positioned against
  // it, so it needs no measurements and follows the label of its own accord as
  // that label grows. Changing section takes it away first, and it builds
  // itself again on arrival: removing the class and reading a layout property
  // before adding it back is what makes the animation restart rather than be
  // left alone as already applied.
  const mark = document.querySelector('.mark');
  let markTimer = 0;

  function placeMark(link) {
    if (!mark) return;
    clearTimeout(markTimer);
    mark.classList.add('is-away');
    if (!link) return;

    markTimer = setTimeout(() => {
      link.parentElement.append(mark);
      mark.classList.remove('is-away', 'is-assembling');
      void mark.offsetWidth; // forced reflow: commit the removal
      mark.classList.add('is-assembling');
    }, 200);
  }

  // The rail has nothing to point at while the opening screen is up, so it is
  // held back until the first real section arrives.
  function setActive(name) {
    const link = links.get(name);
    if (link && link.hasAttribute('aria-current')) return; // already active
    links.forEach((a) => a.removeAttribute('aria-current'));

    root.classList.toggle('menu-up', Boolean(link));
    placeMark(link);

    if (link) {
      link.setAttribute('aria-current', 'location');
      centerInNav(link);
    }
  }

  // An anchor jump scrolls through every panel in between, and the observer
  // below would fire for each one, stepping the active label through every
  // section on the way. While `locked` is set it goes straight to its
  // destination.
  let locked = false;
  let unlockTimer = 0;
  const unlock = () => {
    locked = false;
  };

  window.addEventListener('scrollend', unlock);

  // One delegated listener covers every in-page anchor: the menu, the mark and
  // the pager arrows alike.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !a.hash) return;
    const panel = document.getElementById(a.hash.slice(1));
    if (!panel || !panel.classList.contains('panel')) return;

    setActive(panel.dataset.nav);
    locked = true;
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(unlock, 1500); // fallback: no `scrollend` support
  });

  // Scroll tracking. The margins shrink the detection band to a thin strip
  // across the middle of the viewport, so a panel becomes active once it has
  // actually taken over the screen.
  const observer = new IntersectionObserver((entries) => {
    if (locked) return;
    for (const entry of entries) {
      if (entry.isIntersecting) setActive(entry.target.dataset.nav);
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  panels.forEach((p) => observer.observe(p));

  // ---------- Revealing a panel's contents ----------
  //
  // A separate observer from the one above, because it answers a different
  // question: that one asks which panel owns the screen right now, this one
  // asks whether a panel has been reached at all. It fires earlier, it is not
  // suspended during an anchor jump, and it stops watching a panel once it has
  // fired — revisiting a panel should not replay its entrance.

  const reveal = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-revealed');
      reveal.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -20% 0px' });
  panels.forEach((p) => reveal.observe(p));

  // ---------- Leaving a panel that holds one screen ----------
  //
  // A panel whose content fits the screen has nothing to scroll through: there
  // is one thing on it, and the next turn of the wheel is a request for the
  // next thing. So it moves on whole rather than creeping down an empty half
  // of the screen. A panel with more in it than fits — publications, once the
  // list grows — is read by scrolling like any other page, and is left alone.
  //
  // Wheel only: a touch drag and the keyboard keep the browser's own
  // behaviour, where the same interception would take away something people
  // rely on.

  function currentPanel() {
    const y = window.scrollY + 1;
    let i = 0;
    while (i + 1 < panels.length && panels[i + 1].offsetTop <= y) i++;
    return i;
  }

  let leaving = false;

  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) return; // pinch to zoom, not a scroll
    const step = Math.sign(e.deltaY);
    if (!step) return;

    const here = currentPanel();
    if (panels[here].offsetHeight > window.innerHeight + 2) return; // read, not skipped

    const next = panels[here + step];
    if (!next) return;

    e.preventDefault();
    if (leaving) return;

    leaving = true;
    setTimeout(() => {
      leaving = false;
    }, 900);

    // Coming up into a panel taller than the screen, land on its end, so that
    // reading carries on backwards through it instead of jumping over it.
    const tall = next.offsetHeight > window.innerHeight;
    window.scrollTo({
      top: step < 0 && tall
        ? next.offsetTop + next.offsetHeight - window.innerHeight
        : next.offsetTop,
    });
  }, { passive: false });
})();
