/* सारथि Sarathi: mobile menu, and a table of contents for legal pages. No tracking. */
(function () {
  var d = document, root = d.documentElement;

  /* Mobile menu */
  var btn = d.querySelector('.menu-btn');
  var nav = d.getElementById('site-nav');
  if (btn && nav) {
    var setOpen = function (open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      root.classList.toggle('menu-open', open);
    };
    btn.addEventListener('click', function () {
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        btn.focus();
      }
    });
    d.addEventListener('click', function (e) {
      if (btn.getAttribute('aria-expanded') === 'true' && !e.target.closest('.site-header')) setOpen(false);
    });
  }

  /* Legal pages: wrap tables for small screens, and build "On this page" from the h2s */
  var legal = d.querySelector('main.legal');
  if (!legal) return;

  Array.prototype.forEach.call(legal.querySelectorAll('table'), function (t) {
    if (t.parentElement.classList.contains('table-scroll')) return;
    var w = d.createElement('div');
    w.className = 'table-scroll';
    w.setAttribute('role', 'region');
    w.setAttribute('tabindex', '0');
    var cap = t.querySelector('caption');
    w.setAttribute('aria-label', cap ? cap.textContent.trim() : 'Table');
    t.parentNode.insertBefore(w, t);
    w.appendChild(t);
  });

  if (legal.querySelector('.toc')) return;
  var heads = legal.querySelectorAll('h2');
  if (heads.length < 3) return;

  var used = {};
  var toc = d.createElement('details');
  toc.className = 'toc';
  var sum = d.createElement('summary');
  sum.textContent = 'On this page';
  var navEl = d.createElement('nav');
  navEl.setAttribute('aria-label', 'On this page');
  var ol = d.createElement('ol');
  var links = [];

  Array.prototype.forEach.call(heads, function (h, i) {
    if (!h.id) {
      var base = h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section-' + (i + 1);
      var id = base, n = 2;
      while (used[id] || d.getElementById(id)) id = base + '-' + n++;
      h.id = id;
    }
    used[h.id] = true;
    var li = d.createElement('li');
    var a = d.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent.replace(/\s+/g, ' ').trim();
    li.appendChild(a);
    ol.appendChild(li);
    links.push(a);
  });

  navEl.appendChild(ol);
  toc.appendChild(sum);
  toc.appendChild(navEl);
  var head = legal.querySelector('.legal-head');
  if (head) head.parentNode.insertBefore(toc, head.nextSibling);
  else legal.insertBefore(toc, legal.firstChild);
  legal.classList.add('has-toc');

  var wide = window.matchMedia('(min-width: 1120px)');
  var sync = function () { toc.open = wide.matches; };
  sync();
  if (wide.addEventListener) wide.addEventListener('change', sync);

  /* Mark the section in view (wide screens, where the contents stay visible) */
  if ('IntersectionObserver' in window) {
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var a = ol.querySelector('a[href="#' + en.target.id + '"]');
        if (!a || a === current) return;
        if (current) current.removeAttribute('aria-current');
        a.setAttribute('aria-current', 'true');
        current = a;
      });
    }, { rootMargin: '0px 0px -70% 0px' });
    Array.prototype.forEach.call(heads, function (h) { io.observe(h); });
  }
})();

/* Glass header once the page scrolls; mirror shine as cards arrive */
(function () {
  var d = document;
  var header = d.querySelector('.site-header');
  if (header) {
    var ticking = false;
    var update = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  var items = d.querySelectorAll('.feature, .store, .mark-card, .ps');
  if (!items.length) return;
  Array.prototype.forEach.call(items, function (el, i) {
    el.classList.add('shine');
    el.style.setProperty('--shine-delay', (i % 4) * 80 + 'ms');
  });
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in-view');
      io.unobserve(en.target);
    });
  }, { threshold: 0.35 });
  Array.prototype.forEach.call(items, function (el) { io.observe(el); });
})();
