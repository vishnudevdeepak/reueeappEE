const TRANSITION_DURATION = 280;

function navigateTo(url) {
  const body = document.body;
  if (body.classList.contains('transitioning')) return;
  body.classList.add('transition-exit', 'transitioning');
  setTimeout(() => {
    window.location.href = url;
  }, TRANSITION_DURATION);
}

function goBack() {
  const body = document.body;
  if (body.classList.contains('transitioning')) return;
  body.classList.add('transition-exit', 'transitioning');
  setTimeout(() => {
    window.history.back();
  }, TRANSITION_DURATION);
}

function isInternalLink(anchor) {
  if (anchor.target && anchor.target !== '_self') return false;
  if (!anchor.href) return false;
  if (anchor.origin !== window.location.origin) return false;
  if (anchor.pathname === window.location.pathname && anchor.hash) return false;
  return true;
}

function attachPageTransitionLinks() {
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    if (!isInternalLink(anchor)) return;
    event.preventDefault();
    navigateTo(anchor.getAttribute('href'));
  });
}

function initNavSlider() {
  const nav = document.getElementById('navLinks');
  const slider = document.getElementById('navSlider');
  if (!nav || !slider) return;
  const items = Array.from(nav.querySelectorAll('.nav-item'));
  if (!items.length) return;

  const update = (link) => {
    const navRect = nav.getBoundingClientRect();
    const rect = link.getBoundingClientRect();
    slider.style.width = `${rect.width}px`;
    slider.style.left = `${rect.left - navRect.left}px`;
  };

  const reset = () => {
    const active = nav.querySelector('.nav-item.active') || items[0];
    if (active) update(active);
  };

  items.forEach(link => {
    link.addEventListener('mouseenter', () => update(link));
    link.addEventListener('focus', () => update(link));
    link.addEventListener('mouseleave', reset);
    link.addEventListener('blur', reset);
  });

  window.addEventListener('resize', reset);
  reset();
}

window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('transition-enter');
  attachPageTransitionLinks();
  initNavSlider();
});

window.addEventListener('pageshow', event => {
  if (event.persisted) {
    document.body.classList.add('transition-enter');
    document.body.classList.remove('transition-exit', 'transitioning');
  }
});
