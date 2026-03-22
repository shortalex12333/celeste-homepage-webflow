/**
 * Celeste Theme Toggle
 * Handles light/dark mode switching with localStorage persistence
 * Respects system preference when no user preference is saved
 */
(function() {
  'use strict';

  var STORAGE_KEY = 'celeste-theme';
  var DARK_CLASS = 'dark-mode';
  var LIGHT_CLASS = 'light-mode';

  /**
   * Get the user's preferred theme
   * Priority: localStorage > system preference > light
   */
  function getPreferredTheme() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Apply theme to the document
   */
  function applyTheme(theme) {
    var html = document.documentElement;
    var toggle = document.getElementById('theme-toggle');

    if (theme === 'dark') {
      html.classList.add(DARK_CLASS);
      html.classList.remove(LIGHT_CLASS);
    } else {
      html.classList.add(LIGHT_CLASS);
      html.classList.remove(DARK_CLASS);
    }

    // Update toggle button state
    if (toggle) {
      toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      toggle.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  /**
   * Toggle between light and dark themes
   */
  function toggleTheme() {
    var html = document.documentElement;
    var isDark = html.classList.contains(DARK_CLASS);
    var newTheme = isDark ? 'light' : 'dark';

    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  }

  /**
   * Initialize theme on page load
   */
  function init() {
    // Apply theme immediately to prevent flash
    var theme = getPreferredTheme();
    applyTheme(theme);

    // Set up toggle button click handler
    var toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        toggleTheme();
      });

      // Keyboard support (Enter and Space already work for buttons)
      toggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      });
    }

    // Listen for system preference changes
    if (window.matchMedia) {
      var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', function(e) {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  // Apply theme immediately (before DOM ready) to prevent flash
  var initialTheme = getPreferredTheme();
  document.documentElement.classList.add(initialTheme === 'dark' ? DARK_CLASS : LIGHT_CLASS);

  // Set up event listeners when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
