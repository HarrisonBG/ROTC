// OPORD Trainer — random order generator (OPORD / WARNORD / FRAGO)
// Scenarios are set in the fictional training country of Atropia against SAPA
// (South Atropian People's Army) irregular forces, matching Cadet Summer Training.

const G = (() => {

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const pad2 = n => String(n).padStart(2, "0");

  // ---------- shared pools ----------
  const SQUADS = ["1st Squad", "2nd Squad", "3rd Squad"];
  const OBJ_NAMES = ["FALCON", "BULLDOG", "COBRA", "VIPER", "PANTHER", "IRON", "SABER", "HAMMER", "ANVIL", "TALON"];
  const AO_NAMES = ["EAGLE", "SPARTAN", "PATRIOT", "LONGKNIFE", "WARRIOR", "GRIZZLY"];
  const HIGHER_CS = ["BULLDOG 6", "WARRIOR 6", "SABER 6", "GRIZZLY 6"];
  const PLT_CS = ["RED 1", "WHITE 1", "BLUE 1"];
  const CHALLENGE_PAIRS = [["THUNDER", "FLASH"], ["IRON", "GATE"], ["RIVER", "STONE"], ["COPPER", "WIRE"], ["WINTER", "STORM"], ["SILVER", "OAK"]];
  const RUNNING_PW = ["RANGER", "LIBERTY", "FREEDOM", "PATRIOT", "VICTORY"];
  const TERRAIN = [
    "rolling wooded terrain with dense undergrowth restricting movement to 1 km/h at night",
    "open grassland broken by wooded draws; long fields of fire from the high ground",
    "steep compartmentalized terrain; ridgelines run north-south and canalize movement into the draws",
    "flat marshy lowland with limited cover; the stream to the south is a linear danger area"
  ];
  const SHIFT_SIGNALS = ["a green star cluster", "a whistle blast and green smoke", "a red star cluster", "three short whistle blasts"];
  const MARK_SIGNALS = ["VS-17 panel", "IR strobe", "purple smoke", "yellow smoke"];

  const randGrid = () => {
    const n4 = () => pad2(Math.floor(Math.random() * 100)) + pad2(Math.floor(Math.random() * 100));
    return `EG ${n4()} ${n4()}`;
  };
  const randFreq = () => `${30 + Math.floor(Math.random() * 58)}.${pick(["00", "25", "50", "75"])}`;
  const HIT_TIMES = ["0430", "0500", "0530", "0600", "0630", "0900", "1030"];

  const dtgDate = () => {
    const d = new Date(Date.now() + 86400000); // tomorrow
    const mon = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][d.getMonth()];
    return `${pad2(d.getDate())} ${mon} ${String(d.getFullYear()).slice(2)}`;
  };

  // ---------- mission templates ----------
  const MISSIONS = [
    {
      id: "ambush", label: "Point Ambush",
      task: "conducts a point ambush", taskTokens: [["point", "ambush"], ["ambush"]],
      why: "destroy enemy resupply elements and disrupt SAPA freedom of movement",
      whyTokens: [["destroy", "resupply"], ["disrupt", "freedom", "movement"]],
      enemyComp: "a SAPA resupply element of 2–4 personnel with 1 vehicle, armed with AK-74 rifles and 1 RPK machine gun",
      enemySize: "2 to 4 man resupply element", enemyTokens: [["resupply"], ["2", "4"]],
      enemyMLCOA: "the enemy moves resupply along the route in the next 12 hours in a single vehicle with dismounted security, complacent from lack of recent contact",
      enemyMDCOA: "the enemy moves with a trail security element 200m behind the lead vehicle, able to flank the ambush line",
      keyTasks: ["establish the ambush line NLT 30 minutes prior to the hit time window", "initiate the ambush with the casualty-producing weapon", "collect PIR from the objective within 5 minutes"],
      endState: "enemy resupply element destroyed, PIR collected, and the squad reconsolidated at the ORP with all personnel and equipment accounted for",
      concept: hit => `This operation is conducted in four phases. Phase 1: infiltration from the assembly area to the ORP. Phase 2: leader's recon and occupation of the ambush line. Phase 3: actions on the objective — initiate on the casualty-producing weapon NLT ${hit}, destroy the enemy in the kill zone, then search teams collect PIR. Phase 4: withdrawal to the ORP and exfiltration.`,
      aTask: "Alpha Team establishes the support-by-fire position and left-side security; the SAW gunner is the casualty-producing weapon and initiates the ambush.",
      bTask: "Bravo Team is the assault element: on lift of fires, cross the kill zone, clear it near to far, and conduct EPW/PIR search with aid and litter on standby.",
      fires: "Indirect fires available: 1 x 60mm mortar section in direct support. Priority target AB1001 is centered on the kill zone escape route. Fires shift on the signal."
    },
    {
      id: "recon", label: "Area Reconnaissance",
      task: "conducts an area reconnaissance", taskTokens: [["area", "reconnaissance"], ["area", "recon"], ["recon"]],
      why: "confirm or deny enemy activity and enable the company attack",
      whyTokens: [["confirm", "deny"], ["enemy", "activity"]],
      enemyComp: "a suspected SAPA observation post of 2–3 personnel with small arms and a radio, reported vicinity the objective",
      enemySize: "2 to 3 man observation post", enemyTokens: [["observation", "post"], ["2", "3"]],
      enemyMLCOA: "the enemy OP observes the main avenue of approach during daylight and withdraws 500m to a hide site at night",
      enemyMDCOA: "the enemy OP is reinforced to squad strength and emplaces early-warning devices on likely approach routes",
      keyTasks: ["remain undetected throughout the operation", "confirm or deny enemy presence on the objective", "report all PIR to higher within 15 minutes of collection"],
      endState: "enemy disposition on the objective confirmed and reported, the squad undetected, and the squad reconsolidated at the ORP prepared for follow-on operations",
      concept: hit => `This operation is conducted in four phases. Phase 1: tactical movement from the LD to the ORP. Phase 2: leader's recon to confirm the objective and emplace surveillance. Phase 3: reconnaissance of the objective NLT ${hit} using two R&S teams on separate vantage points — no direct fire contact unless in self-defense. Phase 4: link-up at the ORP, disseminate information, and exfiltrate.`,
      aTask: "Alpha Team provides R&S Team 1: observe the objective from the north vantage point and record SALUTE data.",
      bTask: "Bravo Team provides R&S Team 2 and ORP security: observe from the southwest vantage point; one buddy team secures the ORP.",
      fires: "Indirect fires on-call only for emergency break contact: 1 x 60mm mortar section. No-fire area 500m around the objective until PIR is collected."
    },
    {
      id: "attack", label: "Squad Attack",
      task: "attacks to destroy an enemy outpost", taskTokens: [["attacks", "destroy"], ["attack"], ["destroy", "outpost"]],
      why: "eliminate SAPA early-warning capability and enable the platoon's seizure of the crossing site",
      whyTokens: [["early", "warning"], ["crossing", "site"]],
      enemyComp: "a SAPA outpost of 3–4 personnel in hasty fighting positions with AK-74 rifles, 1 RPK, and possible command-detonated mines on the approach",
      enemySize: "3 to 4 man outpost", enemyTokens: [["outpost"], ["3", "4"]],
      enemyMLCOA: "the enemy defends in place from hasty positions oriented east, with a single sentry posted at night",
      enemyMDCOA: "the enemy withdraws under contact to alert the main defense, bringing indirect fire on their own position",
      keyTasks: ["establish the support-by-fire position undetected", "assault through the objective to the LOA", "report objective secure to higher NLT 15 minutes after the assault"],
      endState: "enemy outpost destroyed, the objective secured to the LOA, and the squad consolidated with ACE reports submitted to higher",
      concept: hit => `This operation is conducted in four phases. Phase 1: movement from the assembly area across the LD to the ORP. Phase 2: leader's recon and establishment of the support-by-fire position. Phase 3: actions on the objective NLT ${hit} — Alpha suppresses, Bravo assaults from the flank, fires shift on signal, assault through to the LOA. Phase 4: consolidate, reorganize, and prepare for counterattack.`,
      aTask: "Alpha Team establishes the support-by-fire position, suppresses the objective, and shifts fires on the signal.",
      bTask: "Bravo Team is the assault element: bound along the covered route to the enemy left flank and assault through the objective to the LOA.",
      fires: "Priority of fires to the assault element. 1 x 60mm mortar section in direct support; target AB2002 on the enemy withdrawal route. Shift fires on the signal.",
    },
    {
      id: "raid", label: "Raid",
      task: "conducts a raid", taskTokens: [["raid"]],
      why: "destroy the SAPA weapons cache and deny the enemy resupply of the local militia",
      whyTokens: [["weapons", "cache"], ["deny", "resupply"]],
      enemyComp: "a SAPA cache site guarded by 3–5 personnel with small arms; possible motorcycle courier traffic at dawn and dusk",
      enemySize: "3 to 5 man guard force", enemyTokens: [["cache"], ["3", "5"]],
      enemyMLCOA: "the guard force maintains one roving sentry and remains near the cache shelter, oriented toward the road",
      enemyMDCOA: "a SAPA quick-reaction force of squad size reinforces within 20 minutes of the first shots",
      keyTasks: ["isolate the objective with security teams before the assault", "destroy the cache in place with thermite on the demo team's signal", "be off the objective NLT 10 minutes after initiation"],
      endState: "cache destroyed, enemy guard force killed or captured, and the squad exfiltrated with no more than green-status casualties",
      concept: hit => `This operation is conducted in four phases. Phase 1: infiltration to the ORP. Phase 2: leader's recon; emplace security, support, and assault elements. Phase 3: actions on the objective NLT ${hit} — security isolates, support suppresses the guard force, assault clears the cache site, demo team destroys the cache. Phase 4: withdrawal on the demo signal through the ORP and exfiltration.`,
      aTask: "Alpha Team provides the support-by-fire element and the two-man demolition team that destroys the cache.",
      bTask: "Bravo Team provides the assault element and the two security teams isolating the objective on the road approaches.",
      fires: "1 x 60mm mortar section on-call. Target AB3003 blocks the enemy QRF route from the north. Do not fire within 300m of the cache until it is destroyed."
    },
    {
      id: "defense", label: "Defense of a Battle Position",
      task: "defends Battle Position 2", taskTokens: [["defends"], ["battle", "position"], ["defense"]],
      why: "deny SAPA forces use of the main supply route and protect the company's western flank",
      whyTokens: [["deny", "supply", "route"], ["western", "flank"]],
      enemyComp: "a SAPA squad of 8–10 personnel with small arms, 1 PKM, and 1 RPG, expected to probe forward of the main attack",
      enemySize: "8 to 10 man squad", enemyTokens: [["8", "10"], ["squad"]],
      enemyMLCOA: "the enemy probes with a 2–3 man recon element tonight, followed by a squad-sized attack along the draw at dawn",
      enemyMDCOA: "the enemy fixes the battle position frontally with the PKM while a fire team envelops from the south",
      keyTasks: ["establish primary, alternate, and supplementary positions with interlocking sectors of fire", "emplace the engagement area with a target reference point on the draw", "defeat the enemy forward of the battle position"],
      endState: "enemy attack defeated forward of the battle position, the MSR denied to enemy movement, and the squad prepared to transition to counterattack on order",
      concept: hit => `This operation is conducted in three phases. Phase 1: occupy the battle position and establish security NLT ${hit}. Phase 2: engagement area development — sectors of fire, range cards, TRPs, and obstacles. Phase 3: defend — engage at the TRP on the squad leader's initiation, mass fires in the engagement area, and repel the enemy assault; on order, counterattack with the reserve fire team.`,
      aTask: "Alpha Team defends the left sector; the SAW covers TRP 1 on the draw — the primary enemy avenue of approach.",
      bTask: "Bravo Team defends the right sector and provides the two-man OP forward of the battle position, withdrawing on the signal.",
      fires: "Priority of fires to the OP during security operations, then to the engagement area. Final protective fire AB4004 is 100m forward of the wire; fire on the squad leader's command only."
    },
    {
      id: "mtc", label: "Movement to Contact",
      task: "conducts a movement to contact", taskTokens: [["movement", "contact"]],
      why: "locate the SAPA element operating in the AO and develop the situation for the platoon",
      whyTokens: [["locate"], ["develop", "situation"]],
      enemyComp: "a SAPA element of unknown size, last reported as 4–6 personnel moving south with small arms and one light machine gun",
      enemySize: "4 to 6 man element, location unknown", enemyTokens: [["4", "6"], ["unknown"]],
      enemyMLCOA: "the enemy moves in a loose file along covered routes and initiates contact only when advantageous",
      enemyMDCOA: "the enemy establishes a hasty ambush on the most likely friendly avenue of approach",
      keyTasks: ["maintain 360-degree security throughout movement", "make contact with the smallest element possible", "retain freedom of maneuver once contact is made"],
      endState: "enemy element located and fixed or destroyed, higher informed of enemy composition and disposition, and the squad postured to continue offensive operations",
      concept: hit => `This operation is conducted in three phases. Phase 1: cross the LD NLT ${hit} and move in squad column, fire teams in wedge, Alpha leading. Phase 2: movement to contact through checkpoints 1 through 3 using traveling overwatch; SLLS halts at each checkpoint. Phase 3: actions on contact — the team in contact fixes the enemy, the squad leader develops the situation, and the squad attacks or breaks contact on order.`,
      aTask: "Alpha Team leads movement as the point element and executes actions on contact as the fixing element.",
      bTask: "Bravo Team provides rear security and is the maneuver element on contact.",
      fires: "1 x 60mm mortar section in general support. Priority targets are pre-planned on checkpoints 2 and 3; call for fire authorized at team leader level once in contact."
    }
  ];

  // ---------- helpers to build the shell ----------
  function baseContext(missionId) {
    const m = missionId && missionId !== "random" ? MISSIONS.find(x => x.id === missionId) : pick(MISSIONS);
    const [challenge, password] = pick(CHALLENGE_PAIRS);
    const combo = 7 + Math.floor(Math.random() * 7);
    return {
      m,
      squad: pick(SQUADS),
      obj: "OBJ " + pick(OBJ_NAMES),
      ao: "AO " + pick(AO_NAMES),
      grid: randGrid(),
      orpGrid: randGrid(),
      ccpGrid: randGrid(),
      hit: pick(HIT_TIMES),
      date: dtgDate(),
      higherCS: pick(HIGHER_CS),
      pltCS: pick(PLT_CS),
      freq1: randFreq(),
      freq2: randFreq(),
      medFreq: randFreq(),
      challenge, password, combo,
      runPw: pick(RUNNING_PW),
      terrain: pick(TERRAIN),
      shiftSig: pick(SHIFT_SIGNALS),
      markSig: pick(MARK_SIGNALS),
      hiTemp: 62 + Math.floor(Math.random() * 30),
      loTemp: 38 + Math.floor(Math.random() * 20),
      illum: 5 + Math.floor(Math.random() * 90)
    };
  }

  function missionStatement(c) {
    return `${c.squad}, 1st Platoon ${c.m.task} vicinity ${c.obj} (${c.grid}) NLT ${c.hit} hours ${c.date} in order to ${c.m.why}.`;
  }

  const L = (cls, text) => ({ cls, text });

  function opordSections(c) {
    const ms = missionStatement(c);
    return [
      {
        title: "1. SITUATION",
        lines: [
          L("sub", `<b>Area of Operations.</b> ${c.ao}. Terrain: ${c.terrain}.`),
          L("sub", `<b>Weather.</b> High ${c.hiTemp}°F, low ${c.loTemp}°F. Illumination ${c.illum}%. Light rain possible after midnight; reduced visibility favors infiltration.`),
          L("sub", `<b>Enemy Forces.</b> ${c.m.enemyComp}, vicinity ${c.obj} (${c.grid}). Morale is moderate; they are equipped for 48 hours of sustained operations.`),
          L("subsub", `<b>Most likely COA:</b> ${c.m.enemyMLCOA}.`),
          L("subsub", `<b>Most dangerous COA:</b> ${c.m.enemyMDCOA}.`),
          L("sub", `<b>Friendly Forces.</b> One level up: 1st Platoon conducts operations in ${c.ao} to defeat SAPA forces in zone. Two levels up: A Company clears ${c.ao} to enable battalion freedom of movement. 2nd Squad operates to our east; 3rd Platoon screens to the north.`),
          L("sub", `<b>Attachments/Detachments.</b> One combat medic attached effective now. No detachments.`),
          L("sub", `<b>Civil Considerations.</b> Local civilians sympathetic to SAPA may report friendly movement. Avoid the farm compounds; report all civilian contact.`)
        ]
      },
      {
        title: "2. MISSION",
        lines: [
          L("", `${ms}`),
          L("", `<i>I say again:</i> ${ms}`)
        ]
      },
      {
        title: "3. EXECUTION",
        lines: [
          L("", `<b>Commander's Intent.</b> Purpose: ${c.m.why}. Key tasks: ${c.m.keyTasks.map((k, i) => `(${i + 1}) ${k}`).join("; ")}. End state: ${c.m.endState}.`),
          L("sub", `<b>Concept of the Operation.</b> ${c.m.concept(c.hit)}`),
          L("sub", `<b>Scheme of Movement and Maneuver.</b> Order of movement: Alpha Team, squad leader, Bravo Team. Movement formation: squad column, fire teams in wedge. ORP at ${c.orpGrid}. Actions at halts: cigar-shaped perimeter, SLLS at all listening halts.`),
          L("sub", `<b>Scheme of Fires.</b> ${c.m.fires} Signal to shift/lift fires: ${c.shiftSig}.`),
          L("sub", `<b>Tasks to Subordinate Units.</b>`),
          L("subsub", `<b>Alpha Team:</b> ${c.m.aTask}`),
          L("subsub", `<b>Bravo Team:</b> ${c.m.bTask}`),
          L("sub", `<b>Coordinating Instructions.</b> Timeline: rehearsals complete NLT ${c.hit === "0430" ? "2200" : "2300"}; SP time 2 hours prior to the hit time; actions on the objective NLT ${c.hit}. PIR: enemy strength, weapons, and communications equipment on the objective. ROE: positive identification required; escalation of force per theater standing rules. MOPP 0. Risk: fratricide during limited visibility — mitigated by ${c.markSig} marking on all friendly elements.`)
        ]
      },
      {
        title: "4. SUSTAINMENT",
        lines: [
          L("sub", `<b>Logistics.</b> Each soldier carries 2 x MRE, 6 quarts of water, and a full basic load (210 rounds 5.56mm; 600 rounds linked for the SAW). Water resupply at the ORP cache. Resupply point: company trains, 1,500m north of the LD.`),
          L("sub", `<b>Personnel.</b> Current strength ${8 + Math.floor(Math.random() * 2)} personnel plus 1 attached medic. EPWs: search, silence, segregate, safeguard, and speed to the platoon EPW collection point.`),
          L("sub", `<b>Health Service Support.</b> Aid and litter teams: one per fire team. CCP: ${c.ccpGrid}. CASEVAC by platoon vehicle from the CCP; MEDEVAC on ${c.medFreq}, call sign DUSTOFF. 9-line format per SOP.`)
        ]
      },
      {
        title: "5. COMMAND AND SIGNAL",
        lines: [
          L("sub", `<b>Command.</b> The squad leader locates with the main effort. Platoon leader (${c.pltCS}) follows 2nd Squad. Succession of command: squad leader, Alpha Team leader, Bravo Team leader, senior rifleman.`),
          L("sub", `<b>Signal.</b> PACE: primary — FM ${c.freq1} (higher: ${c.higherCS}); alternate — FM ${c.freq2}; contingency — runner; emergency — ${c.markSig} and red star cluster.`),
          L("subsub", `<b>Challenge/Password:</b> ${c.challenge} / ${c.password}. <b>Running password:</b> ${c.runPw}. <b>Number combination:</b> ${c.combo}.`),
          L("subsub", `<b>Signals:</b> Shift/lift fires: ${c.shiftSig}. Withdrawal: red smoke. All elements report set on the net.`)
        ]
      }
    ];
  }

  function warnordSections(c) {
    const ms = missionStatement(c);
    return [
      {
        title: "1. SITUATION",
        lines: [
          L("sub", `<b>Enemy.</b> ${c.m.enemyComp}, vicinity ${c.obj} (${c.grid}).`),
          L("sub", `<b>Friendly.</b> 1st Platoon conducts operations in ${c.ao} to defeat SAPA forces in zone.`),
          L("sub", `<b>Attachments.</b> One combat medic attached effective receipt of this order.`)
        ]
      },
      {
        title: "2. MISSION",
        lines: [L("", ms), L("", `<i>I say again:</i> ${ms}`)]
      },
      {
        title: "3. GENERAL INSTRUCTIONS",
        lines: [
          L("sub", `<b>Timeline.</b> Warning order now. Weapons and equipment draw complete NLT 1 hour from now. Rehearsals: actions on the objective, then battle drills. OPORD issued at the platoon CP 3 hours prior to SP. SP is 2 hours prior to ${c.hit}.`),
          L("sub", `<b>Uniform and Equipment.</b> Full kit with assault pack. 2 x MRE, 6 quarts of water, full basic load. ${c.markSig} per team for marking.`),
          L("sub", `<b>Special Teams.</b> Aid and litter: one team per fire team. EPW search: Bravo Team provides one buddy team.`)
        ]
      },
      {
        title: "4. SPECIFIC INSTRUCTIONS",
        lines: [
          L("sub", `<b>Alpha Team Leader:</b> conduct PCCs/PCIs, confirm the SAW gunner's ammunition load, and back-brief me in 90 minutes.`),
          L("sub", `<b>Bravo Team Leader:</b> draw the demo/breach kit, prep the special teams, and rehearse EPW handling.`),
          L("sub", `<b>All:</b> priorities of work — security, weapons maintenance, water, rest. No movement outside the assembly area.`)
        ]
      }
    ];
  }

  function fragoSections(c) {
    const newHit = pick(HIT_TIMES.filter(t => t !== c.hit));
    const newGrid = randGrid();
    c.fragoNewHit = newHit;
    c.fragoNewGrid = newGrid;
    const ms = `${c.squad}, 1st Platoon ${c.m.task} vicinity ${c.obj} (${newGrid}) NLT ${newHit} hours ${c.date} in order to ${c.m.why}.`;
    return [
      {
        title: "FRAGO 01 TO OPORD 26-04",
        lines: [L("", `<b>Reference:</b> OPORD 26-04, ${c.m.label.toLowerCase()} vicinity ${c.obj}. All items not addressed below remain unchanged. Acknowledge receipt.`)]
      },
      {
        title: "1. SITUATION (CHANGES)",
        lines: [
          L("sub", `<b>Enemy.</b> UAS reports the enemy has displaced. New enemy location: ${newGrid}, approximately 800m from the original objective. Composition unchanged: ${c.m.enemyComp}.`)
        ]
      },
      {
        title: "2. MISSION (UPDATED)",
        lines: [L("", ms), L("", `<i>I say again:</i> ${ms}`)]
      },
      {
        title: "3. EXECUTION (CHANGES)",
        lines: [
          L("sub", `<b>Time.</b> Actions on the objective now NLT ${newHit}. SP shifts accordingly — 2 hours prior.`),
          L("sub", `<b>Maneuver.</b> New ORP: ${c.orpGrid}. Route adjusted through checkpoint 2 to avoid the reported civilian traffic on the road.`),
          L("sub", `<b>Fires.</b> Priority target re-plotted to the new objective grid. Signal to shift fires unchanged: ${c.shiftSig}.`)
        ]
      },
      {
        title: "4–5. SUSTAINMENT / COMMAND & SIGNAL",
        lines: [
          L("sub", `<b>CCP</b> displaces to ${c.ccpGrid}. All other sustainment unchanged.`),
          L("sub", `<b>Signal.</b> No change. Challenge/password remains ${c.challenge} / ${c.password}.`)
        ]
      }
    ];
  }

  // ---------- key items for speech scoring ----------
  function opordKeyItems(c) {
    const ord = { "1st": "first", "2nd": "second", "3rd": "third" };
    const sqNum = c.squad.split(" ")[0];
    return [
      { label: "Who (unit)", expected: c.squad, variants: [[ord[sqNum], "squad"], [sqNum, "squad"]] },
      { label: "What (task)", expected: c.m.task, variants: c.m.taskTokens },
      { label: "Where (objective)", expected: `${c.obj} (${c.grid})`, variants: [[c.obj.split(" ")[1].toLowerCase()]] },
      { label: "When (hit time)", expected: `NLT ${c.hit}`, digits: [c.hit, String(parseInt(c.hit, 10))] },
      { label: "Why (purpose)", expected: c.m.why, variants: c.m.whyTokens },
      { label: "Enemy composition", expected: c.m.enemySize, variants: c.m.enemyTokens },
      { label: "A key task", expected: c.m.keyTasks[0], variants: c.m.keyTasks.map(k => significantTokens(k).slice(0, 3)) },
      { label: "End state mentioned", expected: "end state: " + c.m.endState, variants: [["end", "state"]] },
      { label: "Order of movement", expected: "Alpha Team, squad leader, Bravo Team", variants: [["order", "movement"], ["alpha", "bravo"]] },
      { label: "Shift-fires signal", expected: c.shiftSig, variants: [significantTokens(c.shiftSig)] },
      { label: "CASEVAC / CCP", expected: `CCP ${c.ccpGrid}, MEDEVAC ${c.medFreq}`, variants: [["ccp"], ["casualty", "collection"], ["medevac"], ["dustoff"]] },
      { label: "Primary frequency", expected: `FM ${c.freq1}`, digits: [c.freq1.replace(".", ""), c.freq1] },
      { label: "Higher call sign", expected: c.higherCS, variants: [significantTokens(c.higherCS)] },
      { label: "Succession of command", expected: "SL → ATL → BTL → senior rifleman", variants: [["succession", "command"], ["alpha", "team", "leader"]] },
      { label: "Challenge / password", expected: `${c.challenge} / ${c.password}`, variants: [[c.challenge.toLowerCase()], [c.password.toLowerCase()]] },
      { label: "Running password", expected: c.runPw, variants: [["running", "password"], [c.runPw.toLowerCase()]] }
    ];
  }

  function warnordKeyItems(c) {
    const base = opordKeyItems(c);
    const keep = ["Who (unit)", "What (task)", "Where (objective)", "When (hit time)", "Why (purpose)", "Enemy composition"];
    return base.filter(k => keep.includes(k.label)).concat([
      { label: "Timeline items", expected: "weapons draw, rehearsals, OPORD time, SP", variants: [["rehearsals"], ["timeline"], ["opord"]] },
      { label: "Uniform / equipment", expected: "full kit, 2 x MRE, 6 quarts, basic load", variants: [["basic", "load"], ["mre"], ["quarts"]] },
      { label: "Special teams", expected: "aid & litter, EPW search", variants: [["aid", "litter"], ["epw"]] },
      { label: "Priorities of work", expected: "security, maintenance, water, rest", variants: [["priorities", "work"], ["security"]] }
    ]);
  }

  function fragoKeyItems(c) {
    return [
      { label: "New enemy location", expected: c.fragoNewGrid, variants: [["displaced"], ["new", "location"], ["moved"]] },
      { label: "New hit time", expected: `NLT ${c.fragoNewHit}`, digits: [c.fragoNewHit, String(parseInt(c.fragoNewHit, 10))] },
      { label: "Mission restated", expected: c.m.task, variants: c.m.taskTokens },
      { label: "New ORP", expected: c.orpGrid, variants: [["orp"]] },
      { label: "Route change", expected: "adjusted through checkpoint 2", variants: [["route"], ["checkpoint"]] },
      { label: "CCP displaced", expected: c.ccpGrid, variants: [["ccp"], ["casualty", "collection"]] },
      { label: "What is unchanged", expected: "signal / challenge & password unchanged", variants: [["unchanged"], ["no", "change"], ["remains"]] }
    ];
  }

  function significantTokens(s) {
    const stop = new Set(["the", "a", "an", "of", "to", "and", "in", "on", "with", "for", "at", "by", "is", "are", "one", "x", "1"]);
    return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2 && !stop.has(w));
  }

  // ---------- public ----------
  function generate(type, missionId) {
    const c = baseContext(missionId);
    let sections, keyItems, title;
    if (type === "WARNORD") {
      sections = warnordSections(c);
      keyItems = warnordKeyItems(c);
      title = `WARNING ORDER — ${c.m.label.toUpperCase()}`;
    } else if (type === "FRAGO") {
      sections = fragoSections(c);
      keyItems = fragoKeyItems(c);
      title = `FRAGO 01 — ${c.m.label.toUpperCase()}`;
    } else {
      sections = opordSections(c);
      keyItems = opordKeyItems(c);
      title = `OPORD 26-04 — ${c.m.label.toUpperCase()}`;
    }
    const subtitle = `${c.squad}, 1st Platoon · ${c.ao} · ${c.date}`;
    const speechText = sections.map(s =>
      s.title + ". " + s.lines.map(l => l.text.replace(/<[^>]+>/g, "")).join(" ")
    ).join("\n");
    return { type, title, subtitle, sections, keyItems, speechText, missionLabel: c.m.label };
  }

  return { generate, MISSIONS };
})();
