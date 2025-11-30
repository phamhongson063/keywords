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

// Router guard - không cần chặn query params ở đây vì main.js đã xử lý
// Chỉ để cho phép tất cả navigation bình thường
router.beforeEach((to, from, next) => {
  next();
});
