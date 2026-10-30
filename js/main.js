/* main.js — menu latéral (commun à toutes les pages) */
(function () {
  'use strict';
  const body = document.body;
  const toggle = document.querySelector('.sidebar-toggle');
  const scrim = document.querySelector('.sidebar-scrim');
  const isMobile = () => window.matchMedia('(max-width: 800px)').matches;
  const isOpen = () => isMobile()
    ? body.classList.contains('sidebar-open')
    : !body.classList.contains('sidebar-collapsed');

  function setOpen(open) {
    if (isMobile()) body.classList.toggle('sidebar-open', open);
    else body.classList.toggle('sidebar-collapsed', !open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  scrim.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isMobile()) setOpen(false); });
  window.addEventListener('resize', () => {
    if (!isMobile()) body.classList.remove('sidebar-open');
    toggle.setAttribute('aria-expanded', String(isOpen()));
  });
  toggle.setAttribute('aria-expanded', String(isOpen()));   // sur mobile le menu démarre fermé
})();
