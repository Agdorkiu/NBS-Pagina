/* =========================================
   NOMAD BYTE STUDIOS — nav.js
   Active nav link + scroll reveal
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Active nav link ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---- Fade-up on scroll (for elements with .reveal class) ---- */
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-fade-up');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));
  }
});