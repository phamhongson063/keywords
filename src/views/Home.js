// Home View Component
const HomeTemplate = `<div class="desktop-container">
  <div class="computer-screen">
    <svg class="screen-frame" viewBox="0 0 800 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="800" height="600" fill="#2c2c2c" rx="15"/>
      <rect x="20" y="20" width="760" height="520" fill="#1a1a1a" rx="8"/>
      <rect x="30" y="30" width="740" height="500" fill="#0a0a0a" rx="5"/>
      <ellipse cx="400" cy="580" rx="120" ry="15" fill="#2c2c2c"/>
      <rect x="380" y="530" width="40" height="50" fill="#2c2c2c"/>
    </svg>
    <div class="screen-content">
      <div class="dashboard-container">
        <div class="dashboard-item" @click="$router.push('/flashcard')">
          <div class="dashboard-icon">🃏</div>
          <div class="dashboard-title">Flash card</div>
        </div>
        <div class="dashboard-item" @click="$router.push('/practice-menu')">
          <div class="dashboard-icon">🎯</div>
          <div class="dashboard-title">Luyện Tập</div>
        </div>
      </div>
    </div>
  </div>
</div>`;

const Home = {
  template: HomeTemplate,
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

