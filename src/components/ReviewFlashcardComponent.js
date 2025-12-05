const ReviewFlashcardComponentTemplate = `<div id="flashcard-page">
  <div class="back-button-container">
    <button class="back-button" @click="goToHome">
      <span class="back-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="back-text">Quay lại</span>
    </button>
    <div class="flashcard-progress">
      <div class="progress-text">{{ currentPosition }} / {{ reviewCards.length }}</div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
    </div>
  </div>
  <div v-if="reviewCards.length === 0" class="no-cards-message">
    <div class="message-icon">✨</div>
    <div class="message-text">Không có thẻ nào cần ôn tập hôm nay!</div>
  </div>
  <div v-else class="flashcard-container">
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
      <button id="nextButton" class="control-btn next-btn" :disabled="currentIndex >= reviewCards.length - 1" @click.stop="nextCard">
        <span class="btn-text">Sau</span>
        <span class="btn-icon">→</span>
      </button>
    </div>
  </div>
</div>`;

const ReviewFlashcardComponent = {
  template: ReviewFlashcardComponentTemplate,
  data() {
    return {
      vocabularyData: [],
      reviewCards: [],
      currentIndex: 0,
      isFlipped: false,
      isFlipping: false,
      reviewData: {},
      dailyLimit: 3
    };
  },
  computed: {
    currentWord() {
      if (this.reviewCards.length === 0 || this.currentIndex < 0 || this.currentIndex >= this.reviewCards.length) {
        return null;
      }
      return this.reviewCards[this.currentIndex];
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
    },
    currentPosition() {
      if (this.reviewCards.length === 0) return 0;
      return this.currentIndex + 1;
    },
    progressPercentage() {
      if (this.reviewCards.length === 0) return 0;
      return Math.round(((this.currentIndex + 1) / this.reviewCards.length) * 100);
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
        this.loadReviewData();
        this.filterReviewCards();
        this.initializeFlashcard();
      } catch (error) {
        console.error('Error loading vocabulary:', error);
      }
    },
    loadReviewData() {
      try {
        const saved = localStorage.getItem('review-data');
        if (saved) {
          this.reviewData = JSON.parse(saved);
        } else {
          this.reviewData = {};
        }
      } catch (error) {
        console.error('Error loading review data:', error);
        this.reviewData = {};
      }
    },
    saveReviewData() {
      try {
        localStorage.setItem('review-data', JSON.stringify(this.reviewData));
      } catch (error) {
        console.error('Error saving review data:', error);
      }
    },
    getReviewInfo(cardId) {
      if (!this.reviewData[cardId]) {
        return {
          repetitions: 0,
          nextReviewDate: null
        };
      }
      return this.reviewData[cardId];
    },
    getNextReviewInterval(repetitions) {
      const intervals = [1, 3, 7, 14, 30];
      if (repetitions < intervals.length) {
        return intervals[repetitions];
      }
      return 30;
    },
    calculateNextReviewDate(repetitions) {
      const interval = this.getNextReviewInterval(repetitions);
      const today = new Date();
      today.setDate(today.getDate() + interval);
      return today.toISOString().split('T')[0];
    },
    isDueForReview(cardId) {
      const reviewInfo = this.getReviewInfo(cardId);
      if (!reviewInfo.nextReviewDate) {
        return true;
      }
      const today = new Date().toISOString().split('T')[0];
      return reviewInfo.nextReviewDate <= today;
    },
    getTodayDate() {
      return new Date().toISOString().split('T')[0];
    },
    loadDailyReviewCards() {
      try {
        const saved = localStorage.getItem('daily-review-cards');
        const savedDate = localStorage.getItem('daily-review-date');
        const today = this.getTodayDate();
        
        if (saved && savedDate === today) {
          const cardIds = JSON.parse(saved);
          return cardIds;
        }
        return null;
      } catch (error) {
        console.error('Error loading daily review cards:', error);
        return null;
      }
    },
    saveDailyReviewCards(cardIds) {
      try {
        const today = this.getTodayDate();
        localStorage.setItem('daily-review-cards', JSON.stringify(cardIds));
        localStorage.setItem('daily-review-date', today);
      } catch (error) {
        console.error('Error saving daily review cards:', error);
      }
    },
    filterReviewCards() {
      const today = this.getTodayDate();
      const savedDailyCards = this.loadDailyReviewCards();
      
      if (savedDailyCards && savedDailyCards.length > 0) {
        this.reviewCards = this.vocabularyData.filter(card => {
          return savedDailyCards.includes(card.id);
        });
        return;
      }
      
      const allDueCards = this.vocabularyData.filter(card => {
        return this.isDueForReview(card.id);
      });
      
      const selectedCards = allDueCards.slice(0, this.dailyLimit);
      const selectedCardIds = selectedCards.map(card => card.id);
      
      this.saveDailyReviewCards(selectedCardIds);
      this.reviewCards = selectedCards;
    },
    markAsReviewed() {
      if (!this.currentWord) return;
      
      const cardId = this.currentWord.id;
      const reviewInfo = this.getReviewInfo(cardId);
      
      if (this.isFlipped) {
        reviewInfo.repetitions = reviewInfo.repetitions + 1;
        reviewInfo.nextReviewDate = this.calculateNextReviewDate(reviewInfo.repetitions);
        this.reviewData[cardId] = reviewInfo;
        this.saveReviewData();
      }
    },
    initializeFlashcard() {
      if (this.reviewCards.length === 0) return;
      
      const savedIndex = localStorage.getItem('review-current-index');
      if (savedIndex !== null) {
        const index = parseInt(savedIndex, 10);
        if (index >= 0 && index < this.reviewCards.length) {
          this.currentIndex = index;
        }
      } else {
        this.currentIndex = 0;
      }
      
      this.isFlipped = false;
      this.isFlipping = false;
    },
    showCard(index) {
      if (index < 0 || index >= this.reviewCards.length) return;
      
      const flashcard = document.getElementById('flashcard');
      if (flashcard) {
        flashcard.style.transition = 'none';
        flashcard.style.transform = 'rotateY(0deg)';
        flashcard.classList.remove('flipped');
        
        requestAnimationFrame(() => {
          this.$nextTick(() => {
            this.currentIndex = index;
            this.isFlipped = false;
            
            requestAnimationFrame(() => {
              if (flashcard) {
                flashcard.style.transition = '';
              }
            });
          });
        });
      } else {
        this.currentIndex = index;
        this.isFlipped = false;
      }
    },
    flipCard(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      if (this.isFlipping) {
        return;
      }
      
      this.isFlipping = true;
      this.isFlipped = !this.isFlipped;
      
      if (this.isFlipped) {
        this.markAsReviewed();
      }
      
      setTimeout(() => {
        this.isFlipping = false;
      }, 600);
    },
    prevCard() {
      if (this.currentIndex > 0) {
        const prevIndex = this.currentIndex - 1;
        this.showCard(prevIndex);
        localStorage.setItem('review-current-index', prevIndex.toString());
      }
    },
    nextCard() {
      if (this.currentIndex < this.reviewCards.length - 1) {
        const nextIndex = this.currentIndex + 1;
        this.showCard(nextIndex);
        localStorage.setItem('review-current-index', nextIndex.toString());
      } else {
        this.markAsReviewed();
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

