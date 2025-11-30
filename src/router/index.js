// Router configuration
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

// Router guard - redirect về home nếu có query params hoặc truy cập trực tiếp
// Sử dụng sessionStorage để đánh dấu đã vào từ home
const NAVIGATION_KEY = 'app_navigated_from_home';

router.beforeEach((to, from, next) => {
  // Nếu có query params trong URL, redirect về home
  if (window.location.search) {
    // Chỉ redirect khi load trang lần đầu (from.name === undefined)
    if (!from.name) {
      window.location.replace(window.location.pathname + '#/');
      return;
    } else {
      // Clean up query params nếu đang navigation
      const cleanUrl = new URL(window.location);
      cleanUrl.search = '';
      window.history.replaceState({}, '', cleanUrl.toString());
    }
  }
  
  // Nếu đang navigate từ home, đánh dấu
  if (from.path === '/' || from.path === '') {
    sessionStorage.setItem(NAVIGATION_KEY, 'true');
  }
  
  // Chặn truy cập trực tiếp vào các trang không phải home
  // Chỉ chặn khi:
  // 1. from.name là undefined (truy cập trực tiếp, không phải navigation)
  // 2. VÀ from.path là undefined hoặc rỗng (truy cập trực tiếp)
  // 3. VÀ không phải home
  // 4. VÀ không có flag navigation từ home
  const hasNavigatedFromHome = sessionStorage.getItem(NAVIGATION_KEY) === 'true';
  const isDirectAccess = (!from.name && (!from.path || from.path === ''));
  
  if (isDirectAccess && !hasNavigatedFromHome && to.path !== '/' && to.path !== '') {
    // Đây là truy cập trực tiếp vào trang không phải home -> redirect về home
    next('/');
    return;
  }
  
  // Cho phép navigation bình thường
  next();
});

// Khi vào home, reset flag để cho phép navigation từ home
router.afterEach((to) => {
  if (to.path === '/' || to.path === '') {
    sessionStorage.setItem(NAVIGATION_KEY, 'true');
  }
});
