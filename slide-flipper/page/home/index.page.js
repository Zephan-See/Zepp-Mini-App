// page/home/index.page.js — Main Menu
// SlideFlipper v2.0 — Zephan
import { BasePage } from '@zeppos/zml/base-page'
import { createWidget, widget, prop, align } from '@zos/ui'
import { push } from '@zos/router'
import { localStorage } from '@zos/storage'

const W = 390
const H = 450

const C = {
  bg:          0x000000,
  title:       0xFFFFFF,
  subtitle:    0x666688,
  divider:     0x222233,
  menuBg:      0x111122,
  menuPress:   0x222244,
  menuText:    0xFFFFFF,
  menuSub:     0x8888AA,
  statusOn:    0x00CC66,
  statusOff:   0xFF4444,
  statusDot:   0x333355,
  version:     0x444466,
}

Page(
  BasePage({
    name: 'home',
    state: { ip: '192.168.1.100', statusDot: null, statusText: null },

    onInit() {
      this.log('Home onInit')

      // First-launch: redirect to tutorial
      const launched = localStorage.getItem('hasLaunched')
      if (!launched) {
        localStorage.setItem('hasLaunched', '1')
        push({ url: 'page/tutorial/index.page' })
        return
      }

      // Load saved IP
      const saved = localStorage.getItem('currentIP')
      if (saved) this.state.ip = saved
    },

    build() {
      this.log('Home build')
      const self = this
      const ip = this.state.ip

      // Background
      createWidget(widget.FILL_RECT, { x: 0, y: 0, w: W, h: H, color: C.bg })

      // Title
      createWidget(widget.TEXT, {
        x: 0, y: 14, w: W, h: 36,
        text: 'SLIDE FLIPPER',
        text_size: 22,
        color: C.title,
        align_h: align.CENTER_H,
      })

      // Status row
      this.state.statusDot = createWidget(widget.FILL_RECT, {
        x: 90, y: 56, w: 10, h: 10, radius: 5,
        color: C.statusDot,
      })
      this.state.statusText = createWidget(widget.TEXT, {
        x: 106, y: 52, w: 200, h: 20,
        text: 'IP: ' + ip,
        text_size: 14,
        color: C.subtitle,
      })

      // Divider
      createWidget(widget.FILL_RECT, { x: 20, y: 80, w: W - 40, h: 1, color: C.divider })

      // Menu item 1 — FLIPPER
      createWidget(widget.BUTTON, {
        x: 10, y: 90, w: W - 20, h: 96,
        normal_color: C.menuBg,
        press_color: C.menuPress,
        text: 'FLIPPER',
        text_size: 22,
        color: C.menuText,
        click_func() { push({ url: 'page/flipper/index.page' }) },
      })
      createWidget(widget.TEXT, {
        x: 10, y: 158, w: W - 20, h: 22,
        text: 'Prev / Next / Volume / Blank',
        text_size: 13,
        color: C.menuSub,
        align_h: align.CENTER_H,
      })

      // Divider
      createWidget(widget.FILL_RECT, { x: 20, y: 190, w: W - 40, h: 1, color: C.divider })

      // Menu item 2 — IP SETUP
      createWidget(widget.BUTTON, {
        x: 10, y: 196, w: W - 20, h: 96,
        normal_color: C.menuBg,
        press_color: C.menuPress,
        text: 'IP SETUP',
        text_size: 22,
        color: C.menuText,
        click_func() { push({ url: 'page/ip-setup/index.page' }) },
      })
      createWidget(widget.TEXT, {
        x: 10, y: 264, w: W - 20, h: 22,
        text: 'Connect to your computer',
        text_size: 13,
        color: C.menuSub,
        align_h: align.CENTER_H,
      })

      // Divider
      createWidget(widget.FILL_RECT, { x: 20, y: 296, w: W - 40, h: 1, color: C.divider })

      // Menu item 3 — TUTORIAL
      createWidget(widget.BUTTON, {
        x: 10, y: 302, w: W - 20, h: 96,
        normal_color: C.menuBg,
        press_color: C.menuPress,
        text: 'INSTALL',
        text_size: 22,
        color: C.menuText,
        click_func() { push({ url: 'page/tutorial/index.page' }) },
      })
      createWidget(widget.TEXT, {
        x: 10, y: 370, w: W - 20, h: 22,
        text: 'Mac + Windows setup guide',
        text_size: 13,
        color: C.menuSub,
        align_h: align.CENTER_H,
      })

      // Version
      createWidget(widget.TEXT, {
        x: 0, y: 404, w: W, h: 20,
        text: 'v2.0  by Zephan',
        text_size: 12,
        color: C.version,
        align_h: align.CENTER_H,
      })

      // Divider above footer
      createWidget(widget.FILL_RECT, { x: 20, y: 398, w: W - 40, h: 1, color: C.divider })
    },

    onResume() {
      // Refresh IP display when returning from IP setup
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
