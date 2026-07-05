// OPORD Trainer — app logic
(() => {
  const $ = id => document.getElementById(id);
  const show = el => el.classList.remove("hidden");
  const hide = el => el.classList.add("hidden");

  // ---------------- persistence ----------------
  const store = {
    get() {
      try { return JSON.parse(localStorage.getItem("opordTrainer")) || {}; }
      catch (e) { return {}; }
    },
    set(data) { localStorage.setItem("opordTrainer", JSON.stringify(data)); }
  };

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  function refreshStats() {
    const s = store.get();
    $("streakCount").textContent = s.streak || 0;
    $("statStreak").textContent = s.streak || 0;
    $("statTotal").textContent = s.tasksDone || 0;
    $("statOrders").textContent = s.ordersBriefed || 0;
  }

  function bumpOrdersBriefed() {
    const s = store.get();
    s.ordersBriefed = (s.ordersBriefed || 0) + 1;
    store.set(s);
    refreshStats();
  }

  // ---------------- tabs ----------------
  const TABS = ["today", "orders", "drills", "nav", "study"];
  function goTab(name) {
    TABS.forEach(t => {
      $("tab-" + t).classList.toggle("hidden", t !== name);
      document.querySelector(`.tab-btn[data-tab="${t}"]`).classList.toggle("active", t === name);
    });
    window.scrollTo(0, 0);
  }
  document.querySelectorAll(".tab-btn").forEach(b => b.addEventListener("click", () => goTab(b.dataset.tab)));
  document.querySelectorAll(".quick").forEach(b => b.addEventListener("click", () => {
    const dest = b.dataset.goto;
    if (dest === "study-tlp") { goTab("study"); startTlp(); }
    else goTab(dest);
  }));

  // ---------------- daily task ----------------
  function dayOfYear() {
    const d = new Date();
    return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
  }
  const daily = DAILY_TASKS[dayOfYear() % DAILY_TASKS.length];
  $("dailyTitle").textContent = daily.title;
  $("dailyDesc").textContent = daily.desc;
  $("dailyGo").addEventListener("click", () => goTab(daily.goto));
  $("dailyDone").addEventListener("click", () => {
    const s = store.get();
    if (s.lastDone === todayKey()) { $("dailyStatus").textContent = "Already logged for today. See you tomorrow."; return; }
    const yesterday = new Date(Date.now() - 86400000);
    const yKey = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
    s.streak = (s.lastDone === yKey) ? (s.streak || 0) + 1 : 1;
    s.lastDone = todayKey();
    s.tasksDone = (s.tasksDone || 0) + 1;
    store.set(s);
    refreshStats();
    $("dailyStatus").textContent = `Logged. Streak: ${s.streak} day${s.streak === 1 ? "" : "s"}. 🔥`;
  });
  (() => {
    const s = store.get();
    if (s.lastDone === todayKey()) $("dailyStatus").textContent = "Today's task is logged. ✓";
  })();
  refreshStats();

  // ---------------- orders ----------------
  let currentOrder = null;
  let orderType = "OPORD";

  // populate mission select
  G.MISSIONS.forEach(m => {
    const o = document.createElement("option");
    o.value = m.id;
    o.textContent = m.label;
    $("missionSel").appendChild(o);
  });

  document.querySelectorAll("#orderTypeSeg .seg-btn").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll("#orderTypeSeg .seg-btn").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    orderType = b.dataset.otype;
  }));

  const orderPanels = () => [$("orderView"), $("briefChooser"), $("revealMode"), $("speechMode"), $("resultsView")];
  function showOrderPanel(panel) {
    orderPanels().forEach(hide);
    if (panel) show(panel);
  }

  function renderOrder(order) {
    $("orderTitle").innerHTML = `${order.title}<div class="order-sub">${order.subtitle}</div>`;
    $("orderBody").innerHTML = order.sections.map(sec => `
      <div class="order-section">
        <h4>${sec.title}</h4>
        <div class="order-section-body">
          ${sec.lines.map(l => `<p class="${l.cls}">${l.text}</p>`).join("")}
        </div>
      </div>`).join("");
  }

  function generateOrder() {
    stopSpeaking(); stopListening();
    currentOrder = G.generate(orderType, $("missionSel").value);
    renderOrder(currentOrder);
    show($("orderControls"));
    showOrderPanel($("orderView"));
    window.scrollTo(0, 0);
  }
  $("genOrder").addEventListener("click", generateOrder);
  $("btnNewOrder").addEventListener("click", generateOrder);

  // ---------------- text to speech ----------------
  let speaking = false;
  function stopSpeaking() {
    if (window.speechSynthesis) { speechSynthesis.cancel(); speaking = false; $("btnReadAloud").innerHTML = "&#128266; Read aloud"; }
  }
  $("btnReadAloud").addEventListener("click", () => {
    if (!window.speechSynthesis) { alert("Text-to-speech is not available on this device."); return; }
    if (speaking) { stopSpeaking(); return; }
    const u = new SpeechSynthesisUtterance(currentOrder.speechText);
    u.rate = 0.95;
    u.onend = () => { speaking = false; $("btnReadAloud").innerHTML = "&#128266; Read aloud"; };
    speaking = true;
    $("btnReadAloud").innerHTML = "&#9209; Stop";
    speechSynthesis.speak(u);
  });

  // ---------------- brief-back chooser ----------------
  $("btnBriefBack").addEventListener("click", () => { stopSpeaking(); hide($("orderControls")); showOrderPanel($("briefChooser")); });
  $("briefCancel").addEventListener("click", () => { show($("orderControls")); showOrderPanel($("orderView")); });

  // ---------------- recite & reveal ----------------
  let revealIdx = 0, revealScore = 0;
  function startReveal() {
    revealIdx = 0; revealScore = 0;
    showOrderPanel($("revealMode"));
    showRevealSection();
  }
  function showRevealSection() {
    const sec = currentOrder.sections[revealIdx];
    $("revealProgress").textContent = `${revealIdx + 1} OF ${currentOrder.sections.length}`;
    $("revealSectionTitle").textContent = sec.title;
    $("revealBody").innerHTML = sec.lines.map(l => `<p class="${l.cls}">${l.text}</p>`).join("");
    hide($("revealBody")); hide($("gradeBtns")); show($("revealBtn"));
  }
  $("modeReveal").addEventListener("click", startReveal);
  $("revealBtn").addEventListener("click", () => { show($("revealBody")); hide($("revealBtn")); show($("gradeBtns")); });
  function gradeReveal(good) {
    if (good) revealScore++;
    revealIdx++;
    if (revealIdx < currentOrder.sections.length) { showRevealSection(); window.scrollTo(0, 0); }
    else finishReveal();
  }
  $("gradeGood").addEventListener("click", () => gradeReveal(true));
  $("gradeBad").addEventListener("click", () => gradeReveal(false));
  $("revealQuit").addEventListener("click", () => { show($("orderControls")); showOrderPanel($("orderView")); });

  function finishReveal() {
    const total = currentOrder.sections.length;
    const pct = Math.round((revealScore / total) * 100);
    $("scoreBig").textContent = `${pct}%`;
    $("resultsList").innerHTML = `<p class="hint">${revealScore} of ${total} paragraphs briefed correctly (self-graded).</p>` +
      verdict(pct);
    bumpOrdersBriefed();
    showOrderPanel($("resultsView"));
    window.scrollTo(0, 0);
  }

  function verdict(pct) {
    let msg;
    if (pct >= 90) msg = "Outstanding. That's a GO at Advanced Camp.";
    else if (pct >= 70) msg = "Solid brief. Tighten up the weak paragraphs and run it again.";
    else if (pct >= 50) msg = "Getting there. Re-study the shell and focus on Mission and Execution.";
    else msg = "Needs work. Read the order aloud twice, then brief it paragraph by paragraph.";
    return `<p class="hint">${msg}</p>`;
  }

  // ---------------- speech check ----------------
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recog = null, listening = false, transcript = "";

  function stopListening() {
    if (recog) { try { recog.stop(); } catch (e) {} }
    listening = false;
    $("micBtn").classList.remove("listening");
    $("micState").textContent = "TAP TO START";
  }

  $("modeSpeech").addEventListener("click", () => {
    showOrderPanel($("speechMode"));
    transcript = "";
    hide($("transcriptBox")); hide($("scoreSpeech"));
    if (!SR) {
      $("speechHint").textContent = "Speech recognition isn't available in this browser. On iPhone, open the app in Safari (not the home-screen icon) and try again — or use Recite & Reveal mode instead.";
      $("micBtn").style.opacity = 0.3;
    } else {
      $("speechHint").textContent = "Tap the mic, then brief the full order out loud using the OPORD shell. Tap stop when finished.";
      $("micBtn").style.opacity = 1;
    }
  });

  $("micBtn").addEventListener("click", () => {
    if (!SR) return;
    if (listening) { stopListening(); return; }
    transcript = "";
    recog = new SR();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";
    recog.onresult = e => {
      let finals = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) finals += e.results[i][0].transcript + " ";
      }
      if (finals) transcript = finals;
      const interim = Array.from(e.results).map(r => r[0].transcript).join(" ");
      $("transcriptText").textContent = interim || transcript;
      show($("transcriptBox"));
      if ((interim || transcript).trim()) show($("scoreSpeech"));
    };
    recog.onerror = ev => {
      stopListening();
      if (ev.error === "not-allowed") $("micState").textContent = "MIC PERMISSION DENIED";
    };
    recog.onend = () => { if (listening) { try { recog.start(); } catch (e) { stopListening(); } } };
    try {
      recog.start();
      listening = true;
      $("micBtn").classList.add("listening");
      $("micState").textContent = "LISTENING — TAP TO STOP";
    } catch (e) {
      $("micState").textContent = "COULD NOT START MIC";
    }
  });

  $("speechQuit").addEventListener("click", () => { stopListening(); show($("orderControls")); showOrderPanel($("orderView")); });

  // normalization + scoring
  const NUM_WORDS = {
    zero: "0", oh: "0", one: "1", two: "2", three: "3", four: "4", five: "5",
    six: "6", seven: "7", eight: "8", nine: "9", ten: "10", eleven: "11",
    twelve: "12", thirteen: "13", fourteen: "14", fifteen: "15", twenty: "20",
    thirty: "30", forty: "40", fifty: "50", sixty: "60", seventy: "70",
    eighty: "80", ninety: "90", hundred: "00",
    first: "1st", second: "2nd", third: "3rd"
  };
  function normalize(text) {
    const words = text.toLowerCase().replace(/[^a-z0-9.\s]/g, " ").split(/\s+/).filter(Boolean)
      .map(w => NUM_WORDS[w] || w);
    const tokenSet = new Set(words);
    const digits = words.join(" ").replace(/[^0-9]/g, "");
    return { tokenSet, digits };
  }
  function scoreTranscript(order, text) {
    const { tokenSet, digits } = normalize(text);
    return order.keyItems.map(item => {
      let hit = false;
      if (item.variants) {
        hit = item.variants.some(v => v.every(tok => tokenSet.has(tok)));
      }
      if (!hit && item.digits) {
        hit = item.digits.some(d => d && digits.includes(d.replace(/[^0-9]/g, "")));
      }
      return { label: item.label, expected: item.expected, hit };
    });
  }

  $("scoreSpeech").addEventListener("click", () => {
    stopListening();
    const results = scoreTranscript(currentOrder, transcript || $("transcriptText").textContent);
    const hits = results.filter(r => r.hit).length;
    const pct = Math.round((hits / results.length) * 100);
    $("scoreBig").textContent = `${pct}%`;
    $("resultsList").innerHTML =
      `<p class="hint">${hits} of ${results.length} key items covered in your brief.</p>` +
      results.map(r => `
        <div class="result-item">
          <span class="${r.hit ? "result-hit" : "result-miss"}">${r.hit ? "✓" : "✗"}</span>
          <span class="ri-label">${r.label}</span>
          <span class="ri-val">${r.expected}</span>
        </div>`).join("") +
      verdict(pct);
    bumpOrdersBriefed();
    showOrderPanel($("resultsView"));
    window.scrollTo(0, 0);
  });

  $("resultsRetry").addEventListener("click", () => showOrderPanel($("briefChooser")));
  $("resultsBack").addEventListener("click", () => { show($("orderControls")); showOrderPanel($("orderView")); });

  // ---------------- battle drills ----------------
  BATTLE_DRILLS.forEach((d, i) => {
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = d.name;
    b.addEventListener("click", () => openDrill(i));
    $("drillButtons").appendChild(b);
  });
  $("randomDrill").addEventListener("click", () => openDrill(Math.floor(Math.random() * BATTLE_DRILLS.length)));

  function openDrill(i) {
    const d = BATTLE_DRILLS[i];
    $("drillTitle").textContent = d.name;
    $("drillSteps").innerHTML = d.steps.map(s => `<li>${s}</li>`).join("");
    hide($("drillSteps")); hide($("drillGrade")); show($("drillReveal"));
    hide($("drillList")); show($("drillView"));
    window.scrollTo(0, 0);
  }
  $("drillReveal").addEventListener("click", () => { show($("drillSteps")); hide($("drillReveal")); show($("drillGrade")); });
  const closeDrill = () => { hide($("drillView")); show($("drillList")); };
  $("drillGood").addEventListener("click", closeDrill);
  $("drillBad").addEventListener("click", closeDrill);
  $("drillBack").addEventListener("click", closeDrill);

  // ---------------- flashcards ----------------
  let deck = [], flashIdx = 0, flashKnew = 0;
  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function startFlash() {
    deck = shuffled(FLASHCARDS);
    flashIdx = 0; flashKnew = 0;
    hide($("studyHome")); hide($("tlpView")); show($("flashView"));
    showFlash();
  }
  function showFlash() {
    const c = deck[flashIdx];
    $("flashProgress").textContent = `CARD ${flashIdx + 1} OF ${deck.length}`;
    $("flashFront").textContent = c.front;
    $("flashBack").textContent = c.back;
    hide($("flashBack")); hide($("flashGrade")); show($("flashFlip"));
  }
  $("startFlash").addEventListener("click", startFlash);
  $("flashFlip").addEventListener("click", () => { show($("flashBack")); hide($("flashFlip")); show($("flashGrade")); });
  function gradeFlash(knew) {
    if (knew) flashKnew++;
    flashIdx++;
    if (flashIdx < deck.length) showFlash();
    else {
      alert(`Deck complete: ${flashKnew} of ${deck.length} known. ${flashKnew === deck.length ? "Perfect run! 🔥" : "Run it again and clean up the misses."}`);
      quitFlash();
    }
  }
  $("flashGood").addEventListener("click", () => gradeFlash(true));
  $("flashBad").addEventListener("click", () => gradeFlash(false));
  function quitFlash() { hide($("flashView")); show($("studyHome")); }
  $("flashQuit").addEventListener("click", quitFlash);

  // ---------------- TLP quiz ----------------
  let tlpNext = 0;
  function startTlp() {
    tlpNext = 0;
    hide($("studyHome")); hide($("flashView")); show($("tlpView"));
    hide($("tlpAgain"));
    $("tlpMsg").textContent = "";
    $("tlpSlots").innerHTML = TLP_STEPS.map((_, i) => `<div class="tlp-slot" id="tlpSlot${i}">${i + 1}.</div>`).join("");
    $("tlpChoices").innerHTML = "";
    shuffled(TLP_STEPS).forEach(step => {
      const chip = document.createElement("button");
      chip.className = "tlp-chip";
      chip.textContent = step;
      chip.addEventListener("click", () => {
        const correctStep = TLP_STEPS[tlpNext];
        if (step === correctStep) {
          chip.classList.add("used");
          const slot = $("tlpSlot" + tlpNext);
          slot.textContent = `${tlpNext + 1}. ${step}`;
          slot.classList.add("filled");
          tlpNext++;
          if (tlpNext === TLP_STEPS.length) {
            $("tlpMsg").textContent = "All 8 in order — that's a GO. ✓";
            show($("tlpAgain"));
          }
        } else {
          chip.classList.add("wrong");
          $("tlpMsg").textContent = `Not next — step ${tlpNext + 1} comes first.`;
          setTimeout(() => chip.classList.remove("wrong"), 600);
        }
      });
      $("tlpChoices").appendChild(chip);
    });
  }
  $("startTlp").addEventListener("click", startTlp);
  $("tlpAgain").addEventListener("click", startTlp);
  $("tlpQuit").addEventListener("click", () => { hide($("tlpView")); show($("studyHome")); });

})();
