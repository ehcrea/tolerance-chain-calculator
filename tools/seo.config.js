// Settings for tools/build-pages.js (language pages, SEO tags, sitemap).
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load the browser translation files (i18n/*.js call I18N.add(code, dict)).
const dicts = {};
const sandbox = { I18N: { add: (code, d) => { dicts[code] = Object.assign(dicts[code] || {}, d); } } };
for (const l of ['de', 'nl', 'tr', 'es']) {
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'i18n', l + '.js'), 'utf8'), sandbox);
}

module.exports = {
  base: 'https://ehcrea.github.io/tolerance-chain-calculator/',
  repo: 'https://github.com/ehcrea/tolerance-chain-calculator',
  name: 'Tolerance Chain Calculator',
  ogImage: 'og-image.png',
  langs: ['en', 'de', 'nl', 'tr', 'es'],
  meta: {
    title: {
      en: 'Tolerance Chain Calculator: tolerance stack-up with worst case, RSS and Monte Carlo',
      de: 'Toleranzketten-Rechner: Toleranzanalyse mit Worst Case, RSS und Monte Carlo',
      nl: 'Tolerantieketen-calculator: tolerantieanalyse met worst case, RSS en Monte Carlo',
      tr: 'Tolerans Zinciri Hesaplayıcı: en kötü durum, RSS ve Monte Carlo ile tolerans analizi',
      es: 'Calculadora de cadenas de tolerancias: análisis worst case, RSS y Monte Carlo',
    },
    description: {
      en: 'Free online 1D tolerance stack-up calculator with ISO 286 fits, ISO 2768 general tolerances, thermal expansion, angular deviations and play. Worst case, RSS and Monte Carlo results with pass/fail, Cpk and contribution charts.',
      de: 'Kostenloser Online-Rechner für 1D-Toleranzketten mit ISO-286-Passungen, ISO-2768-Allgemeintoleranzen, Wärmeausdehnung, Winkelabweichungen und Spiel. Ergebnisse nach Worst Case, RSS und Monte Carlo mit Gut/Schlecht-Prüfung, Cpk und Beitragsdiagrammen.',
      nl: 'Gratis online calculator voor 1D-tolerantieketens met ISO 286-passingen, ISO 2768-algemene toleranties, thermische uitzetting, hoekafwijkingen en speling. Resultaten volgens worst case, RSS en Monte Carlo met goed/fout, Cpk en bijdragegrafieken.',
      tr: 'ISO 286 geçmeleri, ISO 2768 genel toleransları, ısıl genleşme, açısal sapmalar ve boşluk ile ücretsiz çevrim içi 1B tolerans zinciri hesaplayıcısı. En kötü durum, RSS ve Monte Carlo sonuçları; uygun/uygun değil, Cpk ve katkı grafikleri.',
      es: 'Calculadora gratuita en línea de cadenas de tolerancias 1D con ajustes ISO 286, tolerancias generales ISO 2768, dilatación térmica, desviaciones angulares y juego. Resultados worst case, RSS y Monte Carlo con apto/no apto, Cpk y gráficos de contribución.',
    },
  },
  featureList: ['1D tolerance stack-up', 'ISO 286 fits and ISO 2768-1 general tolerances', 'Thermal expansion, angular deviations and play', 'Worst case, RSS and Monte Carlo analysis', 'Cpk and contribution charts', 'PDF report', 'English, German, Dutch, Turkish and Spanish'],
  dict: (l) => dicts[l],
  assets: /\b(href|src)="(favicon|apple-touch-icon|manifest\.webmanifest|engine\.js|preview\.js|i18n|icon-)/g,
};
