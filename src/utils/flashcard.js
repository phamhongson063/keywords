let vocabularyData = [];
let currentIndex = 0;
let isFlipped = false;

// Function to get DOM elements - call this each time to ensure fresh references
function getElements() {
  return {
    flashcard: document.getElementById('flashcard'),
    flashcardFront: document.getElementById('flashcardFront'),
    flashcardBack: document.getElementById('flashcardBack'),
    vocabularyText: document.getElementById('vocabularyText'),
    meaningText: document.getElementById('meaningText'),
    currentIndexElement: document.getElementById('currentIndex'),
    totalCardsElement: document.getElementById('totalCards'),
    prevButton: document.getElementById('prevButton'),
    nextButton: document.getElementById('nextButton'),
    flipButton: document.getElementById('flipButton')
  };
}

// Load vocabulary data
async function loadVocabulary() {
    const elements = getElements();
    if (!elements.vocabularyText || !elements.meaningText) {
        // Retry after a short delay if elements not found
        setTimeout(loadVocabulary, 100);
        return;
    }
    
    try {
        const response = await fetch('src/assets/data/vocabulary.json');
        vocabularyData = await response.json();
        if (vocabularyData.length === 0) {
            elements.vocabularyText.textContent = 'Không có dữ liệu từ vựng';
            elements.meaningText.textContent = 'Không có dữ liệu từ vựng';
            return;
        }
        initializeFlashcard();
    } catch (error) {
        console.error('Error loading vocabulary:', error);
        elements.vocabularyText.textContent = 'Lỗi khi tải dữ liệu';
        elements.meaningText.textContent = 'Lỗi khi tải dữ liệu';
    }
}

function initializeFlashcard() {
    const elements = getElements();
    if (vocabularyData.length === 0 || !elements.flashcard) return;
    
    // Reset về mặt trước
    isFlipped = false;
    currentIndex = 0;
    elements.flashcard.classList.remove('flipped');
    
    // Cập nhật tổng số thẻ
    if (elements.totalCardsElement) {
        elements.totalCardsElement.textContent = vocabularyData.length;
    }
    
    // Hiển thị thẻ đầu tiên
    showCard(currentIndex);
    
    // Cập nhật trạng thái buttons
    updateButtons();
    
    // Setup event listeners
    setupEventListeners();
}

function showCard(index) {
    const elements = getElements();
    if (index < 0 || index >= vocabularyData.length || !elements.vocabularyText || !elements.meaningText) return;
    
    currentIndex = index;
    const word = vocabularyData[currentIndex];
    
    if (word) {
        elements.vocabularyText.textContent = word.vocabulary || 'N/A';
        elements.meaningText.textContent = word.meaning || 'N/A';
        if (elements.currentIndexElement) {
            elements.currentIndexElement.textContent = currentIndex + 1;
        }
    }
    
    // Reset về mặt trước khi chuyển thẻ
    isFlipped = false;
    if (elements.flashcard) {
        elements.flashcard.classList.remove('flipped');
    }
    
    updateButtons();
}

function flipCard() {
    const elements = getElements();
    if (!elements.flashcard) return;
    
    isFlipped = !isFlipped;
    if (isFlipped) {
        elements.flashcard.classList.add('flipped');
    } else {
        elements.flashcard.classList.remove('flipped');
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
    const elements = getElements();
    if (elements.prevButton) {
        elements.prevButton.disabled = currentIndex === 0;
    }
    if (elements.nextButton) {
        elements.nextButton.disabled = currentIndex === vocabularyData.length - 1;
    }
}

function setupEventListeners() {
    const elements = getElements();
    
    // Remove old listeners by cloning elements
    if (elements.flashcard) {
        const newFlashcard = elements.flashcard.cloneNode(true);
        elements.flashcard.parentNode.replaceChild(newFlashcard, elements.flashcard);
        newFlashcard.setAttribute('id', 'flashcard');
        newFlashcard.addEventListener('click', flipCard);
    }
    
    if (elements.flipButton) {
        const newFlipButton = elements.flipButton.cloneNode(true);
        elements.flipButton.parentNode.replaceChild(newFlipButton, elements.flipButton);
        newFlipButton.setAttribute('id', 'flipButton');
        newFlipButton.addEventListener('click', (e) => {
            e.stopPropagation();
            flipCard();
        });
    }
    
    if (elements.prevButton) {
        const newPrevButton = elements.prevButton.cloneNode(true);
        elements.prevButton.parentNode.replaceChild(newPrevButton, elements.prevButton);
        newPrevButton.setAttribute('id', 'prevButton');
        newPrevButton.addEventListener('click', (e) => {
            e.stopPropagation();
            prevCard();
        });
    }
    
    if (elements.nextButton) {
        const newNextButton = elements.nextButton.cloneNode(true);
        elements.nextButton.parentNode.replaceChild(newNextButton, elements.nextButton);
        newNextButton.setAttribute('id', 'nextButton');
        newNextButton.addEventListener('click', (e) => {
            e.stopPropagation();
            nextCard();
        });
    }
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const elements = getElements();
    if (!elements.flashcard) return;
    
    if (e.key === 'ArrowLeft') {
        prevCard();
    } else if (e.key === 'ArrowRight') {
        nextCard();
    } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flipCard();
    }
});

// Export functions for use by Vue component
window.loadVocabulary = loadVocabulary;
window.resetFlashcardState = function() {
    currentIndex = 0;
    isFlipped = false;
    vocabularyData = [];
};

