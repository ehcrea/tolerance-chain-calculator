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

  setLang(initial(), false);
  root.I18N = {
    LANGS, add, t, setLang, apply,
    lang: () => lang,
    upper: s => s.toLocaleUpperCase(lang),
    // Tests: collect English strings that have no translation in the current language.
    track: on => { missing = on ? {} : null; },
    missing: () => (missing ? Object.keys(missing) : [])
  };
})(window);
