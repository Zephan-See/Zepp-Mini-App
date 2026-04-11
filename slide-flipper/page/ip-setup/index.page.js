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
import { push } from '@zos/router'
import { localStorage } from '@zos/storage'
import { vibrate } from '@zos/interaction'

const W   = 390
const TOP = 60

const C = {
  bg:        0x000000,
  header:    0x0A0E1A,
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
  help:      0x7380A6,
}

let _boxBtns = []
let _boxTexts = []
let _activeBoxBg = null
let _boxUnderlines = []
let _saveStatus = null

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
      createWidget(widget.FILL_RECT, { x: 0, y: 0, w: W, h: 92, color: C.header })

      // Header
      createWidget(widget.TEXT, {
        x: 0, y: TOP - 2, w: W, h: 28,
        text: 'IP SETUP', text_size: 20, color: C.title,
        align_h: align.CENTER_H,
      })
      createWidget(widget.TEXT, {
        x: 0, y: TOP + 22, w: W, h: 16,
        text: 'Tap a block, then type numbers', text_size: 11, color: C.help,
        align_h: align.CENTER_H,
      })
      _saveStatus = createWidget(widget.TEXT, {
        x: 70, y: TOP + 44, w: 250, h: 14,
        text: '', text_size: 11, color: C.histTxt,
        align_h: align.CENTER_H,
      })
      createWidget(widget.FILL_RECT, {
        x: 10, y: TOP - 2, w: 64, h: 34, radius: 10, color: C.backBg,
      })
      createWidget(widget.TEXT, {
        x: 10, y: TOP + 5, w: 64, h: 20,
        text: 'BACK', text_size: 15, color: C.title,
        align_h: align.CENTER_H,
      })
      createWidget(widget.BUTTON, {
        x: 0, y: TOP - 10, w: 96, h: 56,
        normal_color: C.header, press_color: C.backPress,
        text: 'BACK', text_size: 15, color: C.title,
        click_func() { push({ url: 'page/home/index.page' }) },
      })

      // 4 octet boxes
      const BOX_W = 90, BOX_H = 64, BOX_Y = TOP + 60
      const BOX_GAP = 2
      const BOX_LEFT = Math.floor((W - (4 * BOX_W + 3 * BOX_GAP)) / 2)

      _boxBtns = []
      _boxTexts = []
      _boxUnderlines = []
      _activeBoxBg = createWidget(widget.FILL_RECT, {
        x: BOX_LEFT, y: BOX_Y, w: BOX_W, h: BOX_H, color: C.boxActive,
      })

      for (let i = 0; i < 4; i++) {
        const bx = BOX_LEFT + i * (BOX_W + BOX_GAP)
        const idx = i

        const btn = createWidget(widget.BUTTON, {
          x: bx - 4, y: BOX_Y - 4, w: BOX_W + 8, h: BOX_H + 10,
          normal_color: C.bg,
          press_color:  C.boxPress,
          text: ' ',
          text_size: 24,
          color: C.boxTxt,
          click_func() { self.selectBox(idx) },
        })
        _boxBtns.push(btn)
        _boxTexts.push(createWidget(widget.TEXT, {
          x: bx + 8, y: BOX_Y + 16, w: BOX_W - 16, h: 28,
          text: self.state.octets[i],
          text_size: 24, color: C.boxTxt,
          align_h: align.CENTER_H,
        }))
        _boxUnderlines.push(createWidget(widget.FILL_RECT, {
          x: bx, y: BOX_Y + BOX_H + 2, w: BOX_W, h: 4,
          color: idx === 0 ? C.boxActive : C.boxInact,
        }))

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
      if (_saveStatus) {
        _saveStatus.setProperty(prop.MORE, { text: '', color: C.histTxt })
      }
      this.digitPress(key)
    },

    digitPress(d) {
      if (this.state.inputBuffer.length >= 3) return
      this.state.inputBuffer += d
      this.refreshBoxes()
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
        this.refreshBoxes()
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
        const showBuf = isActive && this.state.inputBuffer !== ''
        const text = showBuf
          ? this.state.inputBuffer
          : (this.state.octets[i] || (isActive ? '_' : '0'))
        if (_boxTexts[i]) {
          _boxTexts[i].setProperty(prop.MORE, {
            text,
            color: isActive ? C.title : C.boxTxt,
          })
        }
      }
      if (_boxBtns[this.state.activeIdx]) {
        const x = 12 + this.state.activeIdx * 92
        if (_activeBoxBg) _activeBoxBg.setProperty(prop.MORE, { x, color: C.boxActive })
      }
      _boxUnderlines.forEach((line, idx) => {
        if (line) {
          line.setProperty(prop.MORE, {
            color: idx === this.state.activeIdx ? C.boxActive : C.boxInact,
          })
        }
      })
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
      try {
        this.commitCurrent()
        const octets = this.state.octets.map(function(o) {
          const v = parseInt(o, 10)
          if (isNaN(v) || v < 0) return '0'
          return String(Math.min(v, 255))
        })
        const ip = octets.join('.')
        if (_saveStatus) {
          _saveStatus.setProperty(prop.MORE, { text: 'IP ' + ip, color: C.histTxt })
        }

        localStorage.setItem('currentIP', ip)
        if (_saveStatus) {
          _saveStatus.setProperty(prop.MORE, { text: 'Saved to watch: ' + ip, color: C.keySavePr })
        }

        let hist = (this.state.history || []).filter(function(h) { return h !== ip })
        hist.unshift(ip)
        if (hist.length > 5) hist = hist.slice(0, 5)
        this.state.history = hist
        localStorage.setItem('ipHistory', JSON.stringify(hist))
        if (_saveStatus) {
          _saveStatus.setProperty(prop.MORE, { text: 'Saved to watch: ' + ip, color: C.keySavePr })
        }

        setTimeout(() => {
          push({ url: 'page/home/index.page' })
        }, 700)
      } catch (err) {
        if (_saveStatus) {
          _saveStatus.setProperty(prop.MORE, {
            text: 'ERR ' + (err && err.message ? err.message : 'save failed'),
            color: C.keyDelPr,
          })
        }
      }
    },

    onDestroy() {
      _boxBtns = []
      _boxTexts = []
      _activeBoxBg = null
      _boxUnderlines = []
      _saveStatus = null
      this.log('IP Setup onDestroy')
    },
  }),
)
