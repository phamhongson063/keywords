// Home View Component
const Home = {
  get template() {
    return window.Templates?.Home || '<div>Loading template...</div>';
  },
  mounted() {
    // Disable browser research features
    const handlers = {
      contextmenu: (e) => { e.preventDefault(); return false; },
      selectstart: (e) => { e.preventDefault(); return false; },
      dblclick: (e) => { e.preventDefault(); return false; }
    };
    
    let touchStartTime = 0;
    const touchStart = (e) => { touchStartTime = Date.now(); };
    const touchEnd = (e) => {
      const touchDuration = Date.now() - touchStartTime;
      if (touchDuration > 500) {
        e.preventDefault();
        return false;
      }
    };
    
    Object.entries(handlers).forEach(([event, handler]) => {
      document.addEventListener(event, handler);
    });
    document.addEventListener('touchstart', touchStart);
    document.addEventListener('touchend', touchEnd);
    
    this._cleanup = () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        document.removeEventListener(event, handler);
      });
      document.removeEventListener('touchstart', touchStart);
      document.removeEventListener('touchend', touchEnd);
    };
  },
  unmounted() {
    if (this._cleanup) this._cleanup();
  }
};

