// page/home/index.page.js — Main Menu
// SlideFlipper v2.0 — Zephan
import { BasePage } from '@zeppos/zml/base-page'
import { createWidget, widget, prop, align } from '@zos/ui'
import { push } from '@zos/router'
import { localStorage } from '@zos/storage'

const W   = 390
const TOP = 65   // safe area — clears the watch status bar

const C = {
  bg:      0x000000,
  title:   0xFFFFFF,
  sub:     0x777799,
  divider: 0x1A1A2E,
  menuBg:  0x0D0D1F,
  menuTxt: 0xFFFFFF,
  menuSub: 0x8888AA,
  dotOff:  0x333355,
  version: 0x444466,
}

// Rounded card: FILL_RECT handles click (supports click_func + radius)
// TEXT is visual only — touches pass through to FILL_RECT below
function card(x, y, w, h, label, sz, fn) {
  createWidget(widget.FILL_RECT, { x, y, w, h, radius: 14, color: C.menuBg, click_func: fn })
  createWidget(widget.TEXT, {
    x, y: y + Math.floor((h - sz) / 2),
    w, h: sz + 4,
    text: label, text_size: sz, color: C.menuTxt,
    align_h: align.CENTER_H,
    // No click_func — touch falls through to FILL_RECT
  })
}

Page(
  BasePage({
    name: 'home',
    state: { ip: '', statusText: null },

    onInit() {
      this.log('Home onInit')
      const launched = localStorage.getItem('hasLaunched')
      if (!launched) {
        localStorage.setItem('hasLaunched', '1')
        push({ url: 'page/tutorial/index.page' })
        return
      }
      const saved = localStorage.getItem('currentIP')
      this.state.ip = saved || 'not set'
    },

    build() {
      const self = this
      createWidget(widget.FILL_RECT, { x: 0, y: 0, w: W, h: 450, color: C.bg })

      // ── Title ─────────────────────────────────────────────
      createWidget(widget.TEXT, {
        x: 0, y: TOP, w: W, h: 32,
        text: 'SLIDE FLIPPER', text_size: 20, color: C.title,
        align_h: align.CENTER_H,
      })

      // ── IP status ─────────────────────────────────────────
      createWidget(widget.FILL_RECT, {
        x: 118, y: TOP + 40, w: 8, h: 8, radius: 4, color: C.dotOff,
      })
      this.state.statusText = createWidget(widget.TEXT, {
        x: 132, y: TOP + 36, w: 200, h: 20,
        text: 'IP: ' + this.state.ip, text_size: 13, color: C.sub,
      })

      // ── Divider ───────────────────────────────────────────
      createWidget(widget.FILL_RECT, { x: 16, y: TOP + 58, w: W - 32, h: 1, color: C.divider })

      // ── Menu 1: FLIPPER ───────────────────────────────────
      const y1 = TOP + 64
      card(10, y1, W - 20, 76, 'FLIPPER', 22, () => push({ url: 'page/flipper/index.page' }))
      createWidget(widget.TEXT, {
        x: 10, y: y1 + 76, w: W - 20, h: 18,
        text: 'Prev / Next / Volume / Blank', text_size: 12, color: C.menuSub,
        align_h: align.CENTER_H,
      })

      createWidget(widget.FILL_RECT, { x: 16, y: y1 + 98, w: W - 32, h: 1, color: C.divider })

      // ── Menu 2: IP SETUP ──────────────────────────────────
      const y2 = y1 + 104
      card(10, y2, W - 20, 76, 'IP SETUP', 22, () => push({ url: 'page/ip-setup/index.page' }))
      createWidget(widget.TEXT, {
        x: 10, y: y2 + 76, w: W - 20, h: 18,
        text: 'Connect to your computer', text_size: 12, color: C.menuSub,
        align_h: align.CENTER_H,
      })

      createWidget(widget.FILL_RECT, { x: 16, y: y2 + 98, w: W - 32, h: 1, color: C.divider })

      // ── Menu 3: INSTALL ───────────────────────────────────
      const y3 = y2 + 104
      card(10, y3, W - 20, 72, 'INSTALL', 22, () => push({ url: 'page/tutorial/index.page' }))
      createWidget(widget.TEXT, {
        x: 10, y: y3 + 72, w: W - 20, h: 18,
        text: 'Mac + Windows setup guide', text_size: 12, color: C.menuSub,
        align_h: align.CENTER_H,
      })

      // ── Version ───────────────────────────────────────────
      createWidget(widget.TEXT, {
        x: 0, y: y3 + 96, w: W, h: 18,
        text: 'v2.0  by Zephan', text_size: 11, color: C.version,
        align_h: align.CENTER_H,
      })
    },

    onResume() {
      const saved = localStorage.getItem('currentIP')
      if (saved && saved !== this.state.ip) {
        this.state.ip = saved
        if (this.state.statusText) {
          this.state.statusText.setProperty(prop.MORE, { text: 'IP: ' + saved })
        }
      }
    },

    onDestroy() { this.log('Home onDestroy') },
  }),
)
