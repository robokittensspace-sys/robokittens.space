/**
 * RoboKittens — main.js
 *
 * Loads data from:
 *   /data/i18n.json     — all UI text in EN / PT / RU
 *   /data/site.json     — contacts, locations, program list
 *   /data/schedule.json — classes, special events
 *
 * Then renders the page and wires up interactions.
 */

// ─── State ────────────────────────────────────────────────
let lang = localStorage.getItem('rk_lang') || 'en';
let i18n = {};
let site = {};
let schedule = {};

// ─── Boot ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  render();
  wireCalendar();
});

async function loadData() {
  const [i18nRaw, siteRaw, scheduleRaw] = await Promise.all([
    fetch('/data/i18n.json').then(r => r.json()),
    fetch('/data/site.json').then(r => r.json()),
    fetch('/data/schedule.json').then(r => r.json()),
  ]);
  i18n     = i18nRaw;
  site     = siteRaw;
  schedule = scheduleRaw;
}

// ─── Language switch ──────────────────────────────────────
function setLang(code) {
  if (!site.supportedLangs.includes(code)) return;
  lang = code;
  localStorage.setItem('rk_lang', code);
  render();
}
window.setLang = setLang; // expose for inline onclick

function t(path) {
  // dot-path accessor: t('hero.title') → i18n[lang].hero.title
  return path.split('.').reduce((obj, key) => obj?.[key], i18n[lang]) ?? '';
}

// ─── Render ───────────────────────────────────────────────
function render() {
  updateMeta();
  renderNav();
  renderHero();
  renderSteam();
  renderPrograms();
  renderFormats();
  renderLocations();
  renderScheduleSection();
  renderCta();
  renderFooter();
  highlightLang();
}

function updateMeta() {
  document.title = t('meta.title');
  document.querySelector('meta[name="description"]')
    ?.setAttribute('content', t('meta.description'));
}

function renderNav() {
  setText('nav-programs',  t('nav.programs'));
  setText('nav-schedule',  t('nav.schedule'));
  setText('nav-locations', t('nav.locations'));
  setText('nav-book',      t('nav.bookTrial'));
}

function renderHero() {
  setText('hero-badge',    t('hero.badge'));
  setHTML('hero-title',    t('hero.title'));
  setText('hero-subtitle', t('hero.subtitle'));
  setText('hero-btn-main', t('hero.btnMain'));
  setText('hero-btn-exp',  t('hero.btnExplore'));

  const s = i18n[lang].hero.stats;
  setText('stat-ages-num',       s.ages);
  setText('stat-ages-label',     s.agesLabel);
  setText('stat-dir-num',        s.directions);
  setText('stat-dir-label',      s.directionsLabel);
  setText('stat-loc-num',        s.locations);
  setText('stat-loc-label',      s.locationsLabel);
}

function renderSteam() {
  setText('steam-tag',      t('steam.tag'));
  setText('steam-title',    t('steam.title'));
  setText('steam-subtitle', t('steam.subtitle'));

  const grid = document.getElementById('steam-grid');
  if (!grid) return;
  const items = i18n[lang].steam.items;
  grid.innerHTML = items.map(item => `
    <div class="steam-item">
      <div class="icon">${item.icon}</div>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </div>
  `).join('');
}

function renderPrograms() {
  setText('programs-tag',      t('programs.tag'));
  setText('programs-title',    t('programs.title'));
  setText('programs-subtitle', t('programs.subtitle'));

  const grid = document.getElementById('programs-grid');
  if (!grid) return;
  const items = i18n[lang].programs.items;
  const learnMore = t('programs.learnMore');

  grid.innerHTML = items.map(item => `
    <a class="program-card c-${item.color}" href="${item.url}">
      <div class="top">
        <div class="prog-big-icon ic-${item.color}">${item.icon}</div>
        <span class="age-tag">${item.ages}</span>
      </div>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
      <div class="prog-tags">
        ${item.tags.map(tag => `<span class="prog-tag">${tag}</span>`).join('')}
      </div>
      <span class="prog-link">${learnMore}</span>
    </a>
  `).join('');
}

function renderFormats() {
  setText('formats-tag',      t('formats.tag'));
  setText('formats-title',    t('formats.title'));
  setText('formats-subtitle', t('formats.subtitle'));

  const grid = document.getElementById('formats-grid');
  if (!grid) return;
  grid.innerHTML = i18n[lang].formats.items.map(item => `
    <div class="format-card">
      <div class="format-icon">${item.icon}</div>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </div>
  `).join('');
}

function renderLocations() {
  setText('locations-tag',      t('locations.tag'));
  setText('locations-title',    t('locations.title'));
  setText('locations-subtitle', t('locations.subtitle'));

  const grid = document.getElementById('locations-grid');
  if (!grid) return;

  grid.innerHTML = site.locations.map(loc => {
    if (loc.status === 'open') {
      return `
        <div class="loc-card">
          <span class="loc-badge open">✅ Open now</span>
          <h3>${loc.name}</h3>
          <address>${loc.address}<br/>${loc.postcode} ${loc.city}</address>
          <div class="loc-detail">
            <span>📞 <a href="tel:${site.contact.phone}">${site.contact.phoneDisplay}</a></span>
            <span>✉️ <a href="mailto:${site.contact.email}">${site.contact.email}</a></span>
            <span>🕐 ${loc.hours}</span>
          </div>
        </div>`;
    } else {
      const notifyBtn = t('locations.notifyBtn');
      return `
        <div class="loc-card new-loc">
          <span class="loc-badge coming">🚀 Opening soon</span>
          <h3>${loc.name}</h3>
          <address>${loc.city}</address>
          <div class="loc-detail">
            <span>📅 Expected: ${loc.expectedOpening}</span>
          </div>
          <a href="${site.contact.whatsapp}" class="btn-secondary" style="margin-top:12px;display:inline-flex;font-size:.85rem;padding:10px 18px">
            ${notifyBtn}
          </a>
        </div>`;
    }
  }).join('');
}

function renderScheduleSection() {
  setText('schedule-tag',      t('schedule.tag'));
  setText('schedule-title',    t('schedule.title'));
  setText('schedule-subtitle', t('schedule.subtitle'));
  setHTML('schedule-note',
    `${t('schedule.note')} <a href="/calendar">${t('schedule.calendarLink')}</a>`
  );

  // Render live schedule grid from schedule.json (Gaia branch, recurring classes)
  const grid = document.getElementById('schedule-grid');
  if (!grid) return;

  // dayOfWeek → column index in our display order (Mon=1, Tue=2, Wed=3, Thu=4, Sat=6)
  const displayDays  = [1, 2, 3, 4, 6]; // JS getDay values
  const dayNames     = t('schedule.days'); // array from i18n
  const gaia         = (schedule.classes && schedule.classes.gaia) || [];
  const colorMap     = { orange: 's-orange', teal: 's-teal', purple: 's-purple', yellow: 's-yellow' };

  grid.innerHTML = displayDays.map((jsDay, i) => {
    const slots = gaia
      .filter(c => c.dayOfWeek === jsDay && c.recurring)
      .sort((a, b) => a.timeStart.localeCompare(b.timeStart));

    const slotsHtml = slots.map(c => {
      const prog      = schedule.programs[c.program];
      const colorCls  = colorMap[prog.color] || 's-orange';
      const progLabel = prog.label[lang] || prog.label.en;
      return `
        <div class="slot ${colorCls}">
          <span class="slot-time">${c.timeStart}</span>
          <span class="slot-name">${progLabel}</span>
          <span class="slot-age">${c.ageMin}–${c.ageMax}</span>
        </div>`;
    }).join('');

    return `
      <div class="day-col">
        <div class="day-header">${dayNames[i] || ''}</div>
        <div class="day-slots">${slotsHtml}</div>
      </div>`;
  }).join('');
}

function renderCta() {
  setHTML('cta-title',   t('cta.title'));
  setText('cta-subtitle', t('cta.subtitle'));
  setText('cta-wa',       t('cta.whatsapp'));
  setText('cta-email',    t('cta.email'));
}

function renderFooter() {
  setText('footer-tagline',   t('footer.tagline'));
  setText('footer-prog-title',t('footer.programsTitle'));
  setText('footer-cont-title',t('footer.contactTitle'));
  setText('footer-book-link', t('footer.bookLink'));
  setText('footer-copyright', t('footer.copyright'));
  setText('footer-slogan',    t('footer.slogan'));

  // render program links in footer
  const footerPrograms = document.getElementById('footer-programs');
  if (footerPrograms) {
    const items = i18n[lang].programs.items;
    footerPrograms.innerHTML = items.map(p =>
      `<li><a href="${p.url}">${p.title}</a></li>`
    ).join('');
  }
}

function highlightLang() {
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.langBtn === lang);
  });
}

// ─── Calendar (calendar.html only) ───────────────────────
function wireCalendar() {
  if (!document.getElementById('calendar-root')) return;

  let currentBranch = 'gaia';
  let currentDate   = new Date();

  renderCalendar(currentBranch, currentDate);

  document.querySelectorAll('[data-branch]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentBranch = btn.dataset.branch;
      renderCalendar(currentBranch, currentDate);
    });
  });

  document.getElementById('cal-prev')?.addEventListener('click', () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    renderCalendar(currentBranch, currentDate);
  });

  document.getElementById('cal-next')?.addEventListener('click', () => {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    renderCalendar(currentBranch, currentDate);
  });
}

function renderCalendar(branch, date) {
  const monthNames = {
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    pt: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
    ru: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
  };

  const year  = date.getFullYear();
  const month = date.getMonth();

  const monthLabel = document.getElementById('cal-month-label');
  if (monthLabel) monthLabel.textContent = `${monthNames[lang][month]} ${year}`;

  const grid = document.getElementById('cal-days-grid');
  if (!grid) return;

  const firstDay  = new Date(year, month, 1).getDay(); // 0=Sun
  const daysCount = new Date(year, month + 1, 0).getDate();

  // Days with classes this branch
  const classesForBranch = schedule.classes[branch] || [];
  const daysWithClasses  = new Set(classesForBranch.map(c => c.dayOfWeek));

  // Special events this month
  const specials = (schedule.specialEvents || []).filter(e => {
    if (e.branch !== branch) return false;
    const start = new Date(e.dateStart);
    return start.getFullYear() === year && start.getMonth() === month;
  });
  const specialDays = new Map();
  specials.forEach(e => {
    const d = new Date(e.dateStart).getDate();
    specialDays.set(d, e);
  });

  let html = '';
  const offset = (firstDay + 6) % 7; // Mon-first
  for (let i = 0; i < offset; i++) html += '<div class="cal-cell empty"></div>';

  for (let d = 1; d <= daysCount; d++) {
    const jsDay  = new Date(year, month, d).getDay(); // 0=Sun
    const hasCls = daysWithClasses.has(jsDay);
    const hasSpe = specialDays.has(d);
    const today  = isToday(year, month, d);

    html += `<div class="cal-cell${hasCls ? ' has-classes' : ''}${hasSpe ? ' has-event' : ''}${today ? ' today' : ''}"
      data-year="${year}" data-month="${month}" data-day="${d}"
      data-branch="${branch}">
      <span class="cal-day-num">${d}</span>
      ${hasSpe ? '<span class="cal-dot event"></span>' : ''}
      ${hasCls ? '<span class="cal-dot class"></span>' : ''}
    </div>`;
  }

  grid.innerHTML = html;

  grid.querySelectorAll('.cal-cell:not(.empty)').forEach(cell => {
    cell.addEventListener('click', () => showDayPanel(cell));
  });
}

function showDayPanel(cell) {
  const year   = parseInt(cell.dataset.year);
  const month  = parseInt(cell.dataset.month);
  const day    = parseInt(cell.dataset.day);
  const branch = cell.dataset.branch;
  const jsDay  = new Date(year, month, day).getDay();

  const classes = (schedule.classes[branch] || []).filter(c => c.dayOfWeek === jsDay);
  const specials = (schedule.specialEvents || []).filter(e => {
    if (e.branch !== branch) return false;
    const s = new Date(e.dateStart);
    return s.getFullYear() === year && s.getMonth() === month && s.getDate() === day;
  });

  const panel = document.getElementById('day-panel');
  if (!panel) return;

  const dateStr = new Date(year, month, day).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'pt' ? 'pt-PT' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  let html = `<h3 style="margin-bottom:14px;font-family:'Syne',sans-serif">${dateStr}</h3>`;

  if (classes.length === 0 && specials.length === 0) {
    html += `<p style="color:var(--muted);font-size:.9rem">No classes scheduled.</p>`;
  }

  classes.forEach(cls => {
    const prog = schedule.programs[cls.program];
    const spotsLeft = cls.spotsTotal - cls.spotsTaken;
    const label = prog.label[lang] || prog.label.en;
    html += `
      <div class="day-class-card color-${prog.color}" data-classid="${cls.id}">
        <div class="class-time">${cls.timeStart} – ${cls.timeEnd}</div>
        <div class="class-name">${label}</div>
        <div class="class-meta">Ages ${cls.ageMin}–${cls.ageMax} · ${cls.instructor} · ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left</div>
        <button class="btn-book" onclick="openBooking('${cls.id}','${dateStr}')">Book →</button>
      </div>`;
  });

  specials.forEach(e => {
    const title = e.title[lang] || e.title.en;
    html += `<div class="day-class-card color-teal">
      <div class="class-name">🌟 ${title}</div>
      <div class="class-meta">Special event</div>
    </div>`;
  });

  panel.innerHTML = html;
  panel.style.display = 'block';
}

function openBooking(classId, dateStr) {
  const modal = document.getElementById('booking-modal');
  if (!modal) return;
  document.getElementById('booking-class-label').textContent = `${classId} · ${dateStr}`;
  modal.style.display = 'flex';
}
window.openBooking = openBooking;

function closeBooking() {
  const modal = document.getElementById('booking-modal');
  if (modal) modal.style.display = 'none';
}
window.closeBooking = closeBooking;

// ─── Helpers ──────────────────────────────────────────────
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function isToday(year, month, day) {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
}

// ─── Expose for nav buttons ───────────────────────────────
window.setLang = setLang;
