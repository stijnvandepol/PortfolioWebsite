'use strict';

// ============================
// BOOT SCREEN
// ============================
var bootScreen = document.getElementById('boot');
if (bootScreen) {
  setTimeout(function () { bootScreen.style.pointerEvents = 'none'; }, 2600);
}

// ============================
// MENU BAR CLOCK
// ============================
var clockEl = document.getElementById('menubar-clock');
function updateClock() {
  if (!clockEl) return;
  var now = new Date();
  var days = ['zo','ma','di','wo','do','vr','za'];
  var months = ['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
  clockEl.textContent = days[now.getDay()] + ' ' + now.getDate() + ' ' + months[now.getMonth()] + '  ' + now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
}
updateClock();
setInterval(updateClock, 10000);

// ============================
// MENU BAR DROPDOWNS
// ============================
var menus = document.querySelectorAll('[data-menu]');
var openMenu = null;

function closeAllMenus() {
  menus.forEach(function(m) { m.classList.remove('open'); });
  openMenu = null;
}

menus.forEach(function(menu) {
  var trigger = menu.querySelector('.mb-item');
  if (!trigger) return;
  trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    if (menu.classList.contains('open')) { closeAllMenus(); }
    else { closeAllMenus(); menu.classList.add('open'); openMenu = menu; }
  });
  trigger.addEventListener('mouseenter', function() {
    if (openMenu && openMenu !== menu) { closeAllMenus(); menu.classList.add('open'); openMenu = menu; }
  });
});

document.addEventListener('click', closeAllMenus);

document.querySelectorAll('.dd-item').forEach(function(item) {
  item.addEventListener('click', function(e) {
    e.stopPropagation(); closeAllMenus();
    var nav = this.getAttribute('data-nav');
    var href = this.getAttribute('data-href');
    if (nav) { navigateToPage(nav); }
    else if (href) { window.open(href, '_blank'); }
  });
});

// ============================
// CONTEXT MENU (right-click desktop)
// ============================
var ctxMenu = document.getElementById('ctx-menu');
var wallpaper = document.querySelector('.wallpaper');

if (wallpaper && ctxMenu) {
  wallpaper.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    var x = e.clientX, y = e.clientY;
    // Smart positioning: flip if too close to edges
    var mw = ctxMenu.offsetWidth || 256, mh = ctxMenu.offsetHeight || 200;
    if (x + mw > window.innerWidth) x = window.innerWidth - mw - 8;
    if (y + mh > window.innerHeight) y = window.innerHeight - mh - 8;
    ctxMenu.style.left = x + 'px';
    ctxMenu.style.top = y + 'px';
    ctxMenu.classList.add('visible');
  });
}

document.addEventListener('click', function() {
  if (ctxMenu) ctxMenu.classList.remove('visible');
});

document.querySelectorAll('[data-ctx-nav]').forEach(function(item) {
  item.addEventListener('click', function(e) {
    e.stopPropagation();
    navigateToPage(this.getAttribute('data-ctx-nav'));
    if (ctxMenu) ctxMenu.classList.remove('visible');
  });
});
document.querySelectorAll('[data-ctx-href]').forEach(function(item) {
  item.addEventListener('click', function(e) {
    e.stopPropagation();
    window.open(this.getAttribute('data-ctx-href'), '_blank');
    if (ctxMenu) ctxMenu.classList.remove('visible');
  });
});


// ============================
// WINDOW REF
// ============================
var mainWindow = document.getElementById('main-window');


// ============================
// WINDOW DRAGGING (pointer events)
// ============================
var titlebar = document.querySelector('.titlebar');
var winDragging = false;
var winDragX = 0, winDragY = 0;
var winOffsetX = 0, winOffsetY = 0;
var winDragStartOX = 0, winDragStartOY = 0;

if (titlebar && mainWindow) {
  titlebar.addEventListener('pointerdown', function(e) {
    if (e.target.closest('.traffic-lights') || e.target.closest('.tb-btn') ||
        e.target.closest('.tb-url') || e.target.closest('.tb-actions')) return;
    if (e.button !== 0) return; // left mouse only

    winDragging = true;
    winDragX = e.clientX;
    winDragY = e.clientY;
    winDragStartOX = winOffsetX;
    winDragStartOY = winOffsetY;

    mainWindow.style.transition = 'none';
    titlebar.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  titlebar.addEventListener('pointermove', function(e) {
    if (!winDragging) return;
    winOffsetX = winDragStartOX + (e.clientX - winDragX);
    winOffsetY = winDragStartOY + (e.clientY - winDragY);

    // Keep below menubar
    var rect = mainWindow.getBoundingClientRect();
    if (rect.top < 25) winOffsetY += (25 - rect.top);

    mainWindow.style.transform = 'translate(calc(-50% + ' + winOffsetX + 'px), ' + winOffsetY + 'px)';
  });

  titlebar.addEventListener('pointerup', function(e) {
    if (!winDragging) return;
    winDragging = false;
    titlebar.releasePointerCapture(e.pointerId);
  });

  titlebar.addEventListener('lostpointercapture', function() { winDragging = false; });

}



// ============================
// PAGE NAVIGATION (with history for back/forward)
// ============================
var urlText = document.getElementById('url-text');
var pageNames = { 'over-mij':'Over Mij', 'ontwikkeling':'Ontwikkeling', 'portfolio':'Portfolio', 'blog':'Blog' };
var navHistory = ['over-mij'];
var navIndex = 0;

function navigateToPage(pageId, fromHistory) {
  document.querySelectorAll('.page[data-page]').forEach(function(p) { p.classList.remove('active'); });
  var target = document.querySelector('.page[data-page="' + pageId + '"]');
  if (target) {
    target.classList.add('active');
    setTimeout(function() { triggerReveals(target); }, 100);
    if (pageId === 'ontwikkeling') setTimeout(animateSkillBars, 300);
  }
  document.querySelectorAll('.tab[data-tab]').forEach(function(t) { t.classList.remove('active'); });
  var tab = document.querySelector('.tab[data-tab="' + pageId + '"]');
  if (tab) tab.classList.add('active');
  if (urlText) urlText.textContent = 'stijnvandepol.nl — ' + (pageNames[pageId] || pageId);
  var wb = document.getElementById('win-body');
  if (wb) wb.scrollTop = 0;

  // Track history (skip if navigating via back/forward)
  if (!fromHistory) {
    navHistory = navHistory.slice(0, navIndex + 1);
    navHistory.push(pageId);
    navIndex = navHistory.length - 1;
  }
  updateNavButtons();
}

var backBtn = document.querySelector('.tb-nav .tb-btn:first-child');
var fwdBtn = document.querySelector('.tb-nav .tb-btn:last-child');

function updateNavButtons() {
  if (backBtn) backBtn.style.opacity = navIndex > 0 ? '1' : '0.3';
  if (fwdBtn) fwdBtn.style.opacity = navIndex < navHistory.length - 1 ? '1' : '0.3';
}

if (backBtn) {
  backBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (navIndex > 0) {
      navIndex--;
      navigateToPage(navHistory[navIndex], true);
    }
  });
}

if (fwdBtn) {
  fwdBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (navIndex < navHistory.length - 1) {
      navIndex++;
      navigateToPage(navHistory[navIndex], true);
    }
  });
}

updateNavButtons();


// ============================
// TAB MANAGEMENT (pointer-based drag reorder + close)
// ============================
var tabbar = document.querySelector('.tabbar');
function initTabs() {
  var allTabs = tabbar ? tabbar.querySelectorAll('.tab[data-tab]') : [];

  allTabs.forEach(function(tab) {
    // Click to navigate
    tab.addEventListener('click', function(e) {
      if (e.target.classList.contains('tab-close')) return;
      if (tabDragging) return;
      navigateToPage(this.getAttribute('data-tab'));
    });

    // Close button
    var closeBtn = tab.querySelector('.tab-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var tabEl = this.closest('.tab');
        var wasActive = tabEl.classList.contains('active');
        tabEl.style.transition = 'all 0.2s ease';
        tabEl.style.opacity = '0';
        tabEl.style.maxWidth = '0';
        tabEl.style.padding = '0';
        tabEl.style.overflow = 'hidden';
        setTimeout(function() {
          tabEl.remove();
          if (wasActive) {
            var rem = tabbar.querySelectorAll('.tab[data-tab]');
            if (rem.length > 0) navigateToPage(rem[0].getAttribute('data-tab'));
          }
        }, 200);
      });
    }

    // Pointer-based drag reorder
    tab.addEventListener('pointerdown', function(e) {
      if (e.target.classList.contains('tab-close')) return;
      if (e.button !== 0) return;

      var self = this;
      var moved = false;
      var startX = e.clientX;
      var tabRect = self.getBoundingClientRect();

      function onMove(ev) {
        var dx = ev.clientX - startX;
        if (!moved && Math.abs(dx) < 5) return; // threshold

        if (!moved) {
          moved = true;
          self.classList.add('dragging');
          self.style.position = 'relative';
          self.style.zIndex = '10';
        }

        self.style.left = dx + 'px';

        // Find closest sibling to swap with
        var tabs = Array.from(tabbar.querySelectorAll('.tab[data-tab]:not(.dragging)'));
        tabs.forEach(function(t) {
          t.classList.remove('drag-over-left', 'drag-over-right');
          var r = t.getBoundingClientRect();
          var mid = r.left + r.width / 2;
          if (ev.clientX > r.left && ev.clientX < r.right) {
            if (ev.clientX < mid) t.classList.add('drag-over-left');
            else t.classList.add('drag-over-right');
          }
        });
      }

      function onUp(ev) {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);

        if (moved) {
          self.classList.remove('dragging');
          self.style.position = '';
          self.style.zIndex = '';
          self.style.left = '';

          // Find drop target and insert
          var tabs = Array.from(tabbar.querySelectorAll('.tab[data-tab]:not(.dragging)'));
          var addBtn = tabbar.querySelector('.tab-add');
          var dropped = false;

          tabs.forEach(function(t) {
            if (t.classList.contains('drag-over-left')) {
              tabbar.insertBefore(self, t);
              dropped = true;
            } else if (t.classList.contains('drag-over-right')) {
              if (t.nextSibling) tabbar.insertBefore(self, t.nextSibling);
              else if (addBtn) tabbar.insertBefore(self, addBtn);
              dropped = true;
            }
            t.classList.remove('drag-over-left', 'drag-over-right');
          });
        }
      }

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });
  });
}
initTabs();


// ============================
// DOCK MAGNIFICATION (macos-web.app exact values)
// ============================
var dock = document.getElementById('dock');
var dockItemsAll = dock ? dock.querySelectorAll('.di') : [];
var dockIcons = [];

var BASE = 57.6;
var MAX_W = 115.2;
var DIST_LIMIT = 345.6;

var distIn  = [-DIST_LIMIT, -DIST_LIMIT/1.25, -DIST_LIMIT/2, 0, DIST_LIMIT/2, DIST_LIMIT/1.25, DIST_LIMIT];
var widthOut = [BASE, BASE*1.1, BASE*1.414, BASE*2, BASE*1.414, BASE*1.1, BASE];

function lerp(a, b, t) { return a + (b - a) * t; }

function magnify(sd) {
  if (sd <= distIn[0]) return widthOut[0];
  if (sd >= distIn[6]) return widthOut[6];
  for (var i = 0; i < distIn.length - 1; i++) {
    if (sd >= distIn[i] && sd <= distIn[i + 1]) {
      return lerp(widthOut[i], widthOut[i + 1], (sd - distIn[i]) / (distIn[i + 1] - distIn[i]));
    }
  }
  return BASE;
}

dockItemsAll.forEach(function(item) {
  var icon = item.querySelector('.di-icon');
  if (icon) dockIcons.push({ el: icon, item: item, current: BASE, target: BASE });
});

var dockActive = false, dockRAF = null;

function updateDock() {
  var needsUpdate = false;
  dockIcons.forEach(function(d) {
    var diff = d.target - d.current;
    if (Math.abs(diff) > 0.2) { d.current += diff * 0.15; needsUpdate = true; }
    else d.current = d.target;
    var w = d.current;
    var lift = ((w - BASE) / (MAX_W - BASE)) * 16;
    d.el.style.width = (w / 16) + 'rem';
    d.el.style.height = (w / 16) + 'rem';
    d.el.style.transform = 'translateY(' + (-lift) + 'px)';
  });
  if (needsUpdate || dockActive) dockRAF = requestAnimationFrame(updateDock);
  else dockRAF = null;
}

if (dock) {
  dock.addEventListener('mousemove', function(e) {
    if (winDragging) return;
    dockActive = true;
    var mx = e.clientX;
    dockIcons.forEach(function(d) {
      var rect = d.el.getBoundingClientRect();
      d.target = magnify(mx - (rect.left + rect.width / 2));
    });
    if (!dockRAF) dockRAF = requestAnimationFrame(updateDock);
  });
  dock.addEventListener('mouseleave', function() {
    dockActive = false;
    dockIcons.forEach(function(d) { d.target = BASE; });
    if (!dockRAF) dockRAF = requestAnimationFrame(updateDock);
  });
}


// ============================
// DOCK CLICK HANDLERS
// ============================
dockItemsAll.forEach(function(item) {
  item.addEventListener('click', function() {
    var pageLink = this.getAttribute('data-page-link');
    var href = this.getAttribute('data-href');
    if (pageLink) {
      navigateToPage(pageLink);
      // Bounce (macos-web: -40px, 400ms)
      var icon = this.querySelector('.di-icon');
      if (icon) {
        var orig = icon.style.transform || '';
        icon.style.transition = 'transform 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)';
        icon.style.transform = orig + ' translateY(-40px)';
        setTimeout(function() {
          icon.style.transform = orig;
          setTimeout(function() { icon.style.transition = ''; }, 400);
        }, 400);
      }
    } else if (href) {
      window.open(href, '_blank');
    }
  });
});


// ============================
// PORTFOLIO FILTER
// ============================
document.querySelectorAll('.filter-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var f = this.getAttribute('data-filter');
    document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
    this.classList.add('active');
    document.querySelectorAll('.project-card').forEach(function(c) {
      c.classList.toggle('active', f === 'all' || c.getAttribute('data-category') === f);
    });
  });
});


// ============================
// LIGHTBOX
// ============================
var lightbox = document.getElementById('lightbox');
var lightboxImg = document.getElementById('lightbox-img');
var lightboxTitle = document.getElementById('lightbox-title');

document.querySelectorAll('[data-lightbox]').forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    var img = this.querySelector('.project-img img');
    var title = this.querySelector('.project-title');
    if (img && lightbox && lightboxImg) {
      lightboxImg.src = img.src; lightboxImg.alt = img.alt;
      if (lightboxTitle) lightboxTitle.textContent = title ? title.textContent : '';
      lightbox.classList.add('active');
    }
  });
});

function closeLightbox() { if (lightbox) lightbox.classList.remove('active'); }
document.querySelectorAll('[data-lightbox-close]').forEach(function(el) { el.addEventListener('click', closeLightbox); });


// ============================
// REVEAL ANIMATIONS
// ============================
function triggerReveals(container) {
  var els = (container || document).querySelectorAll('.reveal:not(.visible)');
  var d = 0;
  els.forEach(function(el) { setTimeout(function() { el.classList.add('visible'); }, d); d += 60; });
}

if ('IntersectionObserver' in window) {
  var ro = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(function(el) { ro.observe(el); });
}

setTimeout(function() { var p = document.querySelector('.page.active'); if (p) triggerReveals(p); }, 3200);
setTimeout(function() { document.querySelectorAll('.reveal:not(.visible)').forEach(function(el) { el.classList.add('visible'); }); }, 5000);


// ============================
// SKILL BARS
// ============================
function animateSkillBars() {
  document.querySelectorAll('.skill-fill').forEach(function(b) { b.classList.add('animated'); });
  document.querySelectorAll('.skill-val').forEach(function(el) {
    var t = parseInt(el.getAttribute('data-val')); if (!t) return;
    var c = 0, s = t / 60;
    function tick() { c += s; if (c >= t) { el.textContent = t + '%'; return; } el.textContent = Math.round(c) + '%'; requestAnimationFrame(tick); }
    el.textContent = '0%'; setTimeout(tick, 150);
  });
}
var sc = document.querySelector('.skills-card');
if (sc && 'IntersectionObserver' in window) {
  var so = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) { animateSkillBars(); so.unobserve(e.target); } });
  }, { threshold: 0.3 });
  so.observe(sc);
}


// ============================
// KEYBOARD
// ============================
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { closeAllMenus(); closeLightbox(); if (ctxMenu) ctxMenu.classList.remove('visible'); }
});
