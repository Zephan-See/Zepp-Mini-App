// page/ip-setup/index.page.js — IP Address Configuration
// SlideFlipper v2.0 — Zephan
//
// Layout:
//   [Title + BACK]
//   [History: up to 5 saved IPs as tap-able chips]
//   [IP display: 4 tappable octet boxes]
//   [4x3 number keypad: 1-9, DEL, 0, OK]
//
import { BasePage } from '@zeppos/zml/base-page'
import { createWidget, widget, prop, align } from '@zos/ui'
import { pop } from '@zos/router'
import { localStorage } from '@zos/storage'
import { vibrate } from '@zos/interaction'

const W = 390
const H = 450

const C = {
  bg:           0x000000,
  title:        0xFFFFFF,
  back:         0x555577,
  octetBg:      0x111133,
  octetSel:     0x0A3870,
  octetText:    0xFFFFFF,
  octetDot:     0x555566,
  keyBg:        0x111122,
  keyPress:     0x222244,
  keyDel:       0x3A1020,
  keyDelPress:  0x6A2040,
  keyOk:        0x0A5C30,
  keyOkPress:   0x18A050,
  keyText:      0xFFFFFF,
  historyBg:    0x0D0D1A,
  historyText:  0x8888BB,
  historyAct:   0x4D94FF,
  preview:      0x4D94FF,
  label:        0x555577,
}

// Widget refs for dynamic updates
let _octetWidgets = []   // background rects
let _octetTexts   = []   // text labels
let _previewText  = null // current input preview

Page(
  BasePage({
    name: 'ip-setup',

    state: {
      octets:       ['192', '168', '1', '100'],
      selected:     -1,      // which octet box is active (-1 = none)
      currentInput: '',      // digits being typed
      history:      [],      // array of IP strings, max 5
    },

    onInit() {
      this.log('IP Setup onInit')

      // Load saved IP
      const savedIP = localStorage.getItem('currentIP')
      if (savedIP) {
        const parts = savedIP.split('.')
        if (parts.length === 4) this.state.octets = parts
      }

      // Load history
      const hist = localStorage.getItem('ipHistory')
      if (hist) {
        try { this.state.history = JSON.parse(hist) } catch (e) {}
      }
    },

    build() {
      this.log('IP Setup build')
      const self = this

      createWidget(widget.FILL_RECT, { x: 0, y: 0, w: W, h: H, color: C.bg })

      // ── Header ───────────────────────────────────────────
      createWidget(widget.TEXT, {
        x: 0, y: 10, w: W, h: 30,
        text: 'IP SETUP',
        text_size: 20,
        color: C.title,
        align_h: align.CENTER_H,
      })
      createWidget(widget.BUTTON, {
        x: 6, y: 8, w: 52, h: 32,
        normal_color: 0x111122, press_color: 0x222244,
        text: 'BACK', text_size: 12, color: C.back,
        click_func() { self.saveAndExit() },
      })

      // ── History chips (max 5 IPs) ─────────────────────────
      createWidget(widget.TEXT, {
        x: 8, y: 46, w: 80, h: 18,
        text: 'RECENT:', text_size: 11, color: C.label,
      })
      this.buildHistoryChips()

      // ── IP Octet boxes ────────────────────────────────────
      createWidget(widget.TEXT, {
        x: 8, y: 112, w: 60, h: 18,
        text: 'IP:', text_size: 12, color: C.label,
      })

      // 4 boxes: each ~82px wide, gap 6px
      // total = 4*82 + 3*6 = 346, left margin = (390-346)/2 = 22
      const boxW = 82, boxH = 46, boxY = 108, gap = 6
      const startX = (W - (4 * boxW + 3 * gap)) / 2

      _octetWidgets = []
      _octetTexts   = []

      for (let i = 0; i < 4; i++) {
        const bx = startX + i * (boxW + gap)

        const bg = createWidget(widget.FILL_RECT, {
          x: bx, y: boxY, w: boxW, h: boxH,
          color: C.octetBg,
        })
        const txt = createWidget(widget.TEXT, {
          x: bx, y: boxY + 10, w: boxW, h: 28,
          text: self.state.octets[i],
          text_size: 20,
          color: C.octetText,
          align_h: align.CENTER_H,
        })

        // Dot separator (not after last box)
        if (i < 3) {
          createWidget(widget.TEXT, {
            x: bx + boxW, y: boxY + 12, w: gap + 2, h: 24,
            text: '.', text_size: 20, color: C.octetDot,
            align_h: align.CENTER_H,
          })
        }

        // Make box tappable via invisible BUTTON overlay
        const idx = i
        createWidget(widget.BUTTON, {
          x: bx, y: boxY, w: boxW, h: boxH,
          normal_color: 0x00000000,
          press_color:  0x0A387020,
          text: '', text_size: 1, color: 0x00000000,
          click_func() { self.selectOctet(idx) },
        })

        _octetWidgets.push(bg)
        _octetTexts.push(txt)
      }

      // ── Input preview ─────────────────────────────────────
      _previewText = createWidget(widget.TEXT, {
        x: 0, y: 160, w: W, h: 22,
        text: 'Tap a group above to edit',
        text_size: 13,
        color: C.label,
        align_h: align.CENTER_H,
      })

      // ── 4x3 Number Keypad ─────────────────────────────────
      const keys = [
        ['1','2','3'],
        ['4','5','6'],
        ['7','8','9'],
        ['DEL','0','OK'],
      ]
      const kW = 124, kH = 60, kGap = 4
      const kStartX = (W - (3 * kW + 2 * kGap)) / 2
      const kStartY = 186

      keys.forEach((row, r) => {
        row.forEach((key, c) => {
          const kx = kStartX + c * (kW + kGap)
          const ky = kStartY + r * (kH + kGap)

          let bg = C.keyBg, press = C.keyPress
          if (key === 'DEL') { bg = C.keyDel;  press = C.keyDelPress }
          if (key === 'OK')  { bg = C.keyOk;   press = C.keyOkPress  }

          createWidget(widget.BUTTON, {
            x: kx, y: ky, w: kW, h: kH,
            normal_color: bg, press_color: press,
            text: key, text_size: key === 'DEL' || key === 'OK' ? 18 : 24,
            color: C.keyText,
            click_func() { self.keyPress(key) },
          })
        })
      })
    },

    buildHistoryChips() {
      // Show up to 5 recent IPs as small tappable labels
      const hist = this.state.history
      const self = this
      const chipH = 24, chipY = 46, startX = 76

      if (hist.length === 0) {
        createWidget(widget.TEXT, {
          x: startX, y: chipY, w: W - startX - 8, h: chipH,
          text: 'No history yet',
          text_size: 12, color: C.historyText,
        })
        return
      }

      // Show up to 5 chips - they'll overflow to next line if needed
      // Simple approach: show horizontally, truncate if too many
      let x = startX
      hist.slice(0, 5).forEach((ip, i) => {
        const chipW = Math.min(ip.length * 9 + 12, 130)
        createWidget(widget.BUTTON, {
          x: x, y: chipY, w: chipW, h: chipH,
          normal_color: 0x111133, press_color: 0x0A3870,
          text: ip, text_size: 11, color: C.historyText,
          click_func() { self.loadIP(ip) },
        })
        x += chipW + 6
      })
    },

    selectOctet(idx) {
      // Deselect previous
      if (this.state.selected >= 0 && _octetWidgets[this.state.selected]) {
        _octetWidgets[this.state.selected].setProperty(prop.MORE, { color: C.octetBg })
      }
      // Select new
      this.state.selected = idx
      this.state.currentInput = ''
      if (_octetWidgets[idx]) {
        _octetWidgets[idx].setProperty(prop.MORE, { color: C.octetSel })
      }
      if (_previewText) {
        _previewText.setProperty(prop.MORE, {
          text: 'Group ' + (idx + 1) + ': type new value',
          color: C.preview,
        })
      }
      try { vibrate({ type: 'short' }) } catch (e) {}
    },

    keyPress(key) {
      if (this.state.selected < 0) return
      try { vibrate({ type: 'short' }) } catch (e) {}

      const idx = this.state.selected

      if (key === 'DEL') {
        this.state.currentInput = this.state.currentInput.slice(0, -1)
        const display = this.state.currentInput || this.state.octets[idx]
        if (_octetTexts[idx]) _octetTexts[idx].setProperty(prop.MORE, { text: display })
        if (_previewText) _previewText.setProperty(prop.MORE, {
          text: this.state.currentInput ? 'Typing: ' + this.state.currentInput : 'Deleted',
          color: C.preview,
        })
        return
      }

      if (key === 'OK') {
        const val = parseInt(this.state.currentInput || this.state.octets[idx], 10)
        if (!isNaN(val) && val >= 0 && val <= 255) {
          this.state.octets[idx] = String(val)
          if (_octetTexts[idx]) _octetTexts[idx].setProperty(prop.MORE, { text: String(val) })
        }
        // Deselect and move to next
        if (_octetWidgets[idx]) _octetWidgets[idx].setProperty(prop.MORE, { color: C.octetBg })
        const nextIdx = idx < 3 ? idx + 1 : -1
        this.state.selected = nextIdx
        this.state.currentInput = ''
        if (nextIdx >= 0) {
          this.selectOctet(nextIdx)
        } else {
          if (_previewText) _previewText.setProperty(prop.MORE, {
            text: 'Tap BACK to save: ' + this.state.octets.join('.'),
            color: C.preview,
          })
        }
        return
      }

      // Digit key — max 3 digits
      if (this.state.currentInput.length >= 3) return
      this.state.currentInput += key
      const preview = this.state.currentInput
      if (_octetTexts[idx]) _octetTexts[idx].setProperty(prop.MORE, { text: preview })
      if (_previewText) _previewText.setProperty(prop.MORE, {
        text: 'Typing: ' + preview,
        color: C.preview,
      })
    },

    loadIP(ipStr) {
      const parts = ipStr.split('.')
      if (parts.length !== 4) return
      this.state.octets = parts
      this.state.selected = -1
      this.state.currentInput = ''
      parts.forEach((v, i) => {
        if (_octetTexts[i]) _octetTexts[i].setProperty(prop.MORE, { text: v })
        if (_octetWidgets[i]) _octetWidgets[i].setProperty(prop.MORE, { color: C.octetBg })
      })
      if (_previewText) _previewText.setProperty(prop.MORE, {
        text: 'Loaded: ' + ipStr,
        color: C.preview,
      })
      try { vibrate({ type: 'short' }) } catch (e) {}
    },

    saveAndExit() {
      // Commit any in-progress octet
      const idx = this.state.selected
      if (idx >= 0 && this.state.currentInput) {
        const val = parseInt(this.state.currentInput, 10)
        if (!isNaN(val) && val >= 0 && val <= 255) {
          this.state.octets[idx] = String(val)
        }
      }

      const ip = this.state.octets.join('.')
      localStorage.setItem('currentIP', ip)

      // Update history (max 5, newest first, no duplicates)
      let hist = this.state.history.filter(h => h !== ip)
      hist.unshift(ip)
      if (hist.length > 5) hist = hist.slice(0, 5)
      localStorage.setItem('ipHistory', JSON.stringify(hist))

      pop()
    },

    onDestroy() {
      _octetWidgets = []
      _octetTexts   = []
      _previewText  = null
      this.log('IP Setup onDestroy')
    },
  }),
)
