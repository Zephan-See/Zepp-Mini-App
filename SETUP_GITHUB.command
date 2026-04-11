#!/bin/bash
# SETUP_GITHUB.command — Initialize git and push to GitHub
# Double-click this file to run it.
# ============================================================

# Move to the directory containing this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo ""
echo "=================================================="
echo "   SLIDE FLIPPER — GitHub Setup"
echo "=================================================="
echo ""
echo "Folder: $DIR"
echo ""

# ── Check if git is already initialized ───────────────────
if [ -d ".git" ]; then
  echo "Git already initialized in this folder."
else
  echo "Initializing git repository..."
  git init
  git branch -M main
fi

# ── Ask for GitHub remote URL ──────────────────────────────
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null)

if [ -n "$CURRENT_REMOTE" ]; then
  echo "Remote already set: $CURRENT_REMOTE"
  read -p "Change remote? (leave blank to keep current): " NEW_REMOTE
  if [ -n "$NEW_REMOTE" ]; then
    git remote set-url origin "$NEW_REMOTE"
    echo "Remote updated to: $NEW_REMOTE"
  fi
else
  echo "Paste your GitHub repository URL (e.g. https://github.com/username/repo.git):"
  read -p "GitHub URL: " REMOTE_URL
  if [ -z "$REMOTE_URL" ]; then
    echo "No URL entered. Exiting."
    read -p "Press Enter to close..."
    exit 1
  fi
  git remote add origin "$REMOTE_URL"
  echo "Remote set to: $REMOTE_URL"
fi

echo ""
echo "-- Staging all files..."
git add .

echo ""
echo "-- Files to be committed:"
git status --short

echo ""
echo "-- Creating commit..."
git commit -m "Add SlideFlipper v2.0 — multi-page Zepp OS presentation remote

- Main menu with 3-page navigation (Flipper, IP Setup, Tutorial)
- Flipper: PREV/NEXT + VOL-/PLAY/VOL+ + BLANK SCREEN controls
- IP Setup: 4-octet numpad with 5-slot history, persisted to localStorage
- Tutorial: Mac/Windows tabbed install guide built into the watch
- Dynamic IP: watch sends IP to phone on every request (no hardcoded IP)
- Haptic feedback on all button presses
- First-launch auto-redirect to Tutorial
- pc-controller/server.js supports Mac, Windows, Linux + 6 commands
- zepp-miniapps/ folder for future Zepp apps"

echo ""
echo "-- Pushing to GitHub (branch: main)..."
git push -u origin main

echo ""
echo "=================================================="
echo "   Done! Your code is now on GitHub."
echo "=================================================="
echo ""
read -p "Press Enter to close this window..."
