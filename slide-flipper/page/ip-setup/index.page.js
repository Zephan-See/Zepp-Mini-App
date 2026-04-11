// page/ip-setup/index.page.js — IP Address Setup
// SlideFlipper v2.0 — Zephan
//
// Phone-dialer UX:
//   • Tap a number → immediately appears in the active box
//   • After 3 digits → automatically jumps to next box
//   • DEL → removes last digit; if box empty, goes back to previous box
//   • Tap a box → switch to editing that box
//   • SAVE → saves full IP and returns to menu
//
import { BasePage } from '@zeppos/zml/base-page'
import { createWidget, widget, prop, align } from '@zos/ui'
import { pop } from '@zos/router'
import { localStorage } from '@zos/storage'
import { vibrate } from '@zos/interaction'

const W   = 390
const TOP = 60

const C = {
  bg:        0x000000,
  title:     0xFFFFFF,
  backBg:    0x111122,
  backPress: 0x222244,
  back:      0x555577,
  boxInact:  0x111133,
  boxActive: 0x0A3870,
  boxPress:  0x1A60C0,
  boxTxt:    0xFFFFFF,
  dot:       0x445566,
  keyBg:     0x1A1A2E,
  keyPress:  0x2A2A4E,
  keyDel:    0x3A1020,
  keyDelPr:  0x6A2040,
  keySave:   0x0A5C30,
  keySavePr: 0x18A050,
  keyTxt:    0xFFFFFF,
  histBg:    0x0A0A1A,
  histPress: 0x1A1A3A,
  histTxt:   0x6688BB,
}

// BUTTON widget refs for the 4 octet boxes
let _boxBtns = []

Page(
  BasePage({
    name: 'ip-setup',
    state: {
      octets:      ['192', '168', '1', '100'],
      activeIdx:   0,
      inputBuffer: '',
      history:     [],
    },

    onInit() {
      this.log('IP Setup onInit')
      const savedIP = localStorage.getItem('currentIP')
      if (savedIP) {
        const parts = savedIP.split('.')
        if (parts.length === 4) this.state.octets = parts
      }
      const hist = localStorage.getItem('ipHistory')
      if (hist) {
        try { this.state.history = JSON.parse(hist) } catch (e) {}
      }
    },

    build() {
      const self = this
      createWidget(widget.FILL_RECT, { x: 0, y: 0, w: W, h: 450, color: C.bg })

      // Header
      createWidget(widget.BUTTON, {
        x: 6, y: TOP, w: 60, h: 30,
        normal_color: C.backBg, press_color: C.backPress,
        text: 'BACK', text_size: 13, color: C.back,
        click_func() { self.saveAndExit() },
      })
      createWidget(widget.TEXT, {
        x: 0, y: TOP + 2, w: W, h: 28,
        text: 'IP SETUP', text_size: 20, color: C.title,
        align_h: align.CENTER_H,
      })

      // 4 octet boxes — BUTTON widget so text is updatable + clickable
      // Box: w=78, gap=10. Total=4*78+3*10=342. margin=24
      const BOX_W = 78, BOX_H = 54, BOX_Y = TOP + 38
      const BOX_GAP = 10
      const BOX_LEFT = Math.floor((W - (4 * BOX_W + 3 * BOX_GAP)) / 2)

      _boxBtns = []
      for (let i = 0; i < 4; i++) {
        const bx = BOX_LEFT + i * (BOX_W + BOX_GAP)
        const isActive = i === 0
        const idx = i

        const btn = createWidget(widget.BUTTON, {
          x: bx, y: BOX_Y, w: BOX_W, h: BOX_H,
          normal_color: isActive ? C.boxActive : C.boxInact,
          press_color:  C.boxPress,
          text: self.state.octets[i],
          text_size: 24,
          color: C.boxTxt,
          click_func() { self.selectBox(idx) },
        })
        _boxBtns.push(btn)

        // Dot separator
        if (i < 3) {
          createWidget(widget.TEXT, {
            x: bx + BOX_W + 1, y: BOX_Y + 16,
            w: BOX_GAP, h: 22,
            text: '.', text_size: 22, color: C.dot,
            align_h: align.CENTER_H,
          })
        }
      }

      // History chips
      const HIST_Y = BOX_Y + BOX_H + 8
      const hist = this.state.history
      if (hist.length > 0) {
        let hx = 6
        hist.slice(0, 4).forEach(function(ip) {
          const chipW = Math.min(ip.length * 8 + 14, 120)
          createWidget(widget.BUTTON, {
            x: hx, y: HIST_Y, w: chipW, h: 24,
            normal_color: C.histBg, press_color: C.histPress,
            text: ip, text_size: 11, color: C.histTxt,
            click_func() { self.loadIP(ip) },
          })
          hx += chipW + 4
        })
      }

      // 4×3 Keypad — BUTTON widget (proven to work)
      const KEY_W = 118, KEY_H = 56, KEY_GAP = 8, KEY_MARGIN = 12
      const KEY_Y = HIST_Y + 32

      const rows = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['DEL', '0', 'SAVE'],
      ]

      rows.forEach(function(row, r) {
        const ky = KEY_Y + r * (KEY_H + KEY_GAP)
        row.forEach(function(key, c) {
          const kx = KEY_MARGIN + c * (KEY_W + KEY_GAP)
          const isWord = key === 'DEL' || key === 'SAVE'
          const sz = isWord ? 18 : 34
          let bg = C.keyBg,  pr = C.keyPress
          if (key === 'DEL')  { bg = C.keyDel;  pr = C.keyDelPr  }
          if (key === 'SAVE') { bg = C.keySave; pr = C.keySavePr }

          createWidget(widget.BUTTON, {
            x: kx, y: ky, w: KEY_W, h: KEY_H,
            normal_color: bg, press_color: pr,
            text: key, text_size: sz, color: C.keyTxt,
            click_func() { self.keyPress(key) },
          })
        })
      })
    },

    // ── Logic ───────────────────────────────────────────────

    selectBox(idx) {
      if (idx === this.state.activeIdx) return
      this.commitCurrent()
      this.state.activeIdx   = idx
      this.state.inputBuffer = ''
      this.refreshBoxes()
      try { vibrate({ type: 'short' }) } catch (e) {}
    },

    keyPress(key) {
      try { vibrate({ type: 'short' }) } catch (e) {}
      if (key === 'DEL')  { this.delPress(); return }
      if (key === 'SAVE') { this.saveAndExit(); return }
      this.digitPress(key)
    },

    digitPress(d) {
      if (this.state.inputBuffer.length >= 3) return
      this.state.inputBuffer += d
      const idx = this.state.activeIdx
      if (_boxBtns[idx]) {
        _boxBtns[idx].setProperty(prop.MORE, { text: this.state.inputBuffer })
      }
      // Auto-advance after 3 digits
      if (this.state.inputBuffer.length === 3) {
        this.commitCurrent()
        if (this.state.activeIdx < 3) {
          this.state.activeIdx++
          this.state.inputBuffer = ''
          this.refreshBoxes()
        }
      }
    },

    delPress() {
      if (this.state.inputBuffer.length > 0) {
        this.state.inputBuffer = this.state.inputBuffer.slice(0, -1)
        const idx = this.state.activeIdx
        const display = this.state.inputBuffer || this.state.octets[idx] || '0'
        if (_boxBtns[idx]) _boxBtns[idx].setProperty(prop.MORE, { text: display })
      } else if (this.state.activeIdx > 0) {
        this.state.activeIdx--
        this.state.octets[this.state.activeIdx] = ''
        this.state.inputBuffer = ''
        this.refreshBoxes()
      }
    },

    commitCurrent() {
      const buf = this.state.inputBuffer
      const idx = this.state.activeIdx
      if (buf !== '') {
        let val = parseInt(buf, 10)
        if (isNaN(val) || val < 0) val = 0
        if (val > 255) val = 255
        this.state.octets[idx] = String(val)
        this.state.inputBuffer = ''
      }
    },

    refreshBoxes() {
      for (let i = 0; i < 4; i++) {
        const isActive = i === this.state.activeIdx
        if (_boxBtns[i]) {
          const showBuf = isActive && this.state.inputBuffer !== ''
          const text = showBuf
            ? this.state.inputBuffer
            : (this.state.octets[i] || (isActive ? '_' : '0'))
          _boxBtns[i].setProperty(prop.MORE, {
            normal_color: isActive ? C.boxActive : C.boxInact,
            text,
          })
        }
      }
    },

    loadIP(ipStr) {
      const parts = ipStr.split('.')
      if (parts.length !== 4) return
      this.state.octets      = parts
      this.state.activeIdx   = 0
      this.state.inputBuffer = ''
      this.refreshBoxes()
      try { vibrate({ type: 'short' }) } catch (e) {}
    },

    saveAndExit() {
      this.commitCurrent()
      const octets = this.state.octets.map(function(o) {
        const v = parseInt(o, 10)
        if (isNaN(v) || v < 0) return '0'
        return String(Math.min(v, 255))
      })
      const ip = octets.join('.')
      localStorage.setItem('currentIP', ip)
      let hist = (this.state.history || []).filter(function(h) { return h !== ip })
      hist.unshift(ip)
      if (hist.length > 5) hist = hist.slice(0, 5)
      localStorage.setItem('ipHistory', JSON.stringify(hist))
      pop()
    },

    onDestroy() {
      _boxBtns = []
      this.log('IP Setup onDestroy')
    },
  }),
)
