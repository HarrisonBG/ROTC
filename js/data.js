// OPORD Trainer — static study content
// Battle drills, doctrine flashcards, and TLP steps used by the Drills and Study tabs.

const BATTLE_DRILLS = [
  {
    name: "React to Direct Fire Contact",
    steps: [
      "Soldiers in contact immediately return well-aimed fire and seek the nearest covered position.",
      "Soldiers in contact shout out the ADDRAC: alert, direction, description, range, assignment, and control of the enemy position.",
      "The fire team in contact establishes suppressive fire to gain and maintain fire superiority.",
      "Team leaders control fires using tracers, standard fire commands, and hand-and-arm signals.",
      "The squad leader moves to a position where he can observe the enemy and assess the situation: size, location, and whether the squad can maneuver.",
      "The squad leader reports the contact to the platoon leader using a SALT/SALUTE report.",
      "Based on the assessment, the squad leader directs the next action: squad attack, break contact, or fix and await platoon maneuver."
    ]
  },
  {
    name: "Squad Attack (Battle Drill 1A)",
    steps: [
      "React to contact: the team in contact returns fire, seeks cover, and gains fire superiority.",
      "The squad leader determines the enemy size, location, and any covered and concealed flanking route.",
      "If the squad can maneuver, the squad leader directs the trail team as the assaulting element and the team in contact as the base of fire.",
      "The base-of-fire team suppresses the enemy position and shifts fires on signal.",
      "The assaulting team bounds by individual or buddy rushes along the covered route to the enemy's flank.",
      "The squad leader signals the base of fire to shift or lift fires as the assault element closes on the objective.",
      "The assaulting team fights through the objective to the limit of advance (LOA) using fire and movement.",
      "Consolidate and reorganize: establish 360-degree security, take ACE/LACE reports, treat casualties, secure EPWs and equipment, and send a report to higher."
    ]
  },
  {
    name: "Break Contact (Battle Drill 3)",
    steps: [
      "The squad leader orders the break: direction and distance (for example, \"Break contact — six o'clock, three hundred meters\") or a rally point.",
      "One element suppresses the enemy with a heavy volume of fire while the other element bounds away.",
      "Use smoke and covered/concealed terrain to mask the movement.",
      "Elements alternate bounding and suppressing, maintaining fire on the enemy until contact is broken.",
      "Continue movement to the designated rally point and re-establish the chain of command.",
      "Consolidate and reorganize: account for personnel, take ACE reports, treat casualties, and redistribute ammunition.",
      "Report the situation to higher headquarters and continue the mission or await orders."
    ]
  },
  {
    name: "React to Near Ambush (Battle Drill 4)",
    steps: [
      "Soldiers in the kill zone immediately return fire, take up covered positions, and throw fragmentation and concussion grenades.",
      "After the grenades detonate, soldiers in the kill zone assault through the ambush using fire and movement.",
      "Soldiers not in the kill zone identify the enemy location, suppress it, and shift fires as the assault moves across.",
      "On order, soldiers not in the kill zone maneuver against the enemy flank as required.",
      "Fight through and destroy the enemy position to the limit of advance.",
      "Consolidate and reorganize: 360-degree security, ACE reports, casualties, EPWs, and report to higher."
    ]
  },
  {
    name: "React to Far Ambush (Battle Drill 4)",
    steps: [
      "Soldiers in the kill zone immediately return fire and seek the nearest covered and concealed position.",
      "Soldiers in the kill zone continue suppressive fire to fix the enemy.",
      "Soldiers not in the kill zone move by a covered and concealed route to a flanking position against the enemy.",
      "The flanking element assaults the enemy position using fire and movement while the element in contact shifts fires.",
      "Destroy or force the withdrawal of the enemy, then consolidate and reorganize.",
      "Report the engagement to higher headquarters and continue the mission."
    ]
  },
  {
    name: "React to Indirect Fire",
    steps: [
      "Any soldier shouts \"INCOMING!\" and all personnel immediately seek the nearest cover, staying low.",
      "Wait out the initial impacts under cover; do not stand up between volleys.",
      "The leader gives a direction and distance to move (for example, \"Three o'clock, three hundred meters!\").",
      "The unit moves rapidly out of the impact area in the given direction at double time.",
      "Once clear, the leader rallies the unit, establishes security, and accounts for all personnel and equipment.",
      "Take ACE reports, treat casualties, and report the contact and impact grid to higher."
    ]
  },
  {
    name: "Establish a Patrol Base (Priorities of Work)",
    steps: [
      "Occupy the patrol base using a covered and concealed position off natural lines of drift, defensible for a short period.",
      "Establish security first: assign sectors of fire, emplace the machine guns on the most likely avenue of approach, and man 100% security until the priorities of work begin.",
      "Establish the alert plan and evacuation/withdrawal plan, including the rally point and signal.",
      "Conduct weapons and equipment maintenance by shifts — never more than one-third of weapons down at a time.",
      "Conduct water resupply, mess plan (eat by shifts), sanitation, and personal hygiene.",
      "Execute the rest plan last, maintaining the required security posture throughout."
    ]
  }
];

const FLASHCARDS = [
  { front: "METT-TC", back: "Mission analysis factors:\nMission\nEnemy\nTerrain and weather\nTroops and support available\nTime available\nCivil considerations" },
  { front: "OAKOC", back: "Military aspects of terrain:\nObservation and fields of fire\nAvenues of approach\nKey terrain\nObstacles\nCover and concealment" },
  { front: "5 Paragraphs of the OPORD", back: "1. Situation\n2. Mission\n3. Execution\n4. Sustainment\n5. Command and Signal" },
  { front: "Mission Statement (5 W's)", back: "Who — the unit\nWhat — the tasked action (task)\nWhen — the time it starts/must be done\nWhere — the location (grid/objective)\nWhy — the purpose (in order to...)\n\nAlways stated twice, exactly the same way." },
  { front: "Commander's Intent", back: "Three parts:\n1. Purpose — the reason for the operation\n2. Key tasks — what must happen to succeed\n3. End state — friendly, enemy, and terrain conditions at completion" },
  { front: "Troop Leading Procedures (8 steps)", back: "1. Receive the mission\n2. Issue a warning order\n3. Make a tentative plan\n4. Initiate movement\n5. Conduct reconnaissance\n6. Complete the plan\n7. Issue the order\n8. Supervise and refine" },
  { front: "Principles of Patrolling", back: "Planning\nReconnaissance\nSecurity\nControl\nCommon sense" },
  { front: "SALUTE Report", back: "Size\nActivity\nLocation\nUnit / uniform\nTime\nEquipment" },
  { front: "ADDRAC (Fire Command)", back: "Alert\nDirection\nDescription\nRange\nAssignment\nControl" },
  { front: "GOTWA (5-Point Contingency Plan)", back: "Where I'm Going\nOthers I'm taking with me\nTime I plan to be gone\nWhat to do if I don't return\nActions on contact — mine and yours" },
  { front: "ACE / LACE Report", back: "ACE: Ammunition, Casualties, Equipment\nLACE adds Liquid (water) first:\nLiquid, Ammunition, Casualties, Equipment" },
  { front: "9-Line MEDEVAC", back: "1. Location of pickup site (grid)\n2. Radio frequency and call sign\n3. Number of patients by precedence\n4. Special equipment required\n5. Number of patients by type (litter/ambulatory)\n6. Security at pickup site\n7. Method of marking the site\n8. Patient nationality and status\n9. NBC contamination / terrain description" },
  { front: "MEDEVAC Precedence Categories", back: "Urgent — within 1 hour, life/limb/eyesight\nUrgent-Surgical — within 1 hour, needs surgery\nPriority — within 4 hours\nRoutine — within 24 hours\nConvenience — administrative movement" },
  { front: "Warfighting Functions", back: "Mission command\nMovement and maneuver\nIntelligence\nFires\nSustainment\nProtection" },
  { front: "Forms of Maneuver", back: "Frontal attack\nPenetration\nEnvelopment\nFlank attack\nTurning movement\nInfiltration" },
  { front: "Types of Patrols", back: "Combat patrols: ambush, raid, security\nReconnaissance patrols: area, zone, route, point/leader's recon" },
  { front: "Types of Ambush", back: "By type: point ambush, area ambush\nBy formation: linear, L-shaped\nBy category: hasty, deliberate" },
  { front: "Priorities of Work (Patrol Base)", back: "Security (always first, continuous)\nAlert and evacuation/withdrawal plan\nMaintenance of weapons and equipment\nWater resupply\nMess plan\nSanitation and personal hygiene\nRest plan (last)" },
  { front: "Characteristics of the Defense", back: "Disruption\nFlexibility\nManeuver\nMass and concentration\nOperations in depth\nPreparation\nSecurity" },
  { front: "ASCOPE (Civil Considerations)", back: "Areas\nStructures\nCapabilities\nOrganizations\nPeople\nEvents" },
  { front: "SPORTS (Immediate Action)", back: "Correcting a weapon malfunction:\nSlap the magazine\nPull the charging handle\nObserve the chamber\nRelease the charging handle\nTap the forward assist\nSqueeze the trigger" },
  { front: "PACE Plan", back: "Communications planning:\nPrimary\nAlternate\nContingency\nEmergency" },
  { front: "Rally Points (types)", back: "Initial rally point (IRP)\nEn route rally point (ERP)\nObjective rally point (ORP)\nReentry rally point (RRP)\nNear-side / far-side rally points (danger areas)" },
  { front: "Actions at the ORP", back: "Occupy the ORP (usually by force or after leader's recon)\nEstablish security\nConduct leader's recon of the objective\nIssue the 5-point contingency plan (GOTWA)\nMake final preparations: drop rucks, prep weapons/equipment\nConfirm the plan and disseminate changes" },
  { front: "Consolidate & Reorganize (after the assault)", back: "Establish 360-degree security at the LOA\nRe-establish the chain of command\nACE/LACE reports from team leaders\nTreat and evacuate casualties\nSearch, silence, segregate, safeguard, speed EPWs to the rear (5 S's and T)\nRedistribute ammunition and equipment\nReport to higher" }
];

const TLP_STEPS = [
  "Receive the mission",
  "Issue a warning order",
  "Make a tentative plan",
  "Initiate movement",
  "Conduct reconnaissance",
  "Complete the plan",
  "Issue the order",
  "Supervise and refine"
];

const DAILY_TASKS = [
  { title: "Full OPORD Brief-Back", desc: "Generate a random OPORD, study it, then brief it back with Speech Check or Recite & Reveal. Aim for 80% or better.", goto: "orders" },
  { title: "Battle Drill Reps", desc: "Run through 3 battle drills from memory. Recite every step out loud before you reveal.", goto: "drills" },
  { title: "Doctrine Flashcards", desc: "One full pass through the flashcard deck. Re-run every card you miss.", goto: "study" },
  { title: "WARNORD Speed Brief", desc: "Generate a WARNORD and brief it back inside 3 minutes. WARNORDs are short — nail the timeline.", goto: "orders" },
  { title: "TLP + Mission Statement Drill", desc: "Do the TLP order quiz twice, then generate an OPORD and recite only the mission statement — twice, word for word.", goto: "study" },
  { title: "FRAGO Reaction Drill", desc: "Generate a FRAGO and brief back what changed and what stays the same. Camp loves to hit you with changes.", goto: "orders" },
  { title: "Commander's Intent Focus", desc: "Generate an OPORD and brief back paragraph 3 only: intent (purpose, key tasks, end state), concept, and tasks to subordinate units.", goto: "orders" }
];
