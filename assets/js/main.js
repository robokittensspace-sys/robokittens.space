/**
 * RoboKittens — main.js
 * Loads /data/i18n.json, applies translations.
 * Falls back gracefully — EN text is already in HTML, so page is never blank.
 */

let lang = localStorage.getItem('rk_lang') || detectLang();

function detectLang() {
  const nav = (navigator.language || 'en').toLowerCase();
  if (nav.startsWith('pt')) return 'pt';
  if (nav.startsWith('ru')) return 'ru';
  return 'en';
}

document.addEventListener('DOMContentLoaded', async () => {
  // Mark active lang button immediately (text already in HTML)
  highlightBtn(lang);

  // Load translations
  try {
    const res = await fetch('/data/i18n.json');
    if (!res.ok) throw new Error(res.status);
    const all = await res.json();
    window._i18n = all;
    if (lang !== 'en') applyLang(lang); // EN is already in HTML
  } catch (e) {
    console.warn('[RoboKittens] i18n.json not loaded:', e.message);
  }
});

function applyLang(code) {
  const data = window._i18n;
  if (!data || !data[code]) return;

  lang = code;
  localStorage.setItem('rk_lang', code);

  const t = data[code];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = getKey(t, key);
    if (val !== undefined) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const val = getKey(t, key);
    if (val !== undefined) el.innerHTML = val;
  });

  highlightBtn(code);
  document.documentElement.lang = code;
}

// Get value by dot-path: getKey(obj, 'hero.title')
function getKey(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

function highlightBtn(code) {
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === code);
  });
}

window.setLang = applyLang;
