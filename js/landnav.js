// OPORD Trainer — interactive land navigation practice
// Procedurally generated topographic-style map on a canvas with three games:
//   PLOT  — given a 6-digit grid, tap the map on that point (scored by meters off)
//   READ  — a point is marked; enter its 6-digit grid
//   AZ    — two points are marked; estimate grid azimuth and distance
(() => {
  const $ = id => document.getElementById(id);
  const show = el => el.classList.remove("hidden");
  const hide = el => el.classList.add("hidden");
  const pad2 = n => String(n).padStart(2, "0");

  const ROUNDS = 5;

  const MODES = {
    plot: {
      name: "PLOT THE POINT",
      desc: "You get a 6-digit grid — tap the map where it falls. Scored by how many meters you're off.",
      sizeM: 2000
    },
    read: {
      name: "READ THE GRID",
      desc: "A point is marked on the map — type its 6-digit grid coordinate.",
      sizeM: 2000
    },
    az: {
      name: "AZIMUTH & DISTANCE",
      desc: "Estimate the grid azimuth (degrees) and distance (meters) from the start point ▲ to the objective ●.",
      sizeM: 4000
    }
  };

  // ---------- seeded RNG ----------
  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- map model ----------
  function makeMap(sizeM) {
    const seed = Math.floor(Math.random() * 2 ** 31);
    const r = mulberry32(seed);
    const R = (lo, hi) => lo + r() * (hi - lo);
    const map = {
      sizeM,
      eLabel: 10 + Math.floor(r() * 80),
      nLabel: 10 + Math.floor(r() * 80),
      hills: [], woods: [], stream: null, road: null
    };
    const nHills = 3 + Math.floor(r() * 3);
    for (let i = 0; i < nHills; i++) {
      map.hills.push({
        x: R(0.12, 0.88) * sizeM, y: R(0.12, 0.88) * sizeM,
        r0: R(0.09, 0.2) * sizeM,
        rings: 3 + Math.floor(r() * 4),
        w1: R(0, Math.PI * 2), w2: R(0, Math.PI * 2),
        a1: R(0.08, 0.18), a2: R(0.05, 0.12)
      });
    }
    const nWoods = 2 + Math.floor(r() * 3);
    for (let i = 0; i < nWoods; i++) {
      map.woods.push({
        x: R(0.1, 0.9) * sizeM, y: R(0.1, 0.9) * sizeM,
        r0: R(0.1, 0.22) * sizeM,
        w1: R(0, Math.PI * 2), w2: R(0, Math.PI * 2),
        a1: R(0.2, 0.35), a2: R(0.1, 0.2)
      });
    }
    // stream: meanders top edge to bottom edge
    const sx = R(0.15, 0.85);
    map.stream = {
      pts: Array.from({ length: 7 }, (_, i) => ({
        x: (sx + Math.sin(i * 1.7 + R(0, 6)) * 0.12) * sizeM,
        y: sizeM - (i / 6) * sizeM
      }))
    };
    // road: roughly straight, left edge to right edge
    const ry = R(0.2, 0.8);
    map.road = {
      pts: Array.from({ length: 5 }, (_, i) => ({
        x: (i / 4) * sizeM,
        y: (ry + Math.sin(i * 2.1 + R(0, 6)) * 0.07) * sizeM
      }))
    };
    return map;
  }

  // 6-digit grid string for a point (meters east/north of map SW corner)
  function grid6(map, xm, ym) {
    const e = map.eLabel + Math.floor(xm / 1000);
    const n = map.nLabel + Math.floor(ym / 1000);
    return `${pad2(e)}${Math.floor((xm % 1000) / 100)} ${pad2(n)}${Math.floor((ym % 1000) / 100)}`;
  }

  // ---------- drawing ----------
  const canvas = $("navCanvas");
  const ctx = canvas.getContext("2d");
  let cssSize = 0;

  function fitCanvas() {
    cssSize = Math.min(canvas.parentElement.clientWidth - 2, 560);
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = cssSize + "px";
    canvas.style.height = cssSize + "px";
    canvas.width = Math.round(cssSize * dpr);
    canvas.height = Math.round(cssSize * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const px = (map, xm) => (xm / map.sizeM) * cssSize;
  const py = (map, ym) => cssSize - (ym / map.sizeM) * cssSize;

  function wobblePath(map, b, scale) {
    ctx.beginPath();
    for (let t = 0; t <= 64; t++) {
      const th = (t / 64) * Math.PI * 2;
      const rad = b.r0 * scale * (1 + b.a1 * Math.sin(3 * th + b.w1) + b.a2 * Math.sin(5 * th + b.w2));
      const x = px(map, b.x + rad * Math.cos(th));
      const y = py(map, b.y + rad * Math.sin(th));
      t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function drawMap(map, marks) {
    drawMap.last = [map, marks];
    fitCanvas();
    // paper
    ctx.fillStyle = "#ece4cc";
    ctx.fillRect(0, 0, cssSize, cssSize);
    // woods
    ctx.fillStyle = "rgba(122, 165, 96, 0.5)";
    map.woods.forEach(w => { wobblePath(map, w, 1); ctx.fill(); });
    // contours
    ctx.strokeStyle = "#b3835a";
    map.hills.forEach(h => {
      for (let i = 0; i < h.rings; i++) {
        const scale = 1 - i / h.rings;
        ctx.lineWidth = i === 0 ? 1.6 : 1;
        wobblePath(map, h, scale);
        ctx.stroke();
      }
    });
    // stream
    ctx.strokeStyle = "#4a7fb5";
    ctx.lineWidth = 2;
    ctx.beginPath();
    map.stream.pts.forEach((p, i) => {
      i === 0 ? ctx.moveTo(px(map, p.x), py(map, p.y)) : ctx.lineTo(px(map, p.x), py(map, p.y));
    });
    ctx.stroke();
    // road
    ctx.strokeStyle = "#8a4a3a";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    map.road.pts.forEach((p, i) => {
      i === 0 ? ctx.moveTo(px(map, p.x), py(map, p.y)) : ctx.lineTo(px(map, p.x), py(map, p.y));
    });
    ctx.stroke();
    ctx.setLineDash([]);
    // gridlines + labels
    ctx.strokeStyle = "rgba(20, 20, 20, 0.55)";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#333";
    ctx.font = "700 11px -apple-system, sans-serif";
    for (let m = 0; m <= map.sizeM; m += 1000) {
      const x = px(map, m), y = py(map, m);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cssSize); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cssSize, y); ctx.stroke();
      if (m < map.sizeM) {
        ctx.fillText(pad2(map.eLabel + m / 1000), x + 3, 13);
        ctx.fillText(pad2(map.nLabel + m / 1000), 3, y - 4);
      }
    }
    // north arrow
    ctx.fillStyle = "#333";
    ctx.font = "700 12px -apple-system, sans-serif";
    ctx.fillText("N ↑", cssSize - 30, 16);
    // marks
    (marks || []).forEach(mk => {
      const x = px(map, mk.x), y = py(map, mk.y);
      ctx.lineWidth = 2.5;
      if (mk.shape === "tri") {
        ctx.strokeStyle = mk.color;
        ctx.beginPath();
        ctx.moveTo(x, y - 8); ctx.lineTo(x + 8, y + 7); ctx.lineTo(x - 8, y + 7);
        ctx.closePath(); ctx.stroke();
      } else if (mk.shape === "x") {
        ctx.strokeStyle = mk.color;
        ctx.beginPath();
        ctx.moveTo(x - 7, y - 7); ctx.lineTo(x + 7, y + 7);
        ctx.moveTo(x + 7, y - 7); ctx.lineTo(x - 7, y + 7);
        ctx.stroke();
      } else {
        ctx.strokeStyle = mk.color;
        ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = mk.color; ctx.fill();
      }
      if (mk.label) {
        ctx.fillStyle = mk.color;
        ctx.font = "700 11px -apple-system, sans-serif";
        ctx.fillText(mk.label, x + 10, y - 8);
      }
    });
    // connecting line (feedback)
    if (marks && marks.line) {
      const [a, b] = marks.line;
      ctx.strokeStyle = "#c33";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(px(map, a.x), py(map, a.y));
      ctx.lineTo(px(map, b.x), py(map, b.y));
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // ---------- game state ----------
  let mode = null, map = null, round = 0, score = 0;
  let target = null, target2 = null, tap = null, answered = false;

  function bestScores() {
    const s = JSON.parse(localStorage.getItem("opordTrainerNav") || "{}");
    return s;
  }
  function saveBest(m, val) {
    const s = bestScores();
    if (!s[m] || val > s[m]) { s[m] = val; localStorage.setItem("opordTrainerNav", JSON.stringify(s)); }
  }
  function renderBest() {
    const s = bestScores();
    $("navBest").textContent = Object.keys(MODES)
      .map(k => `${MODES[k].name}: ${s[k] != null ? s[k] + "/100" : "—"}`)
      .join("  ·  ");
  }

  function startGame(m) {
    mode = m; round = 0; score = 0;
    hide($("navHome")); show($("navGame"));
    $("navModeName").textContent = MODES[m].name;
    nextRound();
  }

  function randPoint(margin) {
    const m = margin || 250;
    const snap = v => Math.round(v / 100) * 100; // 6-digit precision
    return {
      x: snap(m + Math.random() * (map.sizeM - 2 * m)),
      y: snap(m + Math.random() * (map.sizeM - 2 * m))
    };
  }

  function nextRound() {
    round++;
    answered = false; tap = null;
    map = makeMap(MODES[mode].sizeM);
    target = randPoint();
    $("navRound").textContent = `ROUND ${round} OF ${ROUNDS} · SCORE ${score}`;
    $("navFeedback").textContent = "";
    hide($("navNext")); hide($("navSubmit"));
    hide($("navReadRow")); hide($("navAzRow"));
    $("navGridIn").value = ""; $("navAzIn").value = ""; $("navDistIn").value = "";

    if (mode === "plot") {
      $("navPrompt").innerHTML = `Plot grid <b>${grid6(map, target.x, target.y)}</b> — tap the map on that point, then submit.`;
      drawMap(map, []);
      show($("navSubmit"));
      $("navSubmit").disabled = true;
    } else if (mode === "read") {
      $("navPrompt").innerHTML = `What is the 6-digit grid of the marked point <b>✕</b>?`;
      drawMap(map, [{ ...target, shape: "x", color: "#b3202a" }]);
      show($("navReadRow")); show($("navSubmit"));
      $("navSubmit").disabled = false;
    } else {
      do { target2 = randPoint(); } while (dist(target, target2) < map.sizeM * 0.3);
      $("navPrompt").innerHTML = `From <b>▲ start</b> to <b>● objective</b>: enter the grid azimuth (0–360°) and distance in meters.`;
      drawMap(map, [
        { ...target, shape: "tri", color: "#1a4d8f", label: "START" },
        { ...target2, shape: "circle", color: "#b3202a", label: "OBJ" }
      ]);
      show($("navAzRow")); show($("navSubmit"));
      $("navSubmit").disabled = false;
    }
  }

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function azimuthDeg(a, b) {
    // grid azimuth from north, clockwise
    return (Math.atan2(b.x - a.x, b.y - a.y) * 180 / Math.PI + 360) % 360;
  }

  // ---------- answering ----------
  canvas.addEventListener("click", e => {
    if (mode !== "plot" || answered) return;
    const rect = canvas.getBoundingClientRect();
    tap = {
      x: ((e.clientX - rect.left) / rect.width) * map.sizeM,
      y: map.sizeM - ((e.clientY - rect.top) / rect.height) * map.sizeM
    };
    drawMap(map, [{ ...tap, shape: "x", color: "#1a4d8f", label: "YOU" }]);
    $("navSubmit").disabled = false;
  });

  function feedback(pts, detail) {
    score += pts;
    answered = true;
    $("navRound").textContent = `ROUND ${round} OF ${ROUNDS} · SCORE ${score}`;
    $("navFeedback").innerHTML = `<b>+${pts} points.</b> ${detail}`;
    hide($("navSubmit"));
    show($("navNext"));
    $("navNext").textContent = round < ROUNDS ? "NEXT ROUND" : "SEE FINAL SCORE";
  }

  $("navSubmit").addEventListener("click", () => {
    if (answered) return;
    if (mode === "plot") {
      if (!tap) return;
      const d = Math.round(dist(tap, target));
      const pts = d <= 50 ? 20 : d <= 100 ? 15 : d <= 150 ? 10 : d <= 250 ? 5 : 0;
      const marks = [
        { ...tap, shape: "x", color: "#1a4d8f", label: "YOU" },
        { ...target, shape: "circle", color: "#b3202a", label: "TRUE" }
      ];
      marks.line = [tap, target];
      drawMap(map, marks);
      feedback(pts, `You were <b>${d}m</b> off. (≤50m for full points.)`);
    } else if (mode === "read") {
      const raw = $("navGridIn").value.replace(/\D/g, "");
      if (raw.length !== 6) { $("navFeedback").textContent = "Enter all 6 digits (e.g. 873456)."; return; }
      const truth = grid6(map, target.x, target.y).replace(/\s/g, "");
      const eOff = Math.abs(parseInt(raw.slice(0, 3), 10) - parseInt(truth.slice(0, 3), 10));
      const nOff = Math.abs(parseInt(raw.slice(3), 10) - parseInt(truth.slice(3), 10));
      const pts = (eOff === 0 && nOff === 0) ? 20 : (eOff <= 1 && nOff <= 1) ? 10 : 0;
      feedback(pts, `Correct grid: <b>${grid6(map, target.x, target.y)}</b>. You said ${raw.slice(0, 3)} ${raw.slice(3)}${pts === 20 ? " — exact. ✓" : pts === 10 ? " — within 100m." : "."}`);
    } else {
      const az = parseFloat($("navAzIn").value);
      const dGuess = parseFloat($("navDistIn").value);
      if (isNaN(az) || isNaN(dGuess)) { $("navFeedback").textContent = "Enter both azimuth and distance."; return; }
      const trueAz = azimuthDeg(target, target2);
      const trueD = dist(target, target2);
      let azErr = Math.abs(az - trueAz); if (azErr > 180) azErr = 360 - azErr;
      const azPts = azErr <= 3 ? 15 : azErr <= 6 ? 12 : azErr <= 10 ? 8 : azErr <= 20 ? 4 : 0;
      const dErr = Math.abs(dGuess - trueD) / trueD;
      const dPts = dErr <= 0.1 ? 5 : dErr <= 0.2 ? 3 : 0;
      const marks = [
        { ...target, shape: "tri", color: "#1a4d8f", label: "START" },
        { ...target2, shape: "circle", color: "#b3202a", label: "OBJ" }
      ];
      marks.line = [target, target2];
      drawMap(map, marks);
      feedback(azPts + dPts,
        `True azimuth <b>${Math.round(trueAz)}°</b> (you: ${Math.round(az)}°, off ${Math.round(azErr)}°). ` +
        `True distance <b>${Math.round(trueD)}m</b> (you: ${Math.round(dGuess)}m).`);
    }
  });

  $("navNext").addEventListener("click", () => {
    if (round < ROUNDS) { nextRound(); return; }
    saveBest(mode, score);
    let msg;
    if (score >= 85) msg = "Expert land navigator. You'd smoke the night course.";
    else if (score >= 65) msg = "Solid GO. Keep sharpening those plots.";
    else if (score >= 40) msg = "Getting there — slow down and read the grid squares first.";
    else msg = "No-go for now. Remember: right and up. Run it again.";
    $("navPrompt").innerHTML = `<b>FINAL SCORE: ${score}/100.</b> ${msg}`;
    $("navFeedback").textContent = "";
    hide($("navNext"));
    show($("navAgainRow"));
  });

  $("navAgain").addEventListener("click", () => { hide($("navAgainRow")); startGame(mode); });
  $("navHomeBtn").addEventListener("click", () => { hide($("navAgainRow")); hide($("navGame")); show($("navHome")); renderBest(); });
  $("navQuit").addEventListener("click", () => { hide($("navGame")); show($("navHome")); renderBest(); });

  document.querySelectorAll("[data-navmode]").forEach(b =>
    b.addEventListener("click", () => startGame(b.dataset.navmode)));

  window.addEventListener("resize", () => {
    if (drawMap.last && !$("navGame").classList.contains("hidden")) drawMap(...drawMap.last);
  });

  renderBest();
})();
