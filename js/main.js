/* Vancouver Combat Robots — main.js */

// --- Update copyright year ---
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- Mobile nav toggle ---
const hamburger = document.querySelector('.nav-hamburger');
const navLinks  = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = navLinks.style.display === 'flex';
    navLinks.style.display = open ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '60px';
    navLinks.style.left = '0';
    navLinks.style.right = '0';
    navLinks.style.background = 'rgba(10,10,10,.97)';
    navLinks.style.padding = '1rem 1.5rem 1.5rem';
    navLinks.style.gap = '1rem';
    navLinks.style.borderBottom = '1px solid #2e333c';
    hamburger.setAttribute('aria-expanded', !open);
  });

  // Close nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.style.display = 'none';
    });
  });
}

// --- Scroll-reveal: fade in sections on scroll ---
const revealEls = document.querySelectorAll('.section, .league-card, .event-detail, .sponsor-card');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});

// Triggered class
const style = document.createElement('style');
style.textContent = '.revealed { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(style);

// --- Ticker: dynamically fill width, then reveal and animate ---
// Strategy:
//   1. Keep one canonical "set" of spans in the HTML (the source of truth).
//   2. After fonts load, measure how wide that one set is.
//   3. Clone it enough times so the total track width is at least 2× the
//      viewport — this guarantees the loop seam is never visible regardless
//      of screen size or zoom level.
//   4. Animate translateX(-50%) so it scrolls exactly one full copy's worth
//      before snapping back to the start seamlessly.
//   5. Re-run on resize so it stays correct if the window changes.

const ticker      = document.querySelector('.hero-ticker');
const tickerTrack = document.querySelector('.ticker-track');

function buildTicker() {
  if (!ticker || !tickerTrack) return;

  // Grab the original spans as the canonical set, then clear the track.
  const originalSpans = Array.from(tickerTrack.children);
  tickerTrack.innerHTML = '';

  // Build one "set" as a template fragment.
  function makeSet() {
    const frag = document.createDocumentFragment();
    originalSpans.forEach(span => frag.appendChild(span.cloneNode(true)));
    return frag;
  }

  // Insert the first set and measure it.
  tickerTrack.appendChild(makeSet());
  const setWidth = tickerTrack.scrollWidth;
  const needed   = window.innerWidth * 2; // need at least 2× viewport

  // Add more sets until we have enough.
  // We already have 1 set; keep adding until total >= needed * 2
  // (the animation moves -50%, so we need double what's visible).
  const totalSetsNeeded = Math.ceil((needed * 2) / setWidth);
  for (let i = 1; i < totalSetsNeeded; i++) {
    tickerTrack.appendChild(makeSet());
  }

  // Recalculate the full track width and set the animation distance.
  // We move exactly half the total width — the second half is identical
  // to the first, so the loop is invisible.
  const totalWidth = tickerTrack.scrollWidth;
  const halfPct    = (totalWidth / 2 / totalWidth * 100).toFixed(4) + '%';

  // Inject a keyframe scoped to the exact pixel distance.
  // Using a px value on a percentage-based element is more reliable
  // than relying on the -50% shorthand when clones vary.
  const halfPx = totalWidth / 2;
  const styleEl = document.getElementById('ticker-keyframe') || document.createElement('style');
  styleEl.id = 'ticker-keyframe';
  styleEl.textContent = `
    @keyframes ticker {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-${halfPx}px); }
    }
  `;
  document.head.appendChild(styleEl);

  // Reset animation so the new keyframe takes effect immediately.
  tickerTrack.style.animation = 'none';
  tickerTrack.offsetHeight; // force reflow
  tickerTrack.style.animation = '';
}

document.fonts.ready.then(() => {
  buildTicker();
  ticker.classList.add('ticker-ready');
  tickerTrack.classList.add('ticker-running');
});

// Rebuild on resize (debounced) in case viewport width changes significantly.
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ticker.classList.remove('ticker-ready');
    tickerTrack.classList.remove('ticker-running');
    buildTicker();
    ticker.classList.add('ticker-ready');
    tickerTrack.classList.add('ticker-running');
  }, 200);
});

// --- Next event date calculator ---
// Calculates the next 13th of the month and injects it into the page
function getNextEventDate() {
  const now = new Date();
  let year  = now.getFullYear();
  let month = now.getMonth(); // 0-indexed

  // If today IS the 13th, show today
  // If past the 13th, jump to next month
  const candidate = new Date(year, month, 13);
  if (now > candidate) {
    month += 1;
    if (month > 11) { month = 0; year += 1; }
  }

  const nextDate = new Date(year, month, 13);
  return nextDate.toLocaleDateString('en-CA', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric'
  });
}

// Inject next event date into the event-value field if we find the "Every 13th" line
const eventValues = document.querySelectorAll('.event-value');
eventValues.forEach(el => {
  if (el.textContent.includes('Every 13th')) {
    const nextDateEl = document.createElement('p');
    nextDateEl.className = 'event-value-sub';
    nextDateEl.style.marginTop = '.35rem';
    nextDateEl.style.color = '#ffc947';
    nextDateEl.textContent = 'Next: ' + getNextEventDate();
    el.after(nextDateEl);
  }
});
