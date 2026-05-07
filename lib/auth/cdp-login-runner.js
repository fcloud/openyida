/**
 * cdp-login-runner.js - 通过 Chrome DevTools Protocol 获取宜搭登录 Cookie
 *
 * 该文件由 cdp-login.js 以子进程方式调用，避免主 CLI 依赖 Playwright。
 */

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const net = require('net');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const DEFAULT_BASE_URL = 'https://www.aliwork.com';
const DEFAULT_LOGIN_URL = 'https://www.aliwork.com/workPlatform';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = address && address.port;
      server.close(() => resolve(port));
    });
  });
}

function getJson(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });
    request.on('error', reject);
    request.setTimeout(timeoutMs || 1500, () => {
      request.destroy(new Error('CDP request timeout'));
    });
  });
}

async function waitForVersion(port) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      return await getJson('http://127.0.0.1:' + port + '/json/version', 1500);
    } catch {
      await sleep(500);
    }
  }
  throw new Error('CDP endpoint not ready');
}

function getChromeCandidates() {
  const candidates = [];
  if (process.env.OPENYIDA_CHROME_PATH) {
    candidates.push(process.env.OPENYIDA_CHROME_PATH);
  }
  if (process.platform === 'darwin') {
    candidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
    candidates.push('/Applications/Chromium.app/Contents/MacOS/Chromium');
    candidates.push('/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');
  } else if (process.platform === 'win32') {
    const programFiles = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean);
    programFiles.forEach((root) => {
      candidates.push(path.join(root, 'Google', 'Chrome', 'Application', 'chrome.exe'));
      candidates.push(path.join(root, 'Microsoft', 'Edge', 'Application', 'msedge.exe'));
    });
  } else {
    candidates.push('/usr/bin/google-chrome');
    candidates.push('/usr/bin/google-chrome-stable');
    candidates.push('/usr/bin/chromium');
    candidates.push('/usr/bin/chromium-browser');
    candidates.push('/usr/bin/microsoft-edge');
  }
  return candidates;
}

function findChromeExecutable() {
  const candidates = getChromeCandidates();
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function buildFrame(payloadText, opcode) {
  const payload = Buffer.from(payloadText);
  const mask = crypto.randomBytes(4);
  let header;
  if (payload.length < 126) {
    header = Buffer.alloc(2);
    header[1] = 0x80 | payload.length;
  } else if (payload.length < 65536) {
    header = Buffer.alloc(4);
    header[1] = 0x80 | 126;
    header.writeUInt16BE(payload.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(payload.length), 2);
  }
  header[0] = 0x80 | (opcode || 1);

  const maskedPayload = Buffer.alloc(payload.length);
  for (let index = 0; index < payload.length; index++) {
    maskedPayload[index] = payload[index] ^ mask[index % 4];
  }
  return Buffer.concat([header, mask, maskedPayload]);
}

function connectWebSocket(wsUrl) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(wsUrl);
    const socket = net.createConnection({
      host: parsed.hostname,
      port: Number(parsed.port || 80),
    });
    const key = crypto.randomBytes(16).toString('base64');
    const pending = new Map();
    const fragments = [];
    let buffer = Buffer.alloc(0);
    let connected = false;
    let seq = 0;
    let settled = false;

    function fail(error) {
      if (!settled) {
        settled = true;
        reject(error);
      }
      pending.forEach((item) => {
        clearTimeout(item.timer);
        item.reject(error);
      });
      pending.clear();
      socket.destroy();
    }

    function sendRaw(text, opcode) {
      socket.write(buildFrame(text, opcode || 1));
    }

    function handleText(text) {
      let message;
      try {
        message = JSON.parse(text);
      } catch {
        return;
      }
      if (message.id && pending.has(message.id)) {
        const item = pending.get(message.id);
        pending.delete(message.id);
        clearTimeout(item.timer);
        if (message.error) {
          item.reject(new Error(message.error.message || JSON.stringify(message.error)));
        } else {
          item.resolve(message.result || {});
        }
      }
    }

    function parseFrames() {
      while (buffer.length >= 2) {
        const first = buffer[0];
        const second = buffer[1];
        const opcode = first & 0x0f;
        const fin = (first & 0x80) !== 0;
        const masked = (second & 0x80) !== 0;
        let length = second & 0x7f;
        let offset = 2;

        if (length === 126) {
          if (buffer.length < offset + 2) {return;}
          length = buffer.readUInt16BE(offset);
          offset += 2;
        } else if (length === 127) {
          if (buffer.length < offset + 8) {return;}
          length = Number(buffer.readBigUInt64BE(offset));
          offset += 8;
        }

        let mask;
        if (masked) {
          if (buffer.length < offset + 4) {return;}
          mask = buffer.slice(offset, offset + 4);
          offset += 4;
        }

        if (buffer.length < offset + length) {return;}
        let payload = buffer.slice(offset, offset + length);
        buffer = buffer.slice(offset + length);

        if (masked && mask) {
          const unmasked = Buffer.alloc(payload.length);
          for (let index = 0; index < payload.length; index++) {
            unmasked[index] = payload[index] ^ mask[index % 4];
          }
          payload = unmasked;
        }

        if (opcode === 8) {
          socket.end();
          return;
        }
        if (opcode === 9) {
          socket.write(buildFrame(payload.toString(), 10));
          continue;
        }
        if (opcode === 1 || opcode === 0) {
          fragments.push(payload);
          if (fin) {
            const text = Buffer.concat(fragments.splice(0)).toString('utf8');
            handleText(text);
          }
        }
      }
    }

    socket.on('connect', () => {
      const pathWithQuery = (parsed.pathname || '/') + (parsed.search || '');
      const host = parsed.host;
      socket.write([
        'GET ' + pathWithQuery + ' HTTP/1.1',
        'Host: ' + host,
        'Upgrade: websocket',
        'Connection: Upgrade',
        'Sec-WebSocket-Key: ' + key,
        'Sec-WebSocket-Version: 13',
        '',
        '',
      ].join('\r\n'));
    });

    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (!connected) {
        const end = buffer.indexOf('\r\n\r\n');
        if (end < 0) {return;}
        const header = buffer.slice(0, end).toString('utf8');
        buffer = buffer.slice(end + 4);
        if (!/^HTTP\/1\.1 101/.test(header)) {
          fail(new Error('CDP WebSocket upgrade failed'));
          return;
        }
        connected = true;
        if (!settled) {
          settled = true;
          resolve({
            send(method, params) {
              const id = ++seq;
              sendRaw(JSON.stringify({ id, method, params: params || {} }));
              return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                  pending.delete(id);
                  reject(new Error('CDP command timeout: ' + method));
                }, 15000);
                pending.set(id, { resolve, reject, timer });
              });
            },
            close() {
              try {
                sendRaw('', 8);
              } catch {
                // ignore
              }
              socket.end();
            },
          });
        }
      }
      parseFrames();
    });

    socket.on('error', fail);
    socket.on('close', () => {
      const error = new Error('CDP WebSocket closed');
      pending.forEach((item) => {
        clearTimeout(item.timer);
        item.reject(error);
      });
      pending.clear();
    });
  });
}

function normalizeCookie(cookie) {
  return {
    name: cookie.name,
    value: cookie.value,
    domain: cookie.domain,
    path: cookie.path || '/',
    expires: typeof cookie.expires === 'number' ? cookie.expires : -1,
    httpOnly: !!cookie.httpOnly,
    secure: !!cookie.secure,
    sameSite: cookie.sameSite || 'Lax',
  };
}

function resolveBaseUrl(cookies, loginUrl) {
  const yidaCookie = cookies.find((cookie) => cookie.name === 'yida_user_cookie' && cookie.domain && cookie.domain.includes('aliwork.com'));
  const csrfCookie = cookies.find((cookie) => cookie.name === 'tianshu_csrf_token' && cookie.domain && cookie.domain.includes('aliwork.com'));
  const domain = yidaCookie && yidaCookie.domain ? yidaCookie.domain : (csrfCookie && csrfCookie.domain);
  if (domain && domain !== '.aliwork.com') {
    return 'https://' + domain.replace(/^\./, '');
  }
  try {
    return new URL(loginUrl).origin;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

async function main() {
  const options = process.argv[2] ? JSON.parse(process.argv[2]) : {};
  const loginUrl = options.loginUrl || DEFAULT_LOGIN_URL;
  const timeoutMs = options.timeoutMs || 600000;
  const chrome = findChromeExecutable();
  if (!chrome) {
    throw new Error('Chrome executable not found');
  }

  const port = await getFreePort();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openyida-cdp-'));
  const child = spawn(chrome, [
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + userDataDir,
    '--no-first-run',
    '--no-default-browser-check',
    '--new-window',
    loginUrl,
  ], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();

  let client;
  try {
    const version = await waitForVersion(port);
    client = await connectWebSocket(version.webSocketDebuggerUrl);
    const deadline = Date.now() + timeoutMs;
    let cookies = [];

    while (Date.now() < deadline) {
      const result = await client.send('Storage.getCookies').catch(() => {
        return client.send('Network.getAllCookies');
      });
      cookies = (result.cookies || []).map(normalizeCookie);
      if (cookies.some((cookie) => cookie.name === 'tianshu_csrf_token' && cookie.value)) {
        const baseUrl = resolveBaseUrl(cookies, loginUrl);
        console.log(JSON.stringify({ cookies, base_url: baseUrl }));
        await client.send('Browser.close').catch(() => {});
        return;
      }
      await sleep(2000);
    }

    throw new Error('Login timed out');
  } finally {
    if (client) {
      client.close();
    }
    try {
      child.kill();
    } catch {
      // ignore
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
