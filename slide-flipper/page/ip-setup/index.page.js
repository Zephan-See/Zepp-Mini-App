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
const TOP = 65

const C = {
  bg:        0x000000,
  title:     0xFFFFFF,
  back:      0x6666AA,
  backBg:    0x111130,
  boxInact:  0x111133,
  boxActive: 0x0A3870,
  boxTxt:    0xFFFFFF,
  dot:       0x445566,
  keyBg:     0x1A1A2E,
  keyDel:    0x3A1020,
  keySave:   0x0A5C30,
  keyTxt:    0xFFFFFF,
  histBg:    0x0A0A1A,
  histTxt:   0x6688BB,
}

let _boxBgs   = []
let _boxTexts = []

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

      // ── Header ────────────────────────────────────────────
      createWidget(widget.TEXT, {
        x: 0, y: TOP, w: W, h: 32,
        text: 'IP SETUP', text_size: 20, color: C.title,
        align_h: align.CENTER_H,
      })
      createWidget(widget.FILL_RECT, {
        x: 6, y: TOP, w: 64, h: 32, radius: 10, color: C.backBg,
        click_func() { self.saveAndExit() },
      })
      createWidget(widget.TEXT, {
        x: 6, y: TOP + 9, w: 64, h: 14,
        text: '< BACK', text_size: 13, color: C.back,
        align_h: align.CENTER_H,
      })

      // ── 4 Octet boxes ─────────────────────────────────────
      const BOX_W = 78, BOX_H = 58, BOX_Y = TOP + 40, BOX_GAP = 10
      const BOX_LEFT = Math.floor((W - (4 * BOX_W + 3 * BOX_GAP)) / 2)

      _boxBgs   = []
      _boxTexts = []

      for (let i = 0; i < 4; i++) {
        const bx = BOX_LEFT + i * (BOX_W + BOX_GAP)
        const isActive = i === 0

        // Background (click_func here — FILL_RECT supports it)
        const bg = createWidget(widget.FILL_RECT, {
          x: bx, y: BOX_Y, w: BOX_W, h: BOX_H,
          radius: 12,
          color: isActive ? C.boxActive : C.boxInact,
          click_func: (function(idx) { return function() { self.selectBox(idx) } })(i),
        })

        // Value label (visual only, no click_func)
        const txt = createWidget(widget.TEXT, {
          x: bx, y: BOX_Y + Math.floor((BOX_H - 26) / 2),
          w: BOX_W, h: 30,
          text: self.state.octets[i],
          text_size: 26, color: C.boxTxt,
          align_h: align.CENTER_H,
        })

        // Dot separator
        if (i < 3) {
          createWidget(widget.TEXT, {
            x: bx + BOX_W, y: BOX_Y + 18,
            w: BOX_GAP, h: 20,
            text: '.', text_size: 20, color: C.dot,
            align_h: align.CENTER_H,
          })
        }

        _boxBgs.push(bg)
        _boxTexts.push(txt)
      }

      // ── History chips ─────────────────────────────────────
      const HIST_Y = BOX_Y + BOX_H + 8
      const hist = this.state.history
      if (hist.length > 0) {
        let hx = 8
        hist.slice(0, 4).forEach(function(ip) {
          const chipW = ip.length * 8 + 16
          createWidget(widget.FILL_RECT, {
            x: hx, y: HIST_Y, w: chipW, h: 24, radius: 8, color: C.histBg,
            click_func: function() { self.loadIP(ip) },
          })
          createWidget(widget.TEXT, {
            x: hx, y: HIST_Y + 6, w: chipW, h: 14,
            text: ip, text_size: 12, color: C.histTxt,
            align_h: align.CENTER_H,
          })
          hx += chipW + 6
        })
      }

      // ── 4 x 3 Keypad ──────────────────────────────────────
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
          const sz = isWord ? 18 : 36
          let bg = C.keyBg
          if (key === 'DEL')  bg = C.keyDel
          if (key === 'SAVE') bg = C.keySave

          // FILL_RECT handles the click (radius + click_func)
          createWidget(widget.FILL_RECT, {
            x: kx, y: ky, w: KEY_W, h: KEY_H, radius: 14, color: bg,
            click_func: (function(k) { return function() { self.keyPress(k) } })(key),
          })
          // TEXT is visual only (no click_func)
          createWidget(widget.TEXT, {
            x: kx, y: ky + Math.floor((KEY_H - sz) / 2),
            w: KEY_W, h: sz + 4,
            text: key, text_size: sz, color: C.keyTxt,
            align_h: align.CENTER_H,
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
      if (_boxTexts[idx]) {
        _boxTexts[idx].setProperty(prop.MORE, { text: this.state.inputBuffer })
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
        if (_boxTexts[idx]) _boxTexts[idx].setProperty(prop.MORE, { text: display })
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
        if (_boxBgs[i]) {
          _boxBgs[i].setProperty(prop.MORE, { color: isActive ? C.boxActive : C.boxInact })
        }
        if (_boxTexts[i]) {
          const showBuf = isActive && this.state.inputBuffer !== ''
          const text = showBuf
            ? this.state.inputBuffer
            : (this.state.octets[i] || (isActive ? '_' : '0'))
          _boxTexts[i].setProperty(prop.MORE, { text })
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
      _boxBgs   = []
      _boxTexts = []
      this.log('IP Setup onDestroy')
    },
  }),
)
