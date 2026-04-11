// page/home/index.page.js — Main Menu
// SlideFlipper v2.0 — Zephan
import { BasePage } from '@zeppos/zml/base-page'
import { createWidget, widget, prop, align } from '@zos/ui'
import { push } from '@zos/router'
import { localStorage } from '@zos/storage'

const W   = 390
const TOP = 60   // offset to clear the watch status bar

const C = {
  bg:        0x000000,
  header:    0x0A0E1A,
  title:     0xFFFFFF,
  accent:    0x4D94FF,
  subtitle:  0x666688,
  divider:   0x222233,
  menuBg:    0x111122,
  menuPress: 0x1B2340,
  menuText:  0xFFFFFF,
  menuSub:   0x8888AA,
  dotOff:    0x333355,
  version:   0x444466,
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
      createWidget(widget.FILL_RECT, { x: 0, y: 0, w: W, h: 450, color: C.bg })
      createWidget(widget.FILL_RECT, { x: 0, y: 0, w: W, h: 92, color: C.header })

      // Title
      createWidget(widget.TEXT, {
        x: 0, y: TOP - 2, w: W, h: 36,
        text: 'SLIDE FLIPPER', text_size: 22, color: C.title,
        align_h: align.CENTER_H,
      })
      createWidget(widget.TEXT, {
        x: 0, y: TOP + 24, w: W, h: 18,
        text: 'Remote control on your wrist', text_size: 12, color: C.subtitle,
        align_h: align.CENTER_H,
      })

      // IP status
      createWidget(widget.FILL_RECT, {
        x: 92, y: TOP + 48, w: 10, h: 10, radius: 5, color: C.accent,
      })
      this.state.statusText = createWidget(widget.TEXT, {
        x: 108, y: TOP + 44, w: 220, h: 20,
        text: 'IP: ' + this.state.ip, text_size: 14, color: C.subtitle,
      })

      // Divider
      createWidget(widget.FILL_RECT, { x: 18, y: TOP + 70, w: W - 36, h: 2, color: C.divider })

      // Menu 1 — FLIPPER
      createWidget(widget.BUTTON, {
        x: 12, y: TOP + 78, w: W - 24, h: 92,
        normal_color: C.menuBg, press_color: C.menuPress,
        text: 'FLIPPER', text_size: 22, color: C.menuText,
        click_func() { push({ url: 'page/flipper/index.page' }) },
      })
      createWidget(widget.TEXT, {
        x: 12, y: TOP + 144, w: W - 24, h: 20,
        text: 'Prev / Next / Volume / Blank', text_size: 13, color: C.menuSub,
        align_h: align.CENTER_H,
      })

      // Divider
      createWidget(widget.FILL_RECT, { x: 22, y: TOP + 184, w: W - 44, h: 1, color: C.divider })

      // Menu 2 — IP SETUP
      createWidget(widget.BUTTON, {
        x: 12, y: TOP + 192, w: W - 24, h: 92,
        normal_color: C.menuBg, press_color: C.menuPress,
        text: 'IP SETUP', text_size: 22, color: C.menuText,
        click_func() { push({ url: 'page/ip-setup/index.page' }) },
      })
      createWidget(widget.TEXT, {
        x: 12, y: TOP + 258, w: W - 24, h: 20,
        text: 'Connect to your computer', text_size: 13, color: C.menuSub,
        align_h: align.CENTER_H,
      })

      // Divider
      createWidget(widget.FILL_RECT, { x: 22, y: TOP + 300, w: W - 44, h: 1, color: C.divider })

      // Menu 3 — INSTALL
      createWidget(widget.BUTTON, {
        x: 12, y: TOP + 308, w: W - 24, h: 82,
        normal_color: C.menuBg, press_color: C.menuPress,
        text: 'INSTALL', text_size: 22, color: C.menuText,
        click_func() { push({ url: 'page/tutorial/index.page' }) },
      })
      createWidget(widget.TEXT, {
        x: 12, y: TOP + 364, w: W - 24, h: 20,
        text: 'Mac + Windows setup guide', text_size: 13, color: C.menuSub,
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
