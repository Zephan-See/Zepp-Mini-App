#!/bin/bash
# ═══════════════════════════════════════════════════════
#  SLIDE FLIPPER — One-Click Launcher
#  Double-click this file to:
#    1. Auto-detect your Mac's current IP address
#    2. Update PC_IP in app-side/index.js
#    3. Start PC Controller (node server.js) in a new window
#    4. Build & show QR code → scan with Zepp app
# ═══════════════════════════════════════════════════════

PROJECT="/Users/zephan/Downloads/PPT Pointer ZEPP Apps/slide-flipper"
cd "$PROJECT"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║      SLIDE FLIPPER — One-Click Setup     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── STEP 1: Auto-detect IP ────────────────────────────
echo "[ 1/4 ] Detecting IP address..."

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

echo "  ✓  Your IP: $LOCAL_IP"

# ── STEP 2: Update PC_IP in app-side/index.js ────────
echo ""
echo "[ 2/4 ] Updating PC_IP in app-side/index.js..."

sed -i '' "s/const PC_IP   = '[^']*'/const PC_IP   = '$LOCAL_IP'/" "$PROJECT/app-side/index.js"

echo "  ✓  PC_IP set to: $LOCAL_IP"

# ── STEP 3: Start server.js in a new Terminal window ─
echo ""
echo "[ 3/4 ] Starting PC Controller server..."

osascript <<EOF
tell application "Terminal"
  activate
  set newTab to do script "echo '' && echo '╔══════════════════════════════════════════╗' && echo '║     SLIDE FLIPPER — PC Controller        ║' && echo '╚══════════════════════════════════════════╝' && echo '' && cd '$PROJECT/pc-controller' && node server.js"
  set current settings of newTab to settings set "Pro"
end tell
EOF

echo "  ✓  Server started in new Terminal window"
sleep 1

# ── STEP 4: Set up app icons ──────────────────────────
echo ""
echo "[ 4/4 ] Building app & generating QR code..."
echo ""

mkdir -p assets/common.r assets/common.s assets/common.b

ICON_B64="iVBORw0KGgoAAAANSUhEUgAAAPgAAAD4CAIAAABOs7xcAAAHn0lEQVR4nO3cQW4cRxBEUS4FwkvBZ/BGF/Jah9WxLGCEgSBLZLOrKiMy4wP/ADOMx0St5uX18xei8b3IPwFRQUCniIBOEQGdIgI6RQR0igjoFBHQKSKgU0RAp4iAThEBnSICOkUEdIoI6BQR0Cmi/wCymP9qPEyn2wAAAABJRU5ErkJggg=="

echo "$ICON_B64" | base64 -d > assets/common.r/icon.png
echo "$ICON_B64" | base64 -d > assets/common.s/icon.png
echo "$ICON_B64" | base64 -d > assets/common.b/icon.png

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
echo "  Done! Check the other Terminal window to see"
echo "  incoming commands from your watch."
echo "═══════════════════════════════════════════════════════"
echo ""
read -n 1 -p "Press any key to close..."
