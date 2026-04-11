// page/tutorial/index.page.js — Installation Guide
// SlideFlipper v2.0 — Zephan
import { BasePage } from '@zeppos/zml/base-page'
import { createWidget, widget, prop, align } from '@zos/ui'
import { pop } from '@zos/router'

const W   = 390
const TOP = 60

const C = {
  bg:       0x000000,
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
  divider:  0x1A1A2E,
}

let _tabMac = null
let _tabWin = null
let _stepWidgets = []

const MAC_STEPS = [
  { n: '1', t: 'Download from:' },
  { n: '',  t: 'github.com/Zephan-See/Zepp-Mini-App', code: true },
  { n: '2', t: 'Double-click START_BRIDGE.command' },
  { n: '3', t: 'Note the IP shown in terminal' },
  { n: '4', t: 'Watch: IP SETUP -> enter that IP' },
  { n: '5', t: 'Open presentation, tap FLIPPER!' },
]

const WIN_STEPS = [
  { n: '1', t: 'Download from:' },
  { n: '',  t: 'github.com/Zephan-See/Zepp-Mini-App', code: true },
  { n: '2', t: 'Open PowerShell in pc-controller/' },
  { n: '',  t: 'node server.js', code: true },
  { n: '3', t: 'Note the IP shown in terminal' },
  { n: '4', t: 'Watch: IP SETUP -> enter that IP' },
  { n: '5', t: 'Open presentation, tap FLIPPER!' },
]

Page(
  BasePage({
    name: 'tutorial',
    state: { platform: 'mac' },

    onInit() { this.log('Tutorial onInit') },

    build() {
      const self = this
      createWidget(widget.FILL_RECT, { x: 0, y: 0, w: W, h: 450, color: C.bg })

      // Header
      createWidget(widget.BUTTON, {
        x: 6, y: TOP, w: 60, h: 30,
        normal_color: C.backBg, press_color: C.backPress,
        text: 'BACK', text_size: 13, color: C.back,
        click_func() { pop() },
      })
      createWidget(widget.TEXT, {
        x: 0, y: TOP + 2, w: W, h: 28,
        text: 'INSTALL GUIDE', text_size: 18, color: C.title,
        align_h: align.CENTER_H,
      })

      // Platform tabs
      const TAB_Y = TOP + 38
      _tabMac = createWidget(widget.BUTTON, {
        x: 6, y: TAB_Y, w: 184, h: 36,
        normal_color: C.tabActBg, press_color: C.tabActPr,
        text: 'MAC', text_size: 18, color: C.tabActTx,
        click_func() { self.setTab('mac') },
      })
      _tabWin = createWidget(widget.BUTTON, {
        x: 200, y: TAB_Y, w: 184, h: 36,
        normal_color: C.tabInaBg, press_color: C.tabInaPr,
        text: 'WINDOWS', text_size: 18, color: C.tabInaTx,
        click_func() { self.setTab('win') },
      })

      createWidget(widget.FILL_RECT, { x: 0, y: TAB_Y + 40, w: W, h: 1, color: C.divider })

      // Steps
      this.renderSteps(MAC_STEPS, TAB_Y + 46)
    },

    renderSteps(steps, startY) {
      _stepWidgets = []
      let y = startY

      steps.forEach(function(s) {
        if (s.code) {
          createWidget(widget.FILL_RECT, { x: 8, y, w: W - 16, h: 36, color: C.codeBg })
          const t = createWidget(widget.TEXT, {
            x: 14, y: y + 10, w: W - 28, h: 18,
            text: s.t, text_size: 12, color: C.code,
          })
          _stepWidgets.push({ w: t, isCode: true })
          y += 42
        } else {
          if (s.n) {
            createWidget(widget.TEXT, {
              x: 10, y, w: 22, h: 20,
              text: s.n + '.', text_size: 14, color: C.stepNum,
            })
          }
          const t = createWidget(widget.TEXT, {
            x: s.n ? 34 : 10, y, w: W - 44, h: 36,
            text: s.t, text_size: 14,
            color: s.n ? C.step : C.note,
          })
          _stepWidgets.push({ w: t, isCode: false, isNote: !s.n })
          y += s.n ? 40 : 28
        }
      })

      createWidget(widget.TEXT, {
        x: 0, y: 424, w: W, h: 18,
        text: 'Works with Slides, Canva, PowerPoint',
        text_size: 11, color: C.note,
        align_h: align.CENTER_H,
      })
    },

    setTab(platform) {
      this.state.platform = platform
      const isMac = platform === 'mac'

      if (_tabMac) _tabMac.setProperty(prop.MORE, {
        normal_color: isMac  ? C.tabActBg : C.tabInaBg,
        color:        isMac  ? C.tabActTx : C.tabInaTx,
      })
      if (_tabWin) _tabWin.setProperty(prop.MORE, {
        normal_color: !isMac ? C.tabActBg : C.tabInaBg,
        color:        !isMac ? C.tabActTx : C.tabInaTx,
      })

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
      _stepWidgets = []
      this.log('Tutorial onDestroy')
    },
  }),
)
