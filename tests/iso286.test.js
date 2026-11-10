/* ISO 286 fit deviations from engine.js checked against the published ISO 286-2 tables.
   Run: node tests/iso286.test.js (exits with code 1 on any mismatch). */
'use strict';
const { iso286 } = require('../engine.js');

// [code, nominal size mm, upper deviation µm, lower deviation µm] from ISO 286-2
const CASES = [
  // Holes, basic H
  ['H7', 3, 10, 0], ['H7', 10, 15, 0], ['H7', 25, 21, 0], ['H7', 30, 21, 0], ['H7', 30.01, 25, 0],
  ['H7', 50, 25, 0], ['H7', 100, 35, 0], ['H7', 400, 57, 0], ['H8', 25, 33, 0], ['H11', 50, 160, 0],
  // Holes with clearance
  ['D9', 25, 117, 65], ['E8', 25, 73, 40], ['F7', 25, 41, 20], ['F8', 25, 53, 20], ['G7', 25, 28, 7],
  // Holes with the Δ correction (K, M, N up to IT8; P to S up to IT7)
  ['K6', 25, 2, -11], ['K7', 25, 6, -15], ['K8', 25, 10, -23], ['M7', 25, 0, -21], ['M8', 25, 4, -29],
  ['N7', 25, -7, -28], ['N9', 25, 0, -52], ['P7', 25, -14, -35], ['R7', 25, -20, -41], ['S7', 25, -27, -48],
  ['R7', 60, -30, -60], ['K7', 3, 0, -10], ['N7', 3, -4, -14], ['P7', 3, -6, -16],
  ['JS7', 25, 10, -10],
  // Shafts
  ['d9', 25, -65, -117], ['e8', 25, -40, -73], ['f7', 25, -20, -41], ['g6', 3, -2, -8], ['g6', 25, -7, -20],
  ['g6', 50, -9, -25], ['g6', 400, -18, -54], ['h6', 25, 0, -13], ['h9', 100, 0, -87], ['js6', 25, 6.5, -6.5], ['js5', 25, 4.5, -4.5], ['js9', 25, 26, -26],
  ['k6', 3, 6, 0], ['k6', 10, 10, 1], ['k6', 25, 15, 2], ['k6', 50, 18, 2], ['k6', 400, 40, 4],
  ['m6', 25, 21, 8], ['n6', 25, 28, 15], ['p6', 25, 35, 22], ['p6', 50, 42, 26], ['p6', 400, 98, 62],
  ['r6', 25, 41, 28], ['r6', 60, 60, 41], ['s6', 25, 48, 35], ['s6', 60, 72, 53],
];

let failed = 0;
for (const [code, D, up, lo] of CASES) {
  const r = iso286(code, D);
  const got = r.err ? r.err : `${Math.round(r.up * 1e4) / 10}/${Math.round(r.lo * 1e4) / 10}`;
  const ok = !r.err && Math.abs(r.up * 1000 - up) < 1e-6 && Math.abs(r.lo * 1000 - lo) < 1e-6;
  if (!ok) { failed++; console.log(`FAIL ${code} at ${D} mm: expected ${up}/${lo} µm, got ${got}`); }
}

// Codes outside the supported range must give an error, not a number.
for (const [code, D] of [['H7', 0], ['H7', 501], ['x7', 25], ['H3', 25], ['K4', 25]]) {
  if (!iso286(code, D).err) { failed++; console.log(`FAIL ${code} at ${D} mm should be rejected`); }
}

console.log(`${CASES.length + 5 - failed} passed, ${failed} failed`);
if (failed) process.exit(1);
