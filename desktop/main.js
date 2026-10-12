// Obelisco Mutante — envoltorio de escritorio (Electron).
// Carga app/obelisco-mutante.html tal cual (lo copia preparar.js desde la raíz del repo).
// No modifica el juego: solo le pone ventana propia, fuentes locales y pantalla completa.
const { app, BrowserWindow, session, Menu } = require('electron');
const path = require('path');

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
  win.once('ready-to-show', () => { win.maximize(); win.show(); });

  // F11 = pantalla completa. F12 = herramientas de desarrollo (para medir rendimiento).
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
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
