// Inyecta las fuentes del juego (Chakra Petch y Creepster) desde archivos locales,
// así no depende de Google Fonts ni de tener internet.
window.addEventListener('DOMContentLoaded', () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'fonts/fonts.css';
  document.head.prepend(link);
});
