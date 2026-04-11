// pc-controller/server.js
// ============================================================
//  SLIDE FLIPPER v2.0 — PC Controller
//
//  Run this on your PRESENTATION computer:
//    node server.js
//
//  It starts a tiny HTTP server on port 3000.
//  Your watch sends commands; this script simulates key presses.
//
//  Supported endpoints:
//    GET /next     → Right arrow key  (next slide)
//    GET /prev     → Left arrow key   (previous slide)
//    GET /play     → F5               (start / resume slideshow)
//    GET /blank    → B key            (black screen toggle)
//    GET /volup    → Volume Up key
//    GET /voldown  → Volume Down key
//    GET /ping     → health check (returns 'pong')
//
//  Works with: PowerPoint, Keynote, Google Slides,
//              LibreOffice Impress, Canva, PDF viewers, etc.
//
//  No extra npm packages needed!
//    Mac   → uses built-in AppleScript (osascript)
//    Win   → uses built-in PowerShell (WScript.Shell)
//    Linux → uses xdotool (sudo apt install xdotool)
// ============================================================

const http = require('http')
const { exec } = require('child_process')
const os   = require('os')

const PORT = 3000
const platform = os.platform()  // 'darwin' | 'win32' | 'linux'

// ── Key definitions per platform ───────────────────────────
//
//  mac:   AppleScript key code OR keystroke
//  win:   PowerShell WScript.Shell SendKeys string
//  linux: xdotool key name
//
const ACTIONS = {
  next: {
    label: 'NEXT  >>',
    mac:   `osascript -e 'tell application "System Events" to key code 124'`,            // Right arrow
    win:   `powershell -command "$s=New-Object -ComObject WScript.Shell; $s.SendKeys('{RIGHT}')"`,
    linux: `xdotool key Right`,
  },
  prev: {
    label: '<< PREV',
    mac:   `osascript -e 'tell application "System Events" to key code 123'`,            // Left arrow
    win:   `powershell -command "$s=New-Object -ComObject WScript.Shell; $s.SendKeys('{LEFT}')"`,
    linux: `xdotool key Left`,
  },
  play: {
    label: 'PLAY',
    // F5 starts slideshow in PowerPoint/LibreOffice; Enter resumes in Keynote
    mac:   `osascript -e 'tell application "System Events" to key code 96'`,             // F5
    win:   `powershell -command "$s=New-Object -ComObject WScript.Shell; $s.SendKeys('{F5}')"`,
    linux: `xdotool key F5`,
  },
  blank: {
    label: 'BLANK',
    // B toggles black screen in PowerPoint, Keynote, Google Slides, LibreOffice
    mac:   `osascript -e 'tell application "System Events" to keystroke "b"'`,
    win:   `powershell -command "$s=New-Object -ComObject WScript.Shell; $s.SendKeys('b')"`,
    linux: `xdotool key b`,
  },
  volup: {
    label: 'VOL+',
    mac:   `osascript -e 'tell application "System Events" to key code 72'`,             // Volume Up
    win:   `powershell -command "$s=New-Object -ComObject WScript.Shell; $s.SendKeys('{VOLUME_UP}')"`,
    linux: `xdotool key XF86AudioRaiseVolume`,
  },
  voldown: {
    label: 'VOL-',
    mac:   `osascript -e 'tell application "System Events" to key code 73'`,             // Volume Down
    win:   `powershell -command "$s=New-Object -ComObject WScript.Shell; $s.SendKeys('{VOLUME_DOWN}')"`,
    linux: `xdotool key XF86AudioLowerVolume`,
  },
}

// ── Helpers ────────────────────────────────────────────────
function timestamp() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false })
}

function getLocalIPs() {
  const ifaces = os.networkInterfaces()
  const results = []
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        results.push({ name, address: iface.address })
      }
    }
  }
  return results
}

function getPlatformKey(action) {
  if (platform === 'darwin') return action.mac
  if (platform === 'win32')  return action.win
  return action.linux
}

// ── Execute a platform action ──────────────────────────────
function runAction(actionName, res) {
  const action = ACTIONS[actionName]
  if (!action) {
    res.statusCode = 404
    res.end(`Unknown action: ${actionName}`)
    return
  }

  const cmd = getPlatformKey(action)
  console.log(`[${timestamp()}] ${action.label}`)

  exec(cmd, (err) => {
    if (err) {
      console.error(`  ERROR: ${err.message}`)
      if (platform === 'linux' && err.message.includes('xdotool')) {
        console.error('  Install xdotool with: sudo apt install xdotool')
      }
      res.statusCode = 500
      res.end('error: ' + err.message)
      return
    }
    res.statusCode = 200
    res.end('ok')
  })
}

// ── HTTP Server ────────────────────────────────────────────
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'text/plain')

  const url = req.url.toLowerCase().split('?')[0].replace(/^\//, '')  // strip leading /

  if (url === 'ping') {
    res.statusCode = 200
    res.end('pong')
    return
  }

  if (ACTIONS[url]) {
    runAction(url, res)
    return
  }

  // Root or unknown
  res.statusCode = 200
  res.end(
    'Slide Flipper v2.0 PC Controller is running.\n' +
    'Endpoints: /next /prev /play /blank /volup /voldown /ping\n'
  )
})

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIPs()
  const platformLabel = platform === 'darwin' ? 'macOS' : platform === 'win32' ? 'Windows' : 'Linux'

  const ipLines = ips.length
    ? ips.map(({ name, address }) => {
        const line = `  -> ${address}  (${name})`
        return `||  ${line.padEnd(43)}||`
      })
    : [`||  No network interface found.               ||`]

  const lines = [
    '',
    '===============================================',
    '     SLIDE FLIPPER v2.0 -- PC CONTROLLER      ',
    '===============================================',
    `||  Platform : ${platformLabel.padEnd(31)}||`,
    `||  Port     : ${String(PORT).padEnd(31)}||`,
    '||                                             ||',
    '||  Your PC IP address(es):                   ||',
    ...ipLines,
    '||                                             ||',
    '||  Enter one of these IPs in the watch        ||',
    '||  IP SETUP screen to connect.               ||',
    '||                                             ||',
    '||  Press Ctrl+C to stop.                     ||',
    '===============================================',
    '',
  ]

  lines.forEach(l => console.log(l))
  console.log(`[${timestamp()}] Ready. Waiting for commands from your watch...`)
  console.log('')
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`ERROR: Port ${PORT} is already in use. Close the other instance and retry.`)
  } else {
    console.error('Server error:', err.message)
  }
  process.exit(1)
})

process.on('SIGINT', () => {
  console.log('\n[SlideFlipper] Server stopped. Goodbye!')
  process.exit(0)
})
