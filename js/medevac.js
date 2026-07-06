// OPORD Trainer — 9-Line MEDEVAC request practice
// Generates a random casualty scenario, then scores the cadet's 9-line
// request against the answers implied by that scenario.
(() => {
  const $ = id => document.getElementById(id);
  const show = el => el.classList.remove("hidden");
  const hide = el => el.classList.add("hidden");
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const pad2 = n => String(n).padStart(2, "0");

  const randGrid = () => {
    const n4 = () => pad2(Math.floor(Math.random() * 100)) + pad2(Math.floor(Math.random() * 100));
    return `${n4()} ${n4()}`;
  };
  const randFreq = () => `${30 + Math.floor(Math.random() * 58)}.${pick(["00", "25", "50", "75"])}`;
  const CALL_SIGNS = ["RED 1", "WHITE 2", "BLUE 3", "SABER 4", "TALON 2"];
  const SUFFIXES = ["ALPHA", "BRAVO", "CHARLIE", "DELTA"];

  const EQUIPMENT = { A: "None", B: "Hoist", C: "Extraction equipment", D: "Ventilator" };
  const SECURITY = {
    N: "No enemy troops in the area",
    P: "Possible enemy troops in the area (approach with caution)",
    E: "Enemy troops in the area (approach with caution)",
    X: "Enemy troops in the area (armed escort required)"
  };
  const MARKING = { A: "Panels", B: "Pyrotechnic signal", C: "Smoke signal", D: "None", E: "Other/verbally" };
  const NATIONALITY = { A: "US military", B: "US civilian", C: "Non-US military", D: "Non-US civilian", E: "EPW" };
  const TERRAIN = { OPEN: "Open field", WOOD: "Wood line", HILL: "Hilltop, no clearing", URBAN: "Built-up/urban area", DRAW: "Wooded draw" };

  // Each scenario template fixes the medically-implied answers (precedence,
  // equipment, patient mix); grid/freq/terrain/security/marking/nationality
  // are randomized per-playthrough but kept internally consistent.
  const TEMPLATES = [
    {
      injury: "an IED strike; one soldier has an arterial bleed from the leg and is going into shock",
      precedence: "A", count: 1, litter: 1, ambulatory: 0,
      equipmentByTerrain: { OPEN: "A", WOOD: "C", HILL: "B", URBAN: "A", DRAW: "C" }
    },
    {
      injury: "a gunshot wound to the chest; the casualty is conscious but has labored breathing and needs surgery en route",
      precedence: "B", count: 1, litter: 1, ambulatory: 0,
      equipmentByTerrain: { OPEN: "A", WOOD: "C", HILL: "B", URBAN: "A", DRAW: "C" }
    },
    {
      injury: "a vehicle rollover; two soldiers have suspected fractures but are stable and alert",
      precedence: "C", count: 2, litter: 1, ambulatory: 1,
      equipmentByTerrain: { OPEN: "A", WOOD: "A", HILL: "B", URBAN: "A", DRAW: "A" }
    },
    {
      injury: "a heat casualty during a road march; the soldier is conscious, walking, and cooling in the shade",
      precedence: "D", count: 1, litter: 0, ambulatory: 1,
      equipmentByTerrain: { OPEN: "A", WOOD: "A", HILL: "A", URBAN: "A", DRAW: "A" }
    },
    {
      injury: "a fall from a rappel tower; the cadet has a suspected spinal injury and cannot be moved without a litter",
      precedence: "B", count: 1, litter: 1, ambulatory: 0,
      equipmentByTerrain: { OPEN: "A", WOOD: "C", HILL: "C", URBAN: "A", DRAW: "C" }
    },
    {
      injury: "a training accident; one soldier has a broken ankle and can be assisted to walk to the pickup site",
      precedence: "C", count: 1, litter: 0, ambulatory: 1,
      equipmentByTerrain: { OPEN: "A", WOOD: "A", HILL: "A", URBAN: "A", DRAW: "A" }
    },
    {
      injury: "an ambush; three soldiers are down — one unresponsive with a head wound, two with minor shrapnel wounds who can walk",
      precedence: "A", count: 3, litter: 1, ambulatory: 2,
      equipmentByTerrain: { OPEN: "A", WOOD: "C", HILL: "B", URBAN: "A", DRAW: "C" }
    }
  ];

  const TERRAIN_KEYS = Object.keys(TERRAIN);
  const MARKING_BY_TERRAIN = { OPEN: "C", WOOD: "A", HILL: "B", URBAN: "A", DRAW: "C" };
  const SECURITY_OPTIONS = ["N", "P", "E", "X"];
  const NATIONALITY_KEYS = Object.keys(NATIONALITY);

  function generateScenario() {
    const t = pick(TEMPLATES);
    const terrainKey = pick(TERRAIN_KEYS);
    const security = pick(SECURITY_OPTIONS);
    const nationality = pick(NATIONALITY_KEYS);
    const grid = randGrid();
    const freq = randFreq();
    const callSign = pick(CALL_SIGNS);
    const suffix = pick(SUFFIXES);
    const equipment = t.equipmentByTerrain[terrainKey];
    const marking = MARKING_BY_TERRAIN[terrainKey];

    const securityLine = security === "N"
      ? "The area has been clear of enemy activity all morning."
      : security === "P"
      ? "There have been unconfirmed sightings of enemy movement in the area — approach with caution."
      : security === "E"
      ? "Enemy troops are confirmed in the area — approach with caution."
      : "Enemy troops are in the area in strength — an armed escort is required for the pickup.";

    const narrative =
      `Your squad is at grid ${grid}, operating on FM ${freq}, call sign ${callSign} ${suffix}. ` +
      `You have a casualty from ${t.injury}. The pickup site is a ${TERRAIN[terrainKey].toLowerCase()}. ${securityLine} ` +
      `The patient(s) ${nationality === "A" ? "are US military" : nationality === "B" ? "are US civilian" : nationality === "C" ? "are non-US military" : nationality === "D" ? "are non-US civilian" : "include a detained enemy combatant (EPW)"}. ` +
      `You have ${marking === "C" ? "smoke" : marking === "A" ? "VS-17 panels" : marking === "B" ? "a pyrotechnic signal" : "no marking material"} available to mark the site.`;

    return {
      narrative, grid, freq, callSign, suffix,
      precedence: t.precedence, count: t.count, litter: t.litter, ambulatory: t.ambulatory,
      equipment, security, marking, nationality, terrainKey
    };
  }

  // ---------------- form rendering ----------------
  function chipRow(name, options, correctKey) {
    return `<div class="medevac-chips" data-field="${name}">` +
      Object.keys(options).map(k => `<button type="button" class="tlp-chip" data-val="${k}">${k} — ${options[k]}</button>`).join("") +
      `</div>`;
  }

  function renderForm(sc) {
    $("medevacForm").innerHTML = `
      <div class="medevac-line">
        <label class="field-label">LINE 1 — Location of pickup site (grid)</label>
        <input class="nav-field-input" id="mLine1" placeholder="e.g. 87 32 45 61" autocomplete="off">
      </div>
      <div class="medevac-line">
        <label class="field-label">LINE 2 — Radio frequency, call sign, suffix</label>
        <input class="nav-field-input" id="mLine2" placeholder="e.g. 45.25, RED 1 ALPHA" autocomplete="off">
      </div>
      <div class="medevac-line">
        <label class="field-label">LINE 3 — Number of patients by precedence</label>
        ${chipRow("precedence", { A: "Urgent", B: "Urgent Surgical", C: "Priority", D: "Routine", E: "Convenience" })}
        <input class="nav-field-input" id="mLine3count" type="number" inputmode="numeric" placeholder="How many patients?" style="margin-top:8px;">
      </div>
      <div class="medevac-line">
        <label class="field-label">LINE 4 — Special equipment required</label>
        ${chipRow("equipment", EQUIPMENT)}
      </div>
      <div class="medevac-line">
        <label class="field-label">LINE 5 — Number of patients by type</label>
        <div class="nav-input-row">
          <input class="nav-field-input" id="mLine5litter" type="number" inputmode="numeric" placeholder="Litter">
          <input class="nav-field-input" id="mLine5amb" type="number" inputmode="numeric" placeholder="Ambulatory">
        </div>
      </div>
      <div class="medevac-line">
        <label class="field-label">LINE 6 — Security at pickup site</label>
        ${chipRow("security", SECURITY)}
      </div>
      <div class="medevac-line">
        <label class="field-label">LINE 7 — Method of marking pickup site</label>
        ${chipRow("marking", MARKING)}
      </div>
      <div class="medevac-line">
        <label class="field-label">LINE 8 — Patient nationality and status</label>
        ${chipRow("nationality", NATIONALITY)}
      </div>
      <div class="medevac-line">
        <label class="field-label">LINE 9 — Terrain description at pickup site</label>
        ${chipRow("terrain", TERRAIN)}
      </div>
    `;
    document.querySelectorAll("#medevacForm .medevac-chips").forEach(group => {
      group.querySelectorAll(".tlp-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          group.querySelectorAll(".tlp-chip").forEach(c => c.classList.remove("chip-selected"));
          chip.classList.add("chip-selected");
        });
      });
    });
  }

  function selectedVal(field) {
    const sel = document.querySelector(`#medevacForm .medevac-chips[data-field="${field}"] .chip-selected`);
    return sel ? sel.dataset.val : null;
  }

  function normGrid(s) { return (s || "").replace(/\D/g, ""); }
  function normFreqCall(s) { return (s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }

  function scoreForm(sc) {
    const items = [];

    const g1 = normGrid($("mLine1").value);
    items.push({ label: "Line 1 — Pickup grid", ok: g1 === normGrid(sc.grid) && g1.length === 8, expected: sc.grid, points: 15 });

    const g2 = normFreqCall($("mLine2").value);
    const expect2 = normFreqCall(`${sc.freq}${sc.callSign}${sc.suffix}`);
    const freqOnly = g2.includes(normFreqCall(sc.freq));
    const callOnly = g2.includes(normFreqCall(sc.callSign));
    items.push({ label: "Line 2 — Freq / call sign / suffix", ok: g2 === expect2 || (freqOnly && callOnly), expected: `${sc.freq}, ${sc.callSign} ${sc.suffix}`, points: 10 });

    const precedenceOk = selectedVal("precedence") === sc.precedence;
    items.push({ label: "Line 3 — Precedence code", ok: precedenceOk, expected: `${sc.precedence} (${{ A: "Urgent", B: "Urgent Surgical", C: "Priority", D: "Routine", E: "Convenience" }[sc.precedence]})`, points: 10 });
    const countOk = parseInt($("mLine3count").value, 10) === sc.count;
    items.push({ label: "Line 3 — Patient count", ok: countOk, expected: String(sc.count), points: 5 });

    items.push({ label: "Line 4 — Special equipment", ok: selectedVal("equipment") === sc.equipment, expected: `${sc.equipment} (${EQUIPMENT[sc.equipment]})`, points: 10 });

    const litterOk = parseInt($("mLine5litter").value, 10) === sc.litter;
    const ambOk = parseInt($("mLine5amb").value, 10) === sc.ambulatory;
    items.push({ label: "Line 5 — Litter count", ok: litterOk, expected: String(sc.litter), points: 8 });
    items.push({ label: "Line 5 — Ambulatory count", ok: ambOk, expected: String(sc.ambulatory), points: 7 });

    items.push({ label: "Line 6 — Security", ok: selectedVal("security") === sc.security, expected: `${sc.security} (${SECURITY[sc.security]})`, points: 10 });
    items.push({ label: "Line 7 — Marking method", ok: selectedVal("marking") === sc.marking, expected: `${sc.marking} (${MARKING[sc.marking]})`, points: 10 });
    items.push({ label: "Line 8 — Nationality/status", ok: selectedVal("nationality") === sc.nationality, expected: `${sc.nationality} (${NATIONALITY[sc.nationality]})`, points: 10 });
    items.push({ label: "Line 9 — Terrain", ok: selectedVal("terrain") === sc.terrainKey, expected: TERRAIN[sc.terrainKey], points: 5 });

    return items;
  }

  // ---------------- controller ----------------
  let scenario = null;

  function startScenario() {
    scenario = generateScenario();
    $("medevacScenario").textContent = scenario.narrative;
    renderForm(scenario);
    hide($("medevacResults"));
    hide($("drillList"));
    show($("medevacView"));
    window.scrollTo(0, 0);
  }

  $("medevacStart").addEventListener("click", startScenario);
  $("medevacAgain").addEventListener("click", startScenario);
  $("medevacQuit").addEventListener("click", () => { hide($("medevacView")); show($("drillList")); });

  $("medevacSubmit").addEventListener("click", () => {
    const items = scoreForm(scenario);
    const total = items.reduce((s, i) => s + i.points, 0);
    const earned = items.reduce((s, i) => s + (i.ok ? i.points : 0), 0);
    const pct = Math.round((earned / total) * 100);
    $("medevacScoreBig").textContent = `${pct}%`;
    $("medevacResultsList").innerHTML = items.map(i => `
      <div class="result-item">
        <span class="${i.ok ? "result-hit" : "result-miss"}">${i.ok ? "✓" : "✗"}</span>
        <span class="ri-label">${i.label}</span>
        <span class="ri-val">${i.expected}</span>
      </div>`).join("");
    show($("medevacResults"));
    $("medevacResults").scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
