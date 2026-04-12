# SlideFlipper Lite

This is a lightweight tray edition of the desktop controller.

## What it keeps

- Same watch HTTP control flow on port `3000`
- Same slide / play / blank / volume actions
- Tray icon with a quick way to see the local IP

## Why it exists

The Electron desktop app is easy to ship, but the download size is large because it bundles Chromium.

This Lite edition is designed to:

- reduce download size
- keep a tray-style experience for non-technical users
- avoid replacing the current stable Electron build

## Local run

```bash
cd slide-flipper/pc-controller-lite
npm install
npm start
```

## Packaging targets

```bash
npm run build:mac
npm run build:win
```

The first iteration targets:

- macOS Apple Silicon
- Windows x64
