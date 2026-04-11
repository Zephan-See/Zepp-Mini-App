// page/flipper/index.page.js — Slide Flipper Controls
// SlideFlipper v2.0 — Zephan
import { BasePage } from '@zeppos/zml/base-page'
import { createWidget, widget, prop, align } from '@zos/ui'
import { pop } from '@zos/router'
import { localStorage } from '@zos/storage'
import { vibrate } from '@zos/interaction'

const W = 390
const H = 450

const C = {
  bg:         0x000000,
  title:      0xFFFFFF,
  back:       0x555577,
  prevBg:     0x0A3870,
  prevPress:  0x1A60C0,
  nextBg:     0x0A5C30,
  nextPress:  0x18A050,
  btnText:    0xFFFFFF,
  rowBg:      0x1A1030,
  rowPress:   0x2A2050,
  blankBg:    0x4A1A1A,
  blankPress: 0x7A2A2A,
  statusRdy:  0x00CC66,
  statusSend: 0x4D94FF,
  statusOk:   0x4D94FF,
  statusErr:  0xFF4444,
  dotBg:      0x333344,
}

let _dot = null
let _statusTxt = null

Page(
  BasePage({
    name: 'flipper',
    state: { ip: '192.168.1.100' },

    onInit() {
      this.log('Flipper onInit')
      const saved = localStorage.getItem('currentIP')
      if (saved) this.state.ip = saved
    },

    build() {
      this.log('Flipper build')
      const self = this

      createWidget(widget.FILL_RECT, { x: 0, y: 0, w: W, h: H, color: C.bg })

      // Header: title + back
      createWidget(widget.TEXT, {
        x: 0, y: 10, w: W, h: 30,
        text: 'FLIPPER',
        text_size: 20,
        color: C.title,
        align_h: align.CENTER_H,
      })
      createWidget(widget.BUTTON, {
        x: 6, y: 8, w: 52, h: 32,
        normal_color: 0x111122,
        press_color: 0x222244,
        text: 'BACK',
        text_size: 12,
        color: C.back,
        click_func() { pop() },
      })

      // Status row
      _dot = createWidget(widget.FILL_RECT, {
        x: 100, y: 46, w: 10, h: 10, radius: 5,
        color: C.dotBg,
      })
      _statusTxt = createWidget(widget.TEXT, {
        x: 116, y: 42, w: 180, h: 20,
        text: 'READY',
        text_size: 14,
        color: C.statusRdy,
      })

      // ── PREV / NEXT  (large buttons) ─────────────────────
      createWidget(widget.BUTTON, {
        x: 6, y: 68, w: 185, h: 212,
        normal_color: C.prevBg,
        press_color:  C.prevPress,
        text: 'PREV',
        text_size: 36,
        color: C.btnText,
        click_func() { self.sendCmd('prev') },
      })
      createWidget(widget.BUTTON, {
        x: 199, y: 68, w: 185, h: 212,
        normal_color: C.nextBg,
        press_color:  C.nextPress,
        text: 'NEXT',
        text_size: 36,
        color: C.btnText,
        click_func() { self.sendCmd('next') },
      })

      // ── VOL-  /  PLAY  /  VOL+  (secondary row) ─────────
      const rowY = 288
      const rowH = 78
      const rowW = 126

      createWidget(widget.BUTTON, {
        x: 6, y: rowY, w: rowW, h: rowH,
        normal_color: C.rowBg,
        press_color:  C.rowPress,
        text: 'VOL-',
        text_size: 18,
        color: C.btnText,
        click_func() { self.sendCmd('voldown') },
      })
      createWidget(widget.BUTTON, {
        x: 138, y: rowY, w: rowW, h: rowH,
        normal_color: C.rowBg,
        press_color:  C.rowPress,
        text: 'PLAY',
        text_size: 18,
        color: C.btnText,
        click_func() { self.sendCmd('play') },
      })
      createWidget(widget.BUTTON, {
        x: 270, y: rowY, w: rowW - 6, h: rowH,
        normal_color: C.rowBg,
        press_color:  C.rowPress,
        text: 'VOL+',
        text_size: 18,
        color: C.btnText,
        click_func() { self.sendCmd('volup') },
      })

      // ── BLANK screen button ───────────────────────────────
      createWidget(widget.BUTTON, {
        x: 6, y: 374, w: W - 12, h: 68,
        normal_color: C.blankBg,
        press_color:  C.blankPress,
        text: 'BLANK SCREEN  (B)',
        text_size: 18,
        color: C.btnText,
        click_func() { self.sendCmd('blank') },
      })
    },

    sendCmd(action) {
      // Haptic feedback immediately on press
      try { vibrate({ type: 'short' }) } catch (e) {}

      // Update status
      if (_dot)       _dot.setProperty(prop.MORE, { color: C.statusSend })
      if (_statusTxt) _statusTxt.setProperty(prop.MORE, { text: 'SENDING...', color: C.statusSend })

      this.request(
        { method: 'slide.' + action, params: { ip: this.state.ip, port: 3000 } },
        { timeout: 8000 }
      )
        .then(() => {
          if (_dot)       _dot.setProperty(prop.MORE, { color: C.statusOk })
          if (_statusTxt) _statusTxt.setProperty(prop.MORE, { text: 'SENT', color: C.statusOk })
          setTimeout(() => {
            if (_dot)       _dot.setProperty(prop.MORE, { color: C.dotBg })
            if (_statusTxt) _statusTxt.setProperty(prop.MORE, { text: 'READY', color: C.statusRdy })
          }, 1200)
        })
        .catch(() => {
          if (_dot)       _dot.setProperty(prop.MORE, { color: C.statusErr })
          if (_statusTxt) _statusTxt.setProperty(prop.MORE, { text: 'NO CONNECTION', color: C.statusErr })
          setTimeout(() => {
            if (_dot)       _dot.setProperty(prop.MORE, { color: C.dotBg })
            if (_statusTxt) _statusTxt.setProperty(prop.MORE, { text: 'READY', color: C.statusRdy })
          }, 2500)
        })
    },

    onDestroy() {
      _dot = null
      _statusTxt = null
      this.log('Flipper onDestroy')
    },
  }),
)
