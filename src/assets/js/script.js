'use strict';

// ============================
// SIDEBAR TOGGLE
// ============================
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");
sidebarBtn.addEventListener("click", function () {
  sidebar.classList.toggle("active");
});


// ============================
// TESTIMONIALS MODAL
// ============================
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
};

for (let i = 0; i < testimonialsItem.length; i++) {
  testimonialsItem[i].addEventListener("click", function () {
    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;
    testimonialsModalFunc();
  });
}

modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);


// ============================
// PORTFOLIO FILTER
// ============================
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-select-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");
const filterItems = document.querySelectorAll("[data-filter-item]");

select.addEventListener("click", function () { this.classList.toggle("active"); });

for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {
    var selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    select.classList.remove("active");
    filterFunc(selectedValue);
  });
}

var filterFunc = function (selectedValue) {
  for (var i = 0; i < filterItems.length; i++) {
    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }
  }
};

var lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {
  filterBtn[i].addEventListener("click", function () {
    var selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);
    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;
  });
}


// ============================
// CONTACT FORM VALIDATION
// ============================
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }
  });
}


// ============================
// PAGE NAVIGATION (data-target based)
// ============================
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

navigationLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    var target = this.dataset.target;

    // Deactivate all pages & links
    pages.forEach(function (page) { page.classList.remove("active"); });
    navigationLinks.forEach(function (nav) { nav.classList.remove("active"); });

    // Activate the clicked link
    this.classList.add("active");

    // Activate matching page
    pages.forEach(function (page) {
      if (page.dataset.page === target) {
        // Remove hidden attribute if present (for portfolio/contact)
        page.removeAttribute("hidden");
        page.classList.add("active");
      }
    });

    window.scrollTo(0, 0);

    // Re-trigger animations
    var activePage = document.querySelector('article.active');
    if (activePage) {
      resetReveals(activePage);
      setTimeout(triggerReveals, 100);
      setTimeout(animateSkillBars, 300);
    }
  });
});


// ============================
// iOS DOCK MAGNIFICATION
// ============================
var dock = document.getElementById('dock');

if (dock) {
  var dockItems = dock.querySelectorAll('.navbar-item:not([hidden])');
  var isTouch = false;

  // Detect touch to disable magnification
  dock.addEventListener('touchstart', function () { isTouch = true; }, { passive: true });

  dock.addEventListener('mousemove', function (e) {
    if (isTouch) return;
    var mouseX = e.clientX;

    dockItems.forEach(function (item) {
      var rect = item.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var dist = Math.abs(mouseX - centerX);
      var maxDist = 100;

      if (dist < maxDist) {
        var ratio = 1 - dist / maxDist;
        var scale = 1 + 0.12 * ratio;
        var lift = -3 * ratio;
        item.style.transform = 'scale(' + scale + ') translateY(' + lift + 'px)';
      } else {
        item.style.transform = '';
      }
    });
  });

  dock.addEventListener('mouseleave', function () {
    dockItems.forEach(function (item) {
      item.style.transform = '';
    });
  });
}


// ============================
// STAGGERED REVEAL ANIMATIONS
// ============================
function resetReveals(container) {
  container.querySelectorAll('.reveal').forEach(function (el) {
    el.classList.remove('visible');
  });
}

function triggerReveals() {
  var delay = 0;
  document.querySelectorAll('.reveal').forEach(function (el) {
    var article = el.closest('article');
    if (article && !article.classList.contains('active')) return;
    if (el.classList.contains('visible')) return;

    setTimeout(function () { el.classList.add('visible'); }, delay);
    delay += 80;
  });
}

// Intersection Observer for scroll reveals
var revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(function (el) {
  revealObserver.observe(el);
});

setTimeout(triggerReveals, 300);


// ============================
// ANIMATED SKILL BARS
// ============================
function animateSkillBars() {
  document.querySelectorAll('.skill-progress-fill').forEach(function (bar) {
    var inlineStyle = bar.getAttribute('style') || '';
    var match = inlineStyle.match(/width:\s*([\d]+%)/);
    if (!match) return;
    var targetWidth = match[1];
    bar.style.width = '0%';
    setTimeout(function () { bar.style.width = targetWidth; }, 100);
  });
}

var skillSection = document.querySelector('.skill');
if (skillSection) {
  var skillObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateSkillBars();
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  skillObserver.observe(skillSection);
}


// ============================
// LIGHTBOX FOR PORTFOLIO
// ============================
var lightbox = document.getElementById('lightbox');
var lightboxImg = document.getElementById('lightbox-img');
var lightboxTitle = document.getElementById('lightbox-title');

// Open lightbox when clicking a project item
document.querySelectorAll('.project-item > a').forEach(function (link) {
  link.addEventListener('click', function (e) {
    e.preventDefault();

    var img = this.querySelector('.project-img img');
    var title = this.querySelector('.project-title');

    if (img && lightbox) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxTitle.textContent = title ? title.textContent : '';
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });
});

// Close lightbox
function closeLightbox() {
  if (lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
}

document.querySelectorAll('[data-lightbox-close]').forEach(function (el) {
  el.addEventListener('click', closeLightbox);
});

// Close on Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeLightbox();
});


// ============================
// 3D TILT ON CARDS
// ============================
document.querySelectorAll('.service-item, .project-item > a, .blog-post-item > a').forEach(function (card) {
  card.addEventListener('mousemove', function (e) {
    var rect = this.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var centerX = rect.width / 2;
    var centerY = rect.height / 2;
    var rotateX = (y - centerY) / centerY * -4;
    var rotateY = (x - centerX) / centerX * 4;

    this.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-2px) scale(1.01)';
  });

  card.addEventListener('mouseleave', function () {
    this.style.transform = '';
  });
});


// ============================
// CURSOR GLOW (desktop only)
// ============================
if (window.matchMedia('(pointer: fine)').matches) {
  var glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  var mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function updateGlow() {
    glowX += (mouseX - glowX) * 0.15;
    glowY += (mouseY - glowY) * 0.15;
    glow.style.left = glowX + 'px';
    glow.style.top = glowY + 'px';
    requestAnimationFrame(updateGlow);
  }
  updateGlow();
}


// ============================
// ANIMATED COUNTERS FOR SKILLS
// ============================
function animateCounters() {
  document.querySelectorAll('.skill .title-wrapper data').forEach(function (el) {
    var target = parseInt(el.getAttribute('value'));
    var current = 0;
    var duration = 1200;
    var step = target / (duration / 16);

    function tick() {
      current += step;
      if (current >= target) {
        el.textContent = target + '%';
        return;
      }
      el.textContent = Math.round(current) + '%';
      requestAnimationFrame(tick);
    }
    el.textContent = '0%';
    setTimeout(tick, 100);
  });
}

// Hook into skill animation
var skillSectionForCounter = document.querySelector('.skill');
if (skillSectionForCounter) {
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounters();
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  counterObserver.observe(skillSectionForCounter);
}


// ============================
// SMOOTH PAGE LOAD
// ============================
document.body.style.opacity = '0';
window.addEventListener('load', function () {
  document.body.style.transition = 'opacity 0.6s ease';
  document.body.style.opacity = '1';
});
