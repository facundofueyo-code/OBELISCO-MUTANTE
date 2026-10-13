// Obelisco Mutante — envoltorio de escritorio (Electron).
// Carga app/obelisco-mutante.html tal cual (lo copia preparar.js desde la raíz del repo).
// No modifica el juego: solo le pone ventana propia, fuentes locales y los modos de pantalla
// (el juego los pide desde Opciones > Video por window.escritorio, ver preload.js).
const { app, BrowserWindow, session, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Modo de pantalla (Opciones > Video del juego): 'ventana', 'completa' o 'sinbordes'.
// Se guarda acá también para arrancar directo en el último modo, sin pasar por la ventana.
const MODOS = ['ventana', 'completa', 'sinbordes'];
const archivoModo = () => path.join(app.getPath('userData'), 'pantalla.json');
function leerModo() {
  try { const m = JSON.parse(fs.readFileSync(archivoModo(), 'utf8')).modo; return MODOS.includes(m) ? m : 'ventana'; }
  catch (e) { return 'ventana'; }
}
function guardarModo(m) { try { fs.writeFileSync(archivoModo(), JSON.stringify({ modo: m })); } catch (e) {} }

// Que use la placa de video aunque Chromium la tenga en su lista negra.
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');

function crearVentana() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 960,
    minHeight: 540,
    backgroundColor: '#000000',
    title: 'Obelisco Mutante',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
    },
  });
  Menu.setApplicationMenu(null);
  // Modos de pantalla. Chromium no tiene pantalla completa exclusiva de verdad: los dos modos completos
  // ocupan toda la pantalla sin bordes; la diferencia es qué pasa al cambiar de programa (Alt+Tab).
  //   completa:  se minimiza al perder el foco, como un juego en pantalla completa exclusiva.
  //   sinbordes: queda a la vista detrás de lo otro (segundo monitor, Alt+Tab rápido).
  let modo = leerModo();
  let ultimoCompleto = modo === 'sinbordes' ? 'sinbordes' : 'completa';
  function aplicar(m, avisar) {
    if (!MODOS.includes(m)) return;
    modo = m;
    if (m !== 'ventana') ultimoCompleto = m;
    guardarModo(m);
    if (m === 'ventana') { if (win.isFullScreen()) win.setFullScreen(false); if (!win.isMaximized()) win.maximize(); }
    else { if (win.isMinimized()) win.restore(); if (!win.isFullScreen()) win.setFullScreen(true); }
    if (avisar) win.webContents.send('pantalla', m);
  }
  ipcMain.removeHandler('pantalla');
  ipcMain.handle('pantalla', (_e, m) => aplicar(m, false));
  win.on('blur', () => { if (modo === 'completa' && win.isFullScreen()) win.minimize(); });
  win.on('restore', () => { if (modo !== 'ventana' && !win.isFullScreen()) win.setFullScreen(true); });

  win.once('ready-to-show', () => {
    win.maximize();
    if (modo !== 'ventana') win.setFullScreen(true);
    win.show();
  });

  // F11 y Alt+Enter = de ventana a pantalla completa (el último modo completo elegido) y vuelta.
  // F12 = herramientas de desarrollo (para medir rendimiento).
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.key === 'Enter' && input.alt)) {
      aplicar(modo === 'ventana' ? ultimoCompleto : 'ventana', true); e.preventDefault();
    }
    if (input.key === 'F12') { win.webContents.toggleDevTools(); e.preventDefault(); }
  });

  // Los links externos no abren ventanas nuevas dentro del juego.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  // El título lo pone el <title> del juego (incluye la versión).
  win.loadFile(path.join(__dirname, 'app', 'obelisco-mutante.html'));
}

app.whenReady().then(() => {
  // Las fuentes vienen dentro de la app (preload.js): se cortan los pedidos a Google Fonts
  // para que el juego se vea igual con o sin internet.
  session.defaultSession.webRequest.onBeforeRequest(
    { urls: ['*://fonts.googleapis.com/*', '*://fonts.gstatic.com/*'] },
    (_d, cb) => cb({ cancel: true })
  );
  crearVentana();
});

app.on('window-all-closed', () => app.quit());
