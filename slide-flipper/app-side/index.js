// app-side/index.js — Companion service (runs on phone), Zepp OS v3
// ============================================================
//  SLIDE FLIPPER v2.0 — Phone Bridge
//
//  Flow:
//    Watch taps a button
//    → BasePage.request({ method: 'slide.next', params: { ip, port } })
//    → this onRequest() receives it, reads IP from params
//    → makes HTTP GET to PC server at that IP
//    → PC simulates key press / system action
//
//  No hardcoded IP here — the watch sends its stored IP every time.
//  To change the target IP, use the IP SETUP screen on the watch.
//
//  Supported methods (all prefixed 'slide.'):
//    slide.next     → Right arrow key  (advance slide)
//    slide.prev     → Left arrow key   (go back)
//    slide.play     → F5 / Enter       (start/resume presentation)
//    slide.blank    → B key            (black screen toggle)
//    slide.volup    → Volume Up
//    slide.voldown  → Volume Down
// ============================================================

import { BaseSideService } from '@zeppos/zml/base-side'

const DEFAULT_PORT = 3000

// Valid actions (prevents arbitrary URL injection)
const VALID_ACTIONS = new Set(['next', 'prev', 'play', 'blank', 'volup', 'voldown'])

AppSideService(
  BaseSideService({
    onInit() {
      this.log('SlideFlipper v2.0 companion onInit')
    },

    async onRequest(req, res) {
      const method = req.method  // e.g. 'slide.next'
      const params = req.params  // { ip: '192.168.x.x', port: 3000 }

      // Validate method prefix
      if (!method || !method.startsWith('slide.')) {
        this.error('Unknown method:', method)
        res('unknown method: ' + method)
        return
      }

      const action = method.replace('slide.', '')  // e.g. 'next'

      // Validate action
      if (!VALID_ACTIONS.has(action)) {
        this.error('Invalid action:', action)
        res('invalid action: ' + action)
        return
      }

      // Read IP from watch params (set in IP SETUP page)
      const ip   = (params && params.ip)   ? params.ip   : null
      const port = (params && params.port) ? params.port : DEFAULT_PORT

      if (!ip) {
        this.error('No IP address provided in params')
        res('no IP address — please set it in the watch IP SETUP screen')
        return
      }

      const url = `http://${ip}:${port}/${action}`
      this.log(`→ ${action.toUpperCase()} — fetching ${url}`)

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' },
        })

        if (response.ok) {
          this.log(`✓ ${action.toUpperCase()} acknowledged by PC`)
          res(null, { result: 'ok', action })
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (err) {
        this.error(`✗ Failed to reach PC at ${ip}:${port} —`, err.message)
        res(err.message)
      }
    },

    onDestroy() {
      this.log('SlideFlipper v2.0 companion onDestroy')
    },
  }),
)
