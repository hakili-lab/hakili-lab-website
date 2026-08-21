var form = document.getElementById('contactForm');

if (form) {
  var whatsappBtn = document.getElementById('whatsappBtn');
  var statusEl = document.getElementById('contactFormStatus');

  function fieldValue(name) {
    var field = form.elements[name];
    return field ? field.value.trim() : '';
  }

  function showStatus(kind, text) {
    if (!statusEl) return;
    statusEl.className = 'form-status is-' + kind;
    statusEl.textContent = text;
    statusEl.hidden = false;
  }

  whatsappBtn.addEventListener('click', function () {
    var nom = fieldValue('nom');
    var telephone = fieldValue('telephone');

    if (!nom || !telephone) {
      var missing = [];
      if (!nom) missing.push('le nom du parent');
      if (!telephone) missing.push('le téléphone');
      showStatus('error', 'Merci de renseigner ' + missing.join(' et ') + " avant d'envoyer sur WhatsApp.");
      return;
    }

    var classe = fieldValue('classe');
    var centre = fieldValue('centre');
    var objet = fieldValue('objet');
    var message = fieldValue('message');

    var lines = ['Bonjour Hakili Lab,', '', 'Je souhaite inscrire mon enfant.', '', 'Parent : ' + nom, 'Téléphone : ' + telephone];
    if (classe) lines.push('Classe : ' + classe);
    if (centre) lines.push('Centre souhaité : ' + centre);
    if (objet) lines.push('Demande : ' + objet);
    if (message) { lines.push(''); lines.push(message); }

    var url = 'https://wa.me/22652932598?text=' + encodeURIComponent(lines.join('\n'));
    window.open(url, '_blank', 'noopener');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var nom = fieldValue('nom');
    var telephone = fieldValue('telephone');
    if (!nom || !telephone) {
      var missing = [];
      if (!nom) missing.push('le nom du parent');
      if (!telephone) missing.push('le téléphone');
      showStatus('error', 'Merci de renseigner ' + missing.join(' et ') + ' avant l\'envoi.');
      return;
    }

    showStatus('sending', 'Envoi en cours…');

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          showStatus('success', 'Votre demande a bien été envoyée. Nous vous répondrons rapidement.');
          form.reset();
        } else {
          showStatus('error', "L'envoi a échoué. Merci de réessayer ou de nous contacter par WhatsApp.");
        }
      })
      .catch(function () {
        showStatus('error', "L'envoi a échoué. Merci de réessayer ou de nous contacter par WhatsApp.");
      });
  });
}
