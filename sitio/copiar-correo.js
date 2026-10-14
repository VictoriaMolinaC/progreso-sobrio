// Botón "Copiar correo": copia la dirección al portapapeles; si el navegador no lo permite, la deja seleccionada.
document.getElementById('copy-mail').addEventListener('click', function () {
  var btn = this, text = document.getElementById('mail').textContent;
  function done() { btn.textContent = 'Copiado'; btn.setAttribute('data-done', ''); setTimeout(function () { btn.textContent = 'Copiar correo'; btn.removeAttribute('data-done'); }, 2000); }
  function fallback() { var r = document.createRange(); r.selectNodeContents(document.getElementById('mail')); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
  try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
});
