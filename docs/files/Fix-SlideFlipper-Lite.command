#!/bin/bash

APP="$HOME/Downloads/SlideFlipper-Lite-mac-arm64"

if [ ! -f "$APP" ]; then
  osascript -e 'display dialog "SlideFlipper-Lite-mac-arm64 was not found in Downloads. Please unzip it in Downloads first, then double-click this file again." buttons {"OK"} default button "OK" with icon caution'
  exit 1
fi

chmod +x "$APP"
xattr -cr "$APP"
nohup "$APP" >/dev/null 2>&1 &

osascript -e 'display dialog "SlideFlipper Lite has been fixed and started in the background." buttons {"OK"} default button "OK"'
(sleep 1; osascript -e 'tell application "Terminal" to close front window saving no' -e 'quit app "Terminal"') >/dev/null 2>&1 &
