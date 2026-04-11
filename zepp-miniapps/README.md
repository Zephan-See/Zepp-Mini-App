# Zepp Mini Apps by Zephan

A collection of Zepp OS v3 Mini Apps for Amazfit smartwatches.

Built for the **Amazfit Bip 6** (also works on other Amazfit devices with Zepp OS v3).

---

## Apps

### [slide-flipper](../slide-flipper/)

**Wireless presentation remote — control slides from your wrist.**

Turn your Amazfit watch into a presentation clicker. Control Google Slides, PowerPoint, Keynote, Canva, and more — without touching your laptop.

**Features:**
- PREV / NEXT slide (large tap targets)
- VOL- / PLAY / VOL+ controls
- BLANK SCREEN toggle (black out during Q&A)
- Manual IP setup with 5-slot history (remembered across sessions)
- Mac + Windows install guide built into the watch
- Haptic feedback on every button press
- First-launch tutorial auto-redirect

**How it works:**
```
Watch tap → Zepp phone app (bridge) → Wi-Fi HTTP → PC server → key press
```

**Quick start:**
1. Double-click `slide-flipper/START_BRIDGE.command` on Mac (or `node pc-controller/server.js` on Windows)
2. Note the IP address shown in the terminal
3. Enter that IP in the watch's IP SETUP screen
4. Open any presentation, tap FLIPPER — done!

---

## Developer Notes

All apps in this collection follow the same structure and rules for Zepp OS v3:

- `configVersion: "v3"`, `designWidth: 390`
- UI built with `@zos/ui` — never `hmUI` (that's v2)
- All widgets inlined in `build()` — no `zosLoader` imports
- `BUTTON` widget: no `radius` property (causes black screen on device)
- Button text: ASCII only — no Unicode arrows or symbols
- Button colors: must contrast against black background (`0x0A3870`+ for blue, `0x0A5C30`+ for green)
- `icon.png` must be exactly **80×80 px**
- Storage: `@zos/storage` localStorage for persistent state
- Navigation: `push()` / `pop()` from `@zos/router`
- Haptics: `vibrate({ type: 'short' })` from `@zos/interaction`
- IP passed dynamically from watch → phone as `params: { ip, port }` — never hardcoded in app-side

---

## Build & Install

Requires [Zeus CLI](https://docs.zepp.com/docs/guides/tools/zeus-cli/) and the Zepp app on your phone with Developer Mode enabled.

```bash
# From inside any app folder:
zeus preview --target "Amazfit Bip 6"
```

Scan the QR code with the Zepp app on your phone. The app will sync to your watch automatically.

---

*Made with care by Zephan*
