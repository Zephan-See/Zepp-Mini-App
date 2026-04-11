// page/home/index.js
// ============================================================
//  SLIDE FLIPPER — Watch UI
//  iOS Liquid Dark Design for Amazfit Bip 6 (390 x 450 px)
//  Tap ◀ to go to PREVIOUS slide, ▶ to go to NEXT slide.
// ============================================================

import { MessageBuilder } from '@zeppos/zml/message-builder'

const messageBuilder = new MessageBuilder()

// ── Screen dimensions ──────────────────────────────────────
const W = 390
const H = 450

// ── iOS Liquid Dark colour palette ────────────────────────
const C = {
  bg:           0x000000,  // Pure AMOLED black
  divider:      0x1E1E2E,  // Subtle divider

  // PREV button (blue family)
  prevBg:       0x0D1B36,  // Deep navy
  prevPress:    0x1A3060,  // Lighter on press
  prevIcon:     0x4D94FF,  // Electric blue arrow
  prevLabel:    0x2B4B80,  // Muted blue label

  // NEXT button (green family)
  nextBg:       0x091A0F,  // Deep forest green
  nextPress:    0x16472A,  // Lighter on press
  nextIcon:     0x00CC66,  // Neon green arrow
  nextLabel:    0x1A5C34,  // Muted green label

  // Typography
  title:        0xFFFFFF,  // Pure white
  subtitle:     0x55556A,  // Muted grey

  // Status colours
  statusReady:  0x00CC66,  // Green → ready
  statusSend:   0x4D94FF,  // Blue → sending
  statusOk:     0x4D94FF,  // Blue → sent ok
  statusError:  0xFF4444,  // Red  → error
}

// ── Widget references (so we can update status later) ──────
let _dotWidget   = null
let _textWidget  = null

// ── Helpers ───────────────────────────────────────────────

function setStatus(msg, color) {
  if (_dotWidget)  _dotWidget.setProperty(hmUI.prop.MORE,  { color })
  if (_textWidget) _textWidget.setProperty(hmUI.prop.MORE, { text: msg, color })
}

function sendCommand(action) {
  setStatus('SENDING…', C.statusSend)

  messageBuilder
    .request({ action }, { timeout: 8000 })
    .then(() => {
      setStatus('✓  SENT', C.statusOk)
      setTimeout(() => setStatus('READY', C.statusReady), 1600)
    })
    .catch(() => {
      setStatus('✗  NO CONNECTION', C.statusError)
      setTimeout(() => setStatus('READY', C.statusReady), 2200)
    })
}

// ── Page ──────────────────────────────────────────────────

Page({

  onInit() {
    messageBuilder.connect()
  },

  build() {

    // ════════════════════════════════
    //  BACKGROUND
    // ════════════════════════════════
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0, y: 0, w: W, h: H,
      color: C.bg,
    })

    // ════════════════════════════════
    //  HEADER
    // ════════════════════════════════

    // App title
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0, y: 26, w: W, h: 38,
      text: 'SLIDE FLIPPER',
      text_size: 22,
      color: C.title,
      align_h: hmUI.align.CENTER_H,
    })

    // Subtitle
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0, y: 67, w: W, h: 26,
      text: 'PowerPoint Remote',
      text_size: 14,
      color: C.subtitle,
      align_h: hmUI.align.CENTER_H,
    })

    // Thin divider line
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 55, y: 100, w: W - 110, h: 1,
      color: C.divider,
    })

    // ════════════════════════════════
    //  STATUS ROW
    // ════════════════════════════════

    // Glowing status dot
    _dotWidget = hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: W / 2 - 58, y: 117,
      w: 12, h: 12, radius: 6,
      color: C.statusReady,
    })

    // Status message
    _textWidget = hmUI.createWidget(hmUI.widget.TEXT, {
      x: W / 2 - 40, y: 113,
      w: 140, h: 22,
      text: 'READY',
      text_size: 14,
      color: C.statusReady,
    })

    // ════════════════════════════════
    //  PREV BUTTON  (left half)
    // ════════════════════════════════

    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: 10,
      y: 148,
      w: 178,
      h: 220,
      radius: 32,
      normal_color: C.prevBg,
      press_color:  C.prevPress,
      text:         '◀',
      text_size:    88,
      color:        C.prevIcon,
      click_func: () => sendCommand('prev'),
    })

    // PREV label (sits just below the button)
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 10, y: 374, w: 178, h: 28,
      text: 'P R E V',
      text_size: 14,
      color: C.prevLabel,
      align_h: hmUI.align.CENTER_H,
    })

    // ════════════════════════════════
    //  NEXT BUTTON  (right half)
    // ════════════════════════════════

    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: 202,
      y: 148,
      w: 178,
      h: 220,
      radius: 32,
      normal_color: C.nextBg,
      press_color:  C.nextPress,
      text:         '▶',
      text_size:    88,
      color:        C.nextIcon,
      click_func: () => sendCommand('next'),
    })

    // NEXT label (sits just below the button)
    hmUI.createWidget(hmUI.widget.TEXT, {
      x: 202, y: 374, w: 178, h: 28,
      text: 'N E X T',
      text_size: 14,
      color: C.nextLabel,
      align_h: hmUI.align.CENTER_H,
    })

  }, // end build()

  onDestroy() {
    messageBuilder.disConnect()
  },

}) // end Page()
