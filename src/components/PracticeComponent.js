// Practice Component - Fully Vue.js implementation
// This replaces the vanilla JS practice.js file

const PracticeComponentTemplate = `<div>
  <div class="top-bar">
    <div class="back-button-container">
      <button class="back-button" @click="goToPracticeMenu">
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
        <div class="score-value">{{ correctCount }}</div>
      </div>
      <div class="score-item">
        <div class="score-label">Sai</div>
        <div class="score-value">{{ wrongCount }}</div>
      </div>
    </div>
  </div>
  <div class="main-wrapper">
    <div class="sidebar">
      <div class="sidebar-title">📋 Danh sách từ</div>
      <ul class="word-list">
        <li v-for="(item, index) in wordListItems" :key="item.word.id || index" 
            :class="['word-item', { 'current': item.isCurrent, 'completed': item.isCompleted }]">
          <span class="word-vocab">{{ item.word.vocabulary }}</span>
          <span class="word-meaning">{{ item.word.meaning }}</span>
        </li>
      </ul>
    </div>
    <div class="container">
      <div class="header">
        <h1>{{ pageTitle }}</h1>
      </div>
      <div class="vocabulary-card">
        <div class="vocabulary-text">{{ currentWordDisplay }}</div>
      </div>
      <div class="timer-container-wrapper">
        <div class="timer-container" :class="{ 'warning': timerWarning, 'danger': timerDanger }" 
             :style="{ '--timer-progress': timerProgress + '%' }">
          <div class="timer-wrapper">
            <svg class="timer-circle" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              <circle class="timer-bg" cx="50" cy="50" r="40"></circle>
              <circle class="timer-progress" :class="{ 'warning': timerWarning, 'danger': timerDanger }" 
                      cx="50" cy="50" r="40" 
                      :style="{ 'stroke-dashoffset': strokeDashoffset }"></circle>
            </svg>
            <div class="timer-text">{{ timerDisplay }}</div>
          </div>
        </div>
      </div>
      <div class="input-section">
        <label class="input-label" for="answerInput">{{ inputLabel }}</label>
        <textarea id="answerInput" 
                  class="answer-input" 
                  :class="inputClass"
                  :placeholder="inputPlaceholder" 
                  v-model="userAnswer"
                  :readonly="isInputReadOnly"
                  :disabled="isInputDisabled"
                  autocomplete="off" 
                  rows="3"
                  @keydown="handleEnterKey"
                  @focus="handleInputFocus"></textarea>
      </div>
      <div class="feedback" :class="['feedback', feedbackType, { 'show': feedbackText }]">
        {{ feedbackText }}
      </div>
      <button class="next-button" :class="{ 'show': showNextButton }" @click="nextWord">Từ tiếp theo →</button>
      <button class="mobile-next-button" :class="{ 'show': showMobileNextButton }" @click="nextWord">
        <span class="mobile-next-icon">→</span>
        <span class="mobile-next-text">Tiếp theo</span>
      </button>
    </div>
    <div class="right-column">
      <div class="hint-section" :class="{ 'active': showHint }">
        <div class="hint-label">💡 Gợi ý</div>
        <div class="hint-text" :class="{ 'empty': !hintText }">{{ hintText }}</div>
      </div>
      <div class="wrong-words-section">
        <div class="wrong-words-title">❌ Từ đã sai</div>
        <ul class="wrong-words-list">
          <li v-if="wrongWordsListItems.length === 0" class="wrong-words-empty">Chưa có từ nào sai</li>
          <li v-for="word in wrongWordsListItems" :key="word.id" class="wrong-word-item">
            <div class="wrong-word-vocab">{{ word.vocabulary }}</div>
            <div class="wrong-word-meaning">{{ word.meaning }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div class="mobile-hint-notification" :class="{ 'show': false, 'active': false }">
    <div class="mobile-hint-label">💡 Gợi ý</div>
    <div class="mobile-hint-text"></div>
  </div>
</div>`;

const PracticeComponent = {
  props: {
    mode: {
      type: String,
      default: 'vocabulary'
    }
  },
  template: PracticeComponentTemplate,
  data() {
    return {
      // Vocabulary data
      vocabularyData: [],
      
      // Game state
      currentIndex: -1,
      currentWord: null,
      timeLeft: 20,
      maxTime: 20,
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      isAnswered: false,
      usedIndices: [],
      hintShown: false,
      upcomingWords: [],
      completedWords: [],
      wrongWords: [],
      
      // UI state
      userAnswer: '',
      feedbackText: '',
      feedbackType: '', // 'correct', 'wrong', 'timeout', ''
      hintText: '',
      showHint: false,
      showNextButton: false,
      showMobileNextButton: false,
      isInputDisabled: false,
      isInputReadOnly: false,
      inputClass: 'answer-input',
      
      // Timer
      timer: null,
      timerProgress: 100,
      timerWarning: false,
      timerDanger: false,
      
      // Mode config
      modeConfig: {
        'vocabulary': {
          title: '📚 Học Từ Vựng',
          label: 'Nhập nghĩa của từ:',
          placeholder: 'Nhập nghĩa và nhấn Enter...',
          displayField: 'vocabulary',
          answerField: 'meaning',
          normalize: true,
          hintField: 'meaning'
        },
        'practice-word': {
          title: '📚 Luyện Tập Từ',
          label: 'Nhập từ vựng:',
          placeholder: 'Nhập từ vựng và nhấn Enter...',
          displayField: 'meaning',
          answerField: 'vocabulary',
          normalize: true,
          hintField: 'vocabulary'
        },
        'spelling': {
          title: '✍️ Luyện Chính Tả',
          label: 'Nhập từ vựng:',
          placeholder: 'Nhập từ vựng và nhấn Enter...',
          displayField: 'vocabulary',
          answerField: 'vocabulary',
          normalize: false,
          hintField: 'vocabulary'
        }
      },
      
      // Processing flags
      isNextWordProcessing: false
    };
  },
  computed: {
    config() {
      return this.modeConfig[this.mode] || this.modeConfig['vocabulary'];
    },
    pageTitle() {
      return this.config.title;
    },
    inputLabel() {
      return this.config.label;
    },
    inputPlaceholder() {
      return this.config.placeholder;
    },
    currentWordDisplay() {
      if (!this.currentWord) return 'Đang tải...';
      return this.currentWord[this.config.displayField] || '';
    },
    wordListItems() {
      const items = [];
      if (this.currentWord) {
        items.push({
          word: this.currentWord,
          isCurrent: true,
          isCompleted: false
        });
      }
      this.upcomingWords.forEach(word => {
        items.push({
          word: word,
          isCurrent: false,
          isCompleted: false
        });
      });
      this.completedWords.forEach(wordId => {
        const word = this.vocabularyData.find(w => w.id === wordId);
        if (word) {
          items.push({
            word: word,
            isCurrent: false,
            isCompleted: true
          });
        }
      });
      return items;
    },
    wrongWordsListItems() {
      return this.wrongWords;
    },
    timerDisplay() {
      return Math.ceil(this.timeLeft);
    },
    circumference() {
      return 2 * Math.PI * 40; // r = 40
    },
    strokeDashoffset() {
      const progress = this.timeLeft / this.maxTime;
      return this.circumference * (1 - progress);
    }
  },
  methods: {
    // Navigation
    goToPracticeMenu(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.$router.push('/practice-menu').catch(err => {
        console.error('Navigation error:', err);
      });
    },
    
    // Normalize Vietnamese text
    normalize(text) {
      if (!text) return '';
      try {
        return text
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim();
      } catch (e) {
        return text.toLowerCase().trim();
      }
    },
    
    // Load vocabulary
    async loadVocabulary() {
      try {
        const response = await fetch('src/assets/data/vocabulary.json');
        this.vocabularyData = await response.json();
        if (this.vocabularyData.length === 0) {
          return;
        }
        this.startGame();
      } catch (error) {
        console.error('Error loading vocabulary:', error);
      }
    },
    
    // Get random word
    getRandomWord() {
      if (this.usedIndices.length >= this.vocabularyData.length) {
        this.usedIndices = [];
        this.completedWords = [];
      }

      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * this.vocabularyData.length);
      } while (this.usedIndices.includes(randomIndex));

      this.usedIndices.push(randomIndex);
      return this.vocabularyData[randomIndex];
    },
    
    // Generate upcoming words
    generateUpcomingWords() {
      if (this.upcomingWords.length > 0) {
        return;
      }
      
      if (!this.vocabularyData || this.vocabularyData.length === 0) {
        return;
      }
      
      const availableWords = [];
      const currentWordId = this.currentWord ? this.currentWord.id : null;
      
      for (let i = 0; i < this.vocabularyData.length; i++) {
        const word = this.vocabularyData[i];
        if (word && word.id && word.vocabulary && word.meaning) {
          if (word.id === currentWordId) {
            continue;
          }
          if (!this.usedIndices.includes(i) && !this.completedWords.includes(word.id)) {
            availableWords.push({ word: word, index: i });
          }
        }
      }
      
      if (availableWords.length === 0) {
        this.usedIndices = [];
        for (let i = 0; i < this.vocabularyData.length; i++) {
          const word = this.vocabularyData[i];
          if (word && word.id && word.vocabulary && word.meaning) {
            if (word.id !== currentWordId) {
              availableWords.push({ word: word, index: i });
            }
          }
        }
      }
      
      if (availableWords.length === 0) {
        if (this.currentWord && this.currentWord.id) {
          availableWords.push({ word: this.currentWord, index: -1 });
        } else {
          for (let i = 0; i < this.vocabularyData.length; i++) {
            const word = this.vocabularyData[i];
            if (word && word.id && word.vocabulary && word.meaning) {
              availableWords.push({ word: word, index: i });
              break;
            }
          }
        }
      }
      
      const shuffled = availableWords.sort(() => 0.5 - Math.random());
      const count = Math.min(5, shuffled.length);
      
      this.upcomingWords = [];
      for (let i = 0; i < count; i++) {
        if (shuffled[i] && shuffled[i].word) {
          const word = shuffled[i].word;
          if (word.id && word.vocabulary && word.meaning) {
            this.upcomingWords.push(word);
            if (shuffled[i].index !== undefined && shuffled[i].index >= 0) {
              this.usedIndices.push(shuffled[i].index);
            }
          }
        }
      }
    },
    
    // Start game
    startGame() {
      this.generateUpcomingWords();
      
      if (this.upcomingWords && this.upcomingWords.length > 0) {
        this.currentWord = this.upcomingWords[0];
        this.upcomingWords.shift();
        this.resetTimer();
        this.startTimer();
      }
    },
    
    // Reset timer
    resetTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      
      this.timeLeft = this.maxTime;
      this.timerProgress = 100;
      this.timerWarning = false;
      this.timerDanger = false;
      this.hintShown = false;
      this.showHint = false;
      this.hintText = '';
      this.showMobileNextButton = false;
    },
    
    // Generate hint
    generateHint(text, timeLeft) {
      const progress = (10 - timeLeft) / 10;
      const minPercent = 0.2;
      const maxPercent = 0.9;
      const hintPercent = minPercent + (maxPercent - minPercent) * progress;
      const hintLength = Math.max(1, Math.floor(text.length * hintPercent));
      const hint = text.substring(0, hintLength);
      return hintLength < text.length ? hint + '...' : hint;
    },
    
    // Start timer
    startTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      
      if (!this.currentWord || !this.currentWord[this.config.hintField] || !this.currentWord.id) {
        return;
      }
      
      const startTime = Date.now();
      const duration = this.maxTime * 1000;
      const wordId = this.currentWord.id;
      
      this.timer = setInterval(() => {
        if (this.currentWord && this.currentWord.id !== wordId) {
          clearInterval(this.timer);
          this.timer = null;
          return;
        }
        
        if (this.isAnswered) {
          clearInterval(this.timer);
          this.timer = null;
          return;
        }
        
        const elapsed = Date.now() - startTime;
        this.timeLeft = Math.max(0, this.maxTime - elapsed / 1000);
        this.timerProgress = (this.timeLeft / this.maxTime) * 100;
        
        if (this.timeLeft <= 5) {
          this.timerDanger = true;
          this.timerWarning = false;
        } else if (this.timeLeft <= 10) {
          this.timerWarning = true;
          this.timerDanger = false;
        } else {
          this.timerWarning = false;
          this.timerDanger = false;
        }
        
        const isMobile = window.innerWidth <= 600;
        if (this.timeLeft <= 10 && !this.isAnswered && this.currentWord) {
          const hint = this.generateHint(this.currentWord[this.config.hintField], this.timeLeft);
          if (!isMobile) {
            if (!this.hintShown) {
              this.hintShown = true;
              this.showHint = true;
            }
            this.hintText = hint;
          }
        } else if (this.timeLeft > 10 && !this.isAnswered) {
          this.hintShown = false;
          this.showHint = false;
          this.hintText = '';
        }
        
        if (this.timeLeft <= 0 && !this.isAnswered) {
          clearInterval(this.timer);
          this.timer = null;
          this.handleTimeout();
        }
      }, 100);
    },
    
    // Handle timeout
    handleTimeout() {
      this.isAnswered = true;
      if (!this.currentWord) return;
      
      this.isInputReadOnly = true;
      this.inputClass = 'answer-input wrong';
      this.feedbackText = '⏰ Hết thời gian!';
      this.feedbackType = 'timeout';
      
      this.wrongCount++;
      
      if (this.currentWord && !this.wrongWords.find(w => w.id === this.currentWord.id)) {
        this.wrongWords.push({
          id: this.currentWord.id,
          vocabulary: this.currentWord.vocabulary,
          meaning: this.currentWord.meaning
        });
      }
      
      this.showNextButton = true;
      
      const isMobile = window.innerWidth <= 600;
      if (isMobile) {
        this.showMobileNextButton = true;
      }
    },
    
    // Check answer
    checkAnswer() {
      if (this.isAnswered) return;
      
      if (!this.currentWord || !this.currentWord[this.config.answerField]) {
        return;
      }
      
      const userAnswer = this.userAnswer.trim();
      const correctAnswer = this.currentWord[this.config.answerField];
      
      let isCorrect;
      
      if (this.config.normalize) {
        const directMatch = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
        const normalizedUser = this.normalize(userAnswer);
        const normalizedCorrect = this.normalize(correctAnswer);
        const normalizedMatch = normalizedUser === normalizedCorrect;
        isCorrect = directMatch || normalizedMatch;
      } else {
        isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      }
      
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      
      const isMobile = window.innerWidth <= 600;
      
      if (isCorrect) {
        this.inputClass = 'answer-input correct';
        this.feedbackText = '✅ Đúng';
        this.feedbackType = 'correct';
        this.score++;
        this.correctCount++;
      } else {
        this.inputClass = 'answer-input wrong';
        this.feedbackText = '❌ Sai';
        this.feedbackType = isMobile ? 'timeout' : 'wrong';
        this.wrongCount++;
        
        if (this.currentWord && !this.wrongWords.find(w => w.id === this.currentWord.id)) {
          this.wrongWords.push({
            id: this.currentWord.id,
            vocabulary: this.currentWord.vocabulary,
            meaning: this.currentWord.meaning
          });
        }
      }
      
      this.isInputReadOnly = true;
      this.isAnswered = true;
      this.showNextButton = true;
      
      if (isMobile) {
        this.showMobileNextButton = true;
      }
    },
    
    // Handle Enter key
    handleEnterKey(e) {
      if (e.key !== 'Enter') return;
      
      e.preventDefault();
      e.stopPropagation();
      
      if (this.isNextWordProcessing) {
        return;
      }
      
      const feedbackVisible = this.feedbackText && this.feedbackText.trim() !== '';
      const inputHasValue = this.userAnswer && this.userAnswer.trim() !== '';
      
      if (feedbackVisible && this.isAnswered) {
        this.nextWord();
      } else if (inputHasValue && !this.isAnswered) {
        this.checkAnswer();
      }
    },
    
    // Next word
    nextWord() {
      if (this.isNextWordProcessing) {
        return;
      }
      
      this.isNextWordProcessing = true;
      
      try {
        if (this.currentWord && this.currentWord.id) {
          this.completedWords.push(this.currentWord.id);
        }
        
        if (this.upcomingWords.length === 0) {
          this.generateUpcomingWords();
        }
        
        if (this.upcomingWords.length > 0) {
          this.currentWord = this.upcomingWords[0];
          this.upcomingWords.shift();
        } else {
          this.currentWord = this.getRandomWord();
        }
        
        this.userAnswer = '';
        this.feedbackText = '';
        this.feedbackType = '';
        this.inputClass = 'answer-input';
        this.isInputReadOnly = false;
        this.isInputDisabled = false;
        this.isAnswered = false;
        this.showNextButton = false;
        this.showMobileNextButton = false;
        
        this.resetTimer();
        this.startTimer();
      } catch (error) {
        console.error('Error in nextWord:', error);
        alert('Có lỗi xảy ra: ' + error.message);
      } finally {
        this.isNextWordProcessing = false;
      }
    },
    
    // Handle input focus (for mobile scroll)
    handleInputFocus() {
      const isMobile = window.innerWidth <= 600;
      if (isMobile) {
        this.$nextTick(() => {
          const vocabularyCard = this.$el?.querySelector('.vocabulary-card');
          if (vocabularyCard) {
            setTimeout(() => {
              vocabularyCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 400);
          }
        });
      }
    }
  },
  mounted() {
    document.body.classList.add('practice-page');
    this.loadVocabulary();
    
    // Add global Enter key listener
    document.addEventListener('keydown', this.handleEnterKey);
  },
  beforeUnmount() {
    document.body.classList.remove('practice-page');
    
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    document.removeEventListener('keydown', this.handleEnterKey);
  }
};

