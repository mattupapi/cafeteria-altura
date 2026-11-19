const mode = process.argv[2] || 'button';
const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:4201';
const debugUrl = process.env.CHROME_DEBUG_URL || 'http://127.0.0.1:9223';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const targets = await fetch(`${debugUrl}/json/list`).then(response => response.json());
const target = targets.find(item => item.type === 'page');
if (!target) throw new Error('No hay una página disponible en Chrome DevTools.');

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let sequence = 0;
const pending = new Map();
const listeners = new Map();
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
    return;
  }
  for (const listener of listeners.get(message.method) || []) listener(message.params);
});

function send(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

function on(method, listener) {
  const current = listeners.get(method) || [];
  current.push(listener);
  listeners.set(method, current);
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(expression, timeoutMs = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const value = await evaluate(expression);
    if (value) return value;
    await sleep(200);
  }
  throw new Error(`Tiempo agotado esperando: ${expression}`);
}

await Promise.all([send('Page.enable'), send('Runtime.enable'), send('Network.enable')]);
if (mode === 'error') await send('Network.setBlockedURLs', { urls: ['*/api/chat'] });
let chatPosts = 0;
let contactPosts = 0;
on('Network.requestWillBeSent', ({ request }) => {
  const url = new URL(request.url);
  if (request.method === 'POST' && url.pathname === '/api/chat') chatPosts += 1;
  if (request.method === 'POST' && url.pathname === '/api/contact') contactPosts += 1;
});

await send('Page.navigate', { url: baseUrl });
await waitFor("document.querySelector('.chat-trigger') !== null", 20000);

if (mode === 'contact') {
  await evaluate(`(() => {
    document.getElementById('contacto').scrollIntoView();
    const set = (selector, value) => {
      const input = document.querySelector(selector);
      const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value');
      descriptor.set.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    set('#contacto input[formcontrolname="name"]', 'Prueba E2E Café Altura');
    set('#contacto input[formcontrolname="email"]', 'codex-e2e@cafe-altura.test');
    set('#contacto textarea[formcontrolname="message"]', 'Mensaje temporal para verificar el formulario de contacto.');
    document.querySelector('#contacto button[type="submit"]').click();
    return true;
  })()`);
  await waitFor("document.querySelector('#contacto .form-status')?.textContent.trim()", 15000);
  const result = await evaluate(`({
    url: location.href,
    contactPosts: ${contactPosts},
    status: document.querySelector('#contacto .form-status')?.textContent.trim() || null,
    atContact: Math.abs(document.getElementById('contacto').getBoundingClientRect().top) < innerHeight
  })`);
  result.contactPosts = contactPosts;
  console.log(JSON.stringify(result));
  socket.close();
  process.exit(0);
}

const question = mode === 'enter'
  ? 'cuanto esta el cold brew citrico'
  : '\u00bfCu\u00e1nto cuesta el Cold brew c\u00edtrico?';

await evaluate(`(() => {
  document.getElementById('precios').scrollIntoView();
  document.querySelector('.chat-trigger').click();
  window.__e2eScrollBefore = scrollY;
  return true;
})()`);
await waitFor("document.querySelector('.chat-panel input') !== null");
await evaluate(`(() => {
  const input = document.querySelector('.chat-panel input');
  const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value');
  descriptor.set.call(input, ${JSON.stringify(question)});
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.focus();
  return true;
})()`);

if (mode === 'enter') {
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
  await send('Input.dispatchKeyEvent', { type: 'char', text: '\r', unmodifiedText: '\r', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
} else {
  await evaluate("document.querySelector('.chat-panel button[type=\"submit\"]').click()");
}

await sleep(1200);
const immediate = await evaluate(`({
  url: location.href,
  panelOpen: document.querySelector('.chat-panel') !== null,
  scrollBefore: window.__e2eScrollBefore || 0,
  scrollAfter: scrollY,
  inputValue: document.querySelector('.chat-panel input')?.value ?? null
})`);

if (immediate.panelOpen) {
  await waitFor("document.querySelectorAll('.chat-panel .messages p').length >= 3 && !document.querySelector('.chat-panel .typing')", 70000);
}

let failureState = null;
if (mode === 'error') {
  failureState = await evaluate(`({
    panelOpen: document.querySelector('.chat-panel') !== null,
    inputValue: document.querySelector('.chat-panel input')?.value ?? null,
    errorText: document.querySelector('.chat-panel .messages p.error')?.textContent.trim() ?? null,
    retryVisible: document.querySelector('.chat-panel .retry') !== null
  })`);
  await send('Network.setBlockedURLs', { urls: [] });
  await evaluate("document.querySelector('.chat-panel .retry').click()");
  await waitFor("document.querySelectorAll('.chat-panel .messages p').length >= 3 && !document.querySelector('.chat-panel .typing') && !document.querySelector('.chat-panel .messages p.error')", 70000);
}

const finalState = await evaluate(`({
  url: location.href,
  panelOpen: document.querySelector('.chat-panel') !== null,
  scrollBefore: window.__e2eScrollBefore || 0,
  scrollAfter: scrollY,
  inputValue: document.querySelector('.chat-panel input')?.value ?? null,
  lastMessage: [...document.querySelectorAll('.chat-panel .messages p')].at(-1)?.textContent.trim() ?? null,
  menuItemText: [...document.querySelectorAll('#precios .menu-item')].find(item => item.textContent.toLowerCase().includes('cold brew'))?.textContent.replace(/\s+/g, ' ').trim() ?? null,
  errorVisible: document.querySelector('.chat-panel .messages p.error') !== null,
  retryVisible: document.querySelector('.chat-panel .retry') !== null
})`);
finalState.chatPosts = chatPosts;
finalState.immediate = immediate;
finalState.failureState = failureState;
console.log(JSON.stringify(finalState));
socket.close();
