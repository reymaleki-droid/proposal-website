/**
 * Proposal Website — Main JavaScript
 * Handles: mobile nav, progress bar, scroll animations, accordions, comparison table groups
 */

(function () {
  'use strict';

  // ── Mobile Navigation Toggle ──────────────────────────────────
  const mobileToggle = document.getElementById('mobile-toggle');
  const topnav = document.getElementById('topnav');

  if (mobileToggle && topnav) {
    mobileToggle.addEventListener('click', function () {
      topnav.classList.toggle('topbar__nav--open');
      const isOpen = topnav.classList.contains('topbar__nav--open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close nav when clicking a link (mobile)
    topnav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        topnav.classList.remove('topbar__nav--open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── Reading Progress Bar ──────────────────────────────────────
  const progressBar = document.getElementById('progress-bar');

  if (progressBar) {
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    }, { passive: true });
  }

  // ── Scroll-Triggered Animations ───────────────────────────────
  if ('IntersectionObserver' in window) {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      var animateObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            animateObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
      });

      document.querySelectorAll('[data-animate]').forEach(function (el) {
        animateObserver.observe(el);
      });
    } else {
      // If reduced motion, make everything visible immediately
      document.querySelectorAll('[data-animate]').forEach(function (el) {
        el.classList.add('is-visible');
      });
    }
  } else {
    // Fallback: show everything
    document.querySelectorAll('[data-animate]').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // ── Accordion ─────────────────────────────────────────────────
  document.querySelectorAll('[data-accordion]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var item = trigger.closest('.accordion__item');
      var content = item.querySelector('.accordion__content');
      var isOpen = item.classList.contains('accordion__item--open');

      // Close all other accordion items in the same accordion
      var accordion = item.closest('.accordion');
      if (accordion) {
        accordion.querySelectorAll('.accordion__item--open').forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove('accordion__item--open');
            var openContent = openItem.querySelector('.accordion__content');
            if (openContent) openContent.style.maxHeight = null;
          }
        });
      }

      // Toggle current
      if (isOpen) {
        item.classList.remove('accordion__item--open');
        content.style.maxHeight = null;
      } else {
        item.classList.add('accordion__item--open');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // ── Comparison Table Group Toggle ─────────────────────────────
  document.querySelectorAll('.group-header').forEach(function (header) {
    header.style.cursor = 'pointer';
    header.addEventListener('click', function () {
      var group = header.getAttribute('data-group');
      var rows = document.querySelectorAll('.group-row[data-group="' + group + '"]');
      var icon = header.querySelector('svg');
      var isHidden = rows.length > 0 && rows[0].classList.contains('hidden');

      rows.forEach(function (row) {
        if (isHidden) {
          row.classList.remove('hidden');
        } else {
          row.classList.add('hidden');
        }
      });

      // Rotate chevron
      if (icon) {
        icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  });

  // ── Toggle All Groups (Compare page) ──────────────────────────
  window.toggleAllGroups = function () {
    var table = document.getElementById('comparison-table');
    if (!table) return;

    var hiddenRows = table.querySelectorAll('.group-row.hidden');
    var allRows = table.querySelectorAll('.group-row');
    var btn = document.getElementById('toggle-all-rows');

    if (hiddenRows.length > 0) {
      // Show all
      allRows.forEach(function (row) { row.classList.remove('hidden'); });
      table.querySelectorAll('.group-header svg').forEach(function (icon) {
        icon.style.transform = 'rotate(180deg)';
      });
      if (btn) btn.textContent = 'Collapse groups';
    } else {
      // Hide all except first group (scope)
      allRows.forEach(function (row) {
        if (row.getAttribute('data-group') !== 'scope') {
          row.classList.add('hidden');
        }
      });
      table.querySelectorAll('.group-header svg').forEach(function (icon) {
        icon.style.transform = 'rotate(0deg)';
      });
      // Keep scope chevron rotated
      var scopeHeader = table.querySelector('.group-header[data-group="scope"] svg');
      if (scopeHeader) scopeHeader.style.transform = 'rotate(180deg)';
      if (btn) btn.textContent = 'Show all attributes';
    }
  };

  // ── Highlight Differences (Compare page) ──────────────────────
  window.toggleDifferences = function () {
    var table = document.getElementById('comparison-table');
    if (!table) return;

    var btn = document.getElementById('toggle-diff');
    var isHighlighted = table.classList.contains('highlight-diff');

    if (isHighlighted) {
      table.classList.remove('highlight-diff');
      if (btn) btn.textContent = 'Highlight differences';
    } else {
      table.classList.add('highlight-diff');
      if (btn) btn.textContent = 'Clear highlights';

      // For each data row, check if all package cells have the same text
      table.querySelectorAll('.group-row').forEach(function (row) {
        var cells = row.querySelectorAll('td:not(:first-child)');
        var values = [];
        cells.forEach(function (cell) {
          values.push(cell.textContent.trim());
        });
        var allSame = values.every(function (v) { return v === values[0]; });
        if (!allSame) {
          row.classList.add('row-diff');
        } else {
          row.classList.remove('row-diff');
        }
      });
    }

    if (!isHighlighted) {
      // Also show all rows so user can see the highlights
      table.querySelectorAll('.group-row.hidden').forEach(function (row) {
        row.classList.remove('hidden');
      });
      table.querySelectorAll('.group-header svg').forEach(function (icon) {
        icon.style.transform = 'rotate(180deg)';
      });
    }
  };

  // ── Smooth scroll for anchor links ────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
