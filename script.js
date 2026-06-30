const isMobile = () => window.innerWidth <= 768;
const isTouchDevice = () => ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

// ---- Custom Cursor (desktop only) ----
const cd = document.getElementById('cd');
const cr = document.getElementById('cr');
if(!isTouchDevice()){
  document.addEventListener('mousemove', e => {
    cd.style.left = e.clientX + 'px'; cd.style.top = e.clientY + 'px';
    cr.style.left = e.clientX + 'px'; cr.style.top = e.clientY + 'px';
  });
  document.querySelectorAll('a,button,.sk,.cert-card,.exp-card,.proj-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cr.style.transform = 'translate(-50%,-50%) scale(1.8)';
      cr.style.borderColor = 'rgba(163,230,53,.8)';
    });
    el.addEventListener('mouseleave', () => {
      cr.style.transform = 'translate(-50%,-50%) scale(1)';
      cr.style.borderColor = 'rgba(163,230,53,.5)';
    });
  });
}

// ---- Toast Notification ----
function showToast(icon, msg, duration=2500){
  const tc = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<i class="${icon}"></i>${msg}`;
  tc.appendChild(t);
  setTimeout(() => {
    t.classList.add('out');
    setTimeout(() => t.remove(), 350);
  }, duration);
}

// ---- Ripple on Mobile Nav ----
document.querySelectorAll('.mob-nav-item').forEach(btn => {
  btn.addEventListener('touchstart', function(e){
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(this.offsetWidth, this.offsetHeight) * 1.5;
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${this.offsetWidth/2 - size/2}px;top:${this.offsetHeight/2 - size/2}px`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
    // Haptic feedback
    if(navigator.vibrate) navigator.vibrate(8);
  }, {passive:true});
});

// ---- Mobile Bottom Nav Active State ----
const mobNavItems = document.querySelectorAll('.mob-nav-item');
function updateMobNav(secId){
  mobNavItems.forEach(a => {
    a.classList.toggle('active', a.dataset.sec === secId);
  });
}
const allSecs = document.querySelectorAll('section[id]');
const mobNavObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) updateMobNav(e.target.id); });
},{threshold:.35, rootMargin:'-10% 0px -50% 0px'});
allSecs.forEach(s => mobNavObs.observe(s));

// ---- Desktop Nav Active State ----
const navAs = document.querySelectorAll('.nav-links a');
allSecs.forEach(s => new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting)
      navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#'+e.target.id));
  });
},{threshold:.35}).observe(s));

// ---- 3D Card — Mouse (desktop) ----
const card3d = document.getElementById('card3d');
if(card3d && !isTouchDevice()){
  card3d.parentElement.addEventListener('mousemove', e => {
    const rect = card3d.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width/2) / (rect.width/2);
    const dy = (e.clientY - rect.top - rect.height/2) / (rect.height/2);
    card3d.style.transform = `rotateY(${dx*12}deg) rotateX(${-dy*8}deg) translateZ(10px)`;
  });
  card3d.parentElement.addEventListener('mouseleave', () => {
    card3d.style.transform = 'rotateY(0) rotateX(0) translateZ(0)';
  });
}

// ---- 3D Card — Gyroscope + Touch Tilt (mobile) ----
if(card3d && isTouchDevice()){
  // Touch tilt
  card3d.addEventListener('touchmove', e => {
    const t = e.touches[0];
    const rect = card3d.getBoundingClientRect();
    const dx = (t.clientX - rect.left - rect.width/2) / (rect.width/2);
    const dy = (t.clientY - rect.top - rect.height/2) / (rect.height/2);
    card3d.style.transform = `rotateY(${dx*10}deg) rotateX(${-dy*6}deg) translateZ(8px)`;
  }, {passive:true});
  card3d.addEventListener('touchend', () => {
    card3d.style.transform = 'rotateY(0) rotateX(0) translateZ(0)';
  });

  // Device orientation tilt
  if(window.DeviceOrientationEvent){
    window.addEventListener('deviceorientation', e => {
      if(!document.querySelector('#hero').matches(':visible') && !isElementInViewport(card3d)) return;
      const tiltX = Math.max(-15, Math.min(15, e.gamma || 0));
      const tiltY = Math.max(-10, Math.min(10, (e.beta || 0) - 30));
      card3d.style.transform = `rotateY(${tiltX * .8}deg) rotateX(${-tiltY * .5}deg)`;
    }, {passive:true});
  }
}

function isElementInViewport(el){
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
}

// ---- Mobile Menu (hamburger - tablet only 600-768) ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if(hamburger){
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    hamburger.innerHTML = mobileMenu.classList.contains('open')
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
  }));
}

// ---- Reveal on Scroll ----
document.querySelectorAll('.reveal').forEach(el => {
  new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('vis'); });
  },{threshold:.08}).observe(el);
});

// ---- Project Filter ----
document.querySelectorAll('.pf-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if(navigator.vibrate) navigator.vibrate(6);
    document.querySelectorAll('.pf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.proj-card').forEach(c => {
      c.style.display = (f === 'all' || (c.dataset.type||'').includes(f)) ? '' : 'none';
    });
  });
});

// ---- Scroll Top ----
const stbtn = document.getElementById('stbtn');
window.addEventListener('scroll', () => stbtn.classList.toggle('show', window.scrollY > 400));
stbtn.addEventListener('click', () => {
  window.scrollTo({top:0,behavior:'smooth'});
  if(navigator.vibrate) navigator.vibrate(10);
});

// ---- Contact Form ----
const form = document.getElementById('contactForm');
form.addEventListener('submit', e => {
  e.preventDefault();
  const btn = form.querySelector('.f-submit');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;
  fetch(form.action, {method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}})
    .then(r => {
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
      btn.disabled = false;
      if(r.ok){
        form.reset();
        document.getElementById('form-success').style.display = 'block';
        if(isMobile()) showToast('fa-solid fa-check-circle', 'Message sent! 🎉');
        setTimeout(() => document.getElementById('form-success').style.display='none', 6000);
        if(navigator.vibrate) navigator.vibrate([20,50,20]);
      } else {
        showToast('fa-solid fa-triangle-exclamation', 'Error! Try again.');
      }
    }).catch(() => {
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
      btn.disabled = false;
      showToast('fa-solid fa-wifi', 'Network error!');
    });
});

// ---- Mobile Skills Swiper Dots ----
const swiper = document.getElementById('mobSkillsSwiper');
const dotsContainer = document.getElementById('swiperDots');
if(swiper && dotsContainer){
  const groups = swiper.querySelectorAll('.mob-skill-group');
  // Init dots
  function initDots(){
    if(!isMobile()){ dotsContainer.style.display='none'; return; }
    dotsContainer.style.display = 'flex';
    dotsContainer.innerHTML = '';
    groups.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'swiper-dot' + (i===0?' active':'');
      d.style.border = 'none'; d.style.cursor='pointer';
      d.addEventListener('click', () => {
        const g = groups[i];
        swiper.scrollTo({left: g.offsetLeft, behavior:'smooth'});
      });
      dotsContainer.appendChild(d);
    });
  }
  initDots();
  window.addEventListener('resize', initDots);

  // Update dots on scroll
  swiper.addEventListener('scroll', () => {
    const dots = dotsContainer.querySelectorAll('.swiper-dot');
    let closest = 0, minDist = Infinity;
    groups.forEach((g, i) => {
      const dist = Math.abs(g.offsetLeft - swiper.scrollLeft);
      if(dist < minDist){ minDist = dist; closest = i; }
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === closest));
  }, {passive:true});
}

// ---- Mobile Accordion for About Cards ----
function initAccordion(){
  if(!isMobile()) return;
  document.querySelectorAll('.icard').forEach((card, idx) => {
    const body = card.querySelector('.icard-body');
    if(!body) return;
    // Open first by default
    if(idx === 0) card.classList.add('open');
    card.addEventListener('click', () => {
      const wasOpen = card.classList.contains('open');
      document.querySelectorAll('.icard').forEach(c => c.classList.remove('open'));
      if(!wasOpen) card.classList.add('open');
      if(navigator.vibrate) navigator.vibrate(6);
    });
  });
}
initAccordion();

// ---- Pull-to-Refresh (visual only) ----
let ptrStart = 0, ptrActive = false;
const ptr = document.getElementById('ptrIndicator');
document.addEventListener('touchstart', e => {
  if(window.scrollY <= 0) ptrStart = e.touches[0].clientY;
}, {passive:true});
document.addEventListener('touchmove', e => {
  if(window.scrollY <= 0 && e.touches[0].clientY - ptrStart > 80){
    ptrActive = true;
    ptr.classList.add('show');
  }
}, {passive:true});
document.addEventListener('touchend', () => {
  if(ptrActive){
    ptrActive = false;
    setTimeout(() => ptr.classList.remove('show'), 1200);
    if(navigator.vibrate) navigator.vibrate([15,30,15]);
  }
}, {passive:true});

// ---- Haptic on all haptic-btn ----
document.querySelectorAll('.haptic-btn').forEach(btn => {
  btn.addEventListener('touchstart', () => {
    if(navigator.vibrate) navigator.vibrate(8);
  }, {passive:true});
});

// ---- Long press on contact links to copy ----
document.querySelectorAll('.clink').forEach(link => {
  let timer;
  link.addEventListener('touchstart', () => {
    timer = setTimeout(() => {
      const val = link.querySelector('.clink-val')?.textContent;
      if(val && navigator.clipboard){
        navigator.clipboard.writeText(val).then(() => {
          showToast('fa-solid fa-copy', `Copied!`);
          if(navigator.vibrate) navigator.vibrate([20,40,20]);
        });
      }
    }, 600);
  }, {passive:true});
  link.addEventListener('touchend', () => clearTimeout(timer), {passive:true});
  link.addEventListener('touchmove', () => clearTimeout(timer), {passive:true});
});

// ---- Hero reveal on load ----
setTimeout(() => document.querySelectorAll('#hero .reveal').forEach(el => el.classList.add('vis')), 100);

// ---- Show "swipe" hint toast on mobile after 2s ----
setTimeout(() => {
  if(isMobile()){
    showToast('fa-solid fa-hand-pointer', 'Long press contacts to copy!', 3500);
  }
}, 2500);