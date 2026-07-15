/* =============================================================
   Winia Nawasirikhun — Teacher Assistant Portfolio
   script.js  (vanilla JS, no dependencies except Bootstrap bundle)
   ============================================================= */

(function () {
  'use strict';

  // ------- 1) Navbar shadow on scroll -------
  const nav = document.getElementById('mainNav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ------- 2) Close mobile menu after clicking a link -------
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const collapseEl = document.getElementById('navMenu');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (collapseEl && collapseEl.classList.contains('show')) {
        // Use Bootstrap Collapse API if available
        const bsCollapse =
          bootstrap.Collapse.getInstance(collapseEl) ||
          new bootstrap.Collapse(collapseEl, { toggle: false });
        bsCollapse.hide();
      }
    });
  });

  // ------- 3) Active nav link via IntersectionObserver -------
  // (Bootstrap scrollspy is also enabled via data attributes as a fallback.)
  const sections = document.querySelectorAll(
    '#home, #about, #experience, #skills, #responsibilities, #gallery, #certificates, #contact'
  );
  const navLookup = {};
  navLinks.forEach((l) => {
    const href = l.getAttribute('href');
    if (href && href.startsWith('#')) navLookup[href.slice(1)] = l;
  });

  const setActive = (id) => {
    navLinks.forEach((l) => l.classList.remove('active'));
    const link = navLookup[id];
    if (link) link.classList.add('active');
  };

  if ('IntersectionObserver' in window && sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
  }

  // ------- 4) Scroll reveal animation -------
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealItems.length) {
    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealItems.forEach((el) => revealIO.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('is-visible'));
  }

  // ------- 5) Contact form validation + EmailJS submission -------
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;

  const emailConfig = {
    serviceId: 'service_xxxxx',
    templateId: 'template_xxxxx',
    publicKey: 'your_public_key'
  };

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());

  const setStatus = (msg, ok) => {
    if (!status) return;
    status.textContent = msg;
    status.classList.remove('ok', 'err');
    status.classList.add(ok ? 'ok' : 'err');
  };

  const setSubmitState = (isSending) => {
    if (!submitButton) return;
    submitButton.disabled = isSending;
    submitButton.innerHTML = isSending
      ? '<span class="me-2"><i class="bi bi-arrow-repeat"></i></span> Sending...'
      : '<i class="bi bi-send-fill"></i> Send Message';
  };

  if (form) {
    if (typeof window.emailjs !== 'undefined' && emailConfig.publicKey && !emailConfig.publicKey.includes('your_')) {
      emailjs.init(emailConfig.publicKey);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setStatus('', true);

      const name = form.querySelector('#name');
      const email = form.querySelector('#email');
      const subject = form.querySelector('#subject');
      const message = form.querySelector('#message');

      [name, email, subject, message].forEach((el) => el.classList.remove('is-invalid'));

      let ok = true;
      if (!name.value.trim()) { name.classList.add('is-invalid'); ok = false; }
      if (!isValidEmail(email.value)) { email.classList.add('is-invalid'); ok = false; }
      if (!subject.value.trim()) { subject.classList.add('is-invalid'); ok = false; }
      if (!message.value.trim() || message.value.trim().length < 5) {
        message.classList.add('is-invalid'); ok = false;
      }

      if (!ok) {
        setStatus('Please fill in all fields correctly.', false);
        return;
      }

      if (!window.emailjs || emailConfig.serviceId.includes('xxxxx') || emailConfig.templateId.includes('xxxxx') || emailConfig.publicKey.includes('your_')) {
        setStatus('Email service is not configured yet. Please add your EmailJS credentials in script.js.', false);
        return;
      }

      setSubmitState(true);

      try {
        await emailjs.send(
          emailConfig.serviceId,
          emailConfig.templateId,
          {
            from_name: name.value.trim(),
            from_email: email.value.trim(),
            subject: subject.value.trim(),
            message: message.value.trim(),
            to_email: 'your.email@example.com'
          },
          emailConfig.publicKey
        );

        setStatus('Thank you! Your message has been sent successfully.', true);
        form.reset();
        setTimeout(() => setStatus('', true), 6000);
      } catch (error) {
        console.error('EmailJS error:', error);
        setStatus('Something went wrong while sending the message. Please try again later.', false);
      } finally {
        setSubmitState(false);
      }
    });

    form.querySelectorAll('input, textarea').forEach((el) => {
      el.addEventListener('input', () => el.classList.remove('is-invalid'));
    });
  }

  // ------- 6) Year in footer (kept static per requirements: © 2026) -------
  // If you'd like it dynamic later:
  // document.querySelector('.site-footer p').textContent = `© ${new Date().getFullYear()} Arada Nawasirikhun. All rights reserved.`;
})();
