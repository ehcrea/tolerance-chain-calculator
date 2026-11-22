/*
 * Translations: English is the source language. Every user-visible string goes through
 * I18N.t(english, vars); the files in i18n/ map the English text to its translation.
 * Placeholders like {name} are filled from `vars`. Untranslated text falls back to English.
 * Static markup is marked with data-i18n (text), data-i18n-html (markup) and
 * data-i18n-attr="title aria-label placeholder label" (attributes); apply() translates it.
 */
(function (root) {
  'use strict';
  const KEY = 'tcc.lang';
  const LANGS = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'es', name: 'Español' },
    { code: 'tr', name: 'Türkçe' }
  ];
  const dicts = {};
  let lang = 'en', missing = null;

  const supported = code => LANGS.some(l => l.code === code);
  function add(code, dict) { dicts[code] = Object.assign(dicts[code] || {}, dict); }
  function fill(s, vars) {
    return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)) : s;
  }
  function t(s, vars) {
    if (s == null || s === '') return s;
    s = String(s);
    if (lang !== 'en') {
      const tr = dicts[lang] && dicts[lang][s];
      if (tr !== undefined) return fill(tr, vars);
      if (missing && /[A-Za-z]{2,}/.test(s.replace(/\{\w+\}/g, ''))) missing[s] = true;
    }
    return fill(s, vars);
  }
  function setLang(code, persist) {
    lang = supported(code) ? code : 'en';
    document.documentElement.lang = lang;
    if (persist) { try { root.localStorage.setItem(KEY, lang); } catch (e) { /* storage unavailable */ } }
    return lang;
  }
  // saved choice, else the browser language when it is one of ours
  function initial() {
    // a language page (/de/, /nl/, …) always shows its own language
    const page = root.document && root.document.documentElement.dataset.page;
    if (supported(page)) return page;
    try { const s = root.localStorage.getItem(KEY); if (supported(s)) return s; } catch (e) { /* storage unavailable */ }
    const nav = (root.navigator && root.navigator.language || 'en').slice(0, 2).toLowerCase();
    return supported(nav) ? nav : 'en';
  }

  // English originals of static markup, read once before the first translation
  const orig = new WeakMap();
  function apply(scope) {
    (scope || document).querySelectorAll('[data-i18n], [data-i18n-html], [data-i18n-attr]').forEach(el => {
      let o = orig.get(el);
      if (!o) {
        o = { attrs: {} };
        if (el.hasAttribute('data-i18n')) o.text = el.textContent.trim();
        if (el.hasAttribute('data-i18n-html')) o.html = el.innerHTML.trim();
        (el.dataset.i18nAttr || '').split(/\s+/).filter(Boolean).forEach(a => { o.attrs[a] = el.getAttribute(a); });
        orig.set(el, o);
      }
      if (o.text != null) el.textContent = t(o.text);
      if (o.html != null) el.innerHTML = t(o.html);
      Object.keys(o.attrs).forEach(a => { if (o.attrs[a] != null) el.setAttribute(a, t(o.attrs[a])); });
    });
  }

  // On a language page, go to the page of language `code` (keeping the #hash); false elsewhere.
  function goToLang(code) {
    const page = root.document.documentElement.dataset.page;
    if (!page || !supported(code)) return false;
    try { root.localStorage.setItem(KEY, code); } catch (e) { /* storage unavailable */ }
    root.location.href = (page === 'en' ? '' : '../') + (code === 'en' ? '' : code + '/') + root.location.hash;
    return true;
  }

  setLang(initial(), false);
  root.I18N = {
    LANGS, add, t, setLang, apply, goToLang,
    lang: () => lang,
    upper: s => s.toLocaleUpperCase(lang),
    // Tests: collect English strings that have no translation in the current language.
    track: on => { missing = on ? {} : null; },
    missing: () => (missing ? Object.keys(missing) : [])
  };
})(window);

// Offline support: register the service worker (sw.js, next to the web manifest) so the
// calculator keeps working without a connection and can be installed as an app.
(function () {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  var local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (location.protocol !== 'https:' && !local) return;
  var link = document.querySelector('link[rel="manifest"]');
  var sw = new URL('sw.js', link ? link.href : location.href).href;
  function register() { navigator.serviceWorker.register(sw).catch(function () {}); }
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register);
})();

// "Install app": a toolbar button (where the browser can install directly, e.g. Chrome/Edge)
// and an "Install as an app" section on the About page with an install button or, where the
// browser has no install prompt (Safari, Firefox), short instructions. Texts in EN/DE/NL/TR/ES.
(function () {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  var TEXT = {
    en: { title: 'Install as an app', body: 'This calculator also works offline. Install it as an app to open it in its own window from the Dock, Start menu or home screen, with or without an internet connection. Updates arrive automatically when you are online.', button: 'Install app', installed: 'You are using the installed app.', done: 'Installed. You can now open it from your apps.', mac: 'In Safari on a Mac: choose File › Add to Dock.', ios: 'On iPhone or iPad: tap Share, then Add to Home Screen.', other: 'In Chrome or Edge: click the install icon in the address bar, or open the browser menu and choose Install. In Safari on a Mac: File › Add to Dock. On iPhone or iPad: Share › Add to Home Screen.' },
    de: { title: 'Als App installieren', body: 'Dieser Rechner funktioniert auch offline. Installieren Sie ihn als App, um ihn in einem eigenen Fenster aus dem Dock, dem Startmenü oder vom Startbildschirm zu öffnen, mit oder ohne Internetverbindung. Updates kommen automatisch, sobald Sie online sind.', button: 'App installieren', installed: 'Sie verwenden die installierte App.', done: 'Installiert. Sie können sie jetzt aus Ihren Apps öffnen.', mac: 'In Safari auf dem Mac: Ablage › Zum Dock hinzufügen.', ios: 'Auf iPhone oder iPad: Teilen tippen, dann Zum Home-Bildschirm.', other: 'In Chrome oder Edge: auf das Installationssymbol in der Adressleiste klicken oder im Browsermenü Installieren wählen. In Safari auf dem Mac: Ablage › Zum Dock hinzufügen. Auf iPhone oder iPad: Teilen › Zum Home-Bildschirm.' },
    nl: { title: 'Installeren als app', body: 'Deze calculator werkt ook offline. Installeer hem als app om hem in een eigen venster te openen vanuit het Dock, het Startmenu of het beginscherm, met of zonder internetverbinding. Updates komen automatisch binnen zodra je online bent.', button: 'App installeren', installed: 'Je gebruikt de geïnstalleerde app.', done: 'Geïnstalleerd. Je kunt hem nu openen vanuit je apps.', mac: 'In Safari op een Mac: kies Archief › Voeg toe aan Dock.', ios: 'Op iPhone of iPad: tik op Deel en daarna op Zet op beginscherm.', other: 'In Chrome of Edge: klik op het installatiepictogram in de adresbalk of kies Installeren in het browsermenu. In Safari op een Mac: Archief › Voeg toe aan Dock. Op iPhone of iPad: Deel › Zet op beginscherm.' },
    tr: { title: 'Uygulama olarak yükle', body: 'Bu hesaplayıcı çevrimdışı da çalışır. Dock, Başlat menüsü veya ana ekrandan kendi penceresinde, internet bağlantısı olsun ya da olmasın açmak için uygulama olarak yükleyin. Çevrimiçi olduğunuzda güncellemeler otomatik olarak gelir.', button: 'Uygulamayı yükle', installed: 'Yüklü uygulamayı kullanıyorsunuz.', done: 'Yüklendi. Artık uygulamalarınızdan açabilirsiniz.', mac: 'Mac’te Safari’de: Dosya › Dock’a Ekle.', ios: 'iPhone veya iPad’de: Paylaş’a, ardından Ana Ekrana Ekle’ye dokunun.', other: 'Chrome veya Edge’de: adres çubuğundaki yükleme simgesine tıklayın ya da tarayıcı menüsünden Yükle’yi seçin. Mac’te Safari’de: Dosya › Dock’a Ekle. iPhone veya iPad’de: Paylaş › Ana Ekrana Ekle.' },
    es: { title: 'Instalar como aplicación', body: 'Esta calculadora también funciona sin conexión. Instálala como aplicación para abrirla en su propia ventana desde el Dock, el menú Inicio o la pantalla de inicio, con o sin conexión a internet. Las actualizaciones llegan solas cuando estás en línea.', button: 'Instalar aplicación', installed: 'Estás usando la aplicación instalada.', done: 'Instalada. Ya puedes abrirla desde tus aplicaciones.', mac: 'En Safari en un Mac: Archivo › Añadir al Dock.', ios: 'En iPhone o iPad: toca Compartir y luego Añadir a pantalla de inicio.', other: 'En Chrome o Edge: haz clic en el icono de instalación de la barra de direcciones o elige Instalar en el menú del navegador. En Safari en un Mac: Archivo › Añadir al Dock. En iPhone o iPad: Compartir › Añadir a pantalla de inicio.' }
  };
  var ABOUT_BUTTONS = '#btnAbout, #about-open, #aboutOpen, [data-dialog="about"]';
  var ICON = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 2v8M4.5 6.8 8 10.3l3.5-3.5M3 13.5h10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var prompt = null, justInstalled = false;

  function lang() { var l = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase(); return TEXT[l] ? l : 'en'; }
  function tx(k) { return TEXT[lang()][k]; }
  function installed() {
    return justInstalled || window.navigator.standalone === true ||
      (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: window-controls-overlay)').matches));
  }
  function platform() {
    var ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
    if (/Macintosh/.test(ua) && /Safari\//.test(ua) && !/Chrome|Chromium|CriOS|Edg|Firefox|OPR/.test(ua)) return 'mac';
    return 'other';
  }
  function install() {
    if (!prompt) return;
    var p = prompt; prompt = null;
    p.prompt();
    (p.userChoice || Promise.resolve({})).then(function (c) { if (c && c.outcome !== 'accepted') prompt = p; render(); });
    render();
  }

  function addStyle() {
    if (document.getElementById('pwa-install-style')) return;
    var s = document.createElement('style');
    s.id = 'pwa-install-style';
    s.textContent =
      '.pwa-install{margin:1rem 0;padding:.85rem 1rem;border:1px solid var(--border, var(--line, #c9ced6));border-radius:var(--radius, 10px)}' +
      '.pwa-install h3{margin:0 0 .4rem;font-size:1rem}.pwa-install p{margin:.35rem 0}' +
      '.pwa-install .pwa-install-cta{display:inline-flex;align-items:center;gap:.45rem;margin-top:.35rem;padding:.5rem .95rem;border:0;border-radius:999px;font:inherit;font-weight:600;cursor:pointer;background:var(--accent);color:var(--accent-ink, var(--bg, #fff))}' +
      '.pwa-install .pwa-install-cta:hover{filter:brightness(1.08)}.pwa-install .pwa-install-cta:focus-visible{outline:2px solid var(--accent);outline-offset:2px}' +
      '.pwa-install-btn{display:inline-flex;align-items:center;gap:.35rem}.pwa-install-btn svg{flex:none}' +
      '@media (max-width:760px){.pwa-install-btn .pwa-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}}';
    document.head.appendChild(s);
  }

  function renderToolbar() {
    var btn = document.querySelector('.pwa-install-btn');
    if (!prompt || installed()) { if (btn) btn.remove(); return; }
    var about = document.querySelector(ABOUT_BUTTONS);
    if (!about) return;
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = (about.className + ' pwa-install-btn').trim();
      btn.addEventListener('click', install);
      about.parentNode.insertBefore(btn, about);
    }
    if (btn.dataset.lang !== lang()) {
      btn.dataset.lang = lang();
      btn.innerHTML = ICON + '<span class="pwa-label">' + tx('button') + '</span>';
      btn.title = tx('button');
      btn.setAttribute('aria-label', tx('button'));
    }
  }

  function renderAbout() {
    var anchor = document.querySelector('.about-support');
    if (!anchor) return;
    var state = lang() + '|' + (installed() ? 'installed' : prompt ? 'prompt' : platform());
    var box = anchor.parentNode.querySelector(':scope > .pwa-install');
    if (box && box.dataset.state === state) return;
    if (!box) { box = document.createElement('section'); box.className = 'pwa-install'; anchor.parentNode.insertBefore(box, anchor); }
    box.dataset.state = state;
    var html = '<h3>' + tx('title') + '</h3><p>' + tx('body') + '</p>';
    if (installed()) html += '<p><strong>' + tx(justInstalled ? 'done' : 'installed') + '</strong></p>';
    else if (prompt) html += '<button type="button" class="pwa-install-cta">' + ICON + '<span>' + tx('button') + '</span></button>';
    else html += '<p>' + tx(platform()) + '</p>';
    box.innerHTML = html;
    var cta = box.querySelector('.pwa-install-cta');
    if (cta) cta.addEventListener('click', install);
  }

  var busy = false;
  function render() {
    if (busy) return;
    busy = true;
    try { addStyle(); renderToolbar(); renderAbout(); } finally { busy = false; }
  }

  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); prompt = e; render(); });
  window.addEventListener('appinstalled', function () { prompt = null; justInstalled = true; render(); });
  function start() {
    render();
    // The About content and the page language are re-rendered by the app: keep up with it.
    new MutationObserver(function () { if (!busy) render(); })
      .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['lang'] });
    new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
