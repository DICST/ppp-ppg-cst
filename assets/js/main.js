'use strict';

// Revela elementos ao entrarem na viewport
const reveal = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      reveal.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => reveal.observe(el));

// Destaca o link ativo da navegação conforme a rolagem
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const scrollSpy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      navLinks.forEach((a) => {
        a.style.color = a.getAttribute('href') === '#' + e.target.id ? 'var(--text-0)' : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach((s) => scrollSpy.observe(s));
