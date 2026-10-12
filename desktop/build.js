// Genera el .exe portable y el instalador en desktop/dist/ con la versión del juego.
const fs = require('fs');
const path = require('path');
const { build, Platform } = require('electron-builder');
const version = fs.readFileSync(path.join(__dirname, 'app', 'version.txt'), 'utf8').trim();
build({
  targets: Platform.WINDOWS.createTarget(process.env.TARGETS ? process.env.TARGETS.split(',') : undefined),
  config: { extraMetadata: { version } },
  publish: 'never',
}).then(r => console.log('Listo:\n' + r.join('\n'))).catch(e => { console.error(e); process.exit(1); });
