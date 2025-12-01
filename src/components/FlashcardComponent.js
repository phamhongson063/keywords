const FlashcardComponentTemplate = `<div id="flashcard-page">
  <div class="back-button-container">
    <button class="back-button" @click="goToHome">
      <span class="back-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="back-text">Quay lại</span>
    </button>
  </div>
  <div class="flashcard-container">
    <div class="flashcard-wrapper">
      <div id="flashcard" class="flashcard" :class="{ 'flipped': isFlipped }" @click.stop="flipCard" @touchstart.stop="flipCard">
        <div id="flashcardFront" class="flashcard-front">
          <div class="flashcard-label">Từ vựng</div>
          <div class="flashcard-content">
            <div id="vocabularyText" class="flashcard-text">{{ currentWordVocabulary }}</div>
          </div>
        </div>
        <div id="flashcardBack" class="flashcard-back">
          <div class="flashcard-label">Nghĩa</div>
          <div class="flashcard-content">
            <div v-if="currentWordFurigana" class="flashcard-furigana">{{ currentWordFurigana }}</div>
            <div class="flashcard-meaning">{{ currentWordMeaning }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="flashcard-controls">
      <button id="prevButton" class="control-btn prev-btn" :disabled="currentIndex === 0" @click.stop="prevCard">
        <span class="btn-icon">←</span>
        <span class="btn-text">Trước</span>
      </button>
      <button id="flipButton" class="control-btn flip-btn" @click.stop="flipCard" style="display: none;">
        <span class="btn-icon">↻</span>
        <span class="btn-text">Lật</span>
      </button>
      <button id="nextButton" class="control-btn next-btn" :disabled="currentIndex >= vocabularyData.length - 1" @click.stop="nextCard">
        <span class="btn-text">Sau</span>
        <span class="btn-icon">→</span>
      </button>
    </div>
  </div>
</div>`;

const FlashcardComponent = {
  template: FlashcardComponentTemplate,
  data() {
    return {
      vocabularyData: [],
      currentIndex: 0,
      isFlipped: false
    };
  },
  computed: {
    currentWord() {
      if (this.vocabularyData.length === 0 || this.currentIndex < 0 || this.currentIndex >= this.vocabularyData.length) {
        return null;
      }
      return this.vocabularyData[this.currentIndex];
    },
    currentWordVocabulary() {
      if (!this.currentWord) return 'Đang tải...';
      return this.currentWord.vocabulary || 'N/A';
    },
    currentWordFurigana() {
      if (!this.currentWord) return '';
      return this.currentWord.furigana || '';
    },
    currentWordMeaning() {
      if (!this.currentWord) return 'Đang tải...';
      return this.currentWord.meaning || 'N/A';
    }
  },
  methods: {
    goToHome() {
      this.$router.push('/').catch(err => {
        console.error('Navigation error:', err);
      });
    },
    async loadVocabulary() {
      try {
        const response = await fetch('src/assets/data/vocabulary.json');
        this.vocabularyData = await response.json();
        if (this.vocabularyData.length === 0) {
          return;
        }
        this.initializeFlashcard();
      } catch (error) {
        console.error('Error loading vocabulary:', error);
      }
    },
    initializeFlashcard() {
      if (this.vocabularyData.length === 0) return;
      
      this.isFlipped = false;
      this.currentIndex = 0;
    },
    showCard(index) {
      if (index < 0 || index >= this.vocabularyData.length) return;
      
      this.currentIndex = index;
      this.isFlipped = false;
    },
    flipCard(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.isFlipped = !this.isFlipped;
    },
    prevCard() {
      if (this.currentIndex > 0) {
        this.showCard(this.currentIndex - 1);
      }
    },
    nextCard() {
      if (this.currentIndex < this.vocabularyData.length - 1) {
        this.showCard(this.currentIndex + 1);
      }
    },
    handleKeyDown(e) {
      if (e.key === 'ArrowLeft') {
        this.prevCard();
      } else if (e.key === 'ArrowRight') {
        this.nextCard();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.flipCard();
      }
    }
  },
  mounted() {
    document.body.classList.add('practice-page');
    this.loadVocabulary();
    document.addEventListener('keydown', this.handleKeyDown);
  },
  beforeUnmount() {
    document.body.classList.remove('practice-page');
    document.removeEventListener('keydown', this.handleKeyDown);
  }
};

