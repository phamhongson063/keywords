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
  const existingLink = document.getElementById('page-css');
  if (existingLink) {
    existingLink.remove();
  }
  
  const link = document.createElement('link');
  link.id = 'page-css';
  link.rel = 'stylesheet';
  link.href = `src/assets/css/${pageName}.css`;
  document.head.appendChild(link);
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
        } else if (path.includes('flashcard')) {
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
      } else if (finalPath.includes('flashcard')) {
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
      } else if (hash.includes('flashcard')) {
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
