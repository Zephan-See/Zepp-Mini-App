// page/flipper/index.page.js — Slide Flipper Controls
// SlideFlipper v2.0 — Zephan
import { BasePage } from '@zeppos/zml/base-page'
import { createWidget, widget, prop, align } from '@zos/ui'
import { pop } from '@zos/router'
import { localStorage } from '@zos/storage'
import { vibrate } from '@zos/interaction'

const W   = 390
const TOP = 60

const C = {
  bg:         0x000000,
  title:      0xFFFFFF,
  backBg:     0x111122,
  backPress:  0x222244,
  back:       0x555577,
  prevBg:     0x0A3870,
  prevPress:  0x1A60C0,
  nextBg:     0x0A5C30,
  nextPress:  0x18A050,
  rowBg:      0x1A1030,
  rowPress:   0x2A2050,
  blankBg:    0x4A1A1A,
  blankPress: 0x7A2A2A,
  btnTxt:     0xFFFFFF,
  dotBg:      0x333344,
  statusRdy:  0x00CC66,
  statusSend: 0x4D94FF,
  statusErr:  0xFF4444,
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
      const self = this
      createWidget(widget.FILL_RECT, { x: 0, y: 0, w: W, h: 450, color: C.bg })

      // Header: BACK + title
      createWidget(widget.BUTTON, {
        x: 6, y: TOP, w: 60, h: 30,
        normal_color: C.backBg, press_color: C.backPress,
        text: 'BACK', text_size: 13, color: C.back,
        click_func() { pop() },
      })
      createWidget(widget.TEXT, {
        x: 0, y: TOP + 2, w: W, h: 28,
        text: 'FLIPPER', text_size: 20, color: C.title,
        align_h: align.CENTER_H,
      })

      // Status row
      _dot = createWidget(widget.FILL_RECT, {
        x: 136, y: TOP + 38, w: 8, h: 8, radius: 4, color: C.dotBg,
      })
      _statusTxt = createWidget(widget.TEXT, {
        x: 150, y: TOP + 34, w: 180, h: 20,
        text: 'READY', text_size: 13, color: C.statusRdy,
      })

      // PREV / NEXT — large buttons
      const bigY = TOP + 54
      const bigH = 190
      createWidget(widget.BUTTON, {
        x: 6, y: bigY, w: 186, h: bigH,
        normal_color: C.prevBg, press_color: C.prevPress,
        text: 'PREV', text_size: 38, color: C.btnTxt,
        click_func() { self.sendCmd('prev') },
      })
      createWidget(widget.BUTTON, {
        x: 198, y: bigY, w: 186, h: bigH,
        normal_color: C.nextBg, press_color: C.nextPress,
        text: 'NEXT', text_size: 38, color: C.btnTxt,
        click_func() { self.sendCmd('next') },
      })

      // VOL- / PLAY / VOL+
      const rowY = bigY + bigH + 6
      const rowH = 66
      createWidget(widget.BUTTON, {
        x: 6, y: rowY, w: 118, h: rowH,
        normal_color: C.rowBg, press_color: C.rowPress,
        text: 'VOL-', text_size: 20, color: C.btnTxt,
        click_func() { self.sendCmd('voldown') },
      })
      createWidget(widget.BUTTON, {
        x: 136, y: rowY, w: 118, h: rowH,
        normal_color: C.rowBg, press_color: C.rowPress,
        text: 'PLAY', text_size: 20, color: C.btnTxt,
        click_func() { self.sendCmd('play') },
      })
      createWidget(widget.BUTTON, {
        x: 266, y: rowY, w: 118, h: rowH,
        normal_color: C.rowBg, press_color: C.rowPress,
        text: 'VOL+', text_size: 20, color: C.btnTxt,
        click_func() { self.sendCmd('volup') },
      })

      // BLANK SCREEN
      const blankY = rowY + rowH + 6
      createWidget(widget.BUTTON, {
        x: 6, y: blankY, w: W - 12, h: 56,
        normal_color: C.blankBg, press_color: C.blankPress,
        text: 'BLANK SCREEN', text_size: 20, color: C.btnTxt,
        click_func() { self.sendCmd('blank') },
      })
    },

    sendCmd(action) {
      try { vibrate({ type: 'short' }) } catch (e) {}

      if (_dot)       _dot.setProperty(prop.MORE, { color: C.statusSend })
      if (_statusTxt) _statusTxt.setProperty(prop.MORE, { text: 'SENDING...', color: C.statusSend })

      this.request(
        { method: 'slide.' + action, params: { ip: this.state.ip, port: 3000 } },
        { timeout: 8000 }
      )
        .then(() => {
          if (_dot)       _dot.setProperty(prop.MORE, { color: C.statusRdy })
          if (_statusTxt) _statusTxt.setProperty(prop.MORE, { text: 'SENT', color: C.statusRdy })
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
