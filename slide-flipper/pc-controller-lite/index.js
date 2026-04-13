'use strict';

const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { exec } = require('child_process');

const systrayModule = require('systray');
const SysTray = systrayModule.default || systrayModule;

const PORT = 3000;
const trayIcons = {
  win32: 'icon.ico',
  darwin: 'tray-icon.png',
  linux: 'tray-icon.png',
};

const MENU_INDEX = {
  status: 0,
  ip: 1,
  port: 2,
  refresh: 3,
  openGuide: 4,
  quit: 5,
};

const ACTIONS = {
  next: {
    mac: 'osascript -e "tell application \\"System Events\\" to key code 124"',
    win: 'powershell -command "$wsh = New-Object -ComObject wscript.shell; $wsh.SendKeys(\\"{RIGHT}\\")"',
    linux: 'xdotool key Right',
  },
  prev: {
    mac: 'osascript -e "tell application \\"System Events\\" to key code 123"',
    win: 'powershell -command "$wsh = New-Object -ComObject wscript.shell; $wsh.SendKeys(\\"{LEFT}\\")"',
    linux: 'xdotool key Left',
  },
  play: {
    mac: 'osascript -e "tell application \\"System Events\\" to key code 49"',
    win: 'powershell -command "$wsh = New-Object -ComObject wscript.shell; $wsh.SendKeys(\\" \\")"',
    linux: 'xdotool key space',
  },
  blank: {
    mac: 'osascript -e "tell application \\"System Events\\" to keystroke \\"b\\""',
    win: 'powershell -command "$wsh = New-Object -ComObject wscript.shell; $wsh.SendKeys(\\"b\\")"',
    linux: 'xdotool key b',
  },
  volup: {
    mac: 'osascript -e "set v to output volume of (get volume settings)" -e "set v to v + 6" -e "if v > 100 then set v to 100" -e "set volume output volume v"',
    win: 'powershell -command "$wsh = New-Object -ComObject wscript.shell; $wsh.SendKeys(\\"{VOLUME_UP}\\")"',
    linux: 'xdotool key XF86AudioRaiseVolume',
  },
  voldown: {
    mac: 'osascript -e "set v to output volume of (get volume settings)" -e "set v to v - 6" -e "if v < 0 then set v to 0" -e "set volume output volume v"',
    win: 'powershell -command "$wsh = New-Object -ComObject wscript.shell; $wsh.SendKeys(\\"{VOLUME_DOWN}\\")"',
    linux: 'xdotool key XF86AudioLowerVolume',
  },
};

let tray = null;
let server = null;

function logLiteError(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  try {
    fs.appendFileSync(path.join(os.tmpdir(), 'slideflipper-lite.log'), line);
  } catch (_) {
    // best effort only
  }
}

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

function iconPath() {
  return path.join(__dirname, 'assets', trayIcons[process.platform] || trayIcons.darwin);
}

function iconBase64() {
  return fs.readFileSync(iconPath()).toString('base64');
}

function platformCommand(action) {
  const map = ACTIONS[action];
  if (!map) return null;
  if (process.platform === 'win32') return map.win;
  if (process.platform === 'darwin') return map.mac;
  return map.linux;
}

function runScript(script, cb) {
  exec(script, (err, stdout, stderr) => {
    if (err) {
      cb(stderr || err.message || 'Unknown error');
      return;
    }
    cb(null, stdout);
  });
}

function ensureWindowsFirewallRule() {
  if (process.platform !== 'win32') return;

  const ruleName = 'SlideFlipper Port 3000';
  const checkCmd = `cmd /c netsh advfirewall firewall show rule name="${ruleName}"`;
  const addCmd = `powershell -NoProfile -Command "Start-Process powershell -Verb RunAs -WindowStyle Hidden -ArgumentList '-NoProfile -Command \\\"netsh advfirewall firewall add rule name=''''${ruleName}'''' dir=in action=allow protocol=TCP localport=${PORT} profile=any\\\"'"`;

  exec(checkCmd, (err, stdout) => {
    if (!err && (stdout || '').includes(ruleName)) return;
    exec(addCmd, (addErr) => {
      if (addErr) logLiteError(`Firewall rule prompt failed: ${addErr.message}`);
    });
  });
}

function buildMenu(ip) {
  const extra = getAllLocalIPs()
    .filter(({ address }) => address !== ip)
    .slice(0, 3)
    .map(({ address }) => address)
    .join(', ');

  const items = [
    {
      title: 'SlideFlipper Lite running',
      tooltip: 'Tray Lite mode is active',
      enabled: false,
    },
    {
      title: `IP: ${ip}`,
      tooltip: 'Enter this IP on the watch',
      enabled: false,
    },
  ];

  if (extra) {
    items.push({
      title: `Other IPs: ${extra}`,
      tooltip: 'Other detected local addresses',
      enabled: false,
    });
  }

  items.push(
    {
      title: `Port: ${PORT}`,
      tooltip: 'Watch sends commands to this port',
      enabled: false,
    },
    {
      title: 'Refresh IP',
      tooltip: 'Refresh the local IP address',
      enabled: true,
    },
    {
      title: 'Open install guide',
      tooltip: 'Open the public install page',
      enabled: true,
    },
    {
      title: 'Quit SlideFlipper Lite',
      tooltip: 'Stop the tray app',
      enabled: true,
    },
  );

  return {
    icon: iconBase64(),
    title: '',
    tooltip: `SlideFlipper Lite • ${ip}:${PORT}`,
    items,
  };
}

function updateMenu(ip) {
  if (!tray) return;

  tray.sendAction({
    type: 'update-item',
    seq_id: MENU_INDEX.ip,
    item: {
      title: `IP: ${ip}`,
      tooltip: 'Enter this IP on the watch',
      enabled: false,
    },
  });

  tray.sendAction({
    type: 'update-item',
    seq_id: MENU_INDEX.port,
    item: {
      title: `Port: ${PORT}`,
      tooltip: `SlideFlipper Lite • ${ip}:${PORT}`,
      enabled: false,
    },
  });
}

function openGuide() {
  const url = process.platform === 'win32'
    ? 'https://zephan-see.github.io/Zepp-Mini-App/win/'
    : 'https://zephan-see.github.io/Zepp-Mini-App/mac/';

  const command = process.platform === 'win32'
    ? `start "" "${url}"`
    : process.platform === 'darwin'
      ? `open "${url}"`
      : `xdg-open "${url}"`;

  exec(command);
}

function startServer() {
  server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, 'http://localhost');
    const action = url.searchParams.get('action') || url.pathname.replace('/', '');

    if (action === 'ping') {
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, pong: true }));
      return;
    }

    const cmd = platformCommand(action);
    if (!cmd) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Unknown action', action }));
      return;
    }

    runScript(cmd, (err) => {
      if (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, action }));
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`SlideFlipper Lite running on ${getLocalIP()}:${PORT}`);
  });

  server.on('error', (err) => {
    console.error(`[SlideFlipper Lite] ${err.message}`);
    process.exit(1);
  });
}

function startTray() {
  const ip = getLocalIP();

  tray = new SysTray({
    menu: buildMenu(ip),
    debug: false,
    copyDir: true,
  });

  tray.onClick((action) => {
    if (action.seq_id === MENU_INDEX.refresh) {
      updateMenu(getLocalIP());
      return;
    }

    if (action.seq_id === MENU_INDEX.openGuide) {
      openGuide();
      return;
    }

    if (action.seq_id === MENU_INDEX.quit) {
      shutdown();
    }
  });

  tray.onError((err) => {
    logLiteError(`Tray error: ${err && err.message ? err.message : String(err)}`);
    process.exit(1);
  });
}

function shutdown() {
  if (server) {
    server.close();
  }
  if (tray) {
    tray.kill(false);
  }
  process.exit(0);
}

ensureWindowsFirewallRule();
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
startTray();
