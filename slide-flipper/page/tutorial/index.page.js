// page/tutorial/index.page.js — Installation Tutorial
// SlideFlipper v2.0 — Zephan
import { BasePage } from '@zeppos/zml/base-page'
import { createWidget, widget, prop, align } from '@zos/ui'
import { pop } from '@zos/router'

const W = 390
const H = 450

const C = {
  bg:       0x000000,
  title:    0xFFFFFF,
  back:     0x555577,
  tabMacBg: 0x0A3870,
  tabWinBg: 0x111122,
  tabText:  0xFFFFFF,
  tabInact: 0x444466,
  step:     0xCCCCEE,
  stepNum:  0x4D94FF,
  code:     0x00CC66,
  note:     0x888899,
  divider:  0x222233,
}

let _contentWidgets = []
let _tabMac = null
let _tabWin = null

const MAC_STEPS = [
  { n: '1', t: 'Open Terminal on your Mac' },
  { n: '2', t: 'Paste this command:' },
  { n: '',  t: 'curl -fsSL https://slideflippper.app/install.sh | bash', code: true },
  { n: '3', t: 'A icon appears in your menu bar (top right)' },
  { n: '4', t: 'Click icon to see your IP address' },
  { n: '5', t: 'Enter that IP in the IP SETUP page on this watch' },
  { n: '6', t: 'Open any presentation and tap FLIPPER!' },
]

const WIN_STEPS = [
  { n: '1', t: 'Open PowerShell on your Windows PC' },
  { n: '2', t: 'Paste this command:' },
  { n: '',  t: 'irm https://slideflippper.app/install.ps1 | iex', code: true },
  { n: '3', t: 'A icon appears in your system tray (bottom right)' },
  { n: '4', t: 'Click icon to see your IP address' },
  { n: '5', t: 'Enter that IP in the IP SETUP page on this watch' },
  { n: '6', t: 'Open any presentation and tap FLIPPER!' },
]

Page(
  BasePage({
    name: 'tutorial',
    state: { platform: 'mac' },

    onInit() { this.log('Tutorial onInit') },

    build() {
      this.log('Tutorial build')
      const self = this

      createWidget(widget.FILL_RECT, { x: 0, y: 0, w: W, h: H, color: C.bg })

      // Header
      createWidget(widget.TEXT, {
        x: 0, y: 10, w: W, h: 30,
        text: 'INSTALL GUIDE',
        text_size: 20,
        color: C.title,
        align_h: align.CENTER_H,
      })
      createWidget(widget.BUTTON, {
        x: 6, y: 8, w: 52, h: 32,
        normal_color: 0x111122, press_color: 0x222244,
        text: 'BACK', text_size: 12, color: C.back,
        click_func() { pop() },
      })

      // Platform toggle tabs
      _tabMac = createWidget(widget.BUTTON, {
        x: 6, y: 48, w: 186, h: 38,
        normal_color: C.tabMacBg,
        press_color: 0x1A60C0,
        text: 'MAC',
        text_size: 18,
        color: C.tabText,
        click_func() { self.setTab('mac') },
      })
      _tabWin = createWidget(widget.BUTTON, {
        x: 198, y: 48, w: 186, h: 38,
        normal_color: C.tabWinBg,
        press_color: 0x222244,
        text: 'WINDOWS',
        text_size: 18,
        color: C.tabInact,
        click_func() { self.setTab('win') },
      })

      createWidget(widget.FILL_RECT, { x: 0, y: 90, w: W, h: 1, color: C.divider })

      // Render default content
      this.renderSteps(MAC_STEPS)
    },

    setTab(platform) {
      this.state.platform = platform

      // Update tab styles
      if (_tabMac) _tabMac.setProperty(prop.MORE, {
        normal_color: platform === 'mac' ? C.tabMacBg : C.tabWinBg,
        color: platform === 'mac' ? C.tabText : C.tabInact,
      })
      if (_tabWin) _tabWin.setProperty(prop.MORE, {
        normal_color: platform === 'win' ? C.tabMacBg : C.tabWinBg,
        color: platform === 'win' ? C.tabText : C.tabInact,
      })

      // Clear old content widgets - in Zepp OS we rebuild by recreating
      // (Widget removal isn't directly supported; we update text instead)
      const steps = platform === 'mac' ? MAC_STEPS : WIN_STEPS
      this.updateStepTexts(steps)
    },

    renderSteps(steps) {
      _contentWidgets = []
      let y = 100

      steps.forEach((s) => {
        if (s.code) {
          // Code block
          createWidget(widget.FILL_RECT, {
            x: 8, y: y, w: W - 16, h: 40,
            color: 0x0A1A0A,
          })
          const t = createWidget(widget.TEXT, {
            x: 12, y: y + 6, w: W - 24, h: 28,
            text: s.t,
            text_size: 12,
            color: C.code,
          })
          _contentWidgets.push({ widget: t, isCode: true })
          y += 48
        } else {
          // Step row
          if (s.n) {
            createWidget(widget.TEXT, {
              x: 8, y: y, w: 22, h: 22,
              text: s.n + '.',
              text_size: 14,
              color: C.stepNum,
            })
          }
          const t = createWidget(widget.TEXT, {
            x: s.n ? 32 : 8, y: y, w: W - 40, h: 40,
            text: s.t,
            text_size: 14,
            color: s.n ? C.step : C.note,
          })
          _contentWidgets.push({ widget: t, isCode: false })
          y += s.n ? 46 : 26
        }
      })

      // Footer note
      createWidget(widget.TEXT, {
        x: 0, y: 418, w: W, h: 28,
        text: 'Works with Slides, Canva, PowerPoint',
        text_size: 12,
        color: C.note,
        align_h: align.CENTER_H,
      })
    },

    updateStepTexts(steps) {
      // Update existing text widgets with new content
      // (Simpler than destroying/recreating in Zepp OS)
      const textSteps = steps.filter(s => true) // all steps
      _contentWidgets.forEach((ref, i) => {
        if (i < textSteps.length && ref.widget) {
          ref.widget.setProperty(prop.MORE, {
            text: textSteps[i].t,
            color: ref.isCode ? C.code : (textSteps[i].n ? C.step : C.note),
          })
        }
      })
    },

    onDestroy() {
      _contentWidgets = []
      _tabMac = null
      _tabWin = null
      this.log('Tutorial onDestroy')
    },
  }),
)
