(() => {
  'use strict';

  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const root = document.documentElement;
  const body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(pointer: coarse)').matches;

  /* ---------- pequenos elementos criados pelo JS ---------- */
  const progress = document.createElement('div');
  progress.className = 'js-scroll-progress';
  progress.innerHTML = '<span></span>';
  body.append(progress);

  const toast = document.createElement('div');
  toast.className = 'js-toast';
  toast.setAttribute('role', 'status');
  body.append(toast);

  const topBtn = document.createElement('button');
  topBtn.className = 'js-back-top';
  topBtn.type = 'button';
  topBtn.textContent = '↑';
  topBtn.setAttribute('aria-label', 'Voltar ao topo');
  body.append(topBtn);

  const loader = $('.js-loader');
  const loaderBar = $('.loader-track i', loader);
  const loaderPct = $('.loader-percent', loader);

  /* ---------- preloader ---------- */
  if (loader && loaderBar && loaderPct) {
    let p = 0;
    const timer = setInterval(() => {
      p += reduce ? 100 : Math.max(2, Math.round(Math.random() * 8));
      p = Math.min(100, p);
      loaderBar.style.width = `${p}%`;
      loaderPct.textContent = `${p}%`;
      if (p >= 100) {
        clearInterval(timer);
        loader.classList.add('done');
        setTimeout(() => loader.remove(), reduce ? 0 : 700);
      }
    }, reduce ? 10 : 35);
  }

  /* ---------- menu + scroll ---------- */
  const header = $('.site-header');
  const nav = $('.main-nav');
  const menu = $('.menu-toggle');
  const navLinks = $$('.main-nav a[href^="#"]');

  const closeMenu = () => {
    nav?.classList.remove('open-mobile');
    menu?.classList.remove('is-open');
    menu?.setAttribute('aria-expanded', 'false');
    body.classList.remove('menu-open');
    if (menu) menu.textContent = '☰';
  };

  menu?.addEventListener('click', () => {
    const open = !nav.classList.contains('open-mobile');
    nav.classList.toggle('open-mobile', open);
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    body.classList.toggle('menu-open', open);
    menu.textContent = open ? '×' : '☰';
  });

  navLinks.forEach(link => link.addEventListener('click', e => {
    const target = $(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }));

  /* ---------- reveal ---------- */
  const reveals = $$('section .hero-content, section .code-window, section .profile-frame, section .about-copy, section .about-highlights > div, section .center-heading, .skill-card, .project-card, .social-card, .contact-copy, .contact-form');
  reveals.forEach((el, i) => {
    el.classList.add('js-reveal');
    el.style.setProperty('--reveal-delay', `${Math.min(i * 45, 260)}ms`);
  });

  if (reduce) reveals.forEach(el => el.classList.add('is-visible'));
  else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -70px' });
    reveals.forEach(el => revealObserver.observe(el));
  }

  /* ---------- navegação ativa ---------- */
  const sections = $$('main section[id]');
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
    });
  }, { rootMargin: '-40% 0px -52% 0px', threshold: 0 });
  sections.forEach(s => sectionObserver.observe(s));

  /* ---------- título digitando ---------- */
  const role = $('.hero h2');
  if (role && !reduce) {
    const words = ['Desenvolvedor Full Stack', 'Criador de experiências digitais', 'Estudante de Tecnologia'];
    let word = 0, index = 0, deleting = false;
    const type = () => {
      const text = words[word];
      role.textContent = text.slice(0, index) + (index % 2 ? '|' : '');
      if (!deleting) index++; else index--;
      if (!deleting && index > text.length) { deleting = true; setTimeout(type, 900); return; }
      if (deleting && index < 0) { deleting = false; index = 0; word = (word + 1) % words.length; }
      setTimeout(type, deleting ? 38 : 62);
    };
    setTimeout(type, 650);
  }

  /* ---------- cursor + spotlight ---------- */
  let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  const cursor = document.createElement('div');
  cursor.className = 'js-cursor';
  cursor.innerHTML = '<span class="js-cursor-dot"></span><span class="js-cursor-ring"></span><span class="js-cursor-label"></span>';
  body.append(cursor);
  const dot = $('.js-cursor-dot', cursor);
  const ring = $('.js-cursor-ring', cursor);
  const label = $('.js-cursor-label', cursor);
  const spotlight = document.createElement('div');
  spotlight.className = 'js-spotlight';
  body.append(spotlight);

  if (!touch) {
    addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add('active');
      const target = e.target.closest('a,button,.chip-row span,.project-card,.skill-card,.social-card,.profile-frame,.code-window');
      cursor.classList.toggle('hovering', !!target);
      label.textContent = target?.matches('.project-card') ? 'VIEW' : target ? 'EXPLORE' : '';
    }, { passive: true });
    addEventListener('pointerleave', () => cursor.classList.remove('active'));
  }

  /* ---------- tilt / magnetismo ---------- */
  const tiltItems = $$('.skill-card, .project-card, .social-card, .profile-frame, .code-window, .contact-form');
  const magnetic = $$('.btn, .mini-btn, .github-more, .cv-btn, .contact-form button');
  if (!touch && !reduce) {
    tiltItems.forEach(el => {
      el.classList.add('js-tilt');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        el.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`);
        el.classList.add('tilt-live');
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
        el.classList.remove('tilt-live');
      });
    });

    magnetic.forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${((e.clientX - r.left - r.width / 2) * .18).toFixed(1)}px`);
        el.style.setProperty('--my', `${((e.clientY - r.top - r.height / 2) * .18).toFixed(1)}px`);
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      });
    });
  }

  /* ---------- ripple + chips ---------- */
  document.addEventListener('click', e => {
    const target = e.target.closest('.btn,.mini-btn,.github-more,.cv-btn,.contact-form button');
    if (!target || reduce) return;
    const r = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'js-ripple';
    const size = Math.max(r.width, r.height);
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-r.left-size/2}px;top:${e.clientY-r.top-size/2}px`;
    target.append(ripple);
    setTimeout(() => ripple.remove(), 650);
  });

  $$('.chip-row span').forEach(chip => chip.addEventListener('click', () => {
    $$('.chip-row span').forEach(x => x.classList.remove('selected-chip'));
    chip.classList.add('selected-chip');
    showToast(`${chip.textContent.trim()} • foco ativado`, 'accent');
  }));

  /* ---------- projetos / modal ---------- */
  const modal = $('#projectModal');
  const modalCard = $('.modal-card');
  const modalTitle = $('#modalTitle');
  const modalKicker = $('.modal-card .section-kicker');
  const modalText = $('.modal-card p');
  const projects = [
    ['Projeto Site 1', 'HTML • CSS • JavaScript', 'Interface web com foco em organização visual, responsividade e microinterações.'],
    ['Projeto Site 2', 'JavaScript • UI • UX', 'Página interativa com navegação suave e animações guiadas pelo viewport.'],
    ['Projeto Site 3', 'C# • MySQL', 'Projeto de lógica, tratamento de dados e integração com banco de dados.'],
    ['Projeto Site 4', 'QA • Git • Front-end', 'Prática de desenvolvimento e testes para interfaces confiáveis.']
  ];

  const closeModal = () => {
    modal?.classList.remove('active');
    modal?.setAttribute('aria-hidden', 'true');
    body.classList.remove('modal-open');
  };

  $$('.mini-btn').forEach((btn, i) => btn.addEventListener('click', () => {
    const p = projects[i] || projects[0];
    if (modalTitle) modalTitle.textContent = p[0];
    if (modalKicker) modalKicker.textContent = p[1];
    if (modalText) modalText.textContent = p[2];
    modal?.classList.add('active');
    modal?.setAttribute('aria-hidden', 'false');
    body.classList.add('modal-open');
    if (!reduce) modalCard?.animate([{ transform: 'translateY(28px) scale(.97)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.16,1,.3,1)' });
  }));

  $('.modal-backdrop')?.addEventListener('click', closeModal);
  $('.modal-close')?.addEventListener('click', closeModal);
  $('.modal-close-action')?.addEventListener('click', closeModal);
  addEventListener('keydown', e => e.key === 'Escape' && closeModal());

  /* ---------- formulário ---------- */
  const form = $('#contactForm');
  if (form) {
    const fields = $$('input,textarea', form);
    const message = $('textarea[name="message"]', form);
    const counter = document.createElement('div');
    counter.className = 'js-char-counter';
    if (message) { message.after(counter); counter.textContent = `${message.value.length} / 500`; }

    fields.forEach(field => field.addEventListener('input', () => {
      if (field === message && field.value.length > 500) field.value = field.value.slice(0, 500);
      if (field === message) counter.textContent = `${field.value.length} / 500`;
      field.classList.remove('invalid');
    }));

    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      fields.forEach(field => {
        const ok = field.checkValidity() && (field.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value));
        field.classList.toggle('invalid', !ok);
        valid &&= ok;
      });
      if (!valid) return showToast('Confira os campos destacados.', 'error');

      const data = new FormData(form);
      const name = String(data.get('name') || '');
      const email = String(data.get('email') || '');
      const text = String(data.get('message') || '');
      const subject = encodeURIComponent(`Contato pelo portfólio — ${name}`);
      const bodyText = encodeURIComponent(`Nome: ${name}\nE-mail: ${email}\n\n${text}`);
      window.location.href = `mailto:saulomaia1116@gmail.com?subject=${subject}&body=${bodyText}`;
    });
  }

  function showToast(message, type = 'default') {
    clearTimeout(showToast.timer);
    toast.textContent = message;
    toast.dataset.type = type;
    toast.classList.add('show');
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  /* ---------- loop leve: cursor, parallax e progresso ---------- */
  const parallax = $$('.hero-content,.code-window,.profile-frame,.connect-heading,.contact-copy,.skills .center-heading,.project-card');
  const tick = () => {
    if (!touch) {
      cx += (tx - cx) * .18;
      cy += (ty - cy) * .18;
      dot.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      ring.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      spotlight.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    }

    const y = scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.firstElementChild.style.width = `${(y / max) * 100}%`;
    header?.classList.toggle('scrolled', y > 20);
    topBtn.classList.toggle('show', y > 500);

    if (!reduce) {
      parallax.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > innerHeight + 100) return;
        const offset = (r.top + r.height / 2 - innerHeight / 2) * -.018;
        el.style.setProperty('--scroll-parallax', `${offset.toFixed(2)}px`);
      });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  topBtn.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* ---------- ano automático ---------- */
  const footer = $('.footer-bottom span');
  if (footer) footer.textContent = `© ${new Date().getFullYear()} Saulo Maia. Todos os direitos reservados.`;

  console.log('%cSAULO MAIA%c motion ativo', 'background:#d31316;color:#fff;padding:4px 8px;font-weight:800;', 'color:#888;');
})();
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {

    menuToggle.addEventListener("click", () => {

        menuToggle.classList.toggle("active");
        navMenu.classList.toggle("active");

        const aberto = navMenu.classList.contains("active");

        menuToggle.setAttribute(
            "aria-expanded",
            aberto ? "true" : "false"
        );

        menuToggle.setAttribute(
            "aria-label",
            aberto ? "Fechar menu" : "Abrir menu"
        );

    });


    navMenu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            menuToggle.classList.remove("active");
            navMenu.classList.remove("active");

            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Abrir menu");

        });

    });

}