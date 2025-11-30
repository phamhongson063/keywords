// PracticeMenu View Component
const PracticeMenuTemplate = `<div class="home-container">
  <button class="back-button-header" @click="$router.push('/')">
    <span class="back-icon">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </button>
  <div class="menu-container">
    <div class="menu-item" @click="$router.push('/practice/vocabulary')">
      <div class="menu-icon">📝</div>
      <div class="menu-content">
        <div class="menu-title">Luyện Tập Nghĩa</div>
      </div>
    </div>
    <div class="menu-item" @click="$router.push('/practice/practice-word')">
      <div class="menu-icon">🎯</div>
      <div class="menu-content">
        <div class="menu-title">Luyện Tập Từ</div>
      </div>
    </div>
    <div class="menu-item" @click="$router.push('/practice/spelling')">
      <div class="menu-icon">✍️</div>
      <div class="menu-content">
        <div class="menu-title">Luyện Chính Tả</div>
      </div>
    </div>
  </div>
</div>`;

const PracticeMenu = {
  template: PracticeMenuTemplate,
  mounted() {
    // Add practice-page class to body để có cùng background với practice detail
    document.body.classList.add('practice-page');
  },
  beforeUnmount() {
    // Remove practice-page class from body
    document.body.classList.remove('practice-page');
  }
};

