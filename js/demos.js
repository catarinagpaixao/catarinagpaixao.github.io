(function () {
  'use strict';

  const dialog = document.getElementById('demo');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const root = document.documentElement;
  const appEl = dialog.querySelector('.demo__app');
  const titleEl = dialog.querySelector('.demo__title');
  const toastEl = dialog.querySelector('.demo__toast');

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const sameDay = (a, b) => a.getTime() === b.getTime();
  const icon = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  const LOCKED = 'Esta parte fica para a conversa. <a href="#contacto" data-close>Fala comigo</a> para veres o resto.';

  let toastTimer;
  function toast(html) {
    toastEl.innerHTML = html;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 3600);
  }

  let current = null;

  function shell(d) {
    const item = (it) => {
      const attr = it.screen ? `data-screen="${it.screen}"` : 'data-locked';
      const cls = 'ap-nav__item' + (it.top ? ' is-top' : '');
      return `<button type="button" class="${cls}" ${attr}>${it.icon ? icon(it.icon) : ''}<span>${esc(it.label)}</span></button>`;
    };
    const nav = d.nav.map((it) => it.group
      ? `<div class="ap-nav__group"><span class="ap-nav__label">${esc(it.group)}</span>${it.items.map(item).join('')}</div>`
      : item(it)).join('');
    return `
      <aside class="ap-side">
        ${d.brand ? `<div class="ap-brand">${d.brand}</div>` : ''}
        <nav class="ap-nav" aria-label="Menu da demonstração">${nav}</nav>
        ${d.sideFoot || ''}
      </aside>
      <div class="ap-body">${d.topbar || ''}<div class="ap-main"></div></div>`;
  }

  function renderMain(keepScroll) {
    const main = appEl.querySelector('.ap-main');
    const y = main.scrollTop;
    main.innerHTML = current.screens[current.screen]();
    main.scrollTop = keepScroll ? y : 0;
    appEl.querySelectorAll('.ap-nav__item').forEach((b) => {
      const active = (current.parent && current.parent[current.screen]) || current.screen;
      b.classList.toggle('is-active', b.dataset.screen === active);
    });
  }

  function region(name, html) {
    const el = appEl.querySelector(`[data-region="${name}"]`);
    if (el) el.innerHTML = html;
  }

  function open(id) {
    const demo = demos[id];
    if (!demo) return;
    current = demo;
    current.screen = demo.start;
    titleEl.textContent = demo.title;
    appEl.className = 'demo__app ap ap--' + id;
    appEl.innerHTML = shell(demo);
    renderMain();
    toastEl.classList.remove('is-on');
    root.classList.add('demo-open');
    if (!dialog.open) dialog.showModal();
  }

  function makeTerracota() {
    const RATE = 135;
    const CH = { 'Website': '#9A7420', 'Airbnb': '#B43A62', 'Booking.com': '#234B6E', 'Manual': '#8C8279' };
    const fmt = (x) => x.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const money = (n) => '€' + n.toLocaleString('en-GB');

    const bookings = [
      ['Marta Lopes', -3, 5, 'Website', 'Confirmed'],
      ['James Carter', 4, 4, 'Airbnb', 'Confirmed'],
      ['Sofia Almeida', 9, 3, 'Booking.com', 'Pending'],
      ['Lukas Becker', 14, 7, 'Website', 'Confirmed'],
      ['Inês Rocha', 23, 2, 'Manual', 'Confirmed'],
      ['Emma Dubois', 27, 5, 'Airbnb', 'Pending'],
      ['Tiago Nunes', -12, 4, 'Booking.com', 'Completed'],
      ['Anna Kowalski', 36, 6, 'Website', 'Cancelled'],
      ['Pedro Matos', 44, 3, 'Website', 'Confirmed']
    ].map(([guest, inOff, nights, channel, status], i) => ({
      id: 1040 + i, guest, nights, channel, status,
      checkIn: addDays(today, inOff), checkOut: addDays(today, inOff + nights), total: nights * RATE
    }));
    const active = bookings.filter((b) => b.status !== 'Cancelled');

    const tasks = [
      { id: 1, title: 'Send check-in form', role: 'Owner', guest: 'James Carter', due: addDays(today, 2), done: false },
      { id: 2, title: 'Replace pool towels', role: 'Cleaning', guest: '', due: addDays(today, -1), done: false },
      { id: 3, title: 'Checkout', role: 'Owner', guest: 'Marta Lopes', due: addDays(today, 2), done: false },
      { id: 4, title: 'Cleaning', role: 'Cleaning', guest: 'Marta Lopes', due: addDays(today, 2), done: false },
      { id: 5, title: 'Welcome basket', role: 'Owner', guest: 'James Carter', due: addDays(today, 4), done: false },
      { id: 6, title: 'Garden maintenance', role: 'Maintenance', guest: '', due: addDays(today, 6), done: true }
    ];

    const state = { q: '', status: 'All', role: 'All', month: 0, rev: true, exp: true, dirty: false };

    const site = {
      kicker: 'Bem-vindos à',
      title: 'terracota',
      tagline: 'a slow living project',
      aboutTitle: 'Sobre nós',
      aboutText: 'Uma casa tradicional, renovada com tempo e cuidado, para quem quer abrandar.',
      houseTitle: 'A casa',
      houseText: 'Quartos cheios de luz, um pátio para os fins de tarde e tudo o que precisa para se sentir em casa.'
    };
    let saved = { ...site };

    const SECTIONS = [
      ['HP', 'Homepage', 'Hero, About Us, The House & Contact section.', 'homepage'],
      ['EX', 'Experiences', 'Local experiences shown to guests.'],
      ['GL', 'Gallery', 'Every photo shown across the site.'],
      ['TM', 'Testimonials', 'Guest reviews shown on the homepage.'],
      ['FQ', 'FAQs', 'Frequently asked questions.'],
      ['LC', 'Legal Content', 'Terms, privacy & house rules.'],
      ['BN', 'Booking Note', 'Message & photo shown after a booking is confirmed.']
    ];

    const field = (k, label, long) => `
      <label class="t-field"><span>${label}</span>
        ${long
          ? `<textarea class="ap-input" rows="3" data-input="site" data-k="${k}">${esc(site[k])}</textarea>`
          : `<input class="ap-input" type="text" value="${esc(site[k])}" data-input="site" data-k="${k}">`}
      </label>`;

    const preview = () => `
      <div class="t-pv__hero">
        <span class="t-pv__nav">início · sobre nós · a casa · contacto</span>
        <span class="t-pv__kicker">${esc(site.kicker)}</span>
        <b class="t-pv__title">${esc(site.title)}</b>
        <span class="t-pv__tagline">${esc(site.tagline)}</span>
      </div>
      <div class="t-pv__block">
        <b class="t-pv__h">${esc(site.aboutTitle)}</b>
        <p>${esc(site.aboutText)}</p>
        <b class="t-pv__h">${esc(site.houseTitle)}</b>
        <p>${esc(site.houseText)}</p>
      </div>`;

    const saveStatus = () => state.dirty
      ? '<span class="t-save is-dirty">Unsaved changes</span>'
      : '<span class="t-save">All changes saved</span>';
    const badge = (s) => `<span class="ap-badge ap-badge--${s.toLowerCase()}">${s}</span>`;
    const dot = (c) => `<span class="ap-dot" style="--c:${CH[c]}"></span>`;

    const taskRow = (t) => `
      <li class="ap-task${t.done ? ' is-done' : ''}">
        <label><input type="checkbox" data-act="task" data-id="${t.id}"${t.done ? ' checked' : ''}>
          <span>${esc(t.title)} | ${esc(t.role)}${t.guest ? ' | ' + esc(t.guest) : ''}</span></label>
        ${!t.done && t.due < today ? '<span class="ap-badge ap-badge--overdue">Overdue</span>' : ''}
        <time>${fmt(t.due)}</time>
      </li>`;

    function bookingRows() {
      const q = state.q.trim().toLowerCase();
      const rows = bookings
        .filter((b) => (state.status === 'All' || b.status === state.status) && (!q || b.guest.toLowerCase().includes(q) || String(b.id).includes(q)))
        .sort((a, b) => a.checkIn - b.checkIn);
      if (!rows.length) return '<tr><td colspan="7" class="ap-empty">No bookings to show.</td></tr>';
      return rows.map((b) => `
        <tr><td class="ap-muted">#${b.id}</td><td><b>${esc(b.guest)}</b></td><td>${fmt(b.checkIn)} → ${fmt(b.checkOut)}</td>
        <td>${b.nights}</td><td>${dot(b.channel)}${b.channel}</td><td>${money(b.total)}</td><td>${badge(b.status)}</td></tr>`).join('');
    }

    const screens = {
      dashboard() {
        const inHouse = active.find((b) => b.checkIn <= today && b.checkOut > today);
        const nextIn = active.filter((b) => b.checkIn > today).sort((a, b) => a.checkIn - b.checkIn)[0];
        const nextOut = active.filter((b) => b.checkOut >= today).sort((a, b) => a.checkOut - b.checkOut)[0];
        const monthCount = active.filter((b) => b.checkIn.getMonth() === today.getMonth() && b.checkIn.getFullYear() === today.getFullYear()).length;

        const rev = [3200, 4100, 6900, 7400, 5200, 2900];
        const exp = [900, 1100, 1500, 1700, 1200, 800];
        const months = rev.map((_, i) => new Date(today.getFullYear(), today.getMonth() - 5 + i, 1).toLocaleDateString('en-GB', { month: 'short' }));
        const bars = months.map((m, i) => `
          <div class="t-chart__col">
            <div class="t-chart__bars">
              ${state.rev ? `<i class="t-bar" style="--h:${rev[i] / 80}%;--c:#C2553C" title="Revenue ${money(rev[i])}"></i>` : ''}
              ${state.exp ? `<i class="t-bar" style="--h:${exp[i] / 80}%;--c:#234B6E" title="Expenses ${money(exp[i])}"></i>` : ''}
            </div><span>${m}</span>
          </div>`).join('');

        const share = { 'Website': 38, 'Airbnb': 30, 'Booking.com': 24, 'Manual': 8 };
        let acc = 0;
        const stops = Object.entries(share).map(([k, v]) => `${CH[k]} ${acc}% ${(acc += v)}%`).join(', ');

        const latest = active.filter((b) => b.checkIn >= today).sort((a, b) => a.checkIn - b.checkIn).slice(0, 4);
        const pending = tasks.filter((t) => !t.done).sort((a, b) => a.due - b.due);

        return `
          <p class="ap-crumb">Dashboard</p><h1 class="ap-h1">Dashboard</h1>
          <div class="ap-grid ap-grid--4">
            <div class="ap-card"><span class="ap-k">House status</span>${inHouse ? '<span class="ap-badge ap-badge--inhouse">In-House</span>' : '<span class="ap-badge">Available</span>'}</div>
            <div class="ap-card"><b class="ap-v">${nextIn ? fmt(nextIn.checkIn) : '—'}</b><span class="ap-k">${nextIn ? esc(nextIn.guest) + ' — Next check-in' : 'No upcoming check-ins'}</span></div>
            <div class="ap-card"><b class="ap-v">${nextOut ? fmt(nextOut.checkOut) : '—'}</b><span class="ap-k">${nextOut ? esc(nextOut.guest) + ' — Next checkout' : 'No checkouts'}</span></div>
            <div class="ap-card"><b class="ap-v">${monthCount}</b><span class="ap-k">Bookings this month</span></div>
          </div>
          <div class="ap-grid ap-grid--wide">
            <div class="ap-card">
              <h2 class="ap-h2">Revenue &amp; Expenses</h2>
              <div class="t-chart">${bars}</div>
              <div class="ap-legend">
                <button type="button" class="${state.rev ? '' : 'is-off'}" data-act="series" data-v="rev"><span class="ap-dot" style="--c:#C2553C"></span>Revenue</button>
                <button type="button" class="${state.exp ? '' : 'is-off'}" data-act="series" data-v="exp"><span class="ap-dot" style="--c:#234B6E"></span>Expenses</button>
              </div>
            </div>
            <div class="ap-card">
              <h2 class="ap-h2">Channels</h2>
              <div class="t-donut" style="background:conic-gradient(${stops})"></div>
              <div class="ap-legend">${Object.keys(share).map((k) => `<span>${dot(k)}${k} ${share[k]}%</span>`).join('')}</div>
            </div>
          </div>
          <div class="ap-grid ap-grid--2">
            <div class="ap-card">
              <h2 class="ap-h2">Upcoming bookings</h2>
              <ul class="ap-list">${latest.map((b) => `<li><span>${dot(b.channel)}<b>${esc(b.guest)}</b></span><span class="ap-muted">${fmt(b.checkIn)} · ${b.nights} nights</span></li>`).join('')}</ul>
              <button type="button" class="ap-btn ap-btn--ghost" data-screen="bookings">View all →</button>
            </div>
            <div class="ap-card">
              <h2 class="ap-h2">Pending tasks</h2>
              <ul class="ap-tasks">${pending.length ? pending.slice(0, 4).map(taskRow).join('') : '<li class="ap-empty">All done for now.</li>'}</ul>
              <button type="button" class="ap-btn ap-btn--ghost" data-screen="tasks">View all →</button>
            </div>
          </div>`;
      },

      calendar() {
        const first = new Date(today.getFullYear(), today.getMonth() + state.month, 1);
        const label = first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
        const pad = (first.getDay() + 6) % 7;
        const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
        let cells = '<div class="t-cal__cell is-pad"></div>'.repeat(pad);
        for (let n = 1; n <= days; n++) {
          const date = new Date(first.getFullYear(), first.getMonth(), n);
          const b = active.find((x) => x.checkIn <= date && x.checkOut > date);
          const showName = b && (sameDay(b.checkIn, date) || n === 1 || date.getDay() === 1);
          cells += `<div class="t-cal__cell${sameDay(date, today) ? ' is-today' : ''}"><span class="t-cal__n">${n}</span>${b ? `<span class="t-cal__stay" style="--c:${CH[b.channel]}" title="${esc(b.guest)} · ${b.channel}">${showName ? esc(b.guest) : '&nbsp;'}</span>` : ''}</div>`;
        }
        return `
          <p class="ap-crumb">Reservations</p><h1 class="ap-h1">Calendar</h1>
          <div class="ap-card">
            <div class="t-cal__head">
              <button type="button" class="ap-btn ap-btn--ghost" data-act="month" data-v="-1" ${state.month <= -1 ? 'disabled' : ''} aria-label="Previous month">←</button>
              <h2 class="ap-h2">${label}</h2>
              <button type="button" class="ap-btn ap-btn--ghost" data-act="month" data-v="1" ${state.month >= 3 ? 'disabled' : ''} aria-label="Next month">→</button>
            </div>
            <div class="t-cal">
              ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => `<span class="t-cal__wd">${d}</span>`).join('')}
              ${cells}
            </div>
            <div class="ap-legend">${Object.keys(CH).map((k) => `<span>${dot(k)}${k}</span>`).join('')}</div>
          </div>`;
      },

      bookings() {
        const chips = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled']
          .map((s) => `<button type="button" class="ap-chip${state.status === s ? ' is-on' : ''}" data-act="status" data-v="${s}">${s}</button>`).join('');
        return `
          <p class="ap-crumb">Reservations</p><h1 class="ap-h1">Booking List</h1>
          <div class="ap-toolbar">
            <input class="ap-input" type="search" placeholder="Search guest or booking id" value="${esc(state.q)}" data-input="q" aria-label="Search bookings">
            <div class="ap-chips">${chips}</div>
          </div>
          <div class="ap-card ap-card--flush"><div class="ap-scroll">
            <table class="ap-table">
              <thead><tr><th>ID</th><th>Guest</th><th>Dates</th><th>Nights</th><th>Channel</th><th>Total</th><th>Status</th></tr></thead>
              <tbody data-region="rows">${bookingRows()}</tbody>
            </table>
          </div></div>`;
      },

      website() {
        return `
          <p class="ap-crumb">Website</p><h1 class="ap-h1">Website</h1>
          <p class="ap-sub">Everything guests see on the public site, organized by section.</p>
          <div class="t-sections">
            ${SECTIONS.map(([ab, name, desc, screen]) => `
              <button type="button" class="ap-card t-section" ${screen ? `data-screen="${screen}"` : 'data-locked'}>
                <span class="t-section__ab">${ab}</span>
                <span><b>${name}</b><span class="ap-k">${desc}</span></span>
                ${screen ? '<span class="t-section__try">Try it</span>' : ''}
              </button>`).join('')}
          </div>`;
      },

      homepage() {
        return `
          <p class="ap-crumb">Website › Homepage</p><h1 class="ap-h1">Homepage</h1>
          <p class="ap-sub">Change the texts on the left and see the page update on the right.</p>
          <div class="t-editor">
            <div class="ap-card t-form">
              <h2 class="ap-h2">Hero</h2>
              ${field('kicker', 'Small title')}
              ${field('title', 'Main title')}
              ${field('tagline', 'Tagline')}
              <h2 class="ap-h2">About Us</h2>
              ${field('aboutTitle', 'Title')}
              ${field('aboutText', 'Text', true)}
              <h2 class="ap-h2">The House</h2>
              ${field('houseTitle', 'Title')}
              ${field('houseText', 'Text', true)}
              <div class="t-form__actions">
                <span data-region="sitestatus">${saveStatus()}</span>
                <button type="button" class="ap-btn ap-btn--ghost" data-act="discard">Discard</button>
                <button type="button" class="ap-btn" data-act="saveSite">Save</button>
              </div>
            </div>
            <div class="t-pv-wrap">
              <span class="ap-k">Live preview</span>
              <div class="t-pv" data-region="preview">${preview()}</div>
            </div>
          </div>`;
      },

      tasks() {
        const roles = ['All', 'Owner', 'Cleaning', 'Maintenance'];
        const list = tasks.filter((t) => state.role === 'All' || t.role === state.role).sort((a, b) => a.done - b.done || a.due - b.due);
        return `
          <p class="ap-crumb">Staff</p><h1 class="ap-h1">Tasks</h1>
          <div class="ap-toolbar">
            <div class="ap-chips">${roles.map((r) => `<button type="button" class="ap-chip${state.role === r ? ' is-on' : ''}" data-act="role" data-v="${r}">${r}</button>`).join('')}</div>
            <button type="button" class="ap-btn" data-locked>+ New task</button>
          </div>
          <div class="ap-card"><ul class="ap-tasks">${list.map(taskRow).join('')}</ul></div>`;
      }
    };

    return {
      title: 'Terracota · Plataforma de gestão',
      start: 'dashboard',
      topbar: `
        <div class="t-top">
          <input class="t-search" type="search" placeholder="Search guests or bookings" data-input="topq" aria-label="Search guests or bookings">
          <span class="t-top__user">Admin <span class="t-avatar">T</span></span>
        </div>`,
      sideFoot: '<div class="ap-side__foot"><button type="button" data-locked>← View website</button></div>',
      nav: [
        { label: 'Dashboard', screen: 'dashboard', top: true },
        { group: 'Reservations', items: [{ label: 'Calendar', screen: 'calendar' }, { label: 'Booking List', screen: 'bookings' }, { label: 'Check-ins' }, { label: 'Clients' }] },
        { group: 'Pricing', items: [{ label: 'Rates' }, { label: 'Seasonal Rates' }] },
        { group: 'Finance', items: [{ label: 'Payments' }, { label: 'Expenses' }] },
        { group: 'Staff', items: [{ label: 'Tasks', screen: 'tasks' }] },
        { label: 'Messages', top: true },
        { label: 'Reports', top: true },
        { label: 'Website', screen: 'website', top: true },
        { label: 'Settings', top: true }
      ],
      parent: { homepage: 'website' },
      screens,
      act(name, el) {
        if (name === 'task') {
          const t = tasks.find((x) => x.id === +el.dataset.id);
          t.done = !t.done;
          renderMain(true);
        } else if (name === 'status') { state.status = el.dataset.v; renderMain(true); }
        else if (name === 'role') { state.role = el.dataset.v; renderMain(true); }
        else if (name === 'month') { state.month += +el.dataset.v; renderMain(true); }
        else if (name === 'series') { state[el.dataset.v] = !state[el.dataset.v]; renderMain(true); }
        else if (name === 'saveSite') {
          saved = { ...site };
          state.dirty = false;
          region('sitestatus', saveStatus());
          toast('Guardado. No site real, a homepage atualizava logo.');
        } else if (name === 'discard') {
          Object.assign(site, saved);
          state.dirty = false;
          renderMain(true);
        }
      },
      input(name, el) {
        if (name === 'site') {
          site[el.dataset.k] = el.value;
          state.dirty = true;
          region('preview', preview());
          region('sitestatus', saveStatus());
          return;
        }
        state.q = el.value;
        if (name === 'topq' && current.screen !== 'bookings') {
          current.screen = 'bookings';
          renderMain();
          return;
        }
        if (name === 'topq') { const inner = appEl.querySelector('[data-input="q"]'); if (inner) inner.value = el.value; }
        region('rows', bookingRows());
      }
    };
  }

  function makeDrogaria() {
    const CATS = ['Tintas e silicones', 'Colas', 'Construção', 'Ferragens', 'Ferramentas', 'Jardim e piscinas', 'Casa', 'Pesca', 'Canalização', 'Eletricidade', 'Diversos'];
    const DAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    const now = () => new Date();
    const minsAgo = (m) => new Date(Date.now() - m * 60000);

    let nextId = 1;
    const items = [
      ['Lâmpada LED E27 9 W', 'Eletricidade', true, true],
      ['Cola branca 250 g', 'Colas', true, true],
      ['Silicone transparente 280 ml', 'Tintas e silicones', true, true],
      ['Pincel plano 50 mm', 'Tintas e silicones', true, false],
      ['Tinta plástica branca 5 L', 'Tintas e silicones', true, true],
      ['Cola de contacto 125 ml', 'Colas', true, false],
      ['Cimento-cola 25 kg', 'Construção', true, true],
      ['Parafusos para madeira 4×40 (100 un.)', 'Ferragens', true, false],
      ['Dobradiça de latão 50 mm', 'Ferragens', false, false],
      ['Martelo de unha 500 g', 'Ferramentas', true, true],
      ['Mangueira de jardim 15 m', 'Jardim e piscinas', true, true],
      ['Cloro em pastilhas 1 kg', 'Jardim e piscinas', true, false],
      ['Anzóis n.º 8 (10 un.)', 'Pesca', true, false],
      ['Torneira de esquadria ½"', 'Canalização', true, true],
      ['Fita isoladora 19 mm', 'Eletricidade', true, false]
    ].map(([name, cat, visible, photo], i) => ({ id: nextId++, name, cat, visible, photo, updated: minsAgo(8 + i * 41) }));

    const hours = DAYS.map((day, i) => ({
      day,
      open: i >= 2,
      from: '09:00',
      to: i === 6 ? '13:00' : '19:00'
    }));

    const activity = [
      { text: 'Início de sessão', when: minsAgo(3) },
      { text: 'Alterou “Lâmpada LED E27 9 W”', when: minsAgo(8) },
      { text: 'Alterou “Cola branca 250 g”', when: minsAgo(49) },
      { text: 'Criou “Silicone transparente 280 ml”', when: minsAgo(90) },
      { text: 'Alterou o horário de sábado', when: minsAgo(60 * 26) },
      { text: 'Ocultou “Dobradiça de latão 50 mm”', when: minsAgo(60 * 50) }
    ];
    const log = (text) => activity.unshift({ text, when: now() });

    const state = { closedToday: false, q: '', cat: '', adding: false };

    const toMin = (s) => +s.slice(0, 2) * 60 + +s.slice(3, 5);
    const h = (s) => s.replace(':', 'h');
    const ago = (dt) => {
      const m = Math.round((Date.now() - dt) / 60000);
      if (m < 1) return 'agora';
      if (m < 60) return `há ${m} min`;
      return dt.toLocaleDateString('pt-PT') + ' ' + dt.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    };

    function shopStatus() {
      const n = now();
      const t = n.getHours() * 60 + n.getMinutes();
      const d = hours[n.getDay()];
      if (!state.closedToday && d.open && t >= toMin(d.from) && t < toMin(d.to)) {
        return { open: true, text: 'Aberto agora', sub: `Fecha às ${h(d.to)}` };
      }
      for (let k = 0; k < 8; k++) {
        const idx = (n.getDay() + k) % 7;
        const x = hours[idx];
        if (!x.open) continue;
        if (k === 0 && (state.closedToday || t >= toMin(x.from))) continue;
        const when = k === 0 ? 'hoje' : k === 1 ? 'amanhã' : DAYS[idx];
        return { open: false, text: state.closedToday ? 'Fechado hoje' : 'Fechado agora', sub: `Abre ${when} às ${h(x.from)}` };
      }
      return { open: false, text: 'Fechado', sub: 'Sem horário definido' };
    }

    function itemRows() {
      const q = state.q.trim().toLowerCase();
      const rows = items.filter((it) => (!state.cat || it.cat === state.cat) && (!q || it.name.toLowerCase().includes(q)));
      if (!rows.length) return '<tr><td colspan="4" class="ap-empty">Nenhum artigo encontrado.</td></tr>';
      return rows.map((it) => `
        <tr class="${it.visible ? '' : 'is-hidden'}">
          <td><b>${esc(it.name)}</b></td>
          <td class="ap-muted">${esc(it.cat)}</td>
          <td>${it.photo ? '<span class="ap-badge ap-badge--confirmed">Com foto</span>' : '<span class="ap-badge">Sem foto</span>'}</td>
          <td><button type="button" class="ap-switch" role="switch" aria-checked="${it.visible}" aria-label="Visível no site: ${esc(it.name)}" data-act="vis" data-id="${it.id}"></button></td>
        </tr>`).join('');
    }

    const screens = {
      painel() {
        const s = shopStatus();
        const hr = now().getHours();
        const hello = hr < 12 ? 'Bom dia' : hr < 20 ? 'Boa tarde' : 'Boa noite';
        const visible = items.filter((i) => i.visible).length;
        const recent = [...items].sort((a, b) => b.updated - a.updated).slice(0, 6);
        return `
          <h1 class="ap-h1 d-hello">${hello}</h1>
          <p class="ap-sub">O que quer atualizar hoje?</p>
          <div class="ap-grid ap-grid--4">
            <button type="button" class="ap-card d-quick is-primary" data-act="new">${icon('M12 5v14M5 12h14')}<b>Novo artigo</b><span>Adicionar ao catálogo</span></button>
            <button type="button" class="ap-card d-quick" data-locked>${icon('M20 12l-8 8-9-9V3h8l9 9zM7.5 7.5h.01')}<b>Promoção</b><span>Nenhuma ativa</span></button>
            <button type="button" class="ap-card d-quick" data-screen="horario">${icon('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2')}<b>Horário</b><span>${s.sub}</span></button>
            <button type="button" class="ap-card d-quick" data-locked>${icon('M5 5h14M12 5v14M9 19h6')}<b>Contactos e textos</b><span>Telefone, morada, fotos</span></button>
          </div>
          <div class="ap-grid ap-grid--2">
            <div class="ap-card">
              <h2 class="ap-h2">Hoje na loja</h2>
              <p class="d-status"><span class="d-status__dot${s.open ? ' is-open' : ''}"></span>${s.text}</p>
              <p class="ap-muted">${s.sub}</p>
              <button type="button" class="ap-btn ap-btn--ghost" data-act="closeToday">${state.closedToday ? 'Reabrir hoje' : 'Fechar hoje (imprevisto)'}</button>
            </div>
            <div class="ap-card">
              <h2 class="ap-h2">Catálogo</h2>
              <div class="d-stats">
                <div><b>${visible}</b><span>artigos visíveis</span></div>
                <div><b>${items.length - visible}</b><span>ocultos</span></div>
                <div><b>${items.filter((i) => !i.photo).length}</b><span>sem foto</span></div>
              </div>
            </div>
          </div>
          <div class="ap-grid ap-grid--2">
            <div class="ap-card">
              <h2 class="ap-h2">Últimos artigos alterados</h2>
              <ul class="ap-list">${recent.map((i) => `<li><span>${esc(i.name)}</span><span class="ap-muted">${esc(i.cat)}</span></li>`).join('')}</ul>
              <button type="button" class="ap-btn ap-btn--ghost" data-screen="artigos">Ver artigos →</button>
            </div>
            <div class="ap-card">
              <h2 class="ap-h2">Atividade recente</h2>
              <ul class="ap-list">${activity.slice(0, 6).map((a) => `<li><span>${esc(a.text)}</span><span class="ap-muted">${ago(a.when)}</span></li>`).join('')}</ul>
            </div>
          </div>`;
      },

      artigos() {
        return `
          <h1 class="ap-h1">Artigos</h1>
          <p class="ap-sub">${items.length} artigos no catálogo</p>
          <div class="ap-toolbar">
            <input class="ap-input" type="search" placeholder="Procurar artigo" value="${esc(state.q)}" data-input="q" aria-label="Procurar artigo">
            <select class="ap-input" data-input="cat" aria-label="Filtrar por categoria">
              <option value="">Todas as categorias</option>
              ${CATS.map((c) => `<option${state.cat === c ? ' selected' : ''}>${c}</option>`).join('')}
            </select>
            <button type="button" class="ap-btn" data-act="new">+ Novo artigo</button>
          </div>
          ${state.adding ? `
            <div class="ap-card d-new">
              <input class="ap-input" type="text" id="d-new-name" placeholder="Nome do artigo" aria-label="Nome do artigo">
              <select class="ap-input" id="d-new-cat" aria-label="Categoria">${CATS.map((c) => `<option>${c}</option>`).join('')}</select>
              <button type="button" class="ap-btn" data-act="save">Guardar</button>
              <button type="button" class="ap-btn ap-btn--ghost" data-act="cancel">Cancelar</button>
            </div>` : ''}
          <div class="ap-card ap-card--flush"><div class="ap-scroll">
            <table class="ap-table">
              <thead><tr><th>Artigo</th><th>Categoria</th><th>Foto</th><th>Visível no site</th></tr></thead>
              <tbody data-region="rows">${itemRows()}</tbody>
            </table>
          </div></div>`;
      },

      horario() {
        const order = [1, 2, 3, 4, 5, 6, 0];
        return `
          <h1 class="ap-h1">Horário</h1>
          <p class="ap-sub">É este o horário que os clientes veem no site.</p>
          <div class="ap-card ap-card--flush"><div class="ap-scroll">
            <table class="ap-table d-hours">
              <thead><tr><th>Dia</th><th>Aberto</th><th>Abre</th><th>Fecha</th></tr></thead>
              <tbody>${order.map((i) => { const x = hours[i]; return `
                <tr class="${x.open ? '' : 'is-hidden'}">
                  <td><b>${x.day[0].toUpperCase() + x.day.slice(1)}</b></td>
                  <td><button type="button" class="ap-switch" role="switch" aria-checked="${x.open}" aria-label="Aberto à ${x.day}" data-act="day" data-i="${i}"></button></td>
                  <td><input class="ap-input" type="time" value="${x.from}" data-input="from" data-i="${i}" ${x.open ? '' : 'disabled'} aria-label="Abre à ${x.day}"></td>
                  <td><input class="ap-input" type="time" value="${x.to}" data-input="to" data-i="${i}" ${x.open ? '' : 'disabled'} aria-label="Fecha à ${x.day}"></td>
                </tr>`; }).join('')}</tbody>
            </table>
          </div></div>
          <div class="ap-card d-today">
            <div><b>Hoje: ${shopStatus().text}</b><span class="ap-muted">${shopStatus().sub}</span></div>
            <button type="button" class="ap-btn ap-btn--ghost" data-act="closeToday">${state.closedToday ? 'Reabrir hoje' : 'Fechar hoje (imprevisto)'}</button>
          </div>`;
      }
    };

    return {
      title: 'Drogaria Paixão · Plataforma de gestão',
      start: 'painel',
      sideFoot: '<div class="ap-side__foot"><button type="button" data-locked>Ver o site</button><button type="button" data-locked>Sair</button></div>',
      nav: [
        { label: 'Painel', screen: 'painel', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
        { label: 'Artigos', screen: 'artigos', icon: 'M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8' },
        { label: 'Categorias', icon: 'M4 6h16M4 12h16M4 18h16' },
        { label: 'Promoções', icon: 'M20 12l-8 8-9-9V3h8l9 9zM7.5 7.5h.01' },
        { label: 'Horário', screen: 'horario', icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2' },
        { label: 'Contactos e textos', icon: 'M5 5h14M12 5v14M9 19h6' },
        { label: 'Importar / exportar', icon: 'M12 3v12M7 10l5 5 5-5M4 21h16' },
        { label: 'Utilizadores', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8' },
        { label: 'Atividade', icon: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2' }
      ],
      screens,
      act(name, el) {
        if (name === 'new') {
          state.adding = true;
          current.screen = 'artigos';
          renderMain();
          const f = appEl.querySelector('#d-new-name');
          if (f) f.focus();
        } else if (name === 'cancel') {
          state.adding = false;
          renderMain(true);
        } else if (name === 'save') {
          const nameEl = appEl.querySelector('#d-new-name');
          const val = nameEl.value.trim();
          if (!val) { toast('Escreve o nome do artigo.'); nameEl.focus(); return; }
          items.unshift({ id: nextId++, name: val, cat: appEl.querySelector('#d-new-cat').value, visible: true, photo: false, updated: now() });
          log(`Criou “${val}”`);
          state.adding = false;
          renderMain(true);
          toast('Artigo criado. Já aparece no painel e na atividade.');
        } else if (name === 'vis') {
          const it = items.find((x) => x.id === +el.dataset.id);
          it.visible = !it.visible;
          it.updated = now();
          log(`${it.visible ? 'Mostrou' : 'Ocultou'} “${it.name}”`);
          region('rows', itemRows());
        } else if (name === 'closeToday') {
          state.closedToday = !state.closedToday;
          log(state.closedToday ? 'Fechou a loja hoje (imprevisto)' : 'Reabriu a loja hoje');
          renderMain(true);
        } else if (name === 'day') {
          const x = hours[+el.dataset.i];
          x.open = !x.open;
          log(`Alterou o horário de ${x.day}`);
          renderMain(true);
        }
      },
      input(name, el) {
        if (name === 'q' || name === 'cat') {
          state[name] = el.value;
          region('rows', itemRows());
        } else if ((name === 'from' || name === 'to') && el.value) {
          hours[+el.dataset.i][name] = el.value;
        }
      }
    };
  }

  function makeContas() {
    const CAT = {
      'Casa': '#94512F', 'Restauração': '#E06B3F', 'Supermercado': '#5E8C61', 'Compras': '#E5A93A',
      'Transportes': '#3D6FD1', 'Subscrições': '#7E5AA8', 'Lazer': '#3FA3A0', 'Outros': '#A3A6A1', 'Rendimentos': '#3E6E50'
    };
    const ORIG = { conta: 'Conta à ordem', cartao: 'Cartão refeição' };
    const eur = (n) => n.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    const months = [2, 1, 0].map((k) => new Date(today.getFullYear(), today.getMonth() - k, 1));
    const monthLabel = (d, o = { month: 'long', year: 'numeric' }) => d.toLocaleDateString('pt-PT', o);

    const TEMPLATE = [
      ['TRF RECEBIDA', 'Rendimentos', 'conta', 500, 25],
      ['CARREGAMENTO CARTAO REFEICAO', 'Rendimentos', 'cartao', 60, 1],
      ['RENDA CASA', 'Casa', 'conta', -450, 1],
      ['DD ELETRICIDADE', 'Casa', 'conta', -38.4, 6, [1.2, 1, .9]],
      ['DD AGUA MUNICIPAL', 'Casa', 'conta', -21.9, 9],
      ['INTERNET FIBRA', 'Subscrições', 'conta', -34.99, 3],
      ['SUBSCRICAO STREAMING', 'Subscrições', 'conta', -11.99, 12],
      ['GINASIO', 'Lazer', 'conta', -29.9, 2],
      ['COMPRA SUPERMERCADO CENTRAL', 'Supermercado', 'conta', -62.3, 5, [1, 1.1, .9]],
      ['COMPRA MERCADO DO BAIRRO', 'Supermercado', 'cartao', -18.75, 11],
      ['COMPRA SUPERMERCADO CENTRAL', 'Supermercado', 'conta', -44.1, 19, [.9, 1.2, 1]],
      ['PADARIA DA ESQUINA', 'Restauração', 'cartao', -6.8, 8],
      ['ALMOCO CANTINA', 'Restauração', 'cartao', -7.5, 7],
      ['ALMOCO CANTINA', 'Restauração', 'cartao', -7.5, 15, [1, 1, 1.4]],
      ['COMPRA SNACK BAR', 'Restauração', 'cartao', -8.4, 21],
      ['COMPRA MINIMERCADO', 'Supermercado', 'cartao', -23.6, 27, [1, .8, 1.2]],
      ['COMPRA CAFE DO LARGO', 'Restauração', 'cartao', -12.5, 14, [.6, 1, 1.8]],
      ['COMPRA RESTAURANTE MARE', 'Restauração', 'conta', -31.4, 20, [.5, 1, 2.1]],
      ['COMPRA COMBUSTIVEL', 'Transportes', 'conta', -50, 10, [1, 1.2, .8]],
      ['PASSE MENSAL', 'Transportes', 'conta', -40, 1],
      ['COMPRA LIVRARIA', 'Compras', 'conta', -24.5, 16, [.4, 1, 1.5]],
      ['COMPRA LOJA DESPORTO', 'Compras', 'conta', -59.99, 22, [0, 1, 1.3]],
      ['COMPRA FARMACIA', 'Outros', 'conta', -14.2, 17, [1, .5, 1.6]],
      ['CINEMA', 'Lazer', 'conta', -13, 26, [1, 2, 1]]
    ];

    const EXP_SCALE = 0.42;
    let nextId = 1;
    const txs = [];
    months.forEach((m, mi) => {
      TEMPLATE.forEach(([desc, cat, orig, val, day, f]) => {
        const amount = Math.round(val * (f ? f[mi] : 1) * (val < 0 ? EXP_SCALE : 1) * 100) / 100;
        if (!amount) return;
        txs.push({ id: nextId++, m: mi, date: new Date(m.getFullYear(), m.getMonth(), day), desc, cat, orig, amount, manual: false });
      });
    });

    const state = { period: 2, q: '', cat: '', orig: '' };
    const inMonth = (mi) => txs.filter((t) => t.m === mi);
    const expenses = (mi, orig) => -inMonth(mi).filter((t) => t.amount < 0 && (!orig || t.orig === orig)).reduce((s, t) => s + t.amount, 0);
    const income = (mi) => inMonth(mi).filter((t) => t.amount > 0 && t.orig === 'conta').reduce((s, t) => s + t.amount, 0);
    const byCat = (mi) => {
      const o = {};
      inMonth(mi).filter((t) => t.amount < 0).forEach((t) => { o[t.cat] = (o[t.cat] || 0) - t.amount; });
      return o;
    };

    const periodSelect = () => `
      <label class="c-period"><span>Período</span>
        <select class="ap-input" data-input="period" aria-label="Período">
          ${months.map((m, i) => `<option value="${i}"${state.period === i ? ' selected' : ''}>${monthLabel(m)}</option>`).join('')}
        </select>
      </label>`;

    function txRows() {
      const q = state.q.trim().toLowerCase();
      const rows = inMonth(state.period)
        .filter((t) => (!state.cat || t.cat === state.cat) && (!state.orig || t.orig === state.orig) && (!q || t.desc.toLowerCase().includes(q)))
        .sort((a, b) => b.date - a.date);
      if (!rows.length) return '<tr><td colspan="5" class="ap-empty">Nenhum movimento encontrado.</td></tr>';
      return rows.map((t) => `
        <tr>
          <td>${t.date.toLocaleDateString('pt-PT')}</td>
          <td>${esc(t.desc)}</td>
          <td><span class="c-orig c-orig--${t.orig}">${ORIG[t.orig]}</span></td>
          <td><select class="ap-input c-cat" data-input="setcat" data-id="${t.id}" aria-label="Categoria de ${esc(t.desc)}">
            ${Object.keys(CAT).map((c) => `<option${c === t.cat ? ' selected' : ''}>${c}</option>`).join('')}
          </select>${t.manual ? '<span class="c-manual">manual</span>' : ''}</td>
          <td class="c-amount${t.amount > 0 ? ' is-pos' : ''}">${t.amount > 0 ? '+' : ''}${eur(t.amount)}</td>
        </tr>`).join('');
    }

    const screens = {
      resumo() {
        const p = state.period;
        const exp = expenses(p), inc = income(p), meal = expenses(p, 'cartao');
        const prev = p > 0 ? expenses(p - 1) : null;
        const diff = prev ? Math.round((exp / prev - 1) * 100) : null;
        const saldo = inc - expenses(p, 'conta');

        const max = 600;
        const bars = months.map((m, i) => {
          const conta = expenses(i, 'conta'), cart = expenses(i, 'cartao');
          return `
            <button type="button" class="c-bar${i === p ? ' is-on' : ''}" data-act="period" data-v="${i}" aria-label="Ver ${monthLabel(m)}">
              <span class="c-bar__stack">
                <i class="c-bar__inc" style="bottom:${income(i) / max * 100}%"></i>
                <i style="height:${cart / max * 100}%;background:#D9913F"></i>
                <i style="height:${conta / max * 100}%;background:#3E6E50"></i>
              </span>
              <span class="c-bar__label">${monthLabel(m, { month: 'short', year: '2-digit' })}</span>
            </button>`;
        }).join('');

        const cats = byCat(p);
        const prevAvg = (c) => { const ps = [0, 1, 2].filter((i) => i < p); return ps.length ? ps.reduce((s, i) => s + (byCat(i)[c] || 0), 0) / ps.length : null; };
        const catRows = Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([c, v]) => {
          const avg = prevAvg(c);
          let delta = '';
          if (avg) {
            const d = Math.round((v / avg - 1) * 100);
            if (Math.abs(d) >= 15) delta = d > 0 ? `<span class="c-up">▲ ${d}% vs média</span>` : `<span class="c-down">▼ ${-d}% vs média</span>`;
          } else if (avg === 0) delta = '<span class="ap-muted">novo este mês</span>';
          return `
            <li class="c-catrow">
              <div><span>${c}</span><b>${eur(v)}</b></div>
              <span class="c-track"><i style="width:${v / exp * 100}%;background:${CAT[c]}"></i></span>
              <small>${(v / exp * 100).toFixed(1)}% ${delta}</small>
            </li>`;
        }).join('');

        const top = inMonth(p).filter((t) => t.amount < 0).sort((a, b) => a.amount - b.amount).slice(0, 5);

        return `
          <div class="c-head">
            <div><h1 class="ap-h1">Livro de Contas</h1><p class="ap-sub">Conta à ordem e cartão refeição. Dados cifrados, guardados só neste dispositivo.</p></div>
            ${periodSelect()}
          </div>
          <div class="ap-card c-kpis">
            <div><span class="ap-k">Despesas</span><b class="ap-v">${eur(exp)}</b><span class="ap-k">${diff === null ? 'primeiro mês' : `<span class="${diff > 0 ? 'c-up' : 'c-down'}">${diff > 0 ? '+' : ''}${diff}%</span> vs mês anterior`}</span></div>
            <div><span class="ap-k">Receitas</span><b class="ap-v">${eur(inc)}</b><span class="ap-k">sem transferências</span></div>
            <div><span class="ap-k">Saldo do período</span><b class="ap-v c-pos">${eur(saldo)}</b><span class="ap-k">poupança de ${Math.round(saldo / inc * 100)}%</span></div>
            <div><span class="ap-k">Cartão refeição gasto</span><b class="ap-v">${eur(meal)}</b><span class="ap-k">carregado ${eur(inMonth(p).filter((t) => t.orig === 'cartao' && t.amount > 0).reduce((s, t) => s + t.amount, 0))}</span></div>
          </div>
          <div class="ap-grid ap-grid--wide">
            <div class="ap-card">
              <h2 class="ap-h2">Despesas por mês</h2>
              <div class="c-chart">${bars}</div>
              <div class="ap-legend"><span><span class="ap-dot" style="--c:#3E6E50"></span>Conta</span><span><span class="ap-dot" style="--c:#D9913F"></span>Refeição</span><span><span class="c-legend-line"></span>Receitas</span></div>
              <h2 class="ap-h2 c-top-title">Top 5 despesas · ${monthLabel(months[p])}</h2>
              <ul class="ap-list">${top.map((t) => `<li><span>${esc(t.desc)}<br><small class="ap-muted"><span class="ap-dot" style="--c:${CAT[t.cat]}"></span>${t.cat}</small></span><span>${eur(t.amount)}</span></li>`).join('')}</ul>
            </div>
            <div class="ap-card">
              <h2 class="ap-h2">Por categoria</h2>
              <ul class="c-cats">${catRows}</ul>
              <button type="button" class="ap-btn ap-btn--ghost" data-screen="movimentos">Ver movimentos →</button>
            </div>
          </div>`;
      },

      movimentos() {
        const list = inMonth(state.period);
        const total = list.reduce((s, t) => s + t.amount, 0);
        return `
          <div class="c-head">
            <div><h1 class="ap-h1">Movimentos</h1><p class="ap-sub">${list.length} movimentos · saldo ${eur(total)} · muda a categoria e o resumo atualiza</p></div>
            ${periodSelect()}
          </div>
          <div class="ap-toolbar">
            <input class="ap-input" type="search" placeholder="Procurar descrição…" value="${esc(state.q)}" data-input="q" aria-label="Procurar movimentos">
            <select class="ap-input" data-input="cat" aria-label="Filtrar por categoria">
              <option value="">Todas as categorias</option>
              ${Object.keys(CAT).map((c) => `<option${state.cat === c ? ' selected' : ''}>${c}</option>`).join('')}
            </select>
            <select class="ap-input" data-input="orig" aria-label="Filtrar por origem">
              <option value="">Todas as origens</option>
              ${Object.entries(ORIG).map(([k, v]) => `<option value="${k}"${state.orig === k ? ' selected' : ''}>${v}</option>`).join('')}
            </select>
            <button type="button" class="ap-btn" data-locked>Adicionar movimento</button>
          </div>
          <div class="ap-card ap-card--flush"><div class="ap-scroll">
            <table class="ap-table">
              <thead><tr><th>Data</th><th>Descrição</th><th>Origem</th><th>Categoria</th><th>Montante</th></tr></thead>
              <tbody data-region="rows">${txRows()}</tbody>
            </table>
          </div></div>`;
      }
    };

    return {
      title: 'Livro de Contas · Projeto pessoal',
      start: 'resumo',
      nav: [
        { label: 'Resumo', screen: 'resumo' },
        { label: 'Movimentos', screen: 'movimentos' },
        { label: 'Importações' },
        { label: 'Categorias' },
        { label: 'Regras de categorização' },
        { label: 'Cópia de segurança' },
        { label: 'Segurança' }
      ],
      screens,
      act(name, el) {
        if (name === 'period') { state.period = +el.dataset.v; renderMain(true); }
      },
      input(name, el) {
        if (name === 'period') { state.period = +el.value; renderMain(true); }
        else if (name === 'setcat') {
          const t = txs.find((x) => x.id === +el.dataset.id);
          t.cat = el.value;
          t.manual = true;
          region('rows', txRows());
          toast('Categoria alterada. O resumo já tem isto em conta.');
        } else {
          state[name] = el.value;
          region('rows', txRows());
        }
      }
    };
  }

  const demos = { terracota: makeTerracota(), drogaria: makeDrogaria(), contas: makeContas() };

  appEl.addEventListener('click', (e) => {
    const t = e.target.closest('[data-screen], [data-locked], [data-act]');
    if (!t || !current) return;
    if (t.dataset.screen) { current.screen = t.dataset.screen; renderMain(); }
    else if (t.hasAttribute('data-locked')) toast(LOCKED);
    else current.act(t.dataset.act, t, e);
  });

  const onInput = (e) => {
    const t = e.target.closest('[data-input]');
    if (t && current && current.input) current.input(t.dataset.input, t);
  };
  appEl.addEventListener('input', onInput);

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) { dialog.close(); return; }
    if (e.target.closest('[data-close]')) dialog.close();
  });
  dialog.querySelector('.demo__close').addEventListener('click', () => dialog.close());

  dialog.addEventListener('close', () => {
    root.classList.remove('demo-open');
    if (location.hash.startsWith('#demo-') && history.replaceState) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  });

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-demo]');
    if (!t) return;
    e.preventDefault();
    open(t.dataset.demo);
  });

  const fromHash = () => { if (location.hash.startsWith('#demo-')) open(location.hash.slice(6)); };
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
