var brochureForm = document.getElementById('brochureForm');

if (brochureForm) {
  var emailInput = brochureForm.elements.email;
  var statusEl = document.getElementById('brochureFormStatus');
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showStatus(kind, text) {
    if (!statusEl) return;
    statusEl.className = 'form-status is-' + kind;
    statusEl.textContent = text;
    statusEl.hidden = false;
  }

  brochureForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var email = emailInput.value.trim();
    if (!EMAIL_RE.test(email)) {
      showStatus('error', 'Merci de renseigner une adresse électronique valide.');
      return;
    }

    showStatus('sending', 'Envoi en cours…');

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(brochureForm)
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          showStatus('success', 'Merci ! La plaquette vous sera envoyée par e-mail.');
          brochureForm.reset();
        } else {
          showStatus('error', "L'envoi a échoué. Merci de réessayer.");
        }
      })
      .catch(function () {
        showStatus('error', "L'envoi a échoué. Merci de réessayer.");
      });
  });
}
