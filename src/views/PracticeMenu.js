// PracticeMenu View Component
const PracticeMenu = {
  get template() {
    return window.Templates?.PracticeMenu || '<div>Loading template...</div>';
  },
  mounted() {
    // Add practice-page class to body để có cùng background với practice detail
    document.body.classList.add('practice-page');
  },
  beforeUnmount() {
    // Remove practice-page class from body
    document.body.classList.remove('practice-page');
  }
};

