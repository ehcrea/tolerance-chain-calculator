# Tolerance Chain Calculator

A free, browser-based 1D tolerance stack-up calculator for mechanical and precision assemblies. No install, no account: open the page and build your chain.

**Live:** https://ehcrea.github.io/tolerance-chain-calculator/

## What it does

- **Dimensions** with plain deviations, ISO 286-1 codes (`h8`, `H7`, `js9`, …) or ISO 2768-1 general tolerance classes (f, m, c, v)
- **Angular and form deviations**: angle (deg, arcmin, arcsec, mm/m), geometric zones such as perpendicularity *t* over a length, or ISO 2768-1 angular tolerances, converted to displacement at a lever arm (`L·tan θ`)
- **Fits and positioning pins**: hole/shaft pairs from ISO codes or deviations, with floating, one-sided or full-clearance effect on the chain; transition and interference fits give zero float
- **Play**: bearing internal clearance, backlash, axial play
- **Thermal expansion** per part (material library or custom α) relative to the ISO 1 reference temperature of 20 °C, including clearance change between hole and shaft materials
- **Results** at minimum ambient, 20 °C and maximum ambient: worst case, RSS and Monte Carlo, with pass/fail against limits, ppm out of limits, Cpk, a histogram and a variance contribution chart
- **SI or imperial units**: switch between mm/°C and inch/°F at any time. Calculations and saved files always stay in mm and °C, so a stack opens the same in either mode; ISO 286 and ISO 2768 values are looked up from the metric size and shown converted
- **About and footer**: an *About* dialog (also at `#about`) and a footer with links to [ehcrea.com](https://ehcrea.com) and the MIT license, styled like the other ehcrea calculators
- **Assembly view**: each example comes with a schematic 2D section and a 3D isometric half-section of its parts; numbered balloons match the contributors (click one to jump to it) and the measured result is marked in orange
- **Chain diagram**: arrows with a ± tolerance band at each tip, coloured by share of result variance; hover for details, click to jump to the contributor; switch between equal steps and true scale
- **Exports**: CSV and Excel (.xlsx) downloads with three tables: contributors, results by temperature and Monte Carlo histogram data, in the unit currently selected
- **PDF report**: A4 report with header (stack, date, revision, author), summary, assembly view (for examples), contributors, chain diagram, results, histograms at all three temperatures, contribution chart and method notes. Press *PDF report* and choose *Save as PDF* in the print dialog
- **Light/dark theme toggle**: follows the system setting until switched, then remembered per browser
- **English, German, Dutch and Turkish**: pick the language in the header; it starts in your browser language and is remembered per browser. Examples load with names in the chosen language; your own stacks keep the names you typed
- **Eight worked examples**: bearing cover gap, DIN 471 retaining ring play, gear centre distance with bearing play, sheet metal bracket, pin-located sensor bracket, two-pin machining fixture, ball screw stage with a warm screw, PCB in a plastic housing from −40 to 85 °C

Stacks are saved in the browser and can be saved and loaded as .json files. On iPhone or iPad, *Share → Add to Home Screen* puts the calculator on the home screen with its own icon.

## Method

| Method | Formula |
| --- | --- |
| Worst case | `Σm ± Σh` |
| RSS | `Σm ± √Σh²` (every tolerance treated as a centred ±3σ normal process) |
| Monte Carlo | each contributor sampled from its distribution (normal ±3σ, uniform or triangular) |
| Thermal | `ΔL = α·L·(T + ΔT_part − 20 °C)` |
| Fit clearance | `c = hole − shaft + D·(α_hole·ΔT_hole − α_shaft·ΔT_shaft)` |

`m` is the centre of a contributor's tolerance zone and `h` its half range, both signed by direction and factor.

ISO 286-1 deviations are computed from the fundamental deviation rules for sizes up to 500 mm (holes D–H, JS, K, M, N, P, R, S; shafts d–h, js, k, m, n, p, r, s; grades IT4–IT13). Check critical fits against the published tables, which contain a few special cases.

## Files

- `index.html`: the user interface
- `engine.js`: calculation engine, also usable from Node (`require('./engine.js')`)
- `preview.js`: the example assemblies and their 2D / isometric drawing
- `i18n.js`: translation helper; `i18n/de.js`, `i18n/nl.js`, `i18n/tr.js` map the English text to each language
- `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `manifest.webmanifest`: browser and home-screen icons

## Disclaimer

This is an engineering aid. Verify results for safety-critical or production decisions.

## License

MIT. See [LICENSE](LICENSE).
