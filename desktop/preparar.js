// Copia la versión actual del juego (../obelisco-mutante.html) y las fuentes a app/.
// Se corre solo con "npm run jugar" o "npm run build".
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const app = path.join(__dirname, 'app');
const fonts = path.join(app, 'fonts');
fs.rmSync(app, { recursive: true, force: true });
fs.mkdirSync(fonts, { recursive: true });

const juego = path.join(raiz, 'obelisco-mutante.html');
const html = fs.readFileSync(juego, 'utf8');
fs.copyFileSync(juego, path.join(app, 'obelisco-mutante.html'));
const m = html.match(/GAME_VERSION\s*=\s*["']([\d.]+)["']/);
if (!m) throw new Error('No encontré GAME_VERSION en obelisco-mutante.html');
fs.writeFileSync(path.join(app, 'version.txt'), m[1]);

const fuentes = [
  ['Chakra Petch', '@fontsource/chakra-petch', 'chakra-petch', [400, 600, 700]],
  ['Creepster', '@fontsource/creepster', 'creepster', [400]],
];
const subsets = ['latin', 'latin-ext'];
let css = '';
for (const [familia, paquete, slug, pesos] of fuentes) {
  const dir = path.join(path.dirname(require.resolve(paquete + '/package.json')), 'files');
  for (const peso of pesos) for (const sub of subsets) {
    const archivo = `${slug}-${sub}-${peso}-normal.woff2`;
    const src = path.join(dir, archivo);
    if (!fs.existsSync(src)) continue;
    fs.copyFileSync(src, path.join(fonts, archivo));
    css += `@font-face{font-family:'${familia}';font-style:normal;font-weight:${peso};font-display:swap;src:url('${archivo}') format('woff2');}\n`;
  }
}
fs.writeFileSync(path.join(fonts, 'fonts.css'), css);
console.log(`Juego v${m[1]} copiado a desktop/app/ con ${css.split('\n').length - 1} fuentes locales.`);
