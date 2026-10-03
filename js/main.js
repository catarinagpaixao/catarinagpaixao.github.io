(function () {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const sections = Array.from(document.querySelectorAll('.section'));
  const dots = Array.from(document.querySelectorAll('.dots__item'));
  const navLinks = Array.from(document.querySelectorAll('.nav__links a'));
  const counterNum = document.querySelector('.counter__num');
  const progressBar = document.querySelector('.progress__bar');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.add('js');

  sections.forEach((section) => {
    section.querySelectorAll('[data-reveal]').forEach((el, i) => {
      el.style.setProperty('--i', i);
    });
  });

  let activeIndex = -1;

  function setActive(index) {
    if (index === activeIndex || index < 0) return;
    const prev = activeIndex;
    activeIndex = index;
    const section = sections[index];
    const id = section.id;

    sections.forEach((s, i) => s.classList.toggle('is-active', i === index));

    dots.forEach((d) => d.classList.toggle('is-active', d.getAttribute('href') === '#' + id));
    navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));

    body.classList.toggle('on-dark', section.dataset.theme === 'dark');
    body.classList.toggle('is-tinted', index % 2 === 1 && section.dataset.theme !== 'dark');

    updateCounter(index, prev);

    if (prev !== -1 && history.replaceState) {
      history.replaceState(null, '', id === 'inicio' ? location.pathname : '#' + id);
    }
  }

  function updateCounter(index, prev) {
    if (!counterNum) return;
    const next = String(index + 1).padStart(2, '0');
    if (prev === -1 || reduceMotion) { counterNum.textContent = next; return; }
    counterNum.classList.remove('is-in');
    counterNum.classList.add('is-out');
    setTimeout(() => {
      counterNum.textContent = next;
      counterNum.classList.remove('is-out');
      void counterNum.offsetWidth;
      counterNum.classList.add('is-in');
    }, 300);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(sections.indexOf(entry.target));
    });
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
  sections.forEach((s) => io.observe(s));

  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio >= 0.2 || (entry.isIntersecting && entry.intersectionRect.height > window.innerHeight * 0.2)) {
        entry.target.classList.add('is-revealed');
      } else if (!entry.isIntersecting) {
        entry.target.classList.remove('is-revealed');
      }
    });
  }, { threshold: [0, 0.05, 0.2, 0.4] });
  sections.forEach((s) => revealIO.observe(s));

  let ticking = false;

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  function onScroll() {
    const vh = window.innerHeight;
    const max = root.scrollHeight - vh;
    const y = window.scrollY;

    if (progressBar) progressBar.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);

    if (!reduceMotion) {
      sections.forEach((section, i) => {
        const rect = section.getBoundingClientRect();
        const enter = clamp(1 - rect.top / vh, 0, 1);
        const leave = i === sections.length - 1 ? 0 : clamp((vh - rect.bottom) / vh, 0, 1);
        section.style.setProperty('--enter', enter.toFixed(3));
        section.style.setProperty('--leave', leave.toFixed(3));
      });
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  const filters = Array.from(document.querySelectorAll('.filter'));
  const projects = Array.from(document.querySelectorAll('.project'));

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const kind = btn.dataset.filter;
      filters.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      let n = 0;
      projects.forEach((p) => {
        const show = kind === 'todos' || p.dataset.kind === kind;
        p.classList.toggle('is-hidden', !show);
        if (p.dataset.wide === undefined && p.classList.contains('project--wide')) p.dataset.wide = '1';
        if (p.dataset.wide) p.classList.toggle('project--wide', kind === 'todos');
        p.classList.remove('is-flip');
        if (show && !reduceMotion) {
          p.style.setProperty('--fi', n++);
          void p.offsetWidth;
          p.classList.add('is-flip');
        }
      });
    });
  });

  const qas = Array.from(document.querySelectorAll('.qa'));
  qas.forEach((qa) => {
    qa.addEventListener('toggle', () => {
      if (qa.open) qas.forEach((o) => { if (o !== qa) o.open = false; });
    });
  });

  const form = document.querySelector('.form');
  if (form) {
    const status = form.querySelector('.form__status');
    const label = form.querySelector('.btn__label');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.className = 'form__status';

      if (form.action.includes('SEU_ID_FORMSPREE')) {
        status.textContent = 'Formulário ainda não configurado — vê o README.md (passo do Formspree).';
        status.classList.add('is-err');
        return;
      }

      label.textContent = 'A enviar…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) throw new Error('Erro no envio');
        form.reset();
        status.textContent = 'Obrigada! Recebi a tua mensagem e respondo em breve.';
        status.classList.add('is-ok');
      } catch (err) {
        status.textContent = 'Não foi possível enviar. Tenta de novo ou escreve-me por email.';
        status.classList.add('is-err');
      } finally {
        label.textContent = 'Enviar mensagem';
      }
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
