# Building OPORD Trainer as a native iOS app

This turns the web app into a real iOS app using [Capacitor](https://capacitorjs.com):
the exact same HTML/CSS/JS runs inside a native WKWebView shell, with two
native upgrades over the plain PWA:

- **On-device speech recognition** for Speech Check mode (Apple's Speech
  framework, via the `@capacitor-community/speech-recognition` plugin) —
  more reliable than Safari's Web Speech API, and works from the home-screen
  app, not just in-browser.
- **A daily local notification** at 1800 reminding you to do the day's task,
  if it isn't logged yet.

Everything else (order generator, land nav, flashcards, drills) is unchanged
— it's the same web app, just wrapped.

You do not need to publish to the public App Store. This guide distributes
through **TestFlight**, which is invite/link-based and never appears in App
Store search.

## What you need

- **A Mac** with Xcode installed (free, from the Mac App Store).
- **Node.js** (18+) — check with `node --version`.
- **CocoaPods** — install once with `sudo gem install cocoapods`.
- **An Apple Developer Program membership** ($99/year) — required for
  TestFlight and for installs to last longer than 7 days. A free Apple ID
  works for testing on your own phone via a cable, but installs expire
  weekly and there's no way to share with other cadets.

## One-time setup (on your Mac)

```bash
git clone <this repo's URL>
cd ROTC
git checkout main   # or whichever branch has this app
npm install
```

## Build and run on your own iPhone

```bash
npm run ios:open
```

This copies the web app into `www/`, syncs it (plus the native plugins) into
the `ios/` Xcode project, and opens Xcode. Then in Xcode:

1. Click the **App** project in the left sidebar → **Signing & Capabilities**.
2. Under **Team**, pick your Apple ID (add it via Xcode → Settings → Accounts
   if it's not listed yet). Xcode will auto-generate a free development
   signing certificate.
3. Change the **Bundle Identifier** if `com.rotc.opordtrainer` is taken —
   anything unique like `com.yourname.opordtrainer` works.
4. Plug your iPhone in (or select it wirelessly), pick it as the run
   destination at the top of the window, and hit **Run** (▶).
5. First launch: on your phone, go to **Settings → General → VPN & Device
   Management** and trust your developer certificate.

The app is now on your home screen. With a free Apple ID it re-signs itself
whenever you rebuild, but the install expires after 7 days — just re-run
from Xcode to refresh it.

## Distributing to other cadets (TestFlight)

This is the part that needs the paid Apple Developer Program.

1. **Register the app** in [App Store Connect](https://appstoreconnect.apple.com)
   → My Apps → **+** → New App. Use the same bundle ID as in Xcode. Platform:
   iOS. Nothing here gets published — this just creates the internal record
   TestFlight needs.
2. **Archive and upload** from Xcode:
   - Select **Any iOS Device** (not a simulator) as the run destination.
   - **Product → Archive.**
   - In the Organizer window that opens, click **Distribute App → TestFlight
     & App Store → Upload**. Xcode handles signing automatically if you're on
     the paid team.
3. **Add testers** in App Store Connect → your app → **TestFlight** tab:
   - **Internal testing** (up to 100 people who are members of your Apple
     Developer team) — no review, available within minutes.
   - **External testing** (up to 10,000 people, just their email or a public
     link) — requires a one-time lightweight "Beta App Review" from Apple,
     usually approved within a day. This is the one you want for sharing
     with your unit — send the TestFlight link, cadets install the
     **TestFlight** app from the App Store, and open your link.
4. Builds you push later (bug fixes, new features) show up automatically to
   everyone already added as a tester — no re-invite needed.

## Updating the app after a code change

Whenever the web app (`index.html`, `css/`, `js/`) changes:

```bash
npm run ios:sync   # rebuilds www/ and copies it into ios/
```

Then in Xcode: bump the build number (General tab), Archive, and upload a new
TestFlight build as above.

## Notes

- `www/`, `node_modules/`, and Xcode's `ios/App/Pods/` and
  `ios/App/App/public/` are generated/build output — don't hand-edit them,
  they get overwritten by `npm run ios:sync`.
- The `ios/` Xcode project itself (the `.xcodeproj`, `Podfile`,
  `Info.plist`, Swift files) **is** committed to the repo, so you don't need
  to regenerate it — just open `ios/App/App.xcworkspace` in Xcode after
  `npm install` and `npx cap sync ios`.
- Microphone and speech recognition permission strings are already set in
  `ios/App/App/Info.plist` — iOS will prompt the cadet the first time they
  use Speech Check mode.
