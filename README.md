# OPORD Trainer — ROTC Advanced Camp Prep

A pocket trainer for Army ROTC cadets preparing for Advanced Camp (Cadet Summer
Training). It randomly generates OPORDs, WARNORDs, and FRAGOs in the standard
5-paragraph shell — set in Atropia against SAPA forces, just like camp — and
drills you on briefing them back, battle drills, and core doctrine.

## Features

- **Random order generator** — OPORDs, WARNORDs, and FRAGOs across six mission
  types (point ambush, area recon, squad attack, raid, defense, movement to
  contact) with randomized grids, hit times, frequencies, call signs,
  challenge/passwords, signals, and enemy situations.
- **Brief-back practice, two modes:**
  - **Recite & Reveal** — brief each paragraph from memory, reveal it, and
    self-grade paragraph by paragraph.
  - **Speech Check** — the app listens while you brief the full order and
    scores the key items you hit (mission statement 5 W's, enemy, frequencies,
    challenge/password, succession of command, and more).
- **Read aloud** — text-to-speech reads the full order to you.
- **Battle drills** — react to contact, squad attack, break contact, near/far
  ambush, indirect fire, patrol base priorities of work. Recite → reveal →
  self-grade.
- **Interactive land nav** — a freshly generated topo-style map every round,
  with three games: plot an 8-digit grid by tapping the map (scored by meters
  off), read the 8-digit grid of a marked point, and estimate azimuth &
  distance between two points. Best scores are saved per mode.
- **Doctrine flashcards** — METT-TC, OAKOC, SALUTE, GOTWA, ADDRAC, 9-line
  MEDEVAC, principles of patrolling, TLPs, back azimuth, terrain features,
  and 25+ more.
- **TLP sequence quiz** — put the 8 Troop Leading Procedures in order.
- **Task of the day + streak tracking** — a rotating daily drill with a streak
  counter, stored on your device.
- **Full offline PWA** — installs to your iPhone home screen and works with no
  signal (important in the field).

## Install on your iPhone

1. Host the app over HTTPS (easiest: enable **GitHub Pages** on this repo —
   Settings → Pages → deploy from the main branch, root folder).
2. Open the page in **Safari** on your iPhone.
3. Tap the **Share** button → **Add to Home Screen**.
4. Launch it from the home-screen icon like any other app. It works offline
   after the first load.

> Note: iOS speech recognition (Speech Check mode) needs mic permission and
> works best in Safari. If your iOS version doesn't support speech recognition
> in home-screen apps, open the site directly in Safari for Speech Check, or
> use Recite & Reveal mode.

## Run locally

No build step — it's plain HTML/CSS/JS:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Project layout

```
index.html            App shell and all screens
css/style.css         Night-ops theme
js/data.js            Battle drills, flashcards, TLP steps, daily tasks
js/generator.js       Random OPORD / WARNORD / FRAGO generator + scoring keys
js/app.js             UI logic, speech recognition, TTS, streaks
js/landnav.js         Land nav games: procedural topo map, plot/read/azimuth
sw.js                 Service worker (offline cache)
manifest.webmanifest  PWA manifest
icons/                App icons
```

Training aid only — content is condensed from common ROTC/Ranger Handbook
material and is not an official Army publication.
