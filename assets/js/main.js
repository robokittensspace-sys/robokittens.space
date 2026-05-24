/**
 * RoboKittens — main.js
 * Loads /data/i18n.json and applies translations via data-i18n attributes.
 */

let lang = localStorage.getItem('rk_lang') || detectLang();
let translations = {};

function detectLang() {
  const nav = (navigator.language || 'en').toLowerCase();
  if (nav.startsWith('pt')) return 'pt';
  if (nav.startsWith('ru')) return 'ru';
  return 'en';
}

// ── Boot ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/data/i18n.json');
    if (!res.ok) throw new Error('i18n.json not found');
    const all = await res.json();
    translations = all;
    applyLang(lang);
  } catch (err) {
    console.error('[RoboKittens] Failed to load i18n.json:', err);
  }
});

// ── Apply language ────────────────────────────────
function applyLang(code) {
  const t = translations[code];
  if (!t) return;

  lang = code;
  localStorage.setItem('rk_lang', code);

  // Flatten nested keys: t['hero']['title'] → key 'hero.title'
  const flat = flattenObj(t);

  // data-i18n → textContent
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (flat[key] !== undefined) el.textContent = flat[key];
  });

  // data-i18n-html → innerHTML  (allows <em> etc.)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (flat[key] !== undefined) el.innerHTML = flat[key];
  });

  // highlight active lang button
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === code);
  });

  document.documentElement.lang = code;
}

// Flatten { hero: { title: 'X' } } → { 'hero.title': 'X' }
function flattenObj(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(acc, flattenObj(v, key));
    } else {
      acc[key] = v;
    }
    return acc;
  }, {});
}

// Expose for onclick="setLang('ru')" in HTML
window.setLang = applyLang;
