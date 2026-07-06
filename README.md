# OPORD Trainer — Orleans Battalion Advanced Camp Prep

A pocket trainer built for Orleans Battalion Army ROTC cadets preparing for
Advanced Camp (Cadet Summer Training). It randomly generates OPORDs,
WARNORDs, and FRAGOs in the standard 5-paragraph shell — set in Atropia
against SAPA forces, just like camp — and drills you on briefing them back,
land navigation, 9-line MEDEVAC requests, battle drills, and core doctrine.

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
- **9-Line MEDEVAC practice** — a random casualty scenario (mechanism of
  injury, terrain, security situation), then you fill in all 9 lines of the
  request — precedence, equipment, patient count and type, security, marking,
  nationality, terrain — scored line by line against the scenario.
- **Interactive land nav** — a freshly generated topo-style map every round,
  with three games:
  - **Plot the Point** — given an 8-digit grid, tap the map where it falls.
  - **Read the Grid** — a point is marked; read off its 8-digit grid.
  - **Azimuth & Distance** — a real interactive protractor: drag the dial to
    sight the objective and read the azimuth off the degree scale, then drag
    a ruler to measure the distance. A live sighting ray on the map updates
    as you rotate the dial, just like sighting through a protractor and
    straightedge on a paper map.

  Best scores are saved per mode.
- **Doctrine flashcards** — METT-TC, OAKOC, SALUTE, GOTWA, ADDRAC, 9-line
  MEDEVAC, principles of patrolling, TLPs, back azimuth, terrain features,
  and 25+ more.
- **TLP sequence quiz** — put the 8 Troop Leading Procedures in order.
- **Task of the day + streak tracking** — a rotating daily drill with a streak
  counter, stored on your device.
- **Orleans Battalion branding** — an animated launch splash with the
  battalion crest, and the crest as the app icon.
- **Full offline PWA** — installs to your iPhone home screen and works with no
  signal (important in the field).

## Install on your iPhone

1. Host the app over HTTPS (easiest: enable **GitHub Pages** on this repo —
   Settings → Pages → deploy from the main branch, root folder).
2. Open the page in **Safari** on your iPhone.
3. Tap the **Share** button → **Add to Home Screen**.
4. Launch it from the home-screen icon like any other app. It works offline
   after the first load.

> Note: as a home-screen web app, Speech Check mode's accuracy depends on
> Safari's Web Speech API, which can be inconsistent on iOS. If it won't
> start, open the site directly in Safari, or use Recite & Reveal mode
> instead. The [native iOS app](#native-ios-app-share-with-other-cadets) uses
> Apple's on-device Speech framework instead and doesn't have this issue.

## Native iOS app (share with other cadets)

This repo also builds into a real iOS app via [Capacitor](https://capacitorjs.com),
using on-device Speech framework recognition (much more reliable than Safari's)
and a daily local notification reminder — no App Store listing required. See
**[docs/ios-build.md](docs/ios-build.md)** for the full step-by-step: build on
your Mac, run on your own phone via Xcode, then distribute to your unit through
**TestFlight** (a private link, up to 10,000 testers, no public App Store page).

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
js/native.js          Capacitor bridge: native speech recognition + notifications,
                      with automatic web fallback when not running in the app
js/data.js            Battle drills, flashcards, TLP steps, daily tasks
js/generator.js       Random OPORD / WARNORD / FRAGO generator + scoring keys
js/app.js             UI logic, speech recognition, TTS, streaks
js/landnav.js         Land nav games: procedural topo map, plot/read/azimuth,
                      protractor dial + ruler for the azimuth/distance game
js/medevac.js         9-Line MEDEVAC scenario generator + scoring
sw.js                 Service worker (offline cache)
manifest.webmanifest  PWA manifest
icons/                App icons, incl. the Orleans Battalion crest (SVG)
scripts/build-www.js  Builds www/ (the Capacitor webDir) from the web app
capacitor.config.json Capacitor project config
ios/                  Generated Xcode project (see docs/ios-build.md)
```

Training aid only — content is condensed from common ROTC/Ranger Handbook
material and is not an official Army publication.
