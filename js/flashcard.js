let vocabularyData = [];
let currentIndex = 0;
let isFlipped = false;

const flashcard = document.getElementById('flashcard');
const flashcardFront = document.getElementById('flashcardFront');
const flashcardBack = document.getElementById('flashcardBack');
const vocabularyText = document.getElementById('vocabularyText');
const meaningText = document.getElementById('meaningText');
const currentIndexElement = document.getElementById('currentIndex');
const totalCardsElement = document.getElementById('totalCards');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const flipButton = document.getElementById('flipButton');

// Load vocabulary data
async function loadVocabulary() {
    try {
        const response = await fetch('../data/vocabulary.json');
        vocabularyData = await response.json();
        if (vocabularyData.length === 0) {
            vocabularyText.textContent = 'Không có dữ liệu từ vựng';
            meaningText.textContent = 'Không có dữ liệu từ vựng';
            return;
        }
        initializeFlashcard();
    } catch (error) {
        console.error('Error loading vocabulary:', error);
        vocabularyText.textContent = 'Lỗi khi tải dữ liệu';
        meaningText.textContent = 'Lỗi khi tải dữ liệu';
    }
}

function initializeFlashcard() {
    if (vocabularyData.length === 0) return;
    
    // Reset về mặt trước
    isFlipped = false;
    flashcard.classList.remove('flipped');
    
    // Cập nhật tổng số thẻ
    totalCardsElement.textContent = vocabularyData.length;
    
    // Hiển thị thẻ đầu tiên
    showCard(currentIndex);
    
    // Cập nhật trạng thái buttons
    updateButtons();
}

function showCard(index) {
    if (index < 0 || index >= vocabularyData.length) return;
    
    currentIndex = index;
    const word = vocabularyData[currentIndex];
    
    if (word) {
        vocabularyText.textContent = word.vocabulary || 'N/A';
        meaningText.textContent = word.meaning || 'N/A';
        currentIndexElement.textContent = currentIndex + 1;
    }
    
    // Reset về mặt trước khi chuyển thẻ
    isFlipped = false;
    flashcard.classList.remove('flipped');
    
    updateButtons();
}

function flipCard() {
    isFlipped = !isFlipped;
    if (isFlipped) {
        flashcard.classList.add('flipped');
    } else {
        flashcard.classList.remove('flipped');
    }
}

function prevCard() {
    if (currentIndex > 0) {
        showCard(currentIndex - 1);
    }
}

function nextCard() {
    if (currentIndex < vocabularyData.length - 1) {
        showCard(currentIndex + 1);
    }
}

function updateButtons() {
    if (prevButton) {
        prevButton.disabled = currentIndex === 0;
    }
    if (nextButton) {
        nextButton.disabled = currentIndex === vocabularyData.length - 1;
    }
}

// Event listeners
if (flashcard) {
    flashcard.addEventListener('click', flipCard);
}

if (flipButton) {
    flipButton.addEventListener('click', (e) => {
        e.stopPropagation();
        flipCard();
    });
}

if (prevButton) {
    prevButton.addEventListener('click', (e) => {
        e.stopPropagation();
        prevCard();
    });
}

if (nextButton) {
    nextButton.addEventListener('click', (e) => {
        e.stopPropagation();
        nextCard();
    });
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        prevCard();
    } else if (e.key === 'ArrowRight') {
        nextCard();
    } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flipCard();
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadVocabulary);
} else {
    loadVocabulary();
}

