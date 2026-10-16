# Samuel Bustamante Larriet — Personal Website

A single page, told in full-screen panels: who I am, where I have worked and
studied, what I have published, and what I build.

Vanilla by design — plain **HTML**, **CSS** and **JavaScript**. No framework,
no build step, no dependencies. Clone it and open `index.html`.

### Highlights

- **Panel-by-panel reading.** Each section owns the screen; the navigation
  marker follows along as you move.
- **Light and dark.** Remembered between visits, applied before the first
  paint, so there is no white flash.
- **Works without JavaScript.** Scripting adds the polish; the page renders in
  full, and the menu keeps working, without it.
- **Accessible and keyboard-friendly.** Skip link, `aria-current` states,
  focus-visible styling.

### Layout

```
index.html     the whole page
css/           base (tokens, reset, type) → layout (panels) → sections
js/            theme.js (pre-paint theme) · main.js (interactions)
img/
```
