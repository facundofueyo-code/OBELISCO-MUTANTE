const { contextBridge, ipcRenderer } = require('electron');

// Puente con la ventana de escritorio: el juego pide el modo de pantalla (Opciones > Video)
// y se entera cuando cambia con F11 o Alt+Enter. También cierra el programa (Salir del juego).
contextBridge.exposeInMainWorld('escritorio', {
  pantalla: (modo) => ipcRenderer.invoke('pantalla', String(modo)),
  alCambiar: (cb) => ipcRenderer.on('pantalla', (_e, modo) => cb(modo)),
  salir: () => ipcRenderer.invoke('salir'),   // botón «Salir del juego» del menú principal (v2.8.0)
});

// Inyecta las fuentes del juego (Chakra Petch y Creepster) desde archivos locales,
// así no depende de Google Fonts ni de tener internet.
window.addEventListener('DOMContentLoaded', () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'fonts/fonts.css';
  document.head.prepend(link);
});
