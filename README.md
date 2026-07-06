# Raghav OS

A portfolio that boots up and runs like a desktop operating system — built with
plain HTML, CSS and JavaScript (no frameworks, no build step). Drop it straight
onto GitHub Pages.

## Files

```
index.html   → structure: boot screen, desktop, all windows, taskbar, start menu
style.css    → all styling, organised in labelled sections
script.js    → all behaviour, organised in labelled, numbered modules
assets/      → resume PDF goes here
```

## Customise it

Everything you're likely to want to change lives in one of two places:

1. **`CONFIG` object at the top of `script.js`** — your bio, projects and skills.
   Add a new project by copying one block inside `CONFIG.projects`; the grid
   re-renders automatically, no HTML editing required. Same for skills.
2. **A few spots in `index.html`** marked with `<!-- TODO -->` or "EDIT ME" —
   your education history and contact links.

Replace `assets/Raghav_Mishra_Resume.pdf` with your real resume, keeping the
same filename (or update the two links in `index.html` if you rename it).

## Running it locally

No build step needed — just open `index.html` in a browser, or serve the
folder with any static server, e.g.:

```
python3 -m http.server
```

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repo settings, enable GitHub Pages for the branch/folder you pushed to.
3. Done — no build step to configure.

## Easter eggs (for you to find, or leave for visitors)

There are a few hidden things: a keyboard code that unlocks something extra,
a fake terminal with a handful of commands, and a couple of achievement toasts
tucked into unexpected places. Poking around the desktop is part of the fun —
so this list stops here on purpose.
