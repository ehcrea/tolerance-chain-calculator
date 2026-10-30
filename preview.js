/*
 * Assembly views of the examples: a 2D section and a 3D isometric half-section, both drawn
 * from one schematic scene per example. Coordinates are mm: x right, y up, z towards the
 * viewer; the section plane is z = 0 and only the half z <= 0 is modelled.
 * Parts:
 *   rev  profile p = [[a, r], ...] revolved about an axis ('x' or 'y') through `at`
 *   ext  polygon p = [[x, y], ...] extruded from z[0] to z[1]
 *   ball n balls of radius br on a pitch circle r at axial position a
 * half: the 2D view shows only the r >= 0 side of parts on the main axis (full: both sides).
 * m is the material colour, h the 2D hatch (none: shown unsectioned, like shafts and pins).
 * tags [row, x, y, bx, by]: balloon for example row `row`, pointing at (x, y) from (bx, by).
 * res: the measured result, as a dimension {dim: [x0, x1, y, from0, from1]} or a leader
 * {at: [[x, y], ...], lab: [x, y]}. Not to scale: small gaps are drawn wider than they are.
 */
(function (root) {
  'use strict';
  // hue, saturation %, lightness % in the light theme
  const MAT = {
    al: [210, 9, 80], alc: [200, 7, 71], steel: [212, 13, 63], brg: [222, 12, 50], ss: [200, 10, 73],
    pa: [32, 16, 58], pcb: [148, 42, 36], chip: [220, 8, 26], tool: [42, 50, 55], res: [21, 82, 52],
    rubber: [0, 0, 26], pad: [195, 32, 70], cell: [215, 34, 52], pc: [210, 6, 82], conn: [220, 6, 44], brass: [42, 52, 58]
  };
  const C30 = Math.cos(Math.PI / 6);
  const V = [1, 1, 1];
  const LIGHT = unit([0.25, 1, 0.5]);
  const HALF = 18;   // facets over the half turn

  function unit(v) { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  // counter-clockwise (positive area) so edge normals (dv, -du) point outwards
  function ccw(p) {
    let s = 0;
    for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; }
    return s >= 0 ? p : p.slice().reverse();
  }
  function color(m, shade, dark) {
    const c = MAT[m] || MAT.steel;
    const L = Math.min(95, c[2] * (dark && m !== 'res' ? 0.8 : 1) * shade);
    return 'hsl(' + c[0] + ',' + c[1] + '%,' + L.toFixed(1) + '%)';
  }
  function revPt(o, a, r, th) {
    const c = r * Math.cos(th), s = r * Math.sin(th);
    return o.ax === 'y' ? [o.at[0] + c, o.at[1] + a, s] : [o.at[0] + a, o.at[1] + c, s];
  }

  const box = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  // ellipse in (a, r) for a squeezed O-ring section
  const ell = (a, r, ha, hr) => Array.from({ length: 20 }, (_, i) => [a + ha * Math.sin(i * Math.PI / 10), r + hr * Math.cos(i * Math.PI / 10)]);
  const range = (n, f) => Array.from({ length: n }, (_, i) => f(i));

  const S = {
    bearing: {
      half: true,
      parts: [
        { k: 'rev', ax: 'x', at: [0, 0], m: 'steel', p: [[-14, 0], [44, 0], [44, 10], [-14, 10]] },
        { k: 'rev', ax: 'x', at: [0, 0], m: 'al', h: 0, p: [[-8, 18], [0, 18], [0, 23.5], [30, 23.5], [30, 40], [-8, 40]] },
        { k: 'rev', ax: 'x', at: [0, 0], m: 'brg', h: 1, p: [[0, 19.5], [14, 19.5], [14, 23.5], [0, 23.5]] },
        { k: 'rev', ax: 'x', at: [0, 0], m: 'brg', h: 1, p: [[0, 10], [14, 10], [14, 14], [0, 14]] },
        { k: 'ball', ax: 'x', at: [0, 0], m: 'brg', a: 7, r: 16.75, br: 3, n: 5 },
        { k: 'rev', ax: 'x', at: [0, 0], m: 'steel', h: 2, p: [[14, 19.5], [26, 19.5], [26, 23.5], [14, 23.5]] },
        { k: 'rev', ax: 'x', at: [0, 0], m: 'res', p: [[26, 19.5], [27.4, 19.5], [27.4, 23.5], [26, 23.5]] },
        { k: 'rev', ax: 'x', at: [0, 0], m: 'al', h: 1, p: [[30, 12], [37, 12], [37, 44], [30, 44], [30, 23.5], [27.4, 23.5], [27.4, 17], [30, 17]] }
      ],
      axes: [[-18, 0, 48, 0]],
      tags: [[0, -4, 31, -14, 54], [5, 0, 20.5, -2, 54], [1, 7, 21.5, 10, 54], [2, 20, 21.5, 22, 54], [3, 28.7, 20, 47, 26], [4, 37, 41, 47, 48]],
      res: { at: [[26.7, 21.5]], lab: [34, 59] }
    },
    pins: {
      parts: [
        { k: 'ext', m: 'steel', h: 0, z: [-16, 0], p: [[0, 0], [32, 0], [32, 10], [0, 10]] },
        { k: 'ext', m: 'al', h: 1, z: [-14, 0], p: [[10, 10], [56, 10], [56, 18], [10, 18]] },
        { k: 'rev', ax: 'y', at: [20, 0], m: 'steel', p: [[2, 0], [16, 0], [16, 3], [2, 3]] },
        { k: 'rev', ax: 'y', at: [45, 0], m: 'ss', p: [[-8, 0], [26, 0], [26, 4], [-8, 4]] },
        { k: 'rev', ax: 'y', at: [45, 0], m: 'steel', h: 2, p: [[18, 4], [22, 4], [22, 7.5], [18, 7.5]] }
      ],
      axes: [[20, -3, 20, 20], [45, -12, 45, 30]],
      tags: [[0, 8, 5, 6, -9], [1, 20, 6, 20, -9], [2, 33, 14, 33, 26], [3, 49, 14, 64, 14], [4, 45, -7.5, 60, -4], [5, 45, -11, 34, -15]],
      res: { dim: [0, 45, 35, 10, 30] }
    },
    gear: {
      parts: [
        { k: 'ext', m: 'alc', h: 0, z: [-24, 0], p: [[-26, -6], [66, -6], [66, 0], [-26, 0]] },
        { k: 'rev', ax: 'y', at: [0, 0], m: 'alc', h: 0, p: [[0, 16], [12, 16], [12, 20], [0, 20]] },
        { k: 'rev', ax: 'y', at: [40, 0], m: 'alc', h: 0, p: [[0, 16], [12, 16], [12, 20], [0, 20]] },
        { k: 'rev', ax: 'y', at: [0, 0], m: 'brg', h: 1, p: [[1, 12.5], [11, 12.5], [11, 16], [1, 16]] },
        { k: 'rev', ax: 'y', at: [0, 0], m: 'brg', h: 1, p: [[1, 6], [11, 6], [11, 8.5], [1, 8.5]] },
        { k: 'ball', ax: 'y', at: [0, 0], m: 'brg', a: 6, r: 10.5, br: 2.3, n: 5 },
        { k: 'rev', ax: 'y', at: [40, 0], m: 'brg', h: 1, p: [[1, 12.5], [11, 12.5], [11, 16], [1, 16]] },
        { k: 'rev', ax: 'y', at: [40, 0], m: 'brg', h: 1, p: [[1, 6], [11, 6], [11, 8.5], [1, 8.5]] },
        { k: 'ball', ax: 'y', at: [40, 0], m: 'brg', a: 6, r: 10.5, br: 2.3, n: 5 },
        { k: 'rev', ax: 'y', at: [0, 0], m: 'steel', p: [[0.5, 0], [30, 0], [30, 6], [0.5, 6]] },
        { k: 'rev', ax: 'y', at: [40, 0], m: 'steel', p: [[0.5, 0], [30, 0], [30, 6], [0.5, 6]] },
        { k: 'rev', ax: 'y', at: [0, 0], m: 'steel', h: 2, p: [[18, 6], [26, 6], [26, 14.5], [18, 14.5]] },
        { k: 'rev', ax: 'y', at: [40, 0], m: 'steel', h: 1, p: [[18, 6], [26, 6], [26, 25.5], [18, 25.5]] }
      ],
      axes: [[0, -9, 0, 33], [40, -9, 40, 33]],
      tags: [[0, 20, 6, 20, -15], [1, -14.2, 4, -32, 2], [2, -10.5, 6, -32, 14], [3, 54.2, 4, 74, 2], [4, 50.5, 6, 74, 14], [5, 62, 22, 74, 28]],
      res: { dim: [0, 40, 39, 31, 31] }
    },
    circlip: {
      half: true,
      parts: [
        { k: 'rev', ax: 'x', at: [0, 0], m: 'steel', p: [[-12, 0], [26, 0], [26, 7.5], [16.6, 7.5], [16.6, 7.1], [15.4, 7.1], [15.4, 7.5], [0, 7.5], [0, 12], [-12, 12]] },
        { k: 'rev', ax: 'x', at: [0, 0], m: 'steel', h: 2, p: [[0, 7.5], [4, 7.5], [4, 11], [0, 11]] },
        { k: 'rev', ax: 'x', at: [0, 0], m: 'brg', h: 1, p: [[4, 7.5], [15, 7.5], [15, 10], [4, 10]] },
        { k: 'rev', ax: 'x', at: [0, 0], m: 'brg', h: 1, p: [[4, 15.2], [15, 15.2], [15, 17.5], [4, 17.5]] },
        { k: 'ball', ax: 'x', at: [0, 0], m: 'brg', a: 9.5, r: 12.6, br: 2.7, n: 5 },
        { k: 'rev', ax: 'x', at: [0, 0], m: 'res', p: [[15, 7.5], [15.6, 7.5], [15.6, 10], [15, 10]] },
        { k: 'rev', ax: 'x', at: [0, 0], m: 'steel', h: 0, p: [[15.6, 7.1], [16.6, 7.1], [16.6, 10.6], [15.6, 10.6]] }
      ],
      seg: 2,
      axes: [[-15, 0, 29, 0]],
      tags: [[0, -6, 9, -10, 21], [1, 15.5, 7.3, 31, 4], [2, 16.1, 10.3, 27, 13], [3, 9.5, 16.4, 9, 24], [4, 2, 10, 1, 21]],
      res: { at: [[15.3, 8.7]], lab: [19, 27] }
    },
    sheet: {
      parts: [
        { k: 'ext', m: 'al', h: 0, z: [-30, 0], p: [[-6, -4], [66, -4], [66, 38.5], [60, 38.5], [60, 0], [0, 0], [0, 38.5], [-6, 38.5]] },
        { k: 'ext', m: 'pa', h: 1, z: [-30, 0], p: [[-6, 38.5], [66, 38.5], [66, 41.5], [-6, 41.5]] },
        { k: 'ext', m: 'steel', h: 2, z: [-16, 0], p: [[10, 0], [30, 0], [30, 35], [50, 35], [50, 36.5], [28.5, 36.5], [28.5, 1.5], [10, 1.5]] },
        { k: 'ext', m: 'res', z: [-16, 0], p: [[28.5, 36.5], [50, 36.5], [50, 38.5], [28.5, 38.5]] },
        { k: 'rev', ax: 'y', at: [18, 0], m: 'steel', p: [[-4, 0], [4.5, 0], [4.5, 4.25], [1.5, 4.25], [1.5, 2.5], [-4, 2.5]] }
      ],
      seg: 3,
      axes: [[18, -7, 18, 8]],
      tags: [[0, 63, 20, 76, 20], [1, 29.2, 18, 18, 22], [2, 40, 35.7, 40, 26], [3, 47, 35.7, 53, 26], [4, 18, 3.5, 6, 12]],
      res: { at: [[39, 37.5]], lab: [39, 49] }
    },
    fixture: {
      parts: [
        { k: 'ext', m: 'steel', h: 0, z: [-30, 0], p: [[0, 0], [118, 0], [118, 15], [0, 15]] },
        { k: 'ext', m: 'al', h: 1, z: [-24, 0], p: [[30, 15], [112, 15], [112, 27], [30, 27]] },
        { k: 'rev', ax: 'y', at: [50, 0], m: 'steel', p: [[8, 0], [24, 0], [24, 5], [8, 5]] },
        { k: 'rev', ax: 'y', at: [104, 0], m: 'steel', p: [[8, 0], [22, 0], [22, 4], [8, 4]] },
        { k: 'rev', ax: 'y', at: [80, 0], m: 'res', p: [[15, 0], [27, 0], [27, 8], [15, 8]] },
        { k: 'ext', m: 'steel', h: 2, z: [-10, 0], p: [[92, 27], [110, 27], [110, 33], [92, 33]] },
        { k: 'rev', ax: 'y', at: [80, 0], m: 'tool', p: [[30, 0], [58, 0], [58, 12], [44, 12], [44, 7], [30, 7]] }
      ],
      seg: 8,
      axes: [[50, -3, 50, 30], [80, 11, 80, 62], [104, -3, 104, 30]],
      tags: [[0, 20, 7, 20, -10], [1, 50, 20, 40, 40], [2, 64, 21, 62, 40], [3, 92, 52, 104, 52], [4, 101, 31, 120, 42]],
      res: { dim: [0, 80, 67, 15, 62] }
    },
    ballscrew: {
      parts: [
        { k: 'ext', m: 'al', h: 0, z: [-26, 0], p: [[-10, -10], [250, -10], [250, 0], [-10, 0]] },
        { k: 'ext', m: 'al', h: 0, z: [-26, 0], p: [[-10, 0], [0, 0], [0, 36], [-10, 36]] },
        { k: 'ext', m: 'al', h: 1, z: [-22, 0], p: [[40, 0], [60, 0], [60, 36], [40, 36]] },
        { k: 'ext', m: 'al', h: 1, z: [-18, 0], p: [[232, 0], [244, 0], [244, 32], [232, 32]] },
        { k: 'ext', m: 'al', h: 1, z: [-24, 0], p: [[176, 4], [206, 4], [206, 44], [176, 44]] },
        { k: 'ext', m: 'al', h: 1, z: [-12, 0], p: [[206, 36], [226, 36], [226, 44], [206, 44]] },
        { k: 'rev', ax: 'x', at: [0, 20], m: 'steel', p: [[36, 0], [248, 0], [248, 6], [36, 6]] },
        { k: 'rev', ax: 'x', at: [0, 20], m: 'brg', h: 2, p: [[43, 11], [57, 11], [57, 14], [43, 14]] },
        { k: 'rev', ax: 'x', at: [0, 20], m: 'brg', h: 2, p: [[43, 6], [57, 6], [57, 8.5], [43, 8.5]] },
        { k: 'ball', ax: 'x', at: [0, 20], m: 'brg', a: 46.5, r: 9.75, br: 1.5, n: 5 },
        { k: 'ball', ax: 'x', at: [0, 20], m: 'brg', a: 53.5, r: 9.75, br: 1.5, n: 5 },
        { k: 'rev', ax: 'x', at: [0, 20], m: 'brg', h: 2, p: [[234, 6], [242, 6], [242, 10], [234, 10]] },
        { k: 'rev', ax: 'x', at: [0, 20], m: 'steel', h: 2, p: [[180, 6], [204, 6], [204, 12], [184, 12], [184, 16], [180, 16]] },
        { k: 'rev', ax: 'y', at: [220, 36], m: 'tool', p: [[-10, 0], [0, 0], [0, 3]] }
      ],
      seg: 12,
      axes: [[32, 20, 252, 20], [220, 22, 220, 50]],
      tags: [[0, 20, -5, 20, -21], [1, 120, 25, 120, 38], [2, 50, 32.5, 50, 48], [3, 182, 34, 160, 46], [4, 214, 40, 238, 46]],
      res: { dim: [0, 220, 58, 36, 50] }
    },
    pcb: {
      parts: [
        { k: 'ext', m: 'pa', h: 0, z: [-30, 0], p: [[-3, -3], [83, -3], [83, 20], [80, 20], [80, 0], [0, 0], [0, 20], [-3, 20]] },
        { k: 'rev', ax: 'y', at: [10, 0], m: 'pa', h: 0, p: [[0, 0], [6, 0], [6, 3], [0, 3]] },
        { k: 'rev', ax: 'y', at: [70, 0], m: 'pa', h: 0, p: [[0, 0], [6, 0], [6, 3], [0, 3]] },
        { k: 'ext', m: 'chip', z: [-18, -6], p: [[20, 7.6], [32, 7.6], [32, 10], [20, 10]] },
        { k: 'ext', m: 'chip', z: [-12, -3], p: [[44, 7.6], [52, 7.6], [52, 9], [44, 9]] },
        { k: 'ext', m: 'pcb', h: 1, z: [-26, 0], p: [[1.5, 6], [78.5, 6], [78.5, 7.6], [1.5, 7.6]] },
        { k: 'ext', m: 'chip', h: 2, z: [-14, 0], p: [[62, 7.6], [74, 7.6], [74, 13], [62, 13]] },
        { k: 'ext', m: 'res', z: [-26, 0], p: [[0, 6], [1.5, 6], [1.5, 7.6], [0, 7.6]] },
        { k: 'ext', m: 'res', z: [-26, 0], p: [[78.5, 6], [80, 6], [80, 7.6], [78.5, 7.6]] }
      ],
      seg: 2,
      axes: [[10, -5, 10, 9], [70, -5, 70, 9]],
      tags: [[0, -1.5, 14, -12, 14], [1, 38, 7.2, 36, 18], [2, 81.5, 17, 94, 17]],
      res: { at: [[0.75, 6.8], [79.25, 6.8]], lab: [40, 29] }
    },
    seat: {
      half: true,
      parts: [
        { k: 'rev', ax: 'x', at: [0, 0], m: 'steel', p: box(-6, 0, 26, 10) },
        { k: 'rev', ax: 'x', at: [0, 0], m: 'al', h: 0, p: [[-4, 21], [0, 21], [0, 24], [18, 24], [18, 38], [-4, 38]] },
        { k: 'rev', ax: 'x', at: [0, 0], m: 'brg', h: 1, p: box(0, 19.5, 14, 23.5) },
        { k: 'rev', ax: 'x', at: [0, 0], m: 'res', p: box(0, 23.5, 14, 24) },
        { k: 'rev', ax: 'x', at: [0, 0], m: 'brg', h: 1, p: box(0, 10, 14, 14) },
        { k: 'ball', ax: 'x', at: [0, 0], m: 'brg', a: 7, r: 16.75, br: 3, n: 5 }
      ],
      seg: 3,
      axes: [[-9, 0, 29, 0]],
      tags: [[0, 9, 31, 4, 46], [1, 11, 21.5, 25, 15], [2, 16.5, 24, 26, 30]],
      res: { at: [[7, 23.75]], lab: [20, 47] }
    },
    oring: {
      half: true,
      parts: [
        { k: 'rev', ax: 'y', at: [0, 0], m: 'al', h: 0, p: [[0, 10], [0, 40], [12, 40], [12, 32.4], [9.3, 32.4], [9.3, 27.6], [12, 27.6], [12, 10]] },
        { k: 'rev', ax: 'y', at: [0, 0], m: 'rubber', p: ell(10.65, 30, 1.35, 2.15) },
        { k: 'rev', ax: 'y', at: [0, 0], m: 'al', h: 1, p: box(12, 10, 18, 40) },
        { k: 'rev', ax: 'y', at: [36, 0], m: 'steel', full: true, p: [[4, 0], [18, 0], [18, 2.5], [4, 2.5]] },
        { k: 'rev', ax: 'y', at: [36, 0], m: 'steel', full: true, p: [[18, 0], [21, 0], [21, 4.2], [18, 4.2]] }
      ],
      seg: 3,
      axes: [[36, 1, 36, 24]],
      tags: [[0, 31.6, 10.65, 47, 11], [1, 28.2, 9.5, 24, -6], [2, 20, 17.5, 16, 28]],
      res: { at: [[29.5, 11.9]], lab: [29, 29] }
    },
    gap: {
      parts: [
        { k: 'ext', m: 'pc', h: 0, z: [-30, 0], p: [[-10, 0], [42.5, 0], [42.5, 22.5], [40, 22.5], [40, 2.5], [-10, 2.5]] },
        { k: 'rev', ax: 'y', at: [0, 0], m: 'pc', h: 0, p: box(2.5, 1.55, 12, 4) },
        { k: 'ext', m: 'pc', h: 1, z: [-30, 0], p: [[-10, 20], [36.7, 20], [36.7, 13], [39.2, 13], [39.2, 22.5], [-10, 22.5]] },
        { k: 'rev', ax: 'y', at: [0, 0], m: 'pc', p: box(6, 0, 20, 1.5) },
        { k: 'ext', m: 'res', z: [-30, 0], p: box(39.2, 13, 40, 22.5) }
      ],
      seg: 3,
      axes: [[0, -3, 0, 25]],
      tags: [[0, 20, 1.2, 20, -8], [1, 20, 21.2, 20, 32], [2, 0, 9, -16, 9], [3, 41.2, 16, 52, 16]],
      res: { at: [[39.6, 17]], lab: [44, 31] }
    },
    tpad: {
      parts: [
        { k: 'ext', m: 'pcb', h: 1, z: [-20, 0], p: box(0, 0, 60, 1.6) },
        { k: 'ext', m: 'chip', z: [-10, 0], p: box(20, 1.65, 40, 6.15) },
        { k: 'ext', m: 'res', z: [-10, 0], p: box(20, 6.15, 40, 7.7) },
        { k: 'rev', ax: 'y', at: [5, 0], m: 'al', h: 2, p: box(1.6, 0, 7.7, 2.5) },
        { k: 'rev', ax: 'y', at: [55, 0], m: 'al', h: 2, p: box(1.6, 0, 7.7, 2.5) },
        { k: 'ext', m: 'al', h: 0, z: [-20, 0], p: box(-2, 7.7, 62, 11) }
      ].concat(range(10, i => ({ k: 'ext', m: 'al', h: 0, z: [-20, 0], p: box(-2 + i * 6.9, 11, -0.2 + i * 6.9, 21) }))),
      seg: 2,
      axes: [[5, -2, 5, 9], [55, -2, 55, 9]],
      tags: [[0, 5, 4.5, -8, 4], [1, 38, 4, 46, 4], [2, 22, 1.63, 13, -6], [3, 8, 0.8, 1, -6], [4, 44, 7.8, 70, 9]],
      res: { at: [[20.5, 6.9]], lab: [13, 6.2] }
    },
    mezz: {
      parts: [
        { k: 'ext', m: 'pcb', h: 1, z: [-20, 0], p: box(0, 0, 60, 1.6) },
        { k: 'ext', m: 'pcb', h: 1, z: [-20, 0], p: box(0, 9.6, 60, 11.2) },
        { k: 'rev', ax: 'y', at: [5, 0], m: 'brass', h: 2, p: box(1.6, 0, 9.6, 2.5) },
        { k: 'rev', ax: 'y', at: [55, 0], m: 'brass', h: 2, p: box(1.6, 0, 9.6, 2.5) },
        { k: 'ext', m: 'conn', h: 0, z: [-8, 0], p: [[20, 1.65], [40, 1.65], [40, 5.65], [37, 5.65], [37, 2.65], [23, 2.65], [23, 5.65], [20, 5.65]] },
        { k: 'ext', m: 'conn', h: 1, z: [-7, 0], p: box(23.2, 4.05, 36.8, 9.55) },
        { k: 'ext', m: 'res', z: [-7, 0], p: box(23.2, 4.05, 36.8, 5.65) }
      ],
      seg: 2,
      axes: [[5, -2, 5, 13], [55, -2, 55, 13]],
      tags: [[0, 21.5, 3.5, 13, 4], [1, 33, 8, 47, 8], [2, 55, 6, 68, 6], [3, 39, 1.63, 50, -6], [4, 10, 10.4, 10, 18]],
      res: { at: [[30, 4.85]], lab: [30, -7] }
    },
    battery: {
      parts: [
        { k: 'ext', m: 'al', h: 0, z: [-50, 0], p: box(0, -5, 12, 112) },
        { k: 'ext', m: 'al', h: 0, z: [-50, 0], p: box(295.5, -5, 307.5, 112) }
      ].concat(
        range(10, i => ({ k: 'ext', m: 'cell', h: 1, z: [-46, 0], p: box(12 + i * 28.5, 0, 39 + i * 28.5, 90) })),
        range(9, i => ({ k: 'ext', m: 'res', z: [-46, 0], p: box(39 + i * 28.5, 0, 40.5 + i * 28.5, 90) })),
        range(10, i => ({ k: 'ext', m: 'steel', z: [-38, -26], p: box(20 + i * 28.5, 90, 31 + i * 28.5, 95) })),
        [
          { k: 'rev', ax: 'x', at: [0, 104], m: 'steel', p: box(-10, 0, 317, 4) },
          { k: 'rev', ax: 'x', at: [0, 104], m: 'steel', h: 2, p: box(-6, 4, 0, 7) },
          { k: 'rev', ax: 'x', at: [0, 104], m: 'steel', h: 2, p: box(307.5, 4, 313.5, 7) }
        ]),
      seg: 12,
      axes: [[-14, 104, 321, 104]],
      tags: [[0, 25.5, 30, 25, -20], [1, 39.75, 20, 55, -20], [2, 6, 40, -14, 40], [3, 150, 104, 150, 124]],
      res: { at: [[210.75, 20]], lab: [240, -20] }
    }
  };

  // Faces of the half-section, z <= 0. Cut faces lie in z = 0 and are drawn last.
  function build(scene) {
    const seg = scene.seg || 5, back = [], cut = [], front = [];
    scene.parts.forEach(o => {
      if (o.k === 'rev') {
        const p = ccw(o.p);
        for (let i = 0; i < p.length; i++) {
          const [a0, r0] = p[i], [a1, r1] = p[(i + 1) % p.length];
          if (r0 < 1e-9 && r1 < 1e-9) continue;
          const len = Math.hypot(a1 - a0, r1 - r0), k = Math.max(1, Math.ceil(len / seg));
          const na = (r1 - r0) / len, nr = -(a1 - a0) / len;
          for (let j = 0; j < HALF; j++) {
            const t0 = Math.PI * (1 + j / HALF), t1 = Math.PI * (1 + (j + 1) / HALF), tm = (t0 + t1) / 2;
            const n = o.ax === 'y' ? [nr * Math.cos(tm), na, nr * Math.sin(tm)] : [na, nr * Math.cos(tm), nr * Math.sin(tm)];
            if (dot(n, V) <= 1e-6) continue;
            for (let q = 0; q < k; q++) {
              const A = [a0 + (a1 - a0) * q / k, r0 + (r1 - r0) * q / k], B = [a0 + (a1 - a0) * (q + 1) / k, r0 + (r1 - r0) * (q + 1) / k];
              back.push({ m: o.m, n, pts: [revPt(o, A[0], A[1], t0), revPt(o, B[0], B[1], t0), revPt(o, B[0], B[1], t1), revPt(o, A[0], A[1], t1)] });
            }
          }
        }
        [Math.PI, 2 * Math.PI].forEach(th => cut.push({ m: o.m, n: [0, 0, 1], pts: p.map(v => revPt(o, v[0], v[1], th)) }));
      } else if (o.k === 'ext') {
        const p = ccw(o.p), [z0, z1] = o.z, kz = Math.max(1, Math.ceil((z1 - z0) / seg));
        for (let i = 0; i < p.length; i++) {
          const [x0, y0] = p[i], [x1, y1] = p[(i + 1) % p.length];
          const len = Math.hypot(x1 - x0, y1 - y0);
          if (len < 1e-9) continue;
          const n = [(y1 - y0) / len, -(x1 - x0) / len, 0];
          if (dot(n, V) <= 1e-6) continue;
          const k = Math.max(1, Math.ceil(len / seg));
          const X = u => x0 + (x1 - x0) * u, Y = u => y0 + (y1 - y0) * u;
          for (let q = 0; q < k; q++) {
            for (let w = 0; w < kz; w++) {
              const u0 = q / k, u1 = (q + 1) / k, za = z0 + (z1 - z0) * w / kz, zb = z0 + (z1 - z0) * (w + 1) / kz;
              back.push({ m: o.m, n, pts: [[X(u0), Y(u0), za], [X(u1), Y(u1), za], [X(u1), Y(u1), zb], [X(u0), Y(u0), zb]] });
            }
          }
        }
        (z1 === 0 ? cut : back).push({ m: o.m, n: [0, 0, 1], pts: p.map(v => [v[0], v[1], z1]), edge: true });
      } else if (o.k === 'ball') {
        for (let i = 0; i < o.n; i++) {
          const c = revPt(o, o.a, o.r, Math.PI * (1 + i / (o.n - 1)));
          (Math.abs(c[2]) < 1e-6 ? front : back).push({ m: o.m, ball: true, c, r: o.br });
        }
      }
    });
    return { back, cut, front };
  }

  // painter's order by centroid; thin result volumes win ties against the faces around them
  const depth = f => (f.ball ? f.c[0] + f.c[1] + f.c[2] : f.pts.reduce((s, v) => s + v[0] + v[1] + v[2], 0) / f.pts.length) + (f.m === 'res' ? 1.5 : 0);
  const f1 = x => x.toFixed(1);
  const ptsAttr = a => a.map(v => f1(v[0]) + ',' + f1(v[1])).join(' ');

  // Fit points (in drawing units) into a box of at most W × H px; y grows downwards.
  function fitter(pts, padX, padY, W, H) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    pts.forEach(v => { x0 = Math.min(x0, v[0]); x1 = Math.max(x1, v[0]); y0 = Math.min(y0, v[1]); y1 = Math.max(y1, v[1]); });
    const k = Math.min(W / Math.max(1e-9, x1 - x0), H / Math.max(1e-9, y1 - y0));
    return {
      k, map: v => [(v[0] - x0) * k + padX, (v[1] - y0) * k + padY],
      vb: '0 0 ' + f1((x1 - x0) * k + 2 * padX) + ' ' + f1((y1 - y0) * k + 2 * padY)
    };
  }

  function defs(pfx) {
    return '<defs>' + [[45, 5], [-45, 5], [45, 2.8]].map(([a, s], i) =>
      '<pattern id="' + pfx + '-h' + i + '" patternUnits="userSpaceOnUse" width="' + s + '" height="' + s + '" patternTransform="rotate(' + a + ')">' +
      '<line class="pv-hl" x1="' + s / 2 + '" y1="0" x2="' + s / 2 + '" y2="' + s + '"/></pattern>').join('') + '</defs>';
  }

  // balloons and the result marker, given a point mapper from scene (x, y) to px
  function overlay(scene, P, o) {
    let g = '';
    const r = scene.res;
    if (r && r.dim) {
      const [xa, xb, y, ea, eb] = r.dim, A = P([xa, y]), B = P([xb, y]), EA = P([xa, ea]), EB = P([xb, eb]);
      const ext = (e, d) => { const v = [d[0] - e[0], d[1] - e[1]], l = Math.hypot(v[0], v[1]) || 1; return '<line class="pv-res" x1="' + f1(e[0]) + '" y1="' + f1(e[1]) + '" x2="' + f1(d[0] + v[0] / l * 5) + '" y2="' + f1(d[1] + v[1] / l * 5) + '"/>'; };
      const head = (p, q) => {
        const v = [q[0] - p[0], q[1] - p[1]], l = Math.hypot(v[0], v[1]) || 1, u = [v[0] / l, v[1] / l], w = [-u[1], u[0]];
        return '<path class="pv-res-f" d="M' + f1(p[0]) + ' ' + f1(p[1]) + 'L' + f1(p[0] + u[0] * 9 + w[0] * 3.2) + ' ' + f1(p[1] + u[1] * 9 + w[1] * 3.2) + 'L' + f1(p[0] + u[0] * 9 - w[0] * 3.2) + ' ' + f1(p[1] + u[1] * 9 - w[1] * 3.2) + 'Z"/>';
      };
      g += ext(EA, A) + ext(EB, B) + '<line class="pv-res" x1="' + f1(A[0]) + '" y1="' + f1(A[1]) + '" x2="' + f1(B[0]) + '" y2="' + f1(B[1]) + '"/>' + head(A, B) + head(B, A);
      g += '<text class="pv-res-t" x="' + f1((A[0] + B[0]) / 2) + '" y="' + f1((A[1] + B[1]) / 2 - 6) + '" text-anchor="middle">' + o.resLabel + '</text>';
    } else if (r) {
      const L = P(r.lab);
      r.at.forEach(a => { const A = P(a); g += '<line class="pv-res" x1="' + f1(L[0]) + '" y1="' + f1(L[1] + 4) + '" x2="' + f1(A[0]) + '" y2="' + f1(A[1]) + '"/><circle class="pv-res-f" cx="' + f1(A[0]) + '" cy="' + f1(A[1]) + '" r="2.2"/>'; });
      g += '<text class="pv-res-t" x="' + f1(L[0]) + '" y="' + f1(L[1]) + '" text-anchor="middle">' + o.resLabel + '</text>';
    }
    (scene.tags || []).forEach(([i, ax, ay, bx, by]) => {
      const tg = o.tags && o.tags[i];
      if (!tg) return;
      const A = P([ax, ay]), B = P([bx, by]);
      g += '<g class="pv-tag" data-id="' + tg.id + '"' + (o.interactive ? ' tabindex="0" role="button" aria-label="' + tg.aria + '"' : '') + '><title>' + tg.title + '</title>' +
        '<line class="pv-lead" x1="' + f1(A[0]) + '" y1="' + f1(A[1]) + '" x2="' + f1(B[0]) + '" y2="' + f1(B[1]) + '"/>' +
        '<circle class="pv-dot" cx="' + f1(A[0]) + '" cy="' + f1(A[1]) + '" r="2"/>' +
        '<circle class="pv-ball" cx="' + f1(B[0]) + '" cy="' + f1(B[1]) + '" r="10"/>' +
        '<text class="pv-num" x="' + f1(B[0]) + '" y="' + f1(B[1] + 4) + '" text-anchor="middle">' + tg.num + '</text></g>';
    });
    return g;
  }

  function flat2d(scene, o) {
    const items = [];
    scene.parts.forEach(p => {
      if (p.k === 'rev') {
        const side = s => p.p.map(v => (p.ax === 'y' ? [p.at[0] + s * v[1], p.at[1] + v[0]] : [p.at[0] + v[0], p.at[1] + s * v[1]]));
        items.push({ pts: side(1), m: p.m, h: p.h });
        if (!scene.half || p.full) items.push({ pts: side(-1), m: p.m, h: p.h });
      } else if (p.k === 'ext') {
        items.push({ pts: p.p, m: p.m, h: p.h, beyond: !(p.z[0] <= 0 && p.z[1] >= 0) });
      } else if (p.k === 'ball') {
        for (let i = 0; i < p.n; i++) {
          const c = revPt(p, p.a, p.r, Math.PI * (1 + i / (p.n - 1)));
          if (Math.abs(c[2]) < 1e-6 && (!scene.half || c[1] >= p.at[1] - 1e-9)) items.push({ c, r: p.br, m: p.m });
        }
      }
    });
    const all = [];
    items.forEach(it => { if (it.pts) all.push(...it.pts); else all.push([it.c[0] - it.r, it.c[1] - it.r], [it.c[0] + it.r, it.c[1] + it.r]); });
    (scene.axes || []).forEach(a => all.push([a[0], a[1]], [a[2], a[3]]));
    (scene.tags || []).forEach(t => all.push([t[3], t[4]]));
    if (scene.res && scene.res.dim) { const d = scene.res.dim; all.push([d[0], d[2] + 3], [d[1], d[2] + 3]); }
    if (scene.res && scene.res.lab) all.push(scene.res.lab);
    const F = fitter(all.map(v => [v[0], -v[1]]), 24, 24, o.W || 640, o.H || 360);
    const P = v => F.map([v[0], -v[1]]);
    const pfx = o.pfx || 'pv';
    let g = defs(pfx);
    const sorted = items.filter(i => i.beyond).concat(items.filter(i => !i.beyond));
    sorted.forEach(it => {
      if (it.c) {
        const c = P(it.c);
        g += '<circle class="pv-o" cx="' + f1(c[0]) + '" cy="' + f1(c[1]) + '" r="' + f1(it.r * F.k) + '" style="fill:' + color(it.m, 1.12, o.dark) + '"/>';
        return;
      }
      const pts = ptsAttr(it.pts.map(P));
      if (it.m === 'res') { g += '<polygon class="pv-o pv-res-f" points="' + pts + '" style="stroke:var(--heat)"/>'; return; }
      if (it.beyond) { g += '<polygon class="pv-o pv-beyond" points="' + pts + '" style="fill:' + color(it.m, 1.1, o.dark) + '"/>'; return; }
      g += '<polygon points="' + pts + '" style="fill:' + color(it.m, it.h == null ? 1 : 1.12, o.dark) + '"/>';
      g += '<polygon class="pv-o" points="' + pts + '" style="fill:' + (it.h == null ? 'none' : 'url(#' + pfx + '-h' + it.h + ')') + '"/>';
    });
    (scene.axes || []).forEach(a => { const A = P([a[0], a[1]]), B = P([a[2], a[3]]); g += '<line class="pv-axis" x1="' + f1(A[0]) + '" y1="' + f1(A[1]) + '" x2="' + f1(B[0]) + '" y2="' + f1(B[1]) + '"/>'; });
    return { vb: F.vb, g: g + overlay(scene, P, o) };
  }

  function iso3d(scene, o) {
    const B = build(scene);
    const proj = v => [(v[0] - v[2]) * C30, (v[0] + v[2]) * 0.5 - v[1]];
    const all = [];
    B.back.concat(B.cut, B.front).forEach(f => {
      if (f.ball) { const c = proj(f.c); all.push([c[0] - f.r, c[1] - f.r], [c[0] + f.r, c[1] + f.r]); } else f.pts.forEach(v => all.push(proj(v)));
    });
    const on = v => proj([v[0], v[1], 0]);
    (scene.tags || []).forEach(t => all.push(on([t[3], t[4]])));
    if (scene.res && scene.res.dim) { const d = scene.res.dim; all.push(on([d[0], d[2] + 3]), on([d[1], d[2] + 3])); }
    if (scene.res && scene.res.lab) all.push(on(scene.res.lab));
    const F = fitter(all, 24, 24, o.W || 640, o.H || 360);
    const P3 = v => F.map(proj(v)), P = v => F.map(on(v));
    const face = (f, cls) => {
      const shade = f.cut ? 1.06 : 0.62 + 0.45 * Math.max(0, dot(f.n, LIGHT));
      const c = color(f.m, shade, o.dark);
      return '<polygon' + (cls ? ' class="' + cls + '"' : '') + ' points="' + ptsAttr(f.pts.map(P3)) + '" style="fill:' + c + (cls ? '' : ';stroke:' + c) + '"/>';
    };
    const ball = f => {
      const c = P3(f.c), r = f.r * F.k;
      return '<circle class="pv-o" cx="' + f1(c[0]) + '" cy="' + f1(c[1]) + '" r="' + f1(r) + '" style="fill:' + color(f.m, 1.05, o.dark) + '"/>' +
        '<circle cx="' + f1(c[0] - r * 0.3) + '" cy="' + f1(c[1] - r * 0.3) + '" r="' + f1(r * 0.3) + '" style="fill:#fff;opacity:0.45"/>';
    };
    let g = '';
    B.back.sort((a, b) => depth(a) - depth(b)).forEach(f => { g += f.ball ? ball(f) : face(f, f.edge ? 'pv-edge' : ''); });
    B.cut.forEach(f => { f.cut = true; g += face(f, 'pv-edge'); });
    B.front.forEach(f => { g += ball(f); });
    (scene.axes || []).forEach(a => { const A = P([a[0], a[1]]), Q = P([a[2], a[3]]); g += '<line class="pv-axis" x1="' + f1(A[0]) + '" y1="' + f1(A[1]) + '" x2="' + f1(Q[0]) + '" y2="' + f1(Q[1]) + '"/>'; });
    return { vb: F.vb, g: g + overlay(scene, P, o) };
  }

  root.Preview = {
    has: k => !!S[k],
    // view '2d' or 'iso'. o: {dark, pfx, resLabel, tags: {row: {id, num, title, aria}}, interactive, W, H}
    markup: (k, view, o) => (view === '2d' ? flat2d : iso3d)(S[k], o || {})
  };
})(window);
