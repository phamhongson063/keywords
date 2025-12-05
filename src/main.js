const { createApp } = Vue;

function normalize(text) {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function loadPageCSS(pageName) {
  // All CSS files are now loaded in index.html, so this function is no longer needed
  // But we keep it for compatibility in case it's called elsewhere
  const existingLink = document.querySelector(`link[href*="${pageName}.css"]`);
  if (!existingLink) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `src/assets/css/${pageName}.css`;
    document.head.appendChild(link);
  }
}

function initApp() {
  if (typeof App !== 'undefined' && typeof router !== 'undefined') {
    const app = createApp(App);
    app.use(router);
    
    router.isReady().then(() => {
      app.mount('#app');
      
      router.afterEach((to) => {
        const path = to.path || to.fullPath || '';
        if (path === '/' || path === '') {
          loadPageCSS('home');
        } else if (path.includes('practice-menu')) {
          loadPageCSS('practice-menu');
        } else if (path.includes('practice')) {
          loadPageCSS('practice');
        } else if (path.includes('flashcard') || path.includes('review')) {
          loadPageCSS('flashcard');
        } else {
          loadPageCSS('home');
        }
      });
      
      const finalPath = router.currentRoute.value.path || '';
      if (finalPath === '/' || finalPath === '') {
        loadPageCSS('home');
      } else if (finalPath.includes('practice-menu')) {
        loadPageCSS('practice-menu');
      } else if (finalPath.includes('practice')) {
        loadPageCSS('practice');
      } else if (finalPath.includes('flashcard') || finalPath.includes('review')) {
        loadPageCSS('flashcard');
      } else {
        loadPageCSS('home');
      }
    }).catch(() => {
      app.mount('#app');
      
      const hash = window.location.hash || '#/';
      if (hash === '#/' || hash === '#') {
        loadPageCSS('home');
      } else if (hash.includes('practice-menu')) {
        loadPageCSS('practice-menu');
      } else if (hash.includes('practice')) {
        loadPageCSS('practice');
      } else if (hash.includes('flashcard') || hash.includes('review')) {
        loadPageCSS('flashcard');
      } else {
        loadPageCSS('home');
      }
    });
  } else {
    setTimeout(initApp, 50);
  }
}

initApp();
