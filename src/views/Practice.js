// Practice View Component - Wrapper that loads the old JS file
// Template is hardcoded here to avoid live-server injection issues
const PracticeTemplate = `<div>
  <div class="top-bar">
    <div class="back-button-container">
      <button class="back-button" id="backButton" @click="goToPracticeMenu">
        <span class="back-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="back-text">Quay lại</span>
      </button>
    </div>
    <div class="score" id="topScore">
      <div class="score-item">
        <div class="score-label">Đúng</div>
        <div class="score-value" id="correct">0</div>
      </div>
      <div class="score-item">
        <div class="score-label">Sai</div>
        <div class="score-value" id="wrong">0</div>
      </div>
    </div>
  </div>
  <div class="main-wrapper">
    <div class="sidebar">
      <div class="sidebar-title">📋 Danh sách từ</div>
      <ul class="word-list" id="wordList">
        <!-- Danh sách từ sẽ được thêm bằng JavaScript -->
      </ul>
    </div>
    <div class="container">
      <div class="header">
        <h1 id="pageTitle">📚 Luyện Tập</h1>
      </div>
      <div class="vocabulary-card">
        <div class="vocabulary-text" id="vocabularyText">Đang tải...</div>
      </div>
      <div class="timer-container-wrapper">
        <div class="timer-container">
          <div class="timer-wrapper" id="timerWrapper">
            <svg class="timer-circle" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              <circle class="timer-bg" cx="50" cy="50" r="40"></circle>
              <circle class="timer-progress" id="timerProgress" cx="50" cy="50" r="40"></circle>
            </svg>
            <div class="timer-text" id="timerText">20</div>
          </div>
        </div>
      </div>
      <div class="input-section">
        <label class="input-label" id="inputLabel" for="answerInput">Nhập nghĩa của từ:</label>
        <textarea id="answerInput" class="answer-input" placeholder="Nhập và nhấn Enter..." autocomplete="off" rows="3"></textarea>
      </div>
      <div class="feedback" id="feedback"></div>
      <button class="next-button" id="nextButton">Từ tiếp theo →</button>
      <button class="mobile-next-button" id="mobileNextButton">
        <span class="mobile-next-icon">→</span>
        <span class="mobile-next-text">Tiếp theo</span>
      </button>
    </div>
    <div class="right-column">
      <div class="hint-section" id="hintSection">
        <div class="hint-label">💡 Gợi ý</div>
        <div class="hint-text empty" id="hintText"></div>
      </div>
      <div class="wrong-words-section" id="wrongWordsSection">
        <div class="wrong-words-title">❌ Từ đã sai</div>
        <ul class="wrong-words-list" id="wrongWordsList">
          <li class="wrong-words-empty">Chưa có từ nào sai</li>
        </ul>
      </div>
    </div>
  </div>
  <div class="mobile-hint-notification" id="mobileHintNotification">
    <div class="mobile-hint-label">💡 Gợi ý</div>
    <div class="mobile-hint-text" id="mobileHintText"></div>
  </div>
</div>`;

const Practice = {
  props: {
    mode: {
      type: String,
      default: 'vocabulary'
    }
  },
  template: PracticeTemplate,
  methods: {
    goToPracticeMenu(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      console.log('goToPracticeMenu method called');
      console.log('Current route:', this.$route.path);
      console.log('Navigating to /practice-menu');
      this.$router.push('/practice-menu').catch(err => {
        console.error('Navigation error:', err);
      });
    }
  },
  mounted() {
    console.log('=== Practice component mounted ===');
    console.log('PracticeTemplate length:', PracticeTemplate.length);
    console.log('PracticeTemplate contains answerInput:', PracticeTemplate.includes('answerInput'));
    console.log('$el:', this.$el);
    console.log('$el innerHTML length:', this.$el?.innerHTML?.length || 0);
    console.log('$el innerHTML (first 1000 chars):', this.$el?.innerHTML?.substring(0, 1000) || '');
    console.log('$el has answerInput:', this.$el?.innerHTML?.includes('answerInput') || false);
    console.log('$el has textarea:', this.$el?.innerHTML?.includes('textarea') || false);
    console.log('$el has input-section:', this.$el?.innerHTML?.includes('input-section') || false);
    console.log('$el has mobileNextButton:', this.$el?.innerHTML?.includes('mobileNextButton') || false);
    console.log('$el has nextButton:', this.$el?.innerHTML?.includes('nextButton') || false);
    
    // Check if elements exist in DOM
    const answerInput = this.$el?.querySelector('#answerInput');
    const textarea = this.$el?.querySelector('textarea');
    const inputSection = this.$el?.querySelector('.input-section');
    console.log('answerInput found in $el:', !!answerInput);
    console.log('textarea found in $el:', !!textarea);
    console.log('input-section found in $el:', !!inputSection);
    
    // Check $options.template
    console.log('$options.template length:', this.$options.template?.length || 0);
    console.log('$options.template contains answerInput:', this.$options.template?.includes('answerInput') || false);
    
    // Add practice-page class to body
    document.body.classList.add('practice-page');
    
    // Store router reference for use in event handlers
    const router = this.$router;
    const component = this;
    
    // Function to set back button handler - chỉ dùng Vue handler, không cần addEventListener
    // Vue @click trong template đã xử lý, chỉ cần đảm bảo không bị override
    const setBackButtonHandler = () => {
      const backButton = document.getElementById('backButton');
      if (backButton) {
        // Chỉ đảm bảo không có onclick handler nào override Vue handler
        backButton.onclick = null;
        backButton.removeAttribute('onclick');
      }
    };
    
    // Set handler immediately
    this.$nextTick(() => {
      setBackButtonHandler();
    });
    
    // Function to initialize practice page
    const initPractice = () => {
      // Set mode in URL for practice.js to read
      const mode = this.mode || 'vocabulary';
      const currentUrl = new URL(window.location);
      currentUrl.searchParams.set('mode', mode);
      window.history.replaceState({}, '', currentUrl.toString());
      
      // Use MutationObserver to wait for elements to be rendered
      const waitForElementsWithObserver = () => {
        const answerInput = document.getElementById('answerInput');
        const nextButton = document.getElementById('nextButton');
        const mobileNextButton = document.getElementById('mobileNextButton');
        const vocabularyText = document.getElementById('vocabularyText');
        const container = document.querySelector('.container');
        const app = document.getElementById('app');
        
        // Debug: Log what we find
        console.log('Checking elements:', {
          answerInput: !!answerInput,
          nextButton: !!nextButton,
          mobileNextButton: !!mobileNextButton,
          vocabularyText: !!vocabularyText,
          container: !!container,
          app: !!app
        });
        
        // Check if container exists and what's inside
        if (container) {
          console.log('Container found!');
          console.log('Container children count:', container.children.length);
          console.log('Container innerHTML length:', container.innerHTML.length);
          console.log('Container innerHTML (first 500 chars):', container.innerHTML.substring(0, 500));
          console.log('Container has answerInput in HTML:', container.innerHTML.includes('answerInput'));
          console.log('Container has textarea in HTML:', container.innerHTML.includes('textarea'));
          
          // Check what template Vue is using
          console.log('Current Practice.template length:', Practice.template?.length || 0);
          console.log('Current Practice.template contains answerInput:', Practice.template?.includes('answerInput') || false);
          console.log('window.Templates.Practice length:', window.Templates?.Practice?.length || 0);
          console.log('window.Templates.Practice contains answerInput:', window.Templates?.Practice?.includes('answerInput') || false);
          
          // Try to find elements by querySelector as well
          const textarea = container.querySelector('textarea');
          const inputSection = container.querySelector('.input-section');
          console.log('Found textarea via querySelector:', !!textarea);
          console.log('Found input-section via querySelector:', !!inputSection);
          
          if (textarea && !answerInput) {
            console.log('Found textarea but not answerInput by ID - checking ID attribute');
            console.log('Textarea ID:', textarea.id);
            if (textarea.id === 'answerInput') {
              console.log('Textarea has correct ID!');
            }
          }
          
          // If template is wrong, try to force update
          if (!container.innerHTML.includes('answerInput') && window.Templates?.Practice?.includes('answerInput')) {
            console.error('Template mismatch! Vue template does not contain answerInput but window.Templates.Practice does!');
            console.error('This means Vue is using an old template. Need to force re-render.');
          }
        }
        
        if (answerInput && nextButton && mobileNextButton && vocabularyText) {
          console.log('All elements found via observer, initializing...');
          
          // Reset game state if functions exist (for when re-entering the page)
          if (typeof window.resetGameState === 'function') {
            window.resetGameState();
          }
          
          // Initialize event listeners and load vocabulary
          if (typeof initEventListeners === 'function') {
            initEventListeners();
          }
          if (typeof loadVocabulary === 'function') {
            loadVocabulary();
          }
          return true;
        }
        return false;
      };
      
      // Try immediately first
      if (waitForElementsWithObserver()) {
        return;
      }
      
      // If not found, use MutationObserver to watch for DOM changes
      const app = document.getElementById('app');
      if (app) {
        const observer = new MutationObserver((mutations, obs) => {
          if (waitForElementsWithObserver()) {
            obs.disconnect();
          }
        });
        
        observer.observe(app, {
          childList: true,
          subtree: true
        });
        
        // Also set a timeout as fallback
        setTimeout(() => {
          observer.disconnect();
          if (!waitForElementsWithObserver()) {
            console.error('Elements still not found after observer timeout');
            // Try to initialize anyway
            if (typeof initEventListeners === 'function') {
              initEventListeners();
            }
            if (typeof loadVocabulary === 'function') {
              loadVocabulary();
            }
          }
        }, 5000);
      } else {
        // Fallback: use setTimeout with retries
        let retryCount = 0;
        const maxRetries = 50;
        
        const waitForElements = () => {
          if (waitForElementsWithObserver()) {
            return;
          }
          
          retryCount++;
          if (retryCount >= maxRetries) {
            console.error('Max retries reached, initializing anyway...');
            if (typeof initEventListeners === 'function') {
              initEventListeners();
            }
            if (typeof loadVocabulary === 'function') {
              loadVocabulary();
            }
            return;
          }
          
          setTimeout(waitForElements, 100);
        };
        
        this.$nextTick(() => {
          setTimeout(waitForElements, 100);
        });
      }
      
      // Remove query params after practice.js has read them
      setTimeout(() => {
        const cleanUrl = new URL(window.location);
        cleanUrl.search = '';
        window.history.replaceState({}, '', cleanUrl.toString());
      }, 300);
      
          // Re-apply router handler after practice.js loads (in case it overrides)
          setTimeout(() => {
            setBackButtonHandler();
          }, 100);
          
          // Đảm bảo Vue handler luôn hoạt động sau khi practice.js load
          setTimeout(() => {
            const backButton = document.getElementById('backButton');
            if (backButton) {
              // Đảm bảo không có onclick override
              backButton.onclick = null;
              backButton.removeAttribute('onclick');
              
              // Thêm event listener để đảm bảo navigation hoạt động
              backButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Back button clicked - navigating to practice-menu');
                router.push('/practice-menu').catch(err => {
                  console.error('Navigation error:', err);
                });
              }, true);
            }
          }, 200);
    };
    
    // Check if practice.js is already loaded
    if (typeof loadVocabulary === 'function' && typeof initEventListeners === 'function') {
      // Script already loaded, just initialize
      initPractice();
    } else {
      // Load and execute the old practice.js file
      const existingScript = document.querySelector('script[src="src/utils/practice.js"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.src = 'src/utils/practice.js';
      script.onload = () => {
        initPractice();
      };
      document.head.appendChild(script);
    }
  },
  beforeUnmount() {
    // Remove practice-page class from body
    document.body.classList.remove('practice-page');
    
    if (this._handlerInterval) {
      clearInterval(this._handlerInterval);
    }
  }
};

