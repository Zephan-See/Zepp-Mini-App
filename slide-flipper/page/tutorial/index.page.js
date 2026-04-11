// page/tutorial/index.page.js — Installation Guide
// SlideFlipper v2.0 — Zephan
import { BasePage } from '@zeppos/zml/base-page'
import { createWidget, widget, prop, align } from '@zos/ui'
import { pop } from '@zos/router'

const W   = 390
const TOP = 60

const C = {
  bg:       0x000000,
  header:   0x0A0E1A,
  title:    0xFFFFFF,
  backBg:   0x111122,
  backPress:0x222244,
  back:     0x555577,
  tabActBg: 0x0A3870,
  tabActPr: 0x1A60C0,
  tabInaBg: 0x111122,
  tabInaPr: 0x222244,
  tabActTx: 0xFFFFFF,
  tabInaTx: 0x6666AA,
  step:     0xCCCCEE,
  stepNum:  0x4D94FF,
  code:     0x00CC66,
  codeBg:   0x061A06,
  note:     0x777799,
  help:     0x7380A6,
  divider:  0x1A1A2E,
}

let _tabMac = null
let _tabWin = null
let _stepWidgets = []
let _tabActiveBg = null
let _tabMacIndicator = null
let _tabWinIndicator = null
let _tabMacText = null
let _tabWinText = null
let _qrImage = null
let _qrCaption = null

const MAC_STEPS = [
  { n: '1', t: 'Scan the QR code' },
  { n: '2', t: 'Copy a Mac download link' },
  { n: '3', t: 'Send it to your Mac' },
]

const WIN_STEPS = [
  { n: '1', t: 'Scan the QR code' },
  { n: '2', t: 'Copy a Windows download link' },
  { n: '3', t: 'Send it to your PC' },
]

Page(
  BasePage({
    name: 'tutorial',
    state: { platform: 'mac' },

    onInit() { this.log('Tutorial onInit') },

    build() {
      const self = this
      createWidget(widget.FILL_RECT, { x: 0, y: 0, w: W, h: 450, color: C.bg })
      createWidget(widget.FILL_RECT, { x: 0, y: 0, w: W, h: 92, color: C.header })

      // Header
      createWidget(widget.FILL_RECT, {
        x: 10, y: TOP - 2, w: 64, h: 34, radius: 10, color: C.backBg,
      })
      createWidget(widget.TEXT, {
        x: 10, y: TOP + 5, w: 64, h: 20,
        text: 'BACK', text_size: 15, color: C.title,
        align_h: align.CENTER_H,
      })
      createWidget(widget.BUTTON, {
        x: 0, y: TOP - 18, w: 124, h: 72,
        normal_color: C.header, press_color: C.backPress,
        text: 'BACK', text_size: 15, color: C.title,
        click_func() { pop() },
      })
      createWidget(widget.TEXT, {
        x: 0, y: TOP - 2, w: W, h: 28,
        text: 'INSTALL GUIDE', text_size: 18, color: C.title,
        align_h: align.CENTER_H,
      })
      createWidget(widget.TEXT, {
        x: 0, y: TOP + 22, w: W, h: 16,
        text: 'Choose your computer setup', text_size: 11, color: C.help,
        align_h: align.CENTER_H,
      })

      // Platform tabs
      const TAB_Y = TOP + 52
      _tabActiveBg = createWidget(widget.FILL_RECT, {
        x: 6, y: TAB_Y, w: 184, h: 36, color: C.tabActBg,
      })
      _tabMacIndicator = createWidget(widget.FILL_RECT, {
        x: 6, y: TAB_Y + 38, w: 184, h: 4, color: C.tabActBg,
      })
      _tabWinIndicator = createWidget(widget.FILL_RECT, {
        x: 200, y: TAB_Y + 38, w: 184, h: 4, color: C.tabInaBg,
      })
      _tabMac = createWidget(widget.BUTTON, {
        x: 0, y: TAB_Y - 6, w: 196, h: 52,
        normal_color: C.header, press_color: C.tabInaPr,
        text: ' ', text_size: 18, color: C.tabActTx,
        click_func() { self.setTab('mac') },
      })
      _tabWin = createWidget(widget.BUTTON, {
        x: 194, y: TAB_Y - 6, w: 196, h: 52,
        normal_color: C.header, press_color: C.tabInaPr,
        text: ' ', text_size: 18, color: C.tabActTx,
        click_func() { self.setTab('win') },
      })
      _tabMacText = createWidget(widget.TEXT, {
        x: 6, y: TAB_Y + 8, w: 184, h: 20,
        text: 'MAC', text_size: 18, color: C.tabActTx,
        align_h: align.CENTER_H,
      })
      _tabWinText = createWidget(widget.TEXT, {
        x: 200, y: TAB_Y + 8, w: 184, h: 20,
        text: 'WINDOWS', text_size: 18, color: C.tabInaTx,
        align_h: align.CENTER_H,
      })

      createWidget(widget.FILL_RECT, { x: 0, y: TAB_Y + 40, w: W, h: 1, color: C.divider })

      // Steps
      this.renderSteps(MAC_STEPS, TAB_Y + 46)
    },

    renderSteps(steps, startY) {
      _stepWidgets = []
      let y = startY

      steps.forEach(function(s) {
        if (s.n) {
          createWidget(widget.TEXT, {
            x: 22, y, w: 18, h: 18,
            text: s.n + '.', text_size: 12, color: C.stepNum,
          })
        }
        const t = createWidget(widget.TEXT, {
          x: 46, y, w: W - 58, h: 20,
          text: s.t, text_size: 11, color: C.step,
        })
        _stepWidgets.push({ w: t, isCode: false, isNote: false })
        y += 18
      })

      const qrBoxY = y + 8
      createWidget(widget.FILL_RECT, {
        x: 0, y: qrBoxY, w: W, h: 276, color: 0x0B1020,
      })
      createWidget(widget.TEXT, {
        x: 0, y: qrBoxY + 10, w: W, h: 14,
        text: 'SCAN FOR APP DOWNLOAD',
        text_size: 10, color: C.note,
        align_h: align.CENTER_H,
      })
      _qrImage = createWidget(widget.IMG, {
        x: 71, y: qrBoxY + 16, w: 248, h: 248,
        src: 'qr_mac.png',
      })
      _qrCaption = createWidget(widget.TEXT, {
        x: 32, y: qrBoxY + 252, w: W - 64, h: 14,
        text: 'Phone opens a page for copying the download link',
        text_size: 9, color: C.help,
        align_h: align.CENTER_H,
      })
    },

    setTab(platform) {
      this.state.platform = platform
      const isMac = platform === 'mac'
      const x = isMac ? 6 : 200
      if (_tabActiveBg) {
        _tabActiveBg.setProperty(prop.MORE, { x })
      }
      if (_tabMacIndicator) {
        _tabMacIndicator.setProperty(prop.MORE, {
          color: isMac ? C.tabActBg : C.tabInaBg,
        })
      }
      if (_tabWinIndicator) {
        _tabWinIndicator.setProperty(prop.MORE, {
          color: isMac ? C.tabInaBg : C.tabActBg,
        })
      }
      if (_tabMacText) _tabMacText.setProperty(prop.MORE, {
        color: isMac ? C.tabActTx : C.tabInaTx,
      })
      if (_tabWinText) _tabWinText.setProperty(prop.MORE, {
        color: isMac ? C.tabInaTx : C.tabActTx,
      })
      if (_qrImage) {
        _qrImage.setProperty(prop.MORE, { src: isMac ? 'qr_mac.png' : 'qr_win.png' })
      }
      if (_qrCaption) {
        _qrCaption.setProperty(prop.MORE, {
          text: isMac
            ? 'Phone opens a Mac page for copying the download link'
            : 'Phone opens a Windows page for copying the download link',
        })
      }

      const steps = isMac ? MAC_STEPS : WIN_STEPS
      _stepWidgets.forEach(function(ref, i) {
        if (i < steps.length && ref.w) {
          ref.w.setProperty(prop.MORE, {
            text: steps[i].t,
            color: ref.isCode ? C.code : (ref.isNote ? C.note : C.step),
          })
        }
      })
    },

    onDestroy() {
      _tabMac = null
      _tabWin = null
      _tabActiveBg = null
      _tabMacIndicator = null
      _tabWinIndicator = null
      _tabMacText = null
      _tabWinText = null
      _qrImage = null
      _qrCaption = null
      _stepWidgets = []
      this.log('Tutorial onDestroy')
    },
  }),
)
