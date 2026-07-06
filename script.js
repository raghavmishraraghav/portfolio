/* ==========================================================================
   PRIYANSHI OS — SCRIPT
   Vanilla JS only. Organised as small modules that talk through a couple
   of shared objects (OS, WindowManager). Search "EDIT ME" for the spots
   you'll want to personalise first.
   ========================================================================== */

'use strict';

/* ==========================================================================
   1. CONTENT CONFIG — edit this section to update the site's content
   ========================================================================== */
const CONFIG = {
  // EDIT ME: swap these for your real profiles
  links: {
    github: 'https://github.com/raghavmishraraghav/',
    linkedin: 'https://www.linkedin.com/in/raghav-mishra-41a731381/',
    email: 'raghavmishraghav794@gmail.com'
  },

  bio: "Hey, I'm Raghav — a second-year B.Tech Computer Science Engineering student at United College of Engineering and Research. I love building interactive software, digging into machine learning, and putting together creative web apps that mix solid functionality with a great user experience. I'm a firm believer that the best way to learn is by doing, so I'm constantly experimenting with new tools, frameworks and ideas.",

  // Add new projects here — the grid renders automatically, no HTML editing needed.
  // Use github/demo: 'soon' to show a "Coming Soon" badge instead of a link.
  projects: [
    {
      name: 'House Price Prediction System',
      emoji: '🏠',
      color: '#FF6B9D',
      desc: 'A machine learning model that predicts house prices from key property features, wrapped in a simple Streamlit interface for easy experimentation.',
      tech: ['Python', 'Machine Learning', 'Streamlit'],
      github: 'https://github.com/raghavmishraraghav/House-Price-Prediction-System',
      demo: 'soon'
    },
    {
      name: 'Loan Approval Prediction System',
      emoji: '💳',
      color: '#06D6A0',
      desc: 'A classification model that predicts whether a loan application is likely to be approved, built as an interactive Streamlit app.',
      tech: ['Python', 'Machine Learning', 'Streamlit'],
      github: 'https://github.com/raghavmishraraghav/Loan-Approval-Prediction-System',
      demo: 'soon'
    }
    // Add a new project by copying the block above ⬆ — that's it.
  ],

  skills: [
    { name: 'C++', emoji: '➕', level: 92, note: 'comfortable' },
    { name: 'Data Analytics', emoji: '📊', level: 80, note: 'comfortable' },
    { name: 'Business Analytics', emoji: '📈', level: 80, note: 'comfortable' },
    { name: 'C', emoji: '🔤', level: 75, note: 'comfortable' },
    { name: 'Marketing', emoji: '📣', level: 65, note: 'still learning' },
    { name: 'Advertisement', emoji: '📢', level: 65, note: 'still learning' },
    { name: 'Python', emoji: '🐍', level: 60, note: 'still learning' }
  ],

  bootLog: [
    'Raghav OS v1.0 — initialising kernel…',
    'Loading window manager… ok',
    'Mounting /projects … ok',
    'Mounting /skills … ok',
    'Checking for coffee levels… low, proceeding anyway',
    'Starting taskbar service… ok',
    'Almost there…'
  ]
};

/* ==========================================================================
   2. SMALL UTILITIES
   ========================================================================== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function storageGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : JSON.parse(v);
  } catch (e) { return fallback; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable, ignore */ }
}

/* ==========================================================================
   3. SOUND — tiny WebAudio beeps, no audio files needed
   ========================================================================== */
const SoundFX = (() => {
  let ctx = null;
  let enabled = storageGet('raghav-os-sound', true);

  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    return ctx;
  }

  function blip(freq = 440, duration = 0.06, type = 'sine', vol = 0.05) {
    if (!enabled) return;
    const audio = getCtx();
    if (!audio) return;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
    osc.connect(gain).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + duration);
  }

  return {
    open: () => blip(660, 0.09, 'triangle'),
    close: () => blip(320, 0.08, 'triangle'),
    click: () => blip(880, 0.04, 'square', 0.03),
    error: () => blip(180, 0.18, 'sawtooth', 0.05),
    achievement: () => { blip(660, 0.08); setTimeout(() => blip(880, 0.12), 90); },
    isEnabled: () => enabled,
    setEnabled(v) { enabled = v; storageSet('raghav-os-sound', enabled); }
  };
})();

/* ==========================================================================
   4. TOASTS / ACHIEVEMENTS
   ========================================================================== */
const Toasts = {
  layer: null,
  init() { this.layer = $('#toast-layer'); },
  show({ icon = '✨', title, sub = '', duration = 4200 }) {
    if (!this.layer) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="toast-icon">${icon}</span><span><strong>${title}</strong>${sub ? `<span class="toast-sub">${sub}</span>` : ''}</span>`;
    this.layer.appendChild(el);
    setTimeout(() => {
      el.classList.add('leaving');
      setTimeout(() => el.remove(), 240);
    }, duration);
  }
};

const unlockedAchievements = new Set(storageGet('raghav-os-achievements', []));
function unlockAchievement(id, title, sub) {
  if (unlockedAchievements.has(id)) return;
  unlockedAchievements.add(id);
  storageSet('raghav-os-achievements', Array.from(unlockedAchievements));
  SoundFX.achievement();
  Toasts.show({ icon: '🏆', title: 'Achievement unlocked', sub: title, duration: 5000 });
}

/* ==========================================================================
   5. RETRO ERROR POPUP
   ========================================================================== */
const RetroError = {
  el: null, titleEl: null, msgEl: null,
  init() {
    this.el = $('#retro-error');
    this.titleEl = $('#retro-error-title');
    this.msgEl = $('#retro-error-message');
    $('#retro-error-ok').addEventListener('click', () => this.hide());
    $('#retro-error-close').addEventListener('click', () => this.hide());
  },
  show(message, title = 'Raghav OS') {
    this.titleEl.textContent = title;
    this.msgEl.textContent = message;
    this.el.classList.remove('hidden');
    SoundFX.error();
  },
  hide() { this.el.classList.add('hidden'); }
};

/* ==========================================================================
   6. BOOT SEQUENCE
   ========================================================================== */
function runBootSequence() {
  const bootScreen = $('#boot-screen');
  const logEl = $('#boot-log');
  const bar = $('#boot-progress-bar');
  const lines = CONFIG.bootLog;
  let i = 0;

  function nextLine() {
    if (i >= lines.length) {
      setTimeout(finishBoot, 500);
      return;
    }
    const div = document.createElement('div');
    div.className = 'line' + (i === lines.length - 1 ? '' : ' ok');
    div.textContent = (i === lines.length - 1 ? '» ' : '✓ ') + lines[i];
    logEl.appendChild(div);
    bar.style.width = `${Math.round(((i + 1) / lines.length) * 100)}%`;
    i++;
    setTimeout(nextLine, prefersReducedMotion() ? 60 : 340);
  }

  function finishBoot() {
    bootScreen.classList.add('boot-done');
    document.body.classList.add('booted');
  }

  // Skip long boot if the user has already reduced motion, but keep the brand moment brief.
  setTimeout(nextLine, prefersReducedMotion() ? 100 : 500);

  // Fallback: clicking anywhere finishes boot immediately (accessibility + impatience).
  bootScreen.addEventListener('click', finishBoot, { once: true });
}

/* ==========================================================================
   7. WINDOW MANAGER
   ========================================================================== */
const WindowManager = (() => {
  let zTop = 10;
  const openApps = new Map(); // appId -> { el, minimized }

  function getWindow(appId) { return document.getElementById(`window-${appId}`); }

  function ensureResizeHandle(win) {
    if (win.querySelector('.window-resize-handle')) return;
    const handle = document.createElement('div');
    handle.className = 'window-resize-handle';
    handle.setAttribute('aria-hidden', 'true');
    win.appendChild(handle);
    bindResize(win, handle);
  }

  function cascadePosition(win) {
    const openCount = openApps.size;
    const offset = (openCount % 6) * 28;
    win.style.top = `${70 + offset}px`;
    win.style.left = `${90 + offset}px`;
  }

  function open(appId) {
    const win = getWindow(appId);
    if (!win) return;
    ensureResizeHandle(win);

    if (openApps.has(appId)) {
      // already open — just restore/focus it
      restore(appId);
      focus(appId);
      return;
    }

    win.hidden = false;
    win.classList.remove('closing');
    if (!win.style.top) cascadePosition(win);
    openApps.set(appId, { el: win, minimized: false });
    focus(appId);
    bindDrag(win);
    SoundFX.open();
    renderTaskbar();
    trackAppOpened(appId);

    if (appId === 'terminal') Terminal.onOpen();
    if (appId === 'about') AboutTyping.start();
    if (appId === 'skills') animateSkillBarsOnce();
  }

  function close(appId) {
    const win = getWindow(appId);
    if (!win || !openApps.has(appId)) return;
    win.classList.add('closing');
    SoundFX.close();
    setTimeout(() => {
      win.hidden = true;
      win.classList.remove('closing', 'maximized', 'active');
      openApps.delete(appId);
      renderTaskbar();
    }, 160);
  }

  function minimize(appId) {
    const entry = openApps.get(appId);
    if (!entry) return;
    entry.el.classList.add('minimized');
    entry.minimized = true;
    renderTaskbar();
  }

  function restore(appId) {
    const entry = openApps.get(appId);
    if (!entry) return;
    entry.el.classList.remove('minimized');
    entry.minimized = false;
    renderTaskbar();
  }

  function toggleMaximize(appId) {
    const entry = openApps.get(appId);
    if (!entry) return;
    entry.el.classList.toggle('maximized');
  }

  function focus(appId) {
    const entry = openApps.get(appId);
    if (!entry) return;
    zTop += 1;
    entry.el.style.zIndex = zTop;
    $$('.window').forEach(w => w.classList.remove('active'));
    entry.el.classList.add('active');
    renderTaskbar();
  }

  function toggleFromTaskbar(appId) {
    const entry = openApps.get(appId);
    if (!entry) return;
    const isActive = entry.el.classList.contains('active') && !entry.minimized;
    if (isActive) minimize(appId);
    else { restore(appId); focus(appId); }
  }

  function closeFocused() {
    const activeEntry = Array.from(openApps.entries()).find(([, v]) => v.el.classList.contains('active'));
    if (activeEntry) close(activeEntry[0]);
  }

  /* ---- dragging ---- */
  function bindDrag(win) {
    if (win.dataset.dragBound) return;
    win.dataset.dragBound = 'true';
    const titlebar = win.querySelector('.window-titlebar');
    let startX, startY, startLeft, startTop, dragging = false;

    titlebar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.win-btn')) return;
      if (win.classList.contains('maximized')) return;
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      const rect = win.getBoundingClientRect();
      startLeft = rect.left; startTop = rect.top;
      titlebar.setPointerCapture(e.pointerId);
      focus(win.id.replace('window-', ''));
    });
    titlebar.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const maxLeft = window.innerWidth - 80;
      const maxTop = window.innerHeight - 100;
      win.style.left = `${Math.min(Math.max(startLeft + dx, -100), maxLeft)}px`;
      win.style.top = `${Math.min(Math.max(startTop + dy, 0), maxTop)}px`;
    });
    titlebar.addEventListener('pointerup', () => { dragging = false; });
    titlebar.addEventListener('pointercancel', () => { dragging = false; });
    titlebar.addEventListener('dblclick', (e) => {
      if (e.target.closest('.win-btn')) return;
      toggleMaximize(win.id.replace('window-', ''));
    });
  }

  /* ---- resizing ---- */
  function bindResize(win, handle) {
    let startX, startY, startW, startH, resizing = false;
    handle.addEventListener('pointerdown', (e) => {
      resizing = true;
      startX = e.clientX; startY = e.clientY;
      const rect = win.getBoundingClientRect();
      startW = rect.width; startH = rect.height;
      handle.setPointerCapture(e.pointerId);
      e.stopPropagation();
    });
    handle.addEventListener('pointermove', (e) => {
      if (!resizing) return;
      const w = Math.max(300, startW + (e.clientX - startX));
      const h = Math.max(220, startH + (e.clientY - startY));
      win.style.width = `${w}px`;
      win.style.height = `${h}px`;
    });
    handle.addEventListener('pointerup', () => { resizing = false; });
    handle.addEventListener('pointercancel', () => { resizing = false; });
  }

  /* ---- taskbar rendering ---- */
  const appMeta = {
    about: { icon: '🖥️', label: 'About Me' },
    projects: { icon: '📁', label: 'Projects' },
    skills: { icon: '💻', label: 'Skills' },
    education: { icon: '🎓', label: 'Education' },
    resume: { icon: '📄', label: 'Resume' },
    contact: { icon: '📧', label: 'Contact' },
    recyclebin: { icon: '🗑️', label: 'Recycle Bin' },
    settings: { icon: '⚙️', label: 'Settings' },
    secretfolder: { icon: '🔐', label: '???' },
    terminal: { icon: '⌨️', label: 'Terminal' }
  };

  function renderTaskbar() {
    const container = $('#taskbar-running');
    container.innerHTML = '';
    openApps.forEach((entry, appId) => {
      const meta = appMeta[appId] || { icon: '🪟', label: appId };
      const btn = document.createElement('button');
      btn.className = 'taskbar-app' + (entry.el.classList.contains('active') && !entry.minimized ? ' active' : '');
      btn.innerHTML = `<span>${meta.icon}</span><span>${meta.label}</span>`;
      btn.setAttribute('role', 'listitem');
      btn.addEventListener('click', () => toggleFromTaskbar(appId));
      container.appendChild(btn);
    });
  }

  /* ---- window control buttons (delegated) ---- */
  document.addEventListener('click', (e) => {
    const winEl = e.target.closest('.window');
    if (!winEl) return;
    const appId = winEl.id.replace('window-', '');
    if (e.target.closest('.win-close')) close(appId);
    else if (e.target.closest('.win-min')) minimize(appId);
    else if (e.target.closest('.win-max')) toggleMaximize(appId);
    else if (!e.target.closest('.window-titlebar')) focus(appId);
  });

  return { open, close, minimize, restore, toggleMaximize, focus, closeFocused, isOpen: (id) => openApps.has(id) };
})();

/* ==========================================================================
   8. DESKTOP ICONS + START MENU
   ========================================================================== */
function initDesktopIcons() {
  $$('.desktop-icon').forEach(icon => {
    const appId = icon.dataset.app;

    // A single click opens the app — closer to how most web portfolios behave,
    // and avoids the "why won't this icon open" confusion of a real desktop's
    // double-click convention. WindowManager.open() is safe to call more than
    // once (it just refocuses an already-open window).
    icon.addEventListener('click', () => {
      $$('.desktop-icon').forEach(i => i.classList.remove('icon-selected'));
      icon.classList.add('icon-selected');
      WindowManager.open(appId);
      SoundFX.click();
    });
    icon.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); WindowManager.open(appId); SoundFX.click(); }
    });
  });
}

function initStartMenu() {
  const startBtn = $('#start-button');
  const menu = $('#start-menu');

  function toggleMenu(force) {
    const willShow = force !== undefined ? force : menu.classList.contains('hidden');
    menu.classList.toggle('hidden', !willShow);
    startBtn.setAttribute('aria-expanded', String(willShow));
  }

  startBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); SoundFX.click(); });
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== startBtn) toggleMenu(false);
  });

  $$('.start-app').forEach(btn => {
    btn.addEventListener('click', () => { WindowManager.open(btn.dataset.app); toggleMenu(false); SoundFX.click(); });
  });

  $('#start-shutdown').addEventListener('click', () => {
    toggleMenu(false);
    fakeShutdown();
  });
}

function fakeShutdown() {
  const bootScreen = $('#boot-screen');
  bootScreen.classList.remove('boot-done');
  $('#boot-log').innerHTML = '';
  $('#boot-progress-bar').style.width = '0%';
  const logEl = $('#boot-log');
  const div = document.createElement('div');
  div.className = 'line ok';
  div.textContent = 'Shutting down Raghav OS… see you soon!';
  logEl.appendChild(div);
  setTimeout(() => {
    logEl.innerHTML = '';
    runBootSequence();
  }, 1400);
}

/* ==========================================================================
   9. CLOCK
   ========================================================================== */
function initClock() {
  const clockEl = $('#tray-clock');
  function tick() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  tick();
  setInterval(tick, 15000);
}

/* ==========================================================================
   10. THEME / WALLPAPER / SOUND TOGGLES (settings + tray, kept in sync)
   ========================================================================== */
function initPreferences() {
  const darkTray = $('#dark-toggle');
  const darkSettings = $('#settings-dark-toggle');
  const soundTray = $('#sound-toggle');
  const soundSettings = $('#settings-sound-toggle');
  const wallpaperOptions = $$('.wallpaper-swatch');

  const savedTheme = storageGet('raghav-os-theme', 'light');
  const savedWallpaper = storageGet('raghav-os-wallpaper', 'dusk');
  applyTheme(savedTheme);
  applyWallpaper(savedWallpaper);
  setSoundUI(SoundFX.isEnabled());

  function applyTheme(theme) {
    document.body.dataset.theme = theme;
    darkTray.setAttribute('aria-pressed', String(theme === 'dark'));
    darkSettings.setAttribute('aria-checked', String(theme === 'dark'));
    darkTray.textContent = theme === 'dark' ? '☀️' : '🌙';
    storageSet('raghav-os-theme', theme);
  }
  function toggleTheme() {
    applyTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
    SoundFX.click();
  }
  darkTray.addEventListener('click', toggleTheme);
  darkSettings.addEventListener('click', toggleTheme);

  function setSoundUI(on) {
    soundTray.setAttribute('aria-pressed', String(on));
    soundSettings.setAttribute('aria-checked', String(on));
    soundTray.textContent = on ? '🔊' : '🔇';
  }
  function toggleSound() {
    const next = !SoundFX.isEnabled();
    SoundFX.setEnabled(next);
    setSoundUI(next);
    if (next) SoundFX.click();
  }
  soundTray.addEventListener('click', toggleSound);
  soundSettings.addEventListener('click', toggleSound);

  function applyWallpaper(name) {
    document.body.dataset.wallpaper = name;
    wallpaperOptions.forEach(sw => sw.classList.toggle('active', sw.dataset.wallpaper === name));
    storageSet('raghav-os-wallpaper', name);
  }
  wallpaperOptions.forEach(sw => {
    sw.addEventListener('click', () => { applyWallpaper(sw.dataset.wallpaper); SoundFX.click(); });
  });
}

/* ==========================================================================
   11. CONTENT RENDERERS — data-driven, so adding a project/skill is trivial
   ========================================================================== */
function renderProjects() {
  const grid = $('#projects-grid');
  grid.innerHTML = CONFIG.projects.map(p => `
    <article class="project-card">
      <div class="project-shot" style="background:linear-gradient(135deg, ${p.color}, color-mix(in srgb, ${p.color} 60%, #1e1b2e))">
        <span aria-hidden="true">${p.emoji}</span>
      </div>
      <div class="project-body">
        <h4>${p.name}</h4>
        <p class="project-desc">${p.desc}</p>
        <div class="project-tech">${p.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}</div>
        <div class="project-actions">
          ${p.github === 'soon' ? `<span class="btn btn-primary btn-sm btn-disabled">🐙 Coming Soon</span>` : `<a class="btn btn-primary btn-sm" href="${p.github}" target="_blank" rel="noopener noreferrer">🐙 GitHub</a>`}
          ${p.demo === 'soon' ? `<span class="btn btn-ghost btn-sm btn-disabled">▶ Coming Soon</span>` : (p.demo ? `<a class="btn btn-ghost btn-sm" href="${p.demo}" target="_blank" rel="noopener noreferrer">▶ Live Demo</a>` : '')}
        </div>
      </div>
    </article>
  `).join('');
}

function renderSkills() {
  const grid = $('#skills-grid');
  grid.innerHTML = CONFIG.skills.map(s => `
    <div class="skill-card">
      <div class="skill-top"><span class="skill-emoji">${s.emoji}</span><span class="skill-name">${s.name}</span></div>
      <span class="skill-level-label">${s.note}</span>
      <div class="skill-bar-track"><div class="skill-bar-fill" data-level="${s.level}"></div></div>
    </div>
  `).join('');
}

function animateSkillBars() {
  $$('.skill-bar-fill').forEach((bar, idx) => {
    setTimeout(() => { bar.style.width = `${bar.dataset.level}%`; }, 120 + idx * 90);
  });
}

let skillsAnimated = false;
function animateSkillBarsOnce() {
  if (skillsAnimated) return;
  skillsAnimated = true;
  setTimeout(animateSkillBars, 200);
}

/* ---- track distinct apps opened, for the "explorer" achievement ---- */
const openedAppsEver = new Set();
function trackAppOpened(appId) {
  openedAppsEver.add(appId);
  if (openedAppsEver.size === 5) unlockAchievement('explorer', 'Opened 5 different windows');
}

/* ---- typing effect for About bio ---- */
const AboutTyping = (() => {
  let started = false;
  function start() {
    const el = $('#typing-target');
    if (!el || started) return;
    started = true;
    if (prefersReducedMotion()) { el.textContent = CONFIG.bio; el.classList.add('typing-done'); return; }
    const text = CONFIG.bio;
    let i = 0;
    (function type() {
      el.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) requestAnimationFrame(() => setTimeout(type, 14));
      else el.classList.add('typing-done');
    })();
  }
  return { start };
})();

/* ==========================================================================
   12. RECYCLE BIN — easter egg on empty
   ========================================================================== */
function initRecycleBin() {
  $('#empty-bin-btn').addEventListener('click', () => {
    RetroError.show('Cannot empty Recycle Bin: one of these files contains the only working copy of a project. Nice try.', 'Raghav OS');
    unlockAchievement('emptied-bin', 'Tried to empty the Recycle Bin');
  });
}

/* ==========================================================================
   13. SECRET FOLDER + TERMINAL (easter eggs)
   ========================================================================== */
function revealSecretFolder() {
  const icon = $('#secret-folder-icon');
  if (icon.classList.contains('hidden')) {
    icon.classList.remove('hidden');
    Toasts.show({ icon: '🔐', title: 'A new icon appeared on the desktop…', sub: 'curiosity pays off' });
  }
}

function initSecretFolder() {
  $('#open-terminal-btn').addEventListener('click', () => {
    WindowManager.open('terminal');
    unlockAchievement('found-terminal', 'Opened the Terminal');
  });
}

const Terminal = (() => {
  let outputEl, inputEl, greeted = false;
  const commands = {
    help: () => 'Available commands: help, about, whoami, projects, joke, sudo, matrix, achievements, clear, exit',
    about: () => "Raghav Mishra — 2nd-year CS student. This whole desktop is one big side project.",
    whoami: () => 'you, poking around a fake terminal inside a portfolio. respect.',
    projects: () => CONFIG.projects.map(p => `- ${p.name}`).join('\n'),
    joke: () => {
      const jokes = [
        'Why do programmers prefer dark mode? Because light attracts bugs.',
        "I told my code a joke. No reaction. Turns out it doesn't have a sense of Java-humor.",
        "There are 10 types of people: those who understand binary, and those who don't."
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    },
    sudo: () => { unlockAchievement('sudo', 'Tried sudo in a fake terminal'); return 'Nice try. Permission denied — this terminal only has "vibes" access.'; },
    matrix: () => { unlockAchievement('matrix', 'Took the red pill'); return 'Wake up, Raghav… the portfolio has you.'; },
    achievements: () => unlockedAchievements.size ? `Unlocked: ${Array.from(unlockedAchievements).join(', ')}` : 'No achievements yet — go explore.',
    clear: () => { outputEl.innerHTML = ''; return null; },
    exit: () => { WindowManager.close('terminal'); return null; }
  };

  function print(text, cls = '') {
    const line = document.createElement('div');
    if (cls) line.className = cls;
    line.textContent = text;
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function onOpen() {
    outputEl = $('#terminal-output');
    inputEl = $('#terminal-input');
    if (!greeted) {
      print('Raghav OS Terminal — type "help" to see what this does.');
      greeted = true;
    }
    setTimeout(() => inputEl.focus(), 200);
    if (!inputEl.dataset.bound) {
      inputEl.dataset.bound = 'true';
      inputEl.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const raw = inputEl.value.trim();
        if (!raw) return;
        print(`raghav@os:~$ ${raw}`, 'cmd-echo');
        inputEl.value = '';
        const cmd = raw.toLowerCase();
        if (commands[cmd]) {
          const result = commands[cmd]();
          if (result) print(result);
        } else {
          print(`command not found: ${cmd} — try "help"`, 'cmd-error');
        }
      });
    }
  }

  return { onOpen };
})();

/* ==========================================================================
   14. KONAMI CODE
   ========================================================================== */
function initKonamiCode() {
  const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;
  document.addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === sequence[pos]) {
      pos++;
      if (pos === sequence.length) {
        pos = 0;
        triggerKonami();
      }
    } else {
      pos = (key === sequence[0]) ? 1 : 0;
    }

    // Esc closes the focused window — small but real keyboard-nav win.
    if (e.key === 'Escape') WindowManager.closeFocused();
  });
}

function triggerKonami() {
  document.body.classList.add('rainbow-mode');
  unlockAchievement('konami', 'Entered the Konami Code');
  revealSecretFolder();
  setTimeout(() => document.body.classList.remove('rainbow-mode'), 6000);
}

/* ==========================================================================
   15. SPARKLE CURSOR TRAIL (desktop only, respects reduced motion)
   ========================================================================== */
function initSparkleTrail() {
  if (prefersReducedMotion()) return;
  const layer = $('#sparkle-layer');
  const desktop = $('#desktop');
  let lastSpawn = 0;

  desktop.addEventListener('pointermove', (e) => {
    if (e.target.closest('.window') || e.target.closest('.taskbar')) return;
    const now = performance.now();
    if (now - lastSpawn < 60) return;
    lastSpawn = now;
    const dot = document.createElement('span');
    dot.className = 'sparkle';
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
    dot.style.background = ['#fff', '#FFD166', '#FF6B9D'][Math.floor(Math.random() * 3)];
    layer.appendChild(dot);
    setTimeout(() => dot.remove(), 700);
  });
}

/* ==========================================================================
   16. PIXEL CAT COMPANION
   A self-contained desktop pet. It only reads DOM nodes under #pixel-cat
   (added in index.html) and never touches WindowManager, icons, or the
   taskbar. Idle animations (blink/ear-twitch/tail-wag/breathing) live in
   CSS and run automatically; this module handles: positioning the cat
   within a safe area, occasional wandering with fading paw prints, the
   greeting speech bubble, and the behavior-picker popup.
   ========================================================================== */
const PixelCat = (() => {
  let root, sprite, bubble, popup, closeBtn, optionButtons;
  let behavior = 'wandering';
  let wanderTimer = null;
  let wanderToken = 0;   // bumped to invalidate in-flight wander loops
  let bubbleTimer = null;
  let popupOpen = false;

  const $all = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---- safe wandering area: right of the desktop icons, above the taskbar ---- */
  function getBounds() {
    const iconGrid = $('#icon-grid');
    const iconRect = iconGrid ? iconGrid.getBoundingClientRect() : { right: 140 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const catW = root.offsetWidth || 78;
    const catH = root.offsetHeight || 66;
    const taskbarH = 56;
    const topSafe = 90;
    const minX = Math.min(Math.max(iconRect.right + 24, 160), Math.max(vw - catW - 20, 160));
    const maxX = Math.max(minX, vw - catW - 20);
    const minY = topSafe;
    const maxY = Math.max(topSafe, vh - taskbarH - catH - 30);
    return { minX, maxX, minY, maxY };
  }

  function currentPos() {
    return { x: parseFloat(root.style.left) || 0, y: parseFloat(root.style.top) || 0 };
  }

  function setPosition(x, y, animate) {
    if (!animate) root.classList.add('no-transition');
    root.style.left = `${x}px`;
    root.style.top = `${y}px`;
    if (!animate) {
      void root.offsetWidth; // force reflow so the "no-transition" jump applies
      requestAnimationFrame(() => root.classList.remove('no-transition'));
    }
  }

  /* ---- tiny fading paw prints along the walking path ---- */
  function spawnPawPrint(x, y) {
    const paw = document.createElement('span');
    paw.className = 'cat-paw-print';
    paw.textContent = '🐾';
    paw.style.left = `${x}px`;
    paw.style.top = `${y}px`;
    paw.style.setProperty('--paw-rot', `${Math.random() * 40 - 20}deg`);
    document.body.appendChild(paw);
    setTimeout(() => paw.remove(), 2300);
  }

  /* ---- wandering loop ---- */
  function scheduleWander() {
    clearTimeout(wanderTimer);
    if (behavior !== 'wandering' || popupOpen || prefersReducedMotion()) return;
    wanderTimer = setTimeout(walkOnce, 4000 + Math.random() * 5000);
  }

  function walkOnce() {
    if (behavior !== 'wandering' || popupOpen) return;
    const myToken = wanderToken;
    const bounds = getBounds();
    const from = currentPos();
    const targetX = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
    const targetY = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
    const dist = Math.hypot(targetX - from.x, targetY - from.y);

    if (dist < 24) { scheduleWander(); return; }

    root.classList.toggle('facing-left', targetX < from.x);
    const duration = Math.min(6, Math.max(1.4, dist / 55)); // seconds, gentle & slow
    root.style.transitionDuration = `${duration}s`;
    root.classList.add('is-walking');
    setPosition(targetX, targetY, true);

    const steps = Math.max(2, Math.floor(dist / 46));
    let i = 0;
    const pawInterval = setInterval(() => {
      if (myToken !== wanderToken) { clearInterval(pawInterval); return; }
      i++;
      const t = i / steps;
      spawnPawPrint(
        from.x + (targetX - from.x) * t + root.offsetWidth / 2,
        from.y + (targetY - from.y) * t + root.offsetHeight - 6
      );
      if (i >= steps) clearInterval(pawInterval);
    }, (duration * 1000) / steps);

    setTimeout(() => {
      if (myToken !== wanderToken) return;
      root.classList.remove('is-walking');
      root.style.transitionDuration = '';
      scheduleWander();
    }, duration * 1000);
  }

  function stopWandering() {
    wanderToken++;
    clearTimeout(wanderTimer);
    root.classList.remove('is-walking');
    root.style.transitionDuration = '';
  }

  /* ---- behavior switching ---- */
  function setBehavior(next) {
    behavior = next;
    root.dataset.behavior = next;
    optionButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.behavior === next));
    if (next === 'wandering') scheduleWander();
    else stopWandering();
  }

  /* ---- greeting speech bubble ---- */
  function showBubble(autoHideMs) {
    clearTimeout(bubbleTimer);
    bubble.classList.add('visible');
    if (autoHideMs) bubbleTimer = setTimeout(() => bubble.classList.remove('visible'), autoHideMs);
  }

  /* ---- behavior popup ---- */
  function positionPopup() {
    popup.classList.remove('above');
    popup.style.setProperty('--popup-shift', '0px');
    let rect = popup.getBoundingClientRect();
    if (rect.bottom > window.innerHeight - 16) popup.classList.add('above');

    rect = popup.getBoundingClientRect();
    const margin = 12;
    let shift = 0;
    if (rect.left < margin) shift = margin - rect.left;
    else if (rect.right > window.innerWidth - margin) shift = (window.innerWidth - margin) - rect.right;
    popup.style.setProperty('--popup-shift', `${shift}px`);
  }

  function openPopup() {
    popupOpen = true;
    stopWandering();
    popup.hidden = false;
    sprite.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => {
      positionPopup();
      popup.classList.add('open');
    });
    showBubble(2600);
  }

  function closePopup() {
    popupOpen = false;
    popup.classList.remove('open');
    sprite.setAttribute('aria-expanded', 'false');
    setTimeout(() => { if (!popupOpen) popup.hidden = true; }, 200);
    if (behavior === 'wandering') scheduleWander();
  }

  function togglePopup() { popupOpen ? closePopup() : openPopup(); }

  function bindEvents() {
    sprite.addEventListener('click', () => { SoundFX.click(); togglePopup(); });
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); SoundFX.click(); closePopup(); });

    optionButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        SoundFX.click();
        setBehavior(btn.dataset.behavior);
      });
    });

    document.addEventListener('click', (e) => {
      if (!popupOpen || root.contains(e.target)) return;
      closePopup();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popupOpen) closePopup();
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const bounds = getBounds();
        const pos = currentPos();
        setPosition(
          Math.min(Math.max(pos.x, bounds.minX), bounds.maxX),
          Math.min(Math.max(pos.y, bounds.minY), bounds.maxY),
          false
        );
        if (popupOpen) positionPopup();
      }, 150);
    });
  }

  function init() {
    root = $('#pixel-cat');
    if (!root) return;
    sprite = $('#cat-sprite', root);
    bubble = $('#cat-speech-bubble', root);
    popup = $('#cat-popup', root);
    closeBtn = $('#cat-popup-close', root);
    optionButtons = $all('.cat-option', root);

    const bounds = getBounds();
    setPosition(
      bounds.minX + (bounds.maxX - bounds.minX) * 0.72,
      bounds.minY + (bounds.maxY - bounds.minY) * 0.55,
      false
    );

    bindEvents();
    setBehavior('wandering');

    // a gentle one-time invitation to click, shortly after boot finishes
    setTimeout(() => showBubble(5500), 3200);
  }

  return { init };
})();

/* ==========================================================================
   17. INIT
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  Toasts.init();
  RetroError.init();
  runBootSequence();

  renderProjects();
  renderSkills();
  initDesktopIcons();
  initStartMenu();
  initClock();
  initPreferences();
  initRecycleBin();
  initSecretFolder();
  initKonamiCode();
  initSparkleTrail();
  PixelCat.init();

  Toasts.show({ icon: '👋', title: 'Welcome to Raghav OS', sub: 'click an icon to get started' });
});
