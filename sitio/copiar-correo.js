// Tarjeta del correo: al tocarla copia la dirección al portapapeles y muestra un ✓ por unos segundos.
// Si el navegador no deja usar el portapapeles, copia con un campo oculto; si tampoco se puede, lo dice bajo el correo.
(function () {
  var btn = document.getElementById('copy-mail');
  if (!btn) return;
  var mail = document.getElementById('mail').textContent.trim();
  var hint = document.getElementById('copy-hint');
  var status = document.getElementById('copy-status');
  var timer;

  function show(copied) {
    hint.textContent = copied ? '' : 'No se pudo copiar: escríbelo a mano';
    status.textContent = copied ? 'Correo copiado' : 'No se pudo copiar el correo';
    if (copied) btn.setAttribute('data-done', '');
    clearTimeout(timer);
    timer = setTimeout(function () {
      btn.removeAttribute('data-done');
      hint.textContent = '';
      status.textContent = '';
    }, 2500);
  }

  function fallback() {
    var area = document.createElement('textarea');
    area.value = mail;
    area.setAttribute('readonly', '');
    area.className = 'copy-buffer';
    document.body.appendChild(area);
    area.select();
    var copied = document.execCommand('copy');
    document.body.removeChild(area);
    btn.focus();
    show(copied);
  }

  btn.addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(mail).then(function () { show(true); }, fallback);
    } else {
      fallback();
    }
  });
})();
