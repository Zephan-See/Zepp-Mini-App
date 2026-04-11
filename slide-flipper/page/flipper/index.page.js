// page/flipper/index.page.js — Slide Flipper Controls
// SlideFlipper v2.0 — Zephan
import { BasePage } from '@zeppos/zml/base-page'
import { createWidget, widget, prop, align } from '@zos/ui'
import { pop } from '@zos/router'
import { localStorage } from '@zos/storage'
import { vibrate } from '@zos/interaction'

const W   = 390
const TOP = 65   // safe area — clears the watch status bar

const C = {
  bg:         0x000000,
  title:      0xFFFFFF,
  back:       0x6666AA,
  backBg:     0x111130,
  prevBg:     0x0A3870,
  nextBg:     0x0A5C30,
  rowBg:      0x1A1032,
  blankBg:    0x4A1A1A,
  btnTxt:     0xFFFFFF,
  dotBg:      0x333344,
  statusRdy:  0x00CC66,
  statusSend: 0x4D94FF,
  statusErr:  0xFF4444,
}

let _dot = null
let _statusTxt = null

// Rounded button: FILL_RECT (visual, radius) + TEXT (click target)
function roundBtn(x, y, w, h, label, sz, bgColor, fn) {
  createWidget(widget.FILL_RECT, { x, y, w, h, radius: 14, color: bgColor })
  createWidget(widget.TEXT, {
    x, y, w, h,
    text: label, text_size: sz, color: C.btnTxt,
    align_h: align.CENTER_H, align_v: align.CENTER_V,
    click_func: fn,
  })
}

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

      // ── Header ────────────────────────────────────────────
      createWidget(widget.TEXT, {
        x: 0, y: TOP, w: W, h: 32,
        text: 'FLIPPER', text_size: 20, color: C.title,
        align_h: align.CENTER_H,
      })
      // BACK button (rounded)
      createWidget(widget.FILL_RECT, { x: 6, y: TOP, w: 64, h: 32, radius: 10, color: C.backBg })
      createWidget(widget.TEXT, {
        x: 6, y: TOP, w: 64, h: 32,
        text: '< BACK', text_size: 13, color: C.back,
        align_h: align.CENTER_H, align_v: align.CENTER_V,
        click_func() { pop() },
      })

      // ── Status row ────────────────────────────────────────
      _dot = createWidget(widget.FILL_RECT, {
        x: 136, y: TOP + 40, w: 8, h: 8, radius: 4, color: C.dotBg,
      })
      _statusTxt = createWidget(widget.TEXT, {
        x: 150, y: TOP + 36, w: 180, h: 20,
        text: 'READY', text_size: 13, color: C.statusRdy,
      })

      // ── PREV / NEXT (large) ───────────────────────────────
      const bigY = TOP + 58
      const bigH = 192
      roundBtn(6,   bigY, 186, bigH, 'PREV', 42, C.prevBg, () => self.sendCmd('prev'))
      roundBtn(198, bigY, 186, bigH, 'NEXT', 42, C.nextBg, () => self.sendCmd('next'))

      // ── VOL-  /  PLAY  /  VOL+ ───────────────────────────
      const rowY = bigY + bigH + 6   // = TOP + 256
      const rowH = 66
      roundBtn(6,   rowY, 118, rowH, 'VOL-', 20, C.rowBg, () => self.sendCmd('voldown'))
      roundBtn(136, rowY, 118, rowH, 'PLAY', 20, C.rowBg, () => self.sendCmd('play'))
      roundBtn(264, rowY, 120, rowH, 'VOL+', 20, C.rowBg, () => self.sendCmd('volup'))

      // ── BLANK SCREEN ──────────────────────────────────────
      const blankY = rowY + rowH + 6
      roundBtn(6, blankY, W - 12, 58, 'BLANK SCREEN', 20, C.blankBg, () => self.sendCmd('blank'))
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
