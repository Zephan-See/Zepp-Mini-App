// page/tutorial/index.page.js — Installation Guide
// SlideFlipper v2.0 — Zephan
import { BasePage } from '@zeppos/zml/base-page'
import { createWidget, widget, prop, align } from '@zos/ui'
import { pop } from '@zos/router'

const W   = 390
const TOP = 65

const C = {
  bg:       0x000000,
  title:    0xFFFFFF,
  back:     0x6666AA,
  backBg:   0x111130,
  tabActBg: 0x0A3870,
  tabInaBg: 0x111122,
  tabActTx: 0xFFFFFF,
  tabInaTx: 0x6666AA,
  step:     0xCCCCEE,
  stepNum:  0x4D94FF,
  code:     0x00CC66,
  codeBg:   0x061A06,
  note:     0x777799,
  divider:  0x1A1A2E,
}

let _tabMac = null
let _tabWin = null
let _stepWidgets = []   // all TEXT widgets in the step area (for tab switching)

const MAC_STEPS = [
  { n: '1', t: 'Download from:' },
  { n: '',  t: 'github.com/Zephan-See/Zepp-Mini-App', code: true },
  { n: '2', t: 'Double-click START_BRIDGE.command' },
  { n: '3', t: 'Note the IP shown in terminal' },
  { n: '4', t: 'Open app -> IP SETUP -> enter IP' },
  { n: '5', t: 'Start presenting, tap FLIPPER!' },
]

const WIN_STEPS = [
  { n: '1', t: 'Download from:' },
  { n: '',  t: 'github.com/Zephan-See/Zepp-Mini-App', code: true },
  { n: '2', t: 'Open PowerShell in pc-controller/' },
  { n: '',  t: 'node server.js', code: true },
  { n: '3', t: 'Note the IP shown in terminal' },
  { n: '4', t: 'Open app -> IP SETUP -> enter IP' },
  { n: '5', t: 'Start presenting, tap FLIPPER!' },
]

Page(
  BasePage({
    name: 'tutorial',
    state: { platform: 'mac' },

    onInit() { this.log('Tutorial onInit') },

    build() {
      this.log('Tutorial build')
      const self = this

      createWidget(widget.FILL_RECT, { x: 0, y: 0, w: W, h: 450, color: C.bg })

      // ── Header ────────────────────────────────────────────
      createWidget(widget.TEXT, {
        x: 0, y: TOP, w: W, h: 32,
        text: 'INSTALL GUIDE', text_size: 18, color: C.title,
        align_h: align.CENTER_H,
      })
      createWidget(widget.FILL_RECT, { x: 6, y: TOP, w: 64, h: 32, radius: 10, color: C.backBg })
      createWidget(widget.TEXT, {
        x: 6, y: TOP, w: 64, h: 32,
        text: '< BACK', text_size: 13, color: C.back,
        align_h: align.CENTER_H, align_v: align.CENTER_V,
        click_func() { pop() },
      })

      // ── Platform tabs ─────────────────────────────────────
      const TAB_Y = TOP + 38
      createWidget(widget.FILL_RECT, { x: 6,   y: TAB_Y, w: 184, h: 36, radius: 10, color: C.tabActBg })
      _tabMac = createWidget(widget.TEXT, {
        x: 6, y: TAB_Y, w: 184, h: 36,
        text: 'MAC', text_size: 18, color: C.tabActTx,
        align_h: align.CENTER_H, align_v: align.CENTER_V,
        click_func() { self.setTab('mac') },
      })

      createWidget(widget.FILL_RECT, { x: 200, y: TAB_Y, w: 184, h: 36, radius: 10, color: C.tabInaBg })
      _tabWin = createWidget(widget.TEXT, {
        x: 200, y: TAB_Y, w: 184, h: 36,
        text: 'WINDOWS', text_size: 18, color: C.tabInaTx,
        align_h: align.CENTER_H, align_v: align.CENTER_V,
        click_func() { self.setTab('win') },
      })

      createWidget(widget.FILL_RECT, { x: 0, y: TAB_Y + 40, w: W, h: 1, color: C.divider })

      // ── Steps content ─────────────────────────────────────
      this.renderSteps(MAC_STEPS, TAB_Y + 46)
    },

    renderSteps(steps, startY) {
      _stepWidgets = []
      let y = startY

      steps.forEach((s) => {
        if (s.code) {
          createWidget(widget.FILL_RECT, { x: 8, y, w: W - 16, h: 38, radius: 8, color: C.codeBg })
          const t = createWidget(widget.TEXT, {
            x: 14, y: y + 6, w: W - 28, h: 26,
            text: s.t, text_size: 12, color: C.code,
          })
          _stepWidgets.push({ w: t, isCode: true })
          y += 44
        } else {
          if (s.n) {
            createWidget(widget.TEXT, {
              x: 10, y, w: 22, h: 22,
              text: s.n + '.', text_size: 14, color: C.stepNum,
            })
          }
          const t = createWidget(widget.TEXT, {
            x: s.n ? 34 : 10, y, w: W - 44, h: 36,
            text: s.t, text_size: 14,
            color: s.n ? C.step : C.note,
          })
          _stepWidgets.push({ w: t, isCode: false, isNote: !s.n })
          y += s.n ? 40 : 30
        }
      })

      // Footer
      createWidget(widget.TEXT, {
        x: 0, y: 422, w: W, h: 20,
        text: 'Works with Slides, Canva, PowerPoint',
        text_size: 11, color: C.note,
        align_h: align.CENTER_H,
      })
    },

    setTab(platform) {
      this.state.platform = platform
      const isMac = platform === 'mac'

      // Update tab text colors (FILL_RECT backgrounds are static, we swap text color)
      if (_tabMac) _tabMac.setProperty(prop.MORE, { color: isMac  ? C.tabActTx : C.tabInaTx })
      if (_tabWin) _tabWin.setProperty(prop.MORE, { color: !isMac ? C.tabActTx : C.tabInaTx })

      // Update step text content
      const steps = isMac ? MAC_STEPS : WIN_STEPS
      const allItems = steps  // same count assumed
      _stepWidgets.forEach((ref, i) => {
        if (i < allItems.length && ref.w) {
          ref.w.setProperty(prop.MORE, {
            text: allItems[i].t,
            color: ref.isCode ? C.code : (ref.isNote ? C.note : C.step),
          })
        }
      })
    },

    onDestroy() {
      _tabMac = null
      _tabWin = null
      _stepWidgets = []
      this.log('Tutorial onDestroy')
    },
  }),
)
