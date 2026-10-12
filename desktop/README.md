# Obelisco Mutante — versión de escritorio

Envoltorio de Electron que abre `../obelisco-mutante.html` en una ventana propia, sin navegador.
El juego no se modifica: `preparar.js` copia la versión actual a `app/` cada vez que se arma.

- Fuentes (Chakra Petch y Creepster) incluidas: anda sin internet.
- F11: pantalla completa. F12: herramientas de desarrollo (para medir rendimiento).
- Los guardados (récord, opciones) quedan en la app, separados de los del navegador.

## Uso (requiere Node.js 22)

```
cd desktop
npm install        # solo la primera vez
npm run jugar      # abre el juego en la app
npm run build      # genera dist/ObeliscoMutante-X.Y.Z-portable.exe y el instalador
```

## En la nube

Al pushear un tag `vX.Y.Z`, GitHub Actions (`.github/workflows/escritorio.yml`) arma los .exe
en Windows y los publica en la pestaña Releases del repo. No hace falta tener la PC prendida.
