'use strict';

const { app, Tray, Menu, nativeImage, shell } = require('electron');
const http = require('http');
const os   = require('os');
const path = require('path');
const { exec } = require('child_process');

// ── Prevent Electron from creating a visible window / dock icon ──────────────
app.commandLine.appendSwitch('disable-renderer-backgrounding');
if (process.platform === 'darwin') {
  // Hide from macOS dock before the app is ready
  app.setActivationPolicy('accessory');
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function isPrivateIPv4(address) {
  if (address.startsWith('10.')) return true;
  if (address.startsWith('192.168.')) return true;
  const m = address.match(/^172\.(\d+)\./);
  return !!m && Number(m[1]) >= 16 && Number(m[1]) <= 31;
}

function interfaceScore(name, address) {
  const lower = name.toLowerCase();
  let score = 0;

  if (isPrivateIPv4(address)) score += 20;
  if (address.startsWith('192.168.')) score += 10;
  if (address.startsWith('10.')) score += 8;
  if (/wi-?fi|wlan|wireless/.test(lower)) score += 20;
  if (/ethernet|local area/.test(lower)) score += 10;

  if (/docker|wsl|hyper-v|vethernet|vmware|virtualbox|virtual|tailscale|zerotier|hamachi|bluetooth|loopback/.test(lower)) {
    score -= 100;
  }

  return score;
}

function getAllLocalIPs() {
  const ifaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(ifaces)) {
    const list = ifaces[name];
    if (!list) continue;
    for (const iface of list) {
      if (iface.family !== 'IPv4' || iface.internal) continue;
      if (iface.address.startsWith('169.254.')) continue;
      candidates.push({
        name,
        address: iface.address,
        score: interfaceScore(name, iface.address),
      });
    }
  }

  return candidates.sort((a, b) => b.score - a.score);
}

function getLocalIP() {
  const candidates = getAllLocalIPs();
  if (candidates.length) return candidates[0].address;
  return '127.0.0.1';
}

function runScript(script, cb) {
  exec(script, (err, stdout, stderr) => {
    if (err) cb(err.message || stderr);
    else cb(null);
  });
}

function ensureWindowsFirewallRule() {
  if (process.platform !== 'win32') return;

  const ruleName = 'SlideFlipper Port 3000';
  const checkCmd = `powershell -NoProfile -Command "Get-NetFirewallRule -DisplayName '${ruleName}' -ErrorAction SilentlyContinue | Select-Object -First 1 | ForEach-Object { $_.DisplayName }"`;
  const addCmd = `powershell -NoProfile -Command "Start-Process powershell -Verb RunAs -WindowStyle Hidden -ArgumentList '-NoProfile -Command \\\"New-NetFirewallRule -DisplayName ''${ruleName}'' -Direction Inbound -Action Allow -Protocol TCP -LocalPort ${PORT} -Profile Private\\\"'"`;

  exec(checkCmd, (err, stdout) => {
    if (err) return;
    if ((stdout || '').trim() === ruleName) return;
    exec(addCmd, () => {});
  });
}

// ── Platform command map ─────────────────────────────────────────────────────
const PORT = 3000;

const ACTIONS = {
  next:     { mac: 'osascript -e "tell application \\"System Events\\" to key code 124"',
               win: 'powershell -command "$wsh = New-Object -ComObject wscript.shell; $wsh.SendKeys(\\"{RIGHT}\\")"' },
  prev:     { mac: 'osascript -e "tell application \\"System Events\\" to key code 123"',
               win: 'powershell -command "$wsh = New-Object -ComObject wscript.shell; $wsh.SendKeys(\\"{LEFT}\\")"' },
  play:     { mac: 'osascript -e "tell application \\"System Events\\" to key code 49"',
               win: 'powershell -command "$wsh = New-Object -ComObject wscript.shell; $wsh.SendKeys(\\" \\")"' },
  blank:    { mac: 'osascript -e "tell application \\"System Events\\" to key code 11"',
               win: 'powershell -command "$wsh = New-Object -ComObject wscript.shell; $wsh.SendKeys(\\"b\\")"' },
  volup:    { mac: 'osascript -e "set curVol to output volume of (get volume settings)\nset volume output volume (curVol + 6)"',
               win: 'powershell -command "$wsh = New-Object -ComObject wscript.shell; $wsh.SendKeys([char]175)"' },
  voldown:  { mac: 'osascript -e "set curVol to output volume of (get volume settings)\nset volume output volume (curVol - 6)"',
               win: 'powershell -command "$wsh = New-Object -ComObject wscript.shell; $wsh.SendKeys([char]174)"' },
};

function getCmd(action) {
  const map = ACTIONS[action];
  if (!map) return null;
  return process.platform === 'win32' ? map.win : map.mac;
}

// ── HTTP server ──────────────────────────────────────────────────────────────
function startServer() {
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    const url  = new URL(req.url, `http://localhost`);
    const action = url.searchParams.get('action') || url.pathname.replace('/', '');

    const cmd = getCmd(action);
    if (!cmd) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Unknown action', action }));
      return;
    }

    runScript(cmd, (err) => {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err }));
      } else {
        res.writeHead(200);
        res.end(JSON.stringify({ ok: true, action }));
      }
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`SlideFlipper server running on port ${PORT}`);
  });

  return server;
}

// ── Tray ─────────────────────────────────────────────────────────────────────
let tray = null;
let currentIP = '';

function secondaryIPs() {
  return getAllLocalIPs()
    .filter(({ address }) => address !== currentIP)
    .slice(0, 3)
    .map(({ address }) => address)
    .join(', ');
}

function buildMenu() {
  const extra = secondaryIPs();
  const ipItems = [
    {
      label: `Your IP:  ${currentIP}`,
      enabled: false,
    },
  ];

  if (extra) {
    ipItems.push({
      label: `Other IPs: ${extra}`,
      enabled: false,
    });
  }

  return Menu.buildFromTemplate([
    {
      label: 'SlideFlipper',
      enabled: false,
    },
    { type: 'separator' },
    ...ipItems,
    {
      label: `Port:  ${PORT}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Refresh IP',
      click() {
        currentIP = getLocalIP();
        tray.setToolTip(`SlideFlipper  •  ${currentIP}:${PORT}`);
        tray.setContextMenu(buildMenu());
      },
    },
    { type: 'separator' },
    {
      label: 'Quit SlideFlipper',
      click() { app.quit(); },
    },
  ]);
}

// ── App ready ────────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  // Extra dock hide safety (macOS)
  if (app.dock) app.dock.hide();

  ensureWindowsFirewallRule();
  currentIP = getLocalIP();

  // Load tray icon
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  let icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) {
    // Fallback: 1×1 transparent placeholder so Tray doesn't throw
    icon = nativeImage.createEmpty();
  }
  // macOS likes a template image (inverts automatically for dark/light menu bar)
  if (process.platform === 'darwin') {
    icon = icon.resize({ width: 16, height: 16 });
    icon.setTemplateImage(true);
  } else {
    icon = icon.resize({ width: 16, height: 16 });
  }

  tray = new Tray(icon);
  tray.setToolTip(`SlideFlipper  •  ${currentIP}:${PORT}`);
  tray.setContextMenu(buildMenu());

  // On macOS, left-click on tray also pops the menu
  if (process.platform === 'darwin') {
    tray.on('click', () => {
      tray.popUpContextMenu();
    });
  }

  startServer();
});

app.on('window-all-closed', (e) => {
  // Keep running even if all windows are closed
  e.preventDefault?.();
});
