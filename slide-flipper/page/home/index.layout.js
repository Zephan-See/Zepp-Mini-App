// page/home/index.layout.js — shared UI layout
// Coordinates are in design units (designWidth: 390 in app.json).
// Zepp OS scales them automatically to the real screen size.
import { createWidget, widget, prop, align } from '@zos/ui'

const W = 390
const H = 450

const C = {
  bg:          0x000000,
  prevBg:      0x0A3870,
  prevPress:   0x1A60C0,
  prevIcon:    0xFFFFFF,
  prevLabel:   0x8899CC,
  nextBg:      0x0A5C30,
  nextPress:   0x18A050,
  nextIcon:    0xFFFFFF,
  nextLabel:   0x44AA77,
  title:       0xFFFFFF,
  subtitle:    0x888888,
  statusReady: 0x00CC66,
  statusSend:  0x4D94FF,
  statusError: 0xFF4444,
}

let _dot  = null
let _text = null

export const layout = {
  setStatus(msg, color) {
    if (_dot)  _dot.setProperty(prop.MORE,  { color })
    if (_text) _text.setProperty(prop.MORE, { text: msg, color })
  },

  render(vm) {
    // Background
    createWidget(widget.FILL_RECT, {
      x: 0, y: 0, w: W, h: H,
      color: C.bg,
    })

    // Title
    createWidget(widget.TEXT, {
      x: 0, y: 28, w: W, h: 40,
      text: 'SLIDE FLIPPER',
      text_size: 24,
      color: C.title,
      align_h: align.CENTER_H,
    })

    // Subtitle
    createWidget(widget.TEXT, {
      x: 0, y: 72, w: W, h: 28,
      text: 'PowerPoint Remote',
      text_size: 16,
      color: C.subtitle,
      align_h: align.CENTER_H,
    })

    // Status dot
    _dot = createWidget(widget.FILL_RECT, {
      x: 147, y: 112, w: 12, h: 12, radius: 6,
      color: C.statusReady,
    })

    // Status text
    _text = createWidget(widget.TEXT, {
      x: 165, y: 108, w: 120, h: 24,
      text: 'READY',
      text_size: 16,
      color: C.statusReady,
    })

    // PREV button
    createWidget(widget.BUTTON, {
      x: 8, y: 144,
      w: 182, h: 240,
      normal_color: C.prevBg,
      press_color:  C.prevPress,
      text:         'PREV',
      text_size:    32,
      color:        C.prevIcon,
      click_func:   () => vm.sendCommand('prev'),
    })

    // PREV label
    createWidget(widget.TEXT, {
      x: 8, y: 390, w: 182, h: 30,
      text: 'PREV',
      text_size: 16,
      color: C.prevLabel,
      align_h: align.CENTER_H,
    })

    // NEXT button
    createWidget(widget.BUTTON, {
      x: 200, y: 144,
      w: 182, h: 240,
      normal_color: C.nextBg,
      press_color:  C.nextPress,
      text:         'NEXT',
      text_size:    32,
      color:        C.nextIcon,
      click_func:   () => vm.sendCommand('next'),
    })

    // NEXT label
    createWidget(widget.TEXT, {
      x: 200, y: 390, w: 182, h: 30,
      text: 'NEXT',
      text_size: 16,
      color: C.nextLabel,
      align_h: align.CENTER_H,
    })
  },
}
