#!/bin/bash
# ═══════════════════════════════════════════════════════
#  SLIDE FLIPPER v2.0 — One-Click Launcher
#  Double-click this file to:
#    1. Auto-detect your Mac's current IP address
#    2. Start PC Controller (node server.js) in a new window
#    3. Build & show QR code → scan with Zepp app
#
#  Then open the watch app → IP SETUP → enter the IP shown.
# ═══════════════════════════════════════════════════════

PROJECT="/Users/zephan/Downloads/PPT Pointer ZEPP Apps/slide-flipper"
cd "$PROJECT"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║    SLIDE FLIPPER v2.0 — One-Click Setup  ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── STEP 1: Auto-detect IP ────────────────────────────
echo "[ 1/3 ] Detecting IP address..."

LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null)
if [ -z "$LOCAL_IP" ]; then
  LOCAL_IP=$(ipconfig getifaddr en1 2>/dev/null)
fi
if [ -z "$LOCAL_IP" ]; then
  LOCAL_IP=$(ifconfig | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -1)
fi

if [ -z "$LOCAL_IP" ]; then
  echo "  ✗  Could not detect IP. Are you connected to Wi-Fi?"
  echo "     Please connect to Wi-Fi and try again."
  read -n 1 -p "Press any key to close..."
  exit 1
fi

echo ""
echo "  ┌─────────────────────────────────────────┐"
echo "  │  Your Mac IP:  $LOCAL_IP"
echo "  │"
echo "  │  → Enter this in the watch:"
echo "  │    Open App → IP SETUP → type this IP"
echo "  └─────────────────────────────────────────┘"
echo ""

# ── STEP 2: Start server.js in a new Terminal window ─
echo "[ 2/3 ] Starting PC Controller server..."

osascript <<EOF
tell application "Terminal"
  activate
  set newTab to do script "echo '' && echo '╔══════════════════════════════════════════╗' && echo '║     SLIDE FLIPPER v2.0 — PC Controller   ║' && echo '╚══════════════════════════════════════════╝' && echo '' && cd '$PROJECT/pc-controller' && node server.js"
  set current settings of newTab to settings set "Pro"
end tell
EOF

echo "  ✓  Server started in new Terminal window"
sleep 1

# ── STEP 3: Build & QR code ───────────────────────────
echo ""
echo "[ 3/3 ] Building app & generating QR code..."
echo ""

rm -rf "$PROJECT/dist"

echo "═══════════════════════════════════════════════════════"
echo ""
echo "  HOW TO INSTALL:"
echo "  1. Open Zepp app on your phone"
echo "  2. Profile (bottom right) → Developer Mode → ON"
echo "  3. Scan the QR code below"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

/opt/homebrew/bin/zeus preview --target "Amazfit Bip 6"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Watch app installed! Now:"
echo "  1. Open Slide Flipper on your watch"
echo "  2. Go to IP SETUP"
echo "  3. Enter: $LOCAL_IP"
echo "  4. Go to FLIPPER — start presenting!"
echo "═══════════════════════════════════════════════════════"
echo ""
read -n 1 -p "Press any key to close..."
