/* contact-form.js — formulaire de contact (chargé sur contact.html uniquement) */
(function () {
  'use strict';
  const form = document.getElementById('contact-form');
  if (!form) return;
  const success = document.getElementById('form-success');
  const status = document.getElementById('form-status');
  const select = form.elements.service;

  // 1. Présélection du service quand on arrive depuis une page de service (?service=cloud-devops)
  const wanted = new URLSearchParams(location.search).get('service');
  if (wanted && [...select.options].some((o) => o.value === wanted)) select.value = wanted;

  function showSuccess(text) {
    document.getElementById('form-success-text').textContent = text;
    form.hidden = true;
    success.hidden = false;
    success.focus();
  }

  // 2. Envoi : vers un service d'envoi si data-endpoint est renseigné, sinon via le client mail du visiteur
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.classList.remove('is-error');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const d = Object.fromEntries(new FormData(form));
    const service = select.selectedOptions[0].textContent;

    if (form.dataset.endpoint) {
      try {
        const res = await fetch(form.dataset.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...d, service })
        });
        if (!res.ok) throw new Error(res.status);
        showSuccess('Merci ' + d.name + ', votre message a bien été envoyé. Nous vous répondons rapidement.');
      } catch (err) {
        status.textContent = "L'envoi a échoué. Réessayez ou écrivez-nous directement à " + form.dataset.mailto + '.';
        status.classList.add('is-error');
      }
      return;
    }

    const subject = '[Site @rchitech] ' + service + ' — ' + d.name;
    const bodyText = 'Nom : ' + d.name + '\nEmail : ' + d.email + '\nService : ' + service + '\n\n' + d.message;
    location.href = 'mailto:' + form.dataset.mailto +
      '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyText);
    showSuccess("Votre application de messagerie s'ouvre avec votre message prêt à envoyer. " +
      "Si rien ne s'ouvre, écrivez-nous à " + form.dataset.mailto + '.');
  });

  document.getElementById('form-reset').addEventListener('click', () => {
    form.reset();
    success.hidden = true;
    form.hidden = false;
    form.elements.name.focus();
  });
})();
