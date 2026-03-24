(function () {
  'use strict';

  const PRIVACY_STORAGE_KEY = 'saudiPreciseTime-privacy-v1';
  const privacyGate = document.getElementById('privacyGate');
  const privacyAckEn = document.getElementById('privacyAckEn');
  const privacyAckAr = document.getElementById('privacyAckAr');

  if (privacyGate && privacyAckEn && privacyAckAr) {
    function onEscape(e) {
      if (e.key === 'Escape' && !privacyGate.classList.contains('privacy-gate--dismissed')) {
        dismissPrivacyGate();
      }
    }

    function dismissPrivacyGate() {
      try {
        localStorage.setItem(PRIVACY_STORAGE_KEY, '1');
      } catch (_) {}
      privacyGate.classList.add('privacy-gate--dismissed');
      privacyGate.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.add('spt-privacy-ack');
      document.body.classList.remove('privacy-gate-open');
      document.removeEventListener('keydown', onEscape);
    }

    if (document.documentElement.classList.contains('spt-privacy-ack')) {
      privacyGate.classList.add('privacy-gate--dismissed');
      privacyGate.setAttribute('aria-hidden', 'true');
    } else {
      document.body.classList.add('privacy-gate-open');
      privacyGate.setAttribute('aria-hidden', 'false');
      document.addEventListener('keydown', onEscape);
      privacyAckEn.focus();
    }

    privacyAckEn.addEventListener('click', dismissPrivacyGate);
    privacyAckAr.addEventListener('click', dismissPrivacyGate);
  }
})();

(function () {
  'use strict';

  const TIME_ZONE = 'Asia/Riyadh';
  const TICK_MS = 10;

  const els = {
    hour: document.getElementById('hourVal'),
    minute: document.getElementById('minuteVal'),
    second: document.getElementById('secondVal'),
    ms: document.getElementById('msVal'),
    micro: document.getElementById('microVal'),
    nano: document.getElementById('nanoVal'),
    saveBtn: document.getElementById('saveMoment'),
    copyCurrentBtn: document.getElementById('copyCurrent'),
    clearBtn: document.getElementById('clearMoments'),
    list: document.getElementById('momentsList'),
    empty: document.getElementById('momentsEmpty'),
    toast: document.getElementById('toast'),
    mode24Btn: document.getElementById('mode24Btn'),
    mode12Btn: document.getElementById('mode12Btn'),
  };

  /**
   * @typedef {{
   *   id: string,
   *   full: string,
   *   date: string,
   *   hour: number,
   *   minute: number,
   *   second: number,
   *   millisecond: number,
   *   microsecond: number,
   *   nanosecond: number,
   *   hhmmssms: string
   * }} SavedMoment
   */
  /** @type {SavedMoment[]} */
  let moments = [];
  let timeMode = '24';

  let toastTimer = 0;

  function supportsFractionalSeconds() {
    try {
      const parts = new Intl.DateTimeFormat('en', {
        fractionalSecondDigits: 3,
        hour: 'numeric',
        second: 'numeric',
        minute: 'numeric',
        hour12: false,
      }).formatToParts(new Date());
      return parts.some((p) => p.type === 'fractionalSecond');
    } catch {
      return false;
    }
  }

  const FRACTIONAL_OK = supportsFractionalSeconds();

  /**
   * Parse fractional milliseconds from a locale time string (fallback path).
   * @param {Date} date
   * @returns {number}
   */
  function fallbackRiyadhMilliseconds(date) {
    try {
      const s = date.toLocaleString('en-GB', {
        timeZone: TIME_ZONE,
        hour12: false,
        fractionalSecondDigits: 3,
      });
      const match = /\.(\d{1,3})(?!\d)/.exec(s);
      if (match) return parseInt(match[1].padEnd(3, '0').slice(0, 3), 10);
    } catch {
      /* ignore */
    }
    return 0;
  }

  /**
   * @param {Date} date
   * @returns {{hour: number, minute: number, second: number, millisecond: number, dateStr: string}}
   */
  function getRiyadhComponents(date) {
    const dateFmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    if (FRACTIONAL_OK) {
      const timeFmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        fractionalSecondDigits: 3,
      });
      const parts = timeFmt.formatToParts(date);
      const hour = parseInt(parts.find((p) => p.type === 'hour').value, 10);
      const minute = parseInt(parts.find((p) => p.type === 'minute').value, 10);
      const second = parseInt(parts.find((p) => p.type === 'second').value, 10);
      const frac = parts.find((p) => p.type === 'fractionalSecond');
      const millisecond = frac ? parseInt(frac.value.padEnd(3, '0').slice(0, 3), 10) : fallbackRiyadhMilliseconds(date);
      const dateStr = dateFmt.format(date);
      return { hour, minute, second, millisecond, dateStr };
    }

    const timeFmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = timeFmt.formatToParts(date);
    const hour = parseInt(parts.find((p) => p.type === 'hour').value, 10);
    const minute = parseInt(parts.find((p) => p.type === 'minute').value, 10);
    const second = parseInt(parts.find((p) => p.type === 'second').value, 10);
    const millisecond = fallbackRiyadhMilliseconds(date);
    const dateStr = dateFmt.format(date);
    return { hour, minute, second, millisecond, dateStr };
  }

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function pad3(n) {
    return String(n).padStart(3, '0');
  }

  function pad6(n) {
    return String(n).padStart(6, '0');
  }

  function pad9(n) {
    return String(n).padStart(9, '0');
  }

  function formatHourForMode(hour24) {
    if (timeMode === '24') return String(hour24);
    const normalized = hour24 % 12 || 12;
    return String(normalized);
  }

  function formatHourLabel(hour24) {
    if (timeMode === '24') return '';
    return hour24 >= 12 ? ' PM' : ' AM';
  }

  /**
   * High-precision fractional phase [0, 1) — drives simulated micro/nano from performance.now().
   */
  function subMillisecondPhase() {
    return performance.now() % 1;
  }

  /**
   * @param {number} millisecond 0–999
   * @param {number} phase from performance.now() % 1
   */
  function simulatedMicrosecond(millisecond, phase) {
    const extra = Math.floor(phase * 1000);
    return millisecond * 1000 + extra;
  }

  /**
   * @param {number} millisecond 0–999
   * @param {number} phase
   */
  function simulatedNanosecond(millisecond, phase) {
    const extra = Math.floor(phase * 1_000_000);
    return millisecond * 1_000_000 + extra;
  }

  function formatHhMmSsMs(c) {
    const hh = timeMode === '24' ? pad2(c.hour) : pad2(c.hour % 12 || 12);
    const suffix = formatHourLabel(c.hour);
    return `${hh}:${pad2(c.minute)}:${pad2(c.second)}.${pad3(c.millisecond)}${suffix}`;
  }

  function formatFullTimestamp(c) {
    const hh = timeMode === '24' ? pad2(c.hour) : pad2(c.hour % 12 || 12);
    const suffix = formatHourLabel(c.hour);
    return `${c.dateStr} ${hh}:${pad2(c.minute)}:${pad2(c.second)}.${pad3(c.millisecond)}${suffix}`;
  }

  /**
   * @param {SavedMoment} m
   */
  function formatMomentCopyBlock(m) {
    return [
      m.full,
      `Microsecond: ${pad6(m.microsecond)}`,
      `Nanosecond: ${pad9(m.nanosecond)}`,
      `Date: ${m.date}`,
      `Hour: ${formatHourForMode(m.hour)}${formatHourLabel(m.hour)} · Minute: ${m.minute} · Second: ${m.second} · Millisecond: ${m.millisecond}`,
    ].join('\n');
  }

  /**
   * @param {SavedMoment} m
   */
  function formatMomentShareText(m) {
    return [
      'Captured Time from Saudi Precise Time:',
      m.hhmmssms,
      `Microsecond: ${pad6(m.microsecond)}`,
      `Nanosecond: ${pad9(m.nanosecond)}`,
      `Date: ${m.date}`,
    ].join('\n');
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      els.toast.hidden = true;
    }, 2200);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard');
    } catch {
      showToast('Copy failed — select and copy manually');
    }
  }

  function renderMoments() {
    if (moments.length === 0) {
      els.list.innerHTML = '';
      els.list.appendChild(els.empty);
      els.empty.hidden = false;
      return;
    }

    els.empty.remove();
    els.list.innerHTML = '';

    moments.forEach((m) => {
      const li = document.createElement('li');
      li.className = 'moment-card';
      li.innerHTML = `
        <p class="ts-full">${escapeHtml(m.full)}</p>
        <div class="moment-meta">
          <div><strong>Date</strong> — ${escapeHtml(m.date)}</div>
          <div><strong>Hour</strong> — ${formatHourForMode(m.hour)}${formatHourLabel(m.hour)} · <strong>Minute</strong> — ${m.minute} · <strong>Second</strong> — ${m.second} · <strong>Millisecond</strong> — ${m.millisecond}</div>
          <div><strong>Microsecond</strong> — ${pad6(m.microsecond)} · <strong>Nanosecond</strong> — ${pad9(m.nanosecond)}</div>
        </div>
        <div class="moment-btns">
          <button type="button" class="btn btn-ghost share-btn" data-id="${escapeAttr(m.id)}">
            <span class="btn-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
              </svg>
            </span>
            Share
          </button>
          <button type="button" class="btn btn-primary copy-snap-btn" data-id="${escapeAttr(m.id)}">
            <span class="btn-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            </span>
            Copy
          </button>
        </div>
      `;
      els.list.appendChild(li);
    });

    els.list.querySelectorAll('.share-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const m = moments.find((x) => x.id === id);
        if (!m) return;
        copyText(formatMomentShareText(m));
      });
    });

    els.list.querySelectorAll('.copy-snap-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const m = moments.find((x) => x.id === id);
        if (!m) return;
        copyText(formatMomentCopyBlock(m));
      });
    });
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return s.replace(/"/g, '&quot;');
  }

  function tick() {
    const date = new Date();
    const c = getRiyadhComponents(date);
    const phase = subMillisecondPhase();
    const micro = simulatedMicrosecond(c.millisecond, phase);
    const nano = simulatedNanosecond(c.millisecond, phase);

    els.hour.textContent = formatHourForMode(c.hour) + formatHourLabel(c.hour);
    els.minute.textContent = String(c.minute);
    els.second.textContent = String(c.second);
    els.ms.textContent = pad3(c.millisecond);
    els.micro.textContent = pad6(micro);
    els.nano.textContent = pad9(nano);
  }

  function captureMoment() {
    const date = new Date();
    const c = getRiyadhComponents(date);
    const phase = subMillisecondPhase();
    const microsecond = simulatedMicrosecond(c.millisecond, phase);
    const nanosecond = simulatedNanosecond(c.millisecond, phase);
    const id = `${date.getTime()}-${Math.random().toString(36).slice(2, 9)}`;
    const full = formatFullTimestamp(c);
    const hhmmssms = formatHhMmSsMs(c);
    moments.unshift({
      id,
      full,
      date: c.dateStr,
      hour: c.hour,
      minute: c.minute,
      second: c.second,
      millisecond: c.millisecond,
      microsecond,
      nanosecond,
      hhmmssms,
    });
    renderMoments();
    showToast('Moment saved');
  }

  function copyLiveDisplay() {
    const date = new Date();
    const c = getRiyadhComponents(date);
    const line = formatHhMmSsMs(c);
    const text = `${line}\nDate: ${c.dateStr}`;
    copyText(text);
  }

  function setTimeMode(nextMode) {
    timeMode = nextMode === '12' ? '12' : '24';
    els.mode24Btn.classList.toggle('is-active', timeMode === '24');
    els.mode12Btn.classList.toggle('is-active', timeMode === '12');
    els.mode24Btn.setAttribute('aria-pressed', String(timeMode === '24'));
    els.mode12Btn.setAttribute('aria-pressed', String(timeMode === '12'));
    tick();
    renderMoments();
  }

  els.saveBtn.addEventListener('click', captureMoment);
  els.copyCurrentBtn.addEventListener('click', copyLiveDisplay);
  els.mode24Btn.addEventListener('click', () => setTimeMode('24'));
  els.mode12Btn.addEventListener('click', () => setTimeMode('12'));
  els.clearBtn.addEventListener('click', () => {
    if (moments.length === 0) {
      showToast('Nothing to clear');
      return;
    }
    moments = [];
    renderMoments();
    showToast('All moments cleared');
  });

  setInterval(tick, TICK_MS);
  tick();
})();
