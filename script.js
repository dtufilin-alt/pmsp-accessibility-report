/* Повышение доступности ПМСП — скрипты сайта (дизайн-система ПМСП). */

/* Хедер: белый при прокрутке; плашка под активным пунктом (на главной — по прокрутке); мобильное меню. */
(() => {
  const header = document.querySelector('.top');
  const menu = document.querySelector('.menu');
  const toggle = document.querySelector('.nav-toggle');
  if (!header || !menu) return;
  const links = [...menu.querySelectorAll('a')];
  const marker = document.createElement('span');
  marker.className = 'menu-marker';
  marker.setAttribute('aria-hidden', 'true');
  menu.prepend(marker);
  const home = links.find(link => link.getAttribute('aria-current') === 'page') || null;
  let active = home;

  function place(link) {
    if (!link) { marker.classList.remove('is-visible'); return; }
    const appearing = !marker.classList.contains('is-visible');
    if (appearing) marker.classList.add('is-placing');
    marker.style.left = `${link.offsetLeft + 8}px`;
    marker.style.width = `${Math.max(0, link.offsetWidth - 16)}px`;
    if (!appearing) return;
    void marker.offsetWidth;
    marker.classList.add('is-visible');
    requestAnimationFrame(() => marker.classList.remove('is-placing'));
  }
  function setActive(link) {
    active = link;
    links.forEach(item => item.classList.toggle('is-active', item === link));
    place(link);
  }
  links.forEach(link => link.addEventListener('mouseenter', () => place(link)));
  menu.addEventListener('mouseleave', () => place(active));

  const spy = links.map(link => ({ link, target: (link.getAttribute('href') || '').startsWith('#') ? document.querySelector(link.getAttribute('href')) : null }))
    .filter(item => item.target).reverse();
  function update() {
    header.classList.toggle('is-scrolled', scrollY > 8);
    if (!spy.length) return;
    const threshold = header.offsetHeight + 180;
    const atBottom = scrollY > 0 && innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    const current = atBottom ? spy[0] : spy.find(({ target }) => target.getBoundingClientRect().top <= threshold);
    const next = current ? current.link : home;
    if (next !== active) setActive(next);
  }
  setActive(home);
  update();
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', () => place(active));
  if (document.fonts) document.fonts.ready.then(() => place(active));

  if (toggle) {
    const close = () => { toggle.setAttribute('aria-expanded', 'false'); menu.classList.remove('is-open'); };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    });
    links.forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || toggle.getAttribute('aria-expanded') !== 'true') return;
      close();
      toggle.focus();
    });
    document.addEventListener('click', event => { if (!menu.contains(event.target) && !toggle.contains(event.target)) close(); });
  }
})();

/* Карта: волна каждого субъекта (data-wave) задана в разметке; наведение или фокус — подпись под картой,
   наведение на пункт легенды выделяет свою волну. */
(() => {
  const map = document.querySelector('.ax-map');
  if (!map) return;
  const paths = [...map.querySelectorAll('svg path[data-wave]')];
  const caption = map.querySelector('.ax-caption');
  const idle = caption ? caption.innerHTML : '';
  const describe = path => path.dataset.wave === 'out' ? 'вне инцидента №38' : `${path.dataset.wave} волна, начало ${path.dataset.start}`;
  const show = path => {
    paths.forEach(other => other.classList.toggle('is-hover', other === path));
    if (caption) caption.innerHTML = path ? `<b>${path.dataset.region}</b> · ${describe(path)}` : idle;
  };
  paths.forEach(path => {
    path.addEventListener('mouseenter', () => show(path));
    path.addEventListener('focus', () => show(path));
    path.addEventListener('blur', () => show(null));
  });
  map.querySelector('svg').addEventListener('mouseleave', () => show(null));
  map.querySelectorAll('.ax-legend li').forEach(item => {
    item.addEventListener('mouseenter', () => { map.classList.add('is-focus'); paths.forEach(path => path.classList.toggle('is-hot', path.dataset.wave === item.dataset.wave)); });
    item.addEventListener('mouseleave', () => map.classList.remove('is-focus'));
  });
})();

/* Практики: ARIA-вкладки по годам (щелчок, стрелки ← →, Home/End); строка вкладок листается на узких экранах. */
(() => {
  document.querySelectorAll('[data-tabs]').forEach(root => {
    const strip = root.querySelector('[role="tablist"]');
    const tabs = [...strip.querySelectorAll('[role="tab"]')];
    const panels = root.querySelector('.mat-panels');
    const select = (tab, focus) => {
      tabs.forEach(other => {
        const on = other === tab;
        other.setAttribute('aria-selected', String(on));
        other.tabIndex = on ? 0 : -1;
        document.getElementById(other.getAttribute('aria-controls')).classList.toggle('is-active', on);
      });
      panels.classList.toggle('is-first', tab === tabs[0]);
      if (focus) tab.focus();
    };
    strip.addEventListener('click', event => { const tab = event.target.closest('[role="tab"]'); if (tab) select(tab); });
    strip.addEventListener('keydown', event => {
      const index = tabs.indexOf(document.activeElement);
      const keys = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
      if (index < 0 || !(event.key in keys)) return;
      event.preventDefault();
      select(tabs[(keys[event.key] + tabs.length) % tabs.length], true);
    });
    const edge = () => strip.classList.toggle('is-end', strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 2);
    strip.addEventListener('scroll', edge, { passive: true });
    edge();
  });
})();

/* Вебинары: видео с Rutube запускается на месте превью по щелчку. */
(() => {
  document.querySelectorAll('.mx-video-frame[data-embed]').forEach(frame => frame.addEventListener('click', () => {
    if (frame.classList.contains('is-playing')) return;
    frame.classList.add('is-playing');
    const iframe = document.createElement('iframe');
    iframe.src = frame.dataset.embed;
    iframe.title = frame.getAttribute('aria-label') || 'Видеозапись вебинара';
    iframe.allow = 'clipboard-write; autoplay';
    iframe.allowFullscreen = true;
    frame.replaceChildren(iframe);
  }));
})();
