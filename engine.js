/* Tolerance Chain Calculator — calculation engine.
   1D stack: worst case, RSS and Monte Carlo, with ISO 286-1 fits, ISO 2768-1
   general tolerances, thermal expansion (ISO 1 reference 20 °C) and play. */
(function (root) {
  'use strict';

  // ISO 286-1 nominal size ranges (upper bound, "over … up to and including")
  const MAIN = [3, 6, 10, 18, 30, 50, 80, 120, 180, 250, 315, 400, 500];
  const FINE = [3, 6, 10, 14, 18, 24, 30, 40, 50, 65, 80, 100, 120, 140, 160, 180, 200, 225, 250, 280, 315, 355, 400, 450, 500];

  // Standard tolerance grades, µm
  const IT = {
    4: [3, 4, 4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20],
    5: [4, 5, 6, 8, 9, 11, 13, 15, 18, 20, 23, 25, 27],
    6: [6, 8, 9, 11, 13, 16, 19, 22, 25, 29, 32, 36, 40],
    7: [10, 12, 15, 18, 21, 25, 30, 35, 40, 46, 52, 57, 63],
    8: [14, 18, 22, 27, 33, 39, 46, 54, 63, 72, 81, 89, 97],
    9: [25, 30, 36, 43, 52, 62, 74, 87, 100, 115, 130, 140, 155],
    10: [40, 48, 58, 70, 84, 100, 120, 140, 160, 185, 210, 230, 250],
    11: [60, 75, 90, 110, 130, 160, 190, 220, 250, 290, 320, 360, 400],
    12: [100, 120, 150, 180, 210, 250, 300, 350, 400, 460, 520, 570, 630],
    13: [140, 180, 220, 270, 330, 390, 460, 540, 630, 720, 810, 890, 970]
  };

  // |es| of shafts d–h, equal to EI of holes D–H, µm
  const UPPER = {
    d: [20, 30, 40, 50, 65, 80, 100, 120, 145, 170, 190, 210, 230],
    e: [14, 20, 25, 32, 40, 50, 60, 72, 85, 100, 110, 125, 135],
    f: [6, 10, 13, 16, 20, 25, 30, 36, 43, 50, 56, 62, 68],
    g: [2, 4, 5, 6, 7, 9, 10, 12, 14, 15, 17, 18, 20],
    h: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  };
  // ei of shafts k–p, µm (k: grades IT4–IT7; 0 otherwise)
  const LOWER = {
    k: [0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 5],
    m: [2, 4, 6, 7, 8, 9, 11, 13, 15, 17, 20, 21, 23],
    n: [4, 8, 10, 12, 15, 17, 20, 23, 27, 31, 34, 37, 40],
    p: [6, 12, 15, 18, 22, 26, 32, 37, 43, 50, 56, 62, 68]
  };
  // ei of shafts r, s on the fine ranges, µm
  const LOWER_FINE = {
    r: [10, 15, 19, 23, 23, 28, 28, 34, 34, 41, 43, 51, 54, 63, 65, 68, 77, 80, 84, 94, 98, 108, 114, 126, 132],
    s: [14, 19, 23, 28, 28, 35, 35, 43, 43, 53, 59, 71, 79, 92, 100, 108, 122, 130, 140, 158, 170, 190, 208, 232, 252]
  };
  // Δ for holes K–N (≤ IT8) and P–ZC (≤ IT7), µm
  const DELTA = {
    5: [0, 1, 2, 3, 3, 4, 5, 5, 6, 6, 7, 7, 7],
    6: [0, 3, 3, 3, 4, 5, 6, 7, 7, 9, 9, 11, 13],
    7: [0, 4, 6, 7, 8, 9, 11, 13, 15, 17, 20, 21, 23],
    8: [0, 6, 7, 9, 12, 14, 16, 19, 23, 26, 29, 32, 34]
  };

  // ISO 2768-1 linear (mm) and angular (arcmin)
  const LIN_B = [3, 6, 30, 120, 400, 1000, 2000, 4000];
  const LIN_T = {
    f: [0.05, 0.05, 0.1, 0.15, 0.2, 0.3, 0.5, null],
    m: [0.1, 0.1, 0.2, 0.3, 0.5, 0.8, 1.2, 2],
    c: [0.2, 0.3, 0.5, 0.8, 1.2, 2, 3, 4],
    v: [null, 0.5, 1, 1.5, 2.5, 4, 6, 8]
  };
  const ANG_B = [10, 50, 120, 400];
  const ANG_T = {
    f: [60, 30, 20, 10, 5],
    m: [60, 30, 20, 10, 5],
    c: [90, 60, 30, 15, 10],
    v: [180, 120, 60, 30, 20]
  };

  // Linear expansion coefficients, 10⁻⁶/K, typical values near room temperature
  const MATERIALS = [
    { id: 'none', name: 'No thermal effect', alpha: 0 },
    { id: 'steel', name: 'Steel, unalloyed (C45, S235)', alpha: 11.5 },
    { id: 'bearing', name: 'Bearing steel 100Cr6', alpha: 12.5 },
    { id: 'ssa', name: 'Stainless austenitic 1.4301/1.4404', alpha: 16.0 },
    { id: 'ssm', name: 'Stainless martensitic 1.4112/1.4034', alpha: 10.5 },
    { id: 'gjl', name: 'Grey cast iron EN-GJL', alpha: 10.5 },
    { id: 'al', name: 'Aluminium 6082 / 6061', alpha: 23.4 },
    { id: 'al7', name: 'Aluminium 7075', alpha: 23.6 },
    { id: 'alc', name: 'Aluminium cast AlSi10Mg', alpha: 21.0 },
    { id: 'brass', name: 'Brass CuZn39Pb3', alpha: 20.0 },
    { id: 'bronze', name: 'Bronze CuSn8', alpha: 18.0 },
    { id: 'cu', name: 'Copper', alpha: 17.0 },
    { id: 'ti', name: 'Titanium Ti6Al4V', alpha: 8.6 },
    { id: 'invar', name: 'Invar 36', alpha: 1.3 },
    { id: 'al2o3', name: 'Alumina ceramic', alpha: 7.5 },
    { id: 'granite', name: 'Granite', alpha: 6.0 },
    { id: 'pom', name: 'POM', alpha: 110 },
    { id: 'pa66', name: 'PA66', alpha: 80 },
    { id: 'pa66gf', name: 'PA66 GF30, flow direction', alpha: 30 },
    { id: 'peek', name: 'PEEK', alpha: 47 },
    { id: 'ptfe', name: 'PTFE', alpha: 120 },
    { id: 'custom', name: 'Custom', alpha: null }
  ];

  function num(v, d) {
    if (typeof v === 'number') return isFinite(v) ? v : d;
    const t = String(v == null ? '' : v).trim().replace(',', '.').replace('−', '-');
    if (t === '') return d;
    const x = Number(t);
    return isFinite(x) ? x : d;
  }
  function fail(msg) { throw new Error(msg); }
  function idx(list, D) {
    if (!(D > 0) || D > list[list.length - 1]) return -1;
    for (let i = 0; i < list.length; i++) if (D <= list[i]) return i;
    return -1;
  }
  function halfIT(it) { return it % 2 ? (it - 1) / 2 : it / 2; }

  function shaftDevUm(l, grade, D) {
    const i = idx(MAIN, D);
    if (i < 0) return { err: 'ISO 286 covers sizes above 0 up to 500 mm' };
    const it = IT[grade] && IT[grade][i];
    if (it == null) return { err: 'Grade IT' + grade + ' is outside IT4–IT13' };
    let es, ei;
    if (UPPER[l]) { es = -UPPER[l][i]; ei = es - it; }
    else if (l === 'js') { es = halfIT(it); ei = -es; }
    else if (l === 'k') { ei = grade >= 4 && grade <= 7 ? LOWER.k[i] : 0; es = ei + it; }
    else if (LOWER[l]) { ei = LOWER[l][i]; es = ei + it; }
    else if (LOWER_FINE[l]) { ei = LOWER_FINE[l][idx(FINE, D)]; es = ei + it; }
    else return { err: 'Shaft letter "' + l + '" is not supported (d e f g h js k m n p r s)' };
    return { up: es, lo: ei };
  }

  function holeDevUm(L, grade, D) {
    const l = L.toLowerCase();
    const i = idx(MAIN, D);
    if (i < 0) return { err: 'ISO 286 covers sizes above 0 up to 500 mm' };
    const it = IT[grade] && IT[grade][i];
    if (it == null) return { err: 'Grade IT' + grade + ' is outside IT4–IT13' };
    let ES, EI;
    if (UPPER[l]) { EI = UPPER[l][i]; ES = EI + it; }
    else if (l === 'js') { ES = halfIT(it); EI = -ES; }
    else if (l === 'k' || l === 'm' || l === 'n') {
      const ei = LOWER[l][i];
      if (grade <= 8) {
        if (!DELTA[grade]) return { err: 'Hole ' + L + grade + ': use grades IT5–IT8' };
        ES = -ei + DELTA[grade][i];
      } else ES = l === 'm' ? -ei : 0;
      EI = ES - it;
    } else if (l === 'p' || LOWER_FINE[l]) {
      const ei = l === 'p' ? LOWER.p[i] : LOWER_FINE[l][idx(FINE, D)];
      if (grade <= 7) {
        if (!DELTA[grade]) return { err: 'Hole ' + L + grade + ': use grades IT5 and up' };
        ES = -ei + DELTA[grade][i];
      } else ES = -ei;
      EI = ES - it;
    } else return { err: 'Hole letter "' + L + '" is not supported (D E F G H JS K M N P R S)' };
    return { up: ES, lo: EI };
  }

  // "H7", "g6", "JS7" at nominal D (mm) → deviations in mm
  function iso286(code, D) {
    const m = String(code || '').trim().match(/^(JS|js|[A-Za-z])\s*(\d{1,2})$/);
    if (!m) return { err: 'Enter an ISO 286 code such as H7, g6 or JS7' };
    const letter = m[1], grade = +m[2];
    const hole = letter[0] === letter[0].toUpperCase();
    const r = hole ? holeDevUm(letter, grade, D) : shaftDevUm(letter.toLowerCase(), grade, D);
    if (r.err) return r;
    return { up: r.up / 1000, lo: r.lo / 1000, hole, code: letter + grade };
  }

  function iso2768Lin(cls, size) {
    if (!(size >= 0.5)) return null;
    const i = LIN_B.findIndex(b => size <= b);
    if (i < 0 || !LIN_T[cls]) return null;
    return LIN_T[cls][i];
  }
  function iso2768Ang(cls, leg) {
    if (!ANG_T[cls]) return null;
    let i = ANG_B.findIndex(b => leg <= b);
    if (i < 0) i = 4;
    return ANG_T[cls][i];
  }

  function alphaOf(id, custom) {
    if (id === 'custom') {
      const a = num(custom, NaN);
      if (!isFinite(a)) fail('Enter the custom expansion coefficient α');
      return a;
    }
    const m = MATERIALS.find(x => x.id === id);
    return m ? m.alpha : 0;
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function gauss(rng) {
    let u = 0;
    while (u === 0) u = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
  }
  // Sample inside a tolerance zone [lo, hi]. Normal: zone = ±3σ about its centre.
  function draw(rng, dist, lo, hi) {
    const c = (lo + hi) / 2, h = (hi - lo) / 2;
    if (dist === 'uniform') return lo + (hi - lo) * rng();
    if (dist === 'triangular') return c + h * (rng() + rng() - 1);
    return c + h / 3 * gauss(rng);
  }

  // Tolerance of a linear dimension. `info` describes where it came from, in mm, for display.
  function linTol(r, nom) {
    if (r.tolMode === 'iso286') {
      const t = iso286(r.iso, nom);
      if (t.err) fail(t.err);
      return { up: t.up, lo: t.lo, info: { mode: 'iso286', code: t.code } };
    }
    if (r.tolMode === 'iso2768') {
      const t = iso2768Lin(r.cls, Math.abs(nom));
      if (t == null) fail('ISO 2768-1 class ' + r.cls + ' has no value for ' + Math.abs(nom) + ' mm');
      return { up: t, lo: -t, info: { mode: 'iso2768', cls: r.cls } };
    }
    const up = num(r.up, 0), lo = num(r.lo, 0);
    if (up < lo) fail('Upper deviation is below the lower deviation');
    return { up, lo, info: { mode: 'dev' } };
  }

  function halfAngle(r, L) {
    if (r.angMode === 'zone') {
      const t = num(r.t, NaN), Lz = num(r.Lz, NaN);
      if (!(t >= 0) || !(Lz > 0)) fail('Enter the zone width t and the length it applies over');
      return { a: Math.atan(t / Lz), info: { mode: 'zone', t, Lz } };
    }
    if (r.angMode === 'iso2768') {
      const leg = num(r.leg, L);
      const am = iso2768Ang(r.cls, leg);
      if (am == null) fail('Pick an ISO 2768-1 class');
      return { a: am / 60 * Math.PI / 180, info: { mode: 'iso2768', cls: r.cls, leg, arcmin: am } };
    }
    const v = Math.abs(num(r.ang, NaN));
    if (!isFinite(v)) fail('Enter the angular tolerance');
    const unit = r.unit || 'deg';
    const a = unit === 'arcmin' ? v / 60 * Math.PI / 180
      : unit === 'arcsec' ? v / 3600 * Math.PI / 180
      : unit === 'mmm' ? Math.atan(v / 1000)
      : v * Math.PI / 180;
    return { a, info: { mode: 'angle', value: v, unit } };
  }

  function devs(mode, code, up, lo, D, hole) {
    if (mode === 'iso') {
      const t = iso286(code, D);
      if (t.err) fail(t.err);
      if (hole && !t.hole) fail('Hole codes use capitals, e.g. H7');
      if (!hole && t.hole) fail('Shaft and pin codes use lower case, e.g. g6');
      return { up: t.up, lo: t.lo, code: t.code };
    }
    const u = num(up, NaN), l = num(lo, NaN);
    if (!isFinite(u) || !isFinite(l)) fail('Enter both deviations');
    if (u < l) fail('Upper deviation is below the lower deviation');
    return { up: u, lo: l, code: '' };
  }

  // How a clearance c (diametral, mm) moves the chain
  function effect(eff, s, cmin, cmax, sampleC) {
    const pos = c => (c > 0 ? c : 0);
    if (eff === 'side' || eff === 'full') {
      const k = eff === 'side' ? 0.5 : 1;
      const v1 = s * k * pos(cmin), v2 = s * k * pos(cmax);
      return { m: (v1 + v2) / 2, h: Math.abs(v2 - v1) / 2, cmin, cmax, sample: rng => s * k * pos(sampleC(rng)) };
    }
    const h = Math.abs(s) * pos(cmax) / 2;
    return { m: 0, h, cmin, cmax, sample: rng => s * (rng() - 0.5) * pos(sampleC(rng)) };
  }

  // One contributor at ambient temperature T (°C) → mean m, half range h, sampler
  function rowModel(r, T) {
    const s = (num(r.dir, 1) < 0 ? -1 : 1) * num(r.k, 1);
    const dist = r.dist || 'normal';

    if (r.type === 'lin') {
      const nom = num(r.nom, NaN);
      if (!isFinite(nom)) fail('Enter a nominal size');
      const tol = linTol(r, nom);
      const a = alphaOf(r.mat, r.alpha) * 1e-6, dT = T + num(r.dT, 0) - 20, f = 1 + a * dT;
      const xlo = (nom + tol.lo) * f, xhi = (nom + tol.up) * f;
      const v1 = s * xlo, v2 = s * xhi;
      return {
        m: (v1 + v2) / 2, h: Math.abs(v2 - v1) / 2,
        info: Object.assign({ kind: 'lin', nom, up: tol.up, lo: tol.lo, alpha: a * 1e6 }, tol.info),
        sample: rng => s * draw(rng, dist, xlo, xhi)
      };
    }

    if (r.type === 'ang') {
      const L = num(r.L, NaN);
      if (!(L >= 0)) fail('Enter the lever arm L');
      const { a, info } = halfAngle(r, L);
      const d = L * Math.tan(a);
      return {
        m: 0, h: Math.abs(s) * d,
        info: Object.assign({ kind: 'ang', L, a }, info),
        sample: rng => s * L * Math.tan(draw(rng, dist, -a, a))
      };
    }

    if (r.type === 'fit') {
      const D = num(r.D, NaN);
      if (!(D > 0)) fail('Enter the fit diameter');
      const hole = devs(r.hMode, r.hIso, r.hUp, r.hLo, D, true);
      const shaft = devs(r.sMode, r.sIso, r.sUp, r.sLo, D, false);
      const ah = alphaOf(r.hMat, r.hAlpha) * 1e-6, as = alphaOf(r.sMat, r.sAlpha) * 1e-6;
      const th = D * (ah * (T + num(r.dTh, 0) - 20) - as * (T + num(r.dTs, 0) - 20));
      const cmin = hole.lo - shaft.up + th, cmax = hole.up - shaft.lo + th;
      const out = effect(r.eff, s, cmin, cmax, rng => draw(rng, dist, hole.lo, hole.up) - draw(rng, dist, shaft.lo, shaft.up) + th);
      out.info = { kind: 'fit', D, hole, shaft };
      return out;
    }

    if (r.type === 'play') {
      const pmin = num(r.pmin, NaN), pmax = num(r.pmax, NaN);
      if (!isFinite(pmin) || !isFinite(pmax)) fail('Enter minimum and maximum play');
      if (pmax < pmin) fail('Maximum play is below minimum play');
      const out = effect(r.eff, s, pmin, pmax, rng => draw(rng, dist, pmin, pmax));
      out.info = { kind: 'play', pmin, pmax };
      return out;
    }
    fail('Unknown contributor type');
  }

  function analyze(st) {
    const N = Math.max(1000, Math.min(500000, Math.round(num(st.n, 100000))));
    const lsl = num(st.lsl, NaN), usl = num(st.usl, NaN);
    const temps = [['cold', num(st.tCold, 20)], ['ref', 20], ['hot', num(st.tHot, 20)]];
    return temps.map(([key, T], ci) => {
      const models = st.rows.map(r => {
        try { return rowModel(r, T); } catch (e) { return { err: e.message || 'Check this contributor' }; }
      });
      const live = models.filter(m => !m.err);
      let nominal = 0, sumH = 0, sumH2 = 0;
      live.forEach(m => { nominal += m.m; sumH += m.h; sumH2 += m.h * m.h; });
      const rss = Math.sqrt(sumH2);

      const rng = mulberry32(0x5eed + ci * 7919);
      const k = live.length, fns = live.map(m => m.sample);
      const rs = new Float64Array(k), rs2 = new Float64Array(k);
      const out = new Float64Array(N);
      let s1 = 0, s2 = 0, below = 0, above = 0;
      for (let i = 0; i < N; i++) {
        let v = 0;
        for (let j = 0; j < k; j++) { const x = fns[j](rng); v += x; rs[j] += x; rs2[j] += x * x; }
        out[i] = v; s1 += v; s2 += v * v;
        if (v < lsl) below++;
        if (v > usl) above++;
      }
      const mean = s1 / N;
      let ss = 0;
      for (let i = 0; i < N; i++) { const d = out[i] - mean; ss += d * d; }
      const sd = Math.sqrt(ss / (N - 1));
      const sorted = Float64Array.from(out).sort();
      const q = p => sorted[Math.min(N - 1, Math.max(0, Math.floor(p * (N - 1))))];
      const vars = Array.from(rs, (sm, j) => Math.max(0, rs2[j] / N - (sm / N) * (sm / N)));
      const vt = vars.reduce((a, b) => a + b, 0) || 1;
      let li = 0;
      models.forEach(m => {
        if (m.err) return;
        m.varShare = vars[li] / vt;
        m.wcShare = sumH ? m.h / sumH : 0;
        li++;
      });
      let cpk = NaN;
      if (sd > 0) {
        const c = [];
        if (isFinite(usl)) c.push((usl - mean) / (3 * sd));
        if (isFinite(lsl)) c.push((mean - lsl) / (3 * sd));
        if (c.length) cpk = Math.min.apply(null, c);
      }
      return {
        key, T, models, nominal,
        wcLo: nominal - sumH, wcHi: nominal + sumH,
        rss, rssLo: nominal - rss, rssHi: nominal + rss,
        mc: { n: N, mean, sd, min: sorted[0], max: sorted[N - 1], pLo: q(0.00135), pHi: q(0.99865), qLo: q(0.0005), qHi: q(0.9995), below, above, samples: out },
        cpk, lsl, usl
      };
    });
  }

  const api = { MATERIALS, num, iso286, iso2768Lin, iso2768Ang, rowModel, analyze };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TCE = api;
})(typeof window !== 'undefined' ? window : this);
