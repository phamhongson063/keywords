const { createRouter, createWebHashHistory } = VueRouter;

const routes = [
  { path: '/', component: Home },
  { path: '/practice-menu', component: PracticeMenu },
  { path: '/practice/:mode?', component: Practice, props: true },
  { path: '/flashcard', component: Flashcard },
  { path: '/:pathMatch(.*)*', component: NotFound }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  if (window.location.search) {
    if (!from.name) {
      window.location.replace(window.location.pathname + '#/');
      return;
    } else {
      const cleanUrl = new URL(window.location);
      cleanUrl.search = '';
      window.history.replaceState({}, '', cleanUrl.toString());
    }
  }
  
  const hasFromName = !!from.name;
  const hasFromPath = from.path && from.path !== '' && from.path !== undefined;
  const isInitialLoad = !hasFromName && !hasFromPath;
  const isNotHome = to.path !== '/' && to.path !== '';
  
  if (isInitialLoad && isNotHome) {
    next('/');
    return;
  }
  
  next();
});
