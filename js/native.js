// OPORD Trainer — native bridge
// Wraps Capacitor plugins (available only inside the iOS app shell) behind
// the same interface the web build already uses, so js/app.js works
// unmodified whether it's running in Safari or inside the native wrapper.
(() => {
  const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  const plugins = isNative ? window.Capacitor.Plugins : {};

  // ---------------- speech recognition ----------------
  // Native: @capacitor-community/speech-recognition (iOS Speech framework).
  // Web fallback: the existing SpeechRecognition/webkitSpeechRecognition API.
  const WebSR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const NativeSpeech = {
    available: isNative && !!plugins.SpeechRecognition,
    webAvailable: !!WebSR,
    // True if some form of speech recognition can run on this device.
    get supported() { return this.available || this.webAvailable; },

    // handlers: { onInterim(text), onError(err) }
    // Returns a promise that resolves with the final transcript when stop() is called.
    async start(handlers) {
      if (this.available) {
        const perm = await plugins.SpeechRecognition.requestPermissions();
        if (perm.speechRecognition !== "granted") throw new Error("not-allowed");
        let finalText = "";
        const sub = await plugins.SpeechRecognition.addListener("partialResults", data => {
          finalText = (data.matches && data.matches[0]) || finalText;
          handlers.onInterim(finalText);
        });
        this._sub = sub;
        const result = await plugins.SpeechRecognition.start({ language: "en-US", partialResults: true, popup: false });
        if (result && result.matches && result.matches[0]) finalText = result.matches[0];
        return finalText;
      }
      // web fallback
      return new Promise((resolve, reject) => {
        const recog = new WebSR();
        this._webRecog = recog;
        let finals = "";
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = "en-US";
        recog.onresult = e => {
          let f = "";
          for (let i = 0; i < e.results.length; i++) if (e.results[i].isFinal) f += e.results[i][0].transcript + " ";
          if (f) finals = f;
          const interim = Array.from(e.results).map(r => r[0].transcript).join(" ");
          handlers.onInterim(interim || finals);
        };
        recog.onerror = ev => { reject(new Error(ev.error || "speech-error")); };
        recog.onend = () => resolve(finals);
        try { recog.start(); } catch (e) { reject(e); }
      });
    },

    async stop() {
      if (this.available) {
        if (this._sub) { try { await this._sub.remove(); } catch (e) {} this._sub = null; }
        try { await plugins.SpeechRecognition.stop(); } catch (e) {}
      } else if (this._webRecog) {
        try { this._webRecog.stop(); } catch (e) {}
        this._webRecog = null;
      }
    }
  };

  // ---------------- local notifications ----------------
  // Native only — schedules a repeating daily reminder for the task of the day.
  // No-op on the web build (there's no reliable iOS Safari equivalent).
  const NativeNotify = {
    available: isNative && !!plugins.LocalNotifications,

    async scheduleDailyReminder(hour, minute) {
      if (!this.available) return false;
      const perm = await plugins.LocalNotifications.requestPermissions();
      if (perm.display !== "granted") return false;
      await plugins.LocalNotifications.cancel({ notifications: [{ id: 1 }] });
      await plugins.LocalNotifications.schedule({
        notifications: [{
          id: 1,
          title: "OPORD Trainer",
          body: "Today's task is up — keep the streak alive.",
          schedule: { on: { hour, minute }, repeats: true }
        }]
      });
      return true;
    },

    async cancelDailyReminder() {
      if (!this.available) return;
      await plugins.LocalNotifications.cancel({ notifications: [{ id: 1 }] });
    }
  };

  window.NativeSpeech = NativeSpeech;
  window.NativeNotify = NativeNotify;
  window.IS_NATIVE_APP = isNative;
})();
