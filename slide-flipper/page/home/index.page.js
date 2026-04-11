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
  title:     0xFFFFFF,
  subtitle:  0x666688,
  divider:   0x222233,
  menuBg:    0x111122,
  menuPress: 0x222244,
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
      const self = this
      createWidget(widget.FILL_RECT, { x: 0, y: 0, w: W, h: 450, color: C.bg })

      // Title
      createWidget(widget.TEXT, {
        x: 0, y: TOP, w: W, h: 36,
        text: 'SLIDE FLIPPER', text_size: 22, color: C.title,
        align_h: align.CENTER_H,
      })

      // IP status
      createWidget(widget.FILL_RECT, {
        x: 90, y: TOP + 42, w: 10, h: 10, radius: 5, color: C.dotOff,
      })
      this.state.statusText = createWidget(widget.TEXT, {
        x: 106, y: TOP + 38, w: 200, h: 20,
        text: 'IP: ' + this.state.ip, text_size: 14, color: C.subtitle,
      })

      // Divider
      createWidget(widget.FILL_RECT, { x: 20, y: TOP + 62, w: W - 40, h: 1, color: C.divider })

      // Menu 1 — FLIPPER
      createWidget(widget.BUTTON, {
        x: 10, y: TOP + 68, w: W - 20, h: 90,
        normal_color: C.menuBg, press_color: C.menuPress,
        text: 'FLIPPER', text_size: 22, color: C.menuText,
        click_func() { push({ url: 'page/flipper/index.page' }) },
      })
      createWidget(widget.TEXT, {
        x: 10, y: TOP + 158, w: W - 20, h: 20,
        text: 'Prev / Next / Volume / Blank', text_size: 13, color: C.menuSub,
        align_h: align.CENTER_H,
      })

      // Divider
      createWidget(widget.FILL_RECT, { x: 20, y: TOP + 182, w: W - 40, h: 1, color: C.divider })

      // Menu 2 — IP SETUP
      createWidget(widget.BUTTON, {
        x: 10, y: TOP + 188, w: W - 20, h: 90,
        normal_color: C.menuBg, press_color: C.menuPress,
        text: 'IP SETUP', text_size: 22, color: C.menuText,
        click_func() { push({ url: 'page/ip-setup/index.page' }) },
      })
      createWidget(widget.TEXT, {
        x: 10, y: TOP + 278, w: W - 20, h: 20,
        text: 'Connect to your computer', text_size: 13, color: C.menuSub,
        align_h: align.CENTER_H,
      })

      // Divider
      createWidget(widget.FILL_RECT, { x: 20, y: TOP + 302, w: W - 40, h: 1, color: C.divider })

      // Menu 3 — INSTALL
      createWidget(widget.BUTTON, {
        x: 10, y: TOP + 308, w: W - 20, h: 80,
        normal_color: C.menuBg, press_color: C.menuPress,
        text: 'INSTALL', text_size: 22, color: C.menuText,
        click_func() { push({ url: 'page/tutorial/index.page' }) },
      })
      createWidget(widget.TEXT, {
        x: 10, y: TOP + 388, w: W - 20, h: 20,
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
