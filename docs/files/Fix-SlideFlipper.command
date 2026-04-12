#!/bin/bash

APP="/Applications/SlideFlipper.app"

if [ ! -d "$APP" ]; then
  osascript -e 'display dialog "SlideFlipper.app was not found in Applications. Please drag it into Applications first, then double-click this file again." buttons {"OK"} default button "OK" with icon caution'
  exit 1
fi

xattr -cr "$APP"
open "$APP"
