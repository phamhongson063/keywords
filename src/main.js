// Vue.js Application Entry Point
const { createApp } = Vue;

// Prevent direct URL access with query params - redirect to home
// Always check and redirect if query params exist
function checkAndRedirectQueryParams() {
  if (window.location.search) {
    const cleanUrl = window.location.pathname + '#/';
    window.location.replace(cleanUrl);
    return true;
  }
  return false;
}

// Check immediately on load - this runs before Vue router initializes
// Use a more aggressive approach
(function() {
  if (window.location.search) {
    window.location.replace(window.location.pathname + '#/');
    // Prevent further execution
    return;
  }
})();

// Utility function to normalize Vietnamese text
function normalize(text) {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Function to load CSS for a specific page
function loadPageCSS(pageName) {
  // Remove existing page-specific CSS
  const existingLink = document.getElementById('page-css');
  if (existingLink) {
    existingLink.remove();
  }
  
  // Add new CSS
  const link = document.createElement('link');
  link.id = 'page-css';
  link.rel = 'stylesheet';
  link.href = `src/assets/css/${pageName}.css`;
  document.head.appendChild(link);
}

// Wait for App and router to be defined, then create and mount the app
function initApp() {
  if (typeof App !== 'undefined' && typeof router !== 'undefined') {
    const app = createApp(App);
    app.use(router);
    
    // Load CSS based on route changes
    router.afterEach((to) => {
      const path = to.path || to.fullPath || '';
      if (path === '/' || path === '') {
        loadPageCSS('home');
      } else if (path.includes('practice-menu')) {
        loadPageCSS('practice-menu');
      } else if (path.includes('practice')) {
        loadPageCSS('practice');
      } else if (path.includes('flashcard')) {
        loadPageCSS('flashcard');
      } else {
        loadPageCSS('home'); // Default
      }
    });
    
    app.mount('#app');
    
    // Load CSS for initial route after mount
    router.isReady().then(() => {
      const currentPath = router.currentRoute.value.path || '';
      if (currentPath === '/' || currentPath === '') {
        loadPageCSS('home');
      } else if (currentPath.includes('practice-menu')) {
        loadPageCSS('practice-menu');
      } else if (currentPath.includes('practice')) {
        loadPageCSS('practice');
      } else if (currentPath.includes('flashcard')) {
        loadPageCSS('flashcard');
      } else {
        loadPageCSS('home');
      }
    }).catch(() => {
      // Fallback: load CSS based on hash
      const currentHash = window.location.hash || '#/';
      if (currentHash === '#/' || currentHash === '#') {
        loadPageCSS('home');
      } else if (currentHash.includes('practice-menu')) {
        loadPageCSS('practice-menu');
      } else if (currentHash.includes('practice')) {
        loadPageCSS('practice');
      } else if (currentHash.includes('flashcard')) {
        loadPageCSS('flashcard');
      } else {
        loadPageCSS('home');
      }
    });
  } else {
    // Retry after a short delay if App or router not ready
    setTimeout(initApp, 50);
  }
}

// Initialize app
initApp();
