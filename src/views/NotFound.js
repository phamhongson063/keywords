// NotFound View Component
const NotFoundTemplate = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 20px;">
  <h1 style="font-size: 4em; margin: 0; color: #4682b4;">404</h1>
  <h2 style="font-size: 2em; margin: 20px 0; color: #333;">Trang không tìm thấy</h2>
  <p style="font-size: 1.2em; color: #666; margin-bottom: 30px;">Trang bạn đang tìm kiếm không tồn tại.</p>
  <button @click="$router.push('/')" style="padding: 12px 30px; font-size: 1.1em; background: #4682b4; color: white; border: none; border-radius: 5px; cursor: pointer; transition: background 0.3s;">
    Về trang chủ
  </button>
</div>`;

const NotFound = {
  template: NotFoundTemplate
};

