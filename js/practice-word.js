let vocabularyData = [];
let currentIndex = -1;
let currentWord = null;
let timer = null;
let timeLeft = 20;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let isAnswered = false;
let usedIndices = [];
let hintShown = false;
let upcomingWords = [];
let completedWords = [];
let wrongWords = []; // Danh sách các từ đã sai

const vocabularyText = document.getElementById('vocabularyText');
const answerInput = document.getElementById('answerInput');
const feedback = document.getElementById('feedback');
const nextButton = document.getElementById('nextButton');
const timerText = document.getElementById('timerText');
const timerProgress = document.getElementById('timerProgress');
const timerWrapper = document.getElementById('timerWrapper');
const scoreElement = document.getElementById('score');
const correctElement = document.getElementById('correct');
const wrongElement = document.getElementById('wrong');
const hintSection = document.getElementById('hintSection');
const hintText = document.getElementById('hintText');
const wordList = document.getElementById('wordList');
const mobileHintNotification = document.getElementById('mobileHintNotification');
const mobileHintText = document.getElementById('mobileHintText');
const mobileNextButton = document.getElementById('mobileNextButton');
const wrongWordsList = document.getElementById('wrongWordsList');

const circumference = 2 * Math.PI * 40; // r = 40
const maxTime = 20;

// Load vocabulary data
async function loadVocabulary() {
    try {
        const response = await fetch('../data/vocabulary.json');
        vocabularyData = await response.json();
        if (vocabularyData.length === 0) {
            vocabularyText.textContent = 'Không có dữ liệu từ vựng';
            return;
        }
        startGame();
    } catch (error) {
        console.error('Error loading vocabulary:', error);
        vocabularyText.textContent = 'Lỗi khi tải dữ liệu';
    }
}

function getRandomWord() {
    if (usedIndices.length >= vocabularyData.length) {
        usedIndices = [];
        completedWords = [];
    }

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * vocabularyData.length);
    } while (usedIndices.includes(randomIndex));

    usedIndices.push(randomIndex);
    return vocabularyData[randomIndex];
}

function generateUpcomingWords() {
    try {
        console.log('generateUpcomingWords called, upcomingWords.length:', upcomingWords.length);
        
        if (upcomingWords.length > 0) {
            console.log('Upcoming words already exist, skipping generation');
            updateWordList();
            return;
        }
        
        if (!vocabularyData || vocabularyData.length === 0) {
            console.error('No vocabulary data available');
            return;
        }
        
        const availableWords = [];
        const currentWordId = currentWord ? currentWord.id : null;
        
        for (let i = 0; i < vocabularyData.length; i++) {
            const word = vocabularyData[i];
            if (word && word.id && word.vocabulary && word.meaning) {
                if (word.id === currentWordId) {
                    continue;
                }
                if (!usedIndices.includes(i) && !completedWords.includes(word.id)) {
                    availableWords.push({ word: word, index: i });
                }
            }
        }
        
        if (availableWords.length === 0) {
            console.log('No available words, resetting...');
            usedIndices = [];
            for (let i = 0; i < vocabularyData.length; i++) {
                const word = vocabularyData[i];
                if (word && word.id && word.vocabulary && word.meaning) {
                    if (word.id !== currentWordId) {
                        availableWords.push({ word: word, index: i });
                    }
                }
            }
        }
        
        if (availableWords.length === 0) {
            console.warn('No words available after reset, using current word or any word');
            if (currentWord && currentWord.id && currentWord.vocabulary && currentWord.meaning) {
                availableWords.push({ word: currentWord, index: -1 });
            } else {
                for (let i = 0; i < vocabularyData.length; i++) {
                    const word = vocabularyData[i];
                    if (word && word.id && word.vocabulary && word.meaning) {
                        availableWords.push({ word: word, index: i });
                        break;
                    }
                }
            }
        }
        
        if (availableWords.length === 0) {
            console.error('No words available at all');
            return;
        }
        
        const shuffled = availableWords.sort(() => 0.5 - Math.random());
        const count = Math.min(5, shuffled.length);
        
        upcomingWords = [];
        for (let i = 0; i < count; i++) {
            if (shuffled[i] && shuffled[i].word) {
                const word = shuffled[i].word;
                if (word.id && word.vocabulary && word.meaning) {
                    upcomingWords.push(word);
                    if (shuffled[i].index !== undefined) {
                        usedIndices.push(shuffled[i].index);
                    }
                }
            }
        }
        
        console.log('Generated', upcomingWords.length, 'upcoming words');
        updateWordList();
    } catch (error) {
        console.error('Error in generateUpcomingWords:', error);
    }
}

function updateWordList() {
    console.log('updateWordList() called');
    
    if (!wordList) {
        console.error('wordList element not found');
        return;
    }
    
    try {
        wordList.innerHTML = '';
        
        if (!Array.isArray(upcomingWords)) {
            console.error('upcomingWords is not an array:', upcomingWords);
            upcomingWords = [];
        }
        
        const allWords = currentWord ? [currentWord, ...upcomingWords] : [...upcomingWords];
        const validWords = allWords.filter(word => word && word.vocabulary && word.meaning && word.id);
        
        validWords.forEach((word, index) => {
            try {
                const li = document.createElement('li');
                li.className = 'word-item';
                
                if (currentWord && word.id === currentWord.id) {
                    li.classList.add('current');
                }
                
                if (completedWords.includes(word.id) && word.id !== currentWord?.id) {
                    li.classList.add('completed');
                }
                
                // Hiển thị meaning trong danh sách (vì đây là chế độ luyện tập từ)
                const meaning = String(word.meaning || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                
                li.innerHTML = `
                    <div class="word-vocabulary">${meaning}</div>
                `;
                
                if (wordList) {
                    wordList.appendChild(li);
                }
            } catch (error) {
                console.error('Error creating word item:', error);
            }
        });
        
        if (validWords.length < 5) {
            const placeholdersNeeded = 5 - validWords.length;
            for (let i = 0; i < placeholdersNeeded; i++) {
                try {
                    const li = document.createElement('li');
                    li.className = 'word-item';
                    li.style.opacity = '0.3';
                    li.innerHTML = `
                        <div class="word-vocabulary">...</div>
                    `;
                    if (wordList) {
                        wordList.appendChild(li);
                    }
                } catch (error) {
                    console.error('Error creating placeholder:', error);
                }
            }
        }
    } catch (error) {
        console.error('Error in updateWordList:', error);
    }
}

function startGame() {
    console.log('=== startGame called ===');
    generateUpcomingWords();
    console.log('After generateUpcomingWords, upcomingWords.length:', upcomingWords.length);
    
    if (upcomingWords && upcomingWords.length > 0) {
        currentWord = upcomingWords[0];
        upcomingWords.shift();
        console.log('Initial currentWord:', currentWord);
        
        // Hiển thị MEANING thay vì vocabulary (đảo ngược)
        if (vocabularyText && currentWord) {
            vocabularyText.textContent = currentWord.meaning;
        }
        
        updateWordList();
        resetTimer();
        startTimer();
    } else {
        console.error('No words available to start game');
    }
}

let isNextWordProcessing = false;

function nextWord() {
    if (isNextWordProcessing) {
        console.warn('nextWord is already processing, ignoring call');
        return;
    }
    
    isNextWordProcessing = true;
    console.log('=== nextWord called ===');
    
    try {
        if (!Array.isArray(upcomingWords)) {
            console.warn('upcomingWords is not an array, resetting...');
            upcomingWords = [];
        }
        
        if (!Array.isArray(completedWords)) {
            completedWords = [];
        }
        
        if (currentWord && currentWord.id) {
            if (!completedWords.includes(currentWord.id)) {
                completedWords.push(currentWord.id);
                console.log('Marked current word as completed:', currentWord.id);
            }
        }
        
        if (upcomingWords.length === 0) {
            console.log('Upcoming words empty, generating new list');
            generateUpcomingWords();
        }
        
        if (!upcomingWords || upcomingWords.length === 0) {
            console.error('No upcoming words available after generation');
            if (vocabularyText) vocabularyText.textContent = 'Đã hết từ vựng!';
            isNextWordProcessing = false;
            return;
        }
        
        let wordFound = false;
        while (!wordFound && upcomingWords.length > 0) {
            currentWord = upcomingWords[0];
            if (currentWord && currentWord.vocabulary && currentWord.meaning && currentWord.id) {
                upcomingWords.shift();
                wordFound = true;
                console.log('Selected valid word:', currentWord.vocabulary);
            } else {
                console.warn('Invalid word found, removing:', currentWord);
                upcomingWords.shift();
            }
        }
        
        if (!wordFound) {
            console.log('No valid word in current list, generating new list');
            generateUpcomingWords();
            while (!wordFound && upcomingWords.length > 0) {
                currentWord = upcomingWords[0];
                if (currentWord && currentWord.vocabulary && currentWord.meaning && currentWord.id) {
                    upcomingWords.shift();
                    wordFound = true;
                    console.log('Selected valid word from new list:', currentWord.vocabulary);
                } else {
                    console.warn('Invalid word in new list, removing:', currentWord);
                    upcomingWords.shift();
                }
            }
        }
        
        if (!wordFound || !currentWord || !currentWord.meaning) {
            console.error('No valid word available after all attempts');
            if (vocabularyData && vocabularyData.length > 0) {
                console.log('Trying fallback: getting any word from vocabularyData');
                for (let i = 0; i < vocabularyData.length; i++) {
                    const word = vocabularyData[i];
                    if (word && word.id && word.vocabulary && word.meaning) {
                        currentWord = word;
                        wordFound = true;
                        console.log('Fallback word selected:', currentWord.vocabulary);
                        break;
                    }
                }
            }
            
            if (!wordFound || !currentWord || !currentWord.meaning) {
                if (vocabularyText) vocabularyText.textContent = 'Đã hết từ vựng!';
                isNextWordProcessing = false;
                return;
            }
        }
        
        console.log('Setting up new word');
        
        try {
            // Hiển thị MEANING thay vì vocabulary (đảo ngược)
            if (vocabularyText && currentWord) {
                vocabularyText.textContent = currentWord.meaning;
                console.log('Meaning text updated to:', currentWord.meaning);
            }
            
            if (answerInput) {
                answerInput.value = '';
                answerInput.className = 'answer-input';
                answerInput.disabled = false;
                answerInput.readOnly = false;
                answerInput.removeAttribute('data-answered');
                console.log('Input reset and enabled');
            }
            
            if (feedback) {
                feedback.className = 'feedback';
                feedback.textContent = '';
                console.log('Feedback cleared');
            }
            
            if (nextButton) {
                nextButton.className = 'next-button';
                console.log('Next button reset');
            }
        } catch (error) {
            console.error('Error updating DOM:', error);
        }
        
        isAnswered = false;
        console.log('isAnswered reset to false after setup');
        
        setTimeout(() => {
            try {
                if (answerInput) {
                    answerInput.focus();
                    console.log('Input focused');
                }
            } catch (error) {
                console.error('Error focusing input:', error);
            }
        }, 100);
        
        const isMobile = window.innerWidth <= 600;
        if (isMobile) {
            if (mobileHintNotification && mobileHintText) {
                mobileHintNotification.classList.remove('show', 'active');
                mobileHintText.textContent = '';
            }
            if (mobileNextButton) {
                mobileNextButton.classList.remove('show');
                mobileNextButton.style.display = 'none';
                mobileNextButton.style.opacity = '0';
                mobileNextButton.style.visibility = 'hidden';
            }
        } else {
            if (hintText) {
                hintText.textContent = '';
                hintText.className = 'hint-text empty';
            }
            if (hintSection) hintSection.classList.remove('active');
        }

        updateWordList();
        resetTimer();
        startTimer();
        
        console.log('=== nextWord completed successfully ===');
    } catch (error) {
        console.error('Error in nextWord:', error);
        alert('Có lỗi xảy ra: ' + error.message);
    } finally {
        isNextWordProcessing = false;
    }
}

function resetTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    timeLeft = maxTime;
    if (timerText) timerText.textContent = timeLeft;
    if (timerProgress) timerProgress.style.strokeDashoffset = circumference;
    if (timerWrapper) timerWrapper.classList.remove('warning');
    if (timerProgress) timerProgress.classList.remove('warning', 'danger');
    const isMobile = window.innerWidth <= 600;
    if (isMobile) {
        if (mobileHintNotification && mobileHintText) {
            mobileHintNotification.classList.remove('show', 'active');
            mobileHintText.textContent = '';
        }
        if (mobileNextButton) {
            mobileNextButton.classList.remove('show');
            mobileNextButton.style.display = 'none';
            mobileNextButton.style.opacity = '0';
            mobileNextButton.style.visibility = 'hidden';
        }
    } else {
        if (hintText) {
            hintText.textContent = '';
            hintText.className = 'hint-text empty';
        }
        if (hintSection) hintSection.classList.remove('active');
    }
    hintShown = false;
}

// Generate hint cho vocabulary (đảo ngược - hiển thị từng ký tự của vocabulary)
function generateHint(vocabulary, timeLeft) {
    const progress = (10 - timeLeft) / 10;
    const minPercent = 0.2;
    const maxPercent = 0.9;
    const hintPercent = minPercent + (maxPercent - minPercent) * progress;
    
    const hintLength = Math.max(1, Math.floor(vocabulary.length * hintPercent));
    const hint = vocabulary.substring(0, hintLength);
    
    return hintLength < vocabulary.length ? hint + '...' : hint;
}

function startTimer() {
    console.log('startTimer() called');
    
    if (timer) {
        console.log('Clearing old timer');
        clearInterval(timer);
        timer = null;
    }

    const wordForTimer = currentWord;
    console.log('wordForTimer:', wordForTimer);
    
    if (!wordForTimer || !wordForTimer.vocabulary || !wordForTimer.id) {
        console.warn('No valid word for timer, skipping timer start');
        return;
    }

    const startTime = Date.now();
    const duration = maxTime * 1000;
    const wordId = wordForTimer.id;
    console.log('Starting timer for word:', wordForTimer.meaning, 'id:', wordId);

    timer = setInterval(() => {
        try {
            if (currentWord && currentWord.id !== wordId) {
                console.log('Word changed, stopping old timer');
                clearInterval(timer);
                timer = null;
                return;
            }

            if (isAnswered) {
                clearInterval(timer);
                timer = null;
                return;
            }

            const elapsed = Date.now() - startTime;
            timeLeft = Math.max(0, maxTime - elapsed / 1000);
            
            const progress = timeLeft / maxTime;
            const offset = circumference * (1 - progress);
            if (timerProgress) timerProgress.style.strokeDashoffset = offset;
            if (timerText) timerText.textContent = Math.ceil(timeLeft);

            if (timerProgress) {
                if (timeLeft <= 5) {
                    timerProgress.classList.add('danger');
                    timerProgress.classList.remove('warning');
                } else if (timeLeft <= 10) {
                    timerProgress.classList.add('warning');
                    timerProgress.classList.remove('danger');
                    if (timerWrapper) timerWrapper.classList.add('warning');
                }
            }
            
            const isMobile = window.innerWidth <= 600;
            
            // Hint sẽ hiển thị từng ký tự của vocabulary (đảo ngược)
            if (timeLeft <= 10 && !isAnswered && wordForTimer) {
                const hint = generateHint(wordForTimer.vocabulary, timeLeft);
                
                if (isMobile) {
                    if (mobileHintNotification && mobileHintText) {
                        if (!hintShown) {
                            hintShown = true;
                            mobileHintNotification.classList.add('show', 'active');
                        }
                        mobileHintText.textContent = hint;
                    }
                } else {
                    if (hintText && hintSection) {
                        if (!hintShown) {
                            hintShown = true;
                            hintSection.classList.add('active');
                        }
                        hintText.textContent = hint;
                        hintText.className = 'hint-text';
                    }
                }
            } else if (timeLeft > 10 && !isAnswered) {
                if (isMobile) {
                    if (mobileHintNotification && mobileHintText) {
                        mobileHintNotification.classList.remove('show', 'active');
                        mobileHintText.textContent = '';
                    }
                } else {
                    if (hintText && hintSection) {
                        hintText.textContent = '';
                        hintText.className = 'hint-text empty';
                        hintSection.classList.remove('active');
                    }
                }
                hintShown = false;
            }

            if (timeLeft <= 0 && !isAnswered) {
                clearInterval(timer);
                timer = null;
                handleTimeout();
            }
        } catch (error) {
            console.error('Error in timer interval:', error);
            clearInterval(timer);
            timer = null;
        }
    }, 100);
}

function handleTimeout() {
    isAnswered = true;
    if (!currentWord) return;
    
    if (answerInput) {
        answerInput.readOnly = true;
        answerInput.disabled = false;
        answerInput.setAttribute('data-answered', 'true');
        answerInput.className = 'answer-input wrong';
    }
    
    // Hiển thị vocabulary đúng (đảo ngược)
    if (feedback) {
        feedback.className = 'feedback timeout show';
        feedback.textContent = `⏰ Hết thời gian! Đáp án đúng: "${currentWord.vocabulary}"`;
    }
    
    wrongCount++;
    
    if (currentWord && !wrongWords.find(w => w.id === currentWord.id)) {
        wrongWords.push({
            id: currentWord.id,
            vocabulary: currentWord.vocabulary,
            meaning: currentWord.meaning
        });
        updateWrongWordsList();
    }
    
    updateScore();
    
    if (nextButton) {
        nextButton.className = 'next-button show';
    }
    
    const isMobile = window.innerWidth <= 600;
    if (isMobile) {
        if (mobileNextButton) {
            void mobileNextButton.offsetWidth;
            mobileNextButton.classList.add('show');
            mobileNextButton.style.display = 'flex';
            mobileNextButton.style.opacity = '1';
            mobileNextButton.style.visibility = 'visible';
        }
        
        if (mobileHintNotification) {
            mobileHintNotification.classList.remove('show', 'active');
            if (mobileHintText) {
                mobileHintText.textContent = '';
            }
        }
    }
}

function checkAnswer() {
    if (isAnswered) return;
    
    if (!currentWord || !currentWord.vocabulary) {
        console.error('No current word available');
        return;
    }

    if (!answerInput || !feedback) {
        console.error('DOM elements not found');
        return;
    }

    try {
        const normalize = (str) => {
            if (!str) return '';
            try {
                return str
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase()
                    .trim();
            } catch (e) {
                return str.toLowerCase().trim();
            }
        };

        const userAnswer = answerInput.value.trim();
        // So sánh với vocabulary thay vì meaning (đảo ngược)
        const correctAnswer = currentWord.vocabulary;

        const directMatch = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
        const normalizedUser = normalize(userAnswer);
        const normalizedCorrect = normalize(correctAnswer);
        const normalizedMatch = normalizedUser === normalizedCorrect;

        const isCorrect = directMatch || normalizedMatch;

        isAnswered = true;
        console.log('=== checkAnswer: isAnswered set to TRUE ===');
        console.log('User answer:', userAnswer);
        console.log('Correct answer:', correctAnswer);
        console.log('Final result:', isCorrect);
        
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        
        answerInput.readOnly = true;
        answerInput.disabled = false;
        answerInput.setAttribute('data-answered', 'true');
        console.log('Input locked');

        const isMobile = window.innerWidth <= 600;
        
        if (isCorrect) {
            answerInput.className = 'answer-input correct';
            // Hiển thị vocabulary đúng (đảo ngược)
            feedback.className = 'feedback correct show';
            feedback.textContent = `✅ Chính xác! Đáp án: "${currentWord.vocabulary}"`;
            score++;
            correctCount++;
            console.log('Answer is CORRECT');
        } else {
            answerInput.className = 'answer-input wrong';
            // Hiển thị vocabulary đúng (đảo ngược)
            feedback.className = 'feedback wrong show';
            feedback.textContent = `❌ Sai rồi! Đáp án đúng: "${currentWord.vocabulary}"`;
            wrongCount++;
            console.log('Answer is WRONG');
            
            if (currentWord && !wrongWords.find(w => w.id === currentWord.id)) {
                wrongWords.push({
                    id: currentWord.id,
                    vocabulary: currentWord.vocabulary,
                    meaning: currentWord.meaning
                });
                updateWrongWordsList();
            }
        }
        
        updateScore();
        if (nextButton) {
            nextButton.className = 'next-button show';
        }
        
        if (isMobile) {
            if (mobileNextButton) {
                void mobileNextButton.offsetWidth;
                mobileNextButton.classList.add('show');
                mobileNextButton.style.display = 'flex';
                mobileNextButton.style.opacity = '1';
                mobileNextButton.style.visibility = 'visible';
            }
            
            if (mobileHintNotification) {
                mobileHintNotification.classList.remove('show', 'active');
                if (mobileHintText) {
                    mobileHintText.textContent = '';
                }
            }
        }
    } catch (error) {
        console.error('Error in checkAnswer:', error);
        alert('Có lỗi xảy ra khi kiểm tra đáp án: ' + error.message);
    }
}

function updateScore() {
    try {
        if (scoreElement) scoreElement.textContent = score;
        if (correctElement) correctElement.textContent = correctCount;
        if (wrongElement) wrongElement.textContent = wrongCount;
    } catch (error) {
        console.error('Error updating score:', error);
    }
}

function updateWrongWordsList() {
    if (!wrongWordsList) {
        console.error('wrongWordsList element not found');
        return;
    }
    
    try {
        wrongWordsList.innerHTML = '';
        
        if (wrongWords.length === 0) {
            const emptyLi = document.createElement('li');
            emptyLi.className = 'wrong-words-empty';
            emptyLi.textContent = 'Chưa có từ nào sai';
            wrongWordsList.appendChild(emptyLi);
            return;
        }
        
        wrongWords.forEach((word) => {
            try {
                const li = document.createElement('li');
                li.className = 'wrong-word-item';
                
                const vocab = String(word.vocabulary || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const meaning = String(word.meaning || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                
                li.innerHTML = `
                    <div class="wrong-word-vocab">${vocab}</div>
                    <div class="wrong-word-meaning">${meaning}</div>
                `;
                
                wrongWordsList.appendChild(li);
            } catch (error) {
                console.error('Error creating wrong word item:', error, word);
            }
        });
    } catch (error) {
        console.error('Error updating wrong words list:', error);
    }
}

function initEventListeners() {
    console.log('Initializing event listeners...');
    
    function handleEnterKey(e) {
        if (e.key !== 'Enter') return;
        
        e.preventDefault();
        e.stopPropagation();
        
        console.log('=== Enter pressed ===');
        console.log('isNextWordProcessing:', isNextWordProcessing);
        console.log('isAnswered:', isAnswered);
        
        if (isNextWordProcessing) {
            console.log('nextWord is processing, ignoring');
            return;
        }
        
        let feedbackVisible = false;
        if (feedback) {
            const hasShow = feedback.classList.contains('show');
            const hasText = feedback.textContent && feedback.textContent.trim() !== '';
            feedbackVisible = hasShow && hasText;
        }
        
        const inputHasValue = answerInput && answerInput.value.trim() !== '';
        const inputLocked = answerInput && answerInput.readOnly;
        
        if (inputLocked || feedbackVisible || isAnswered) {
            console.log('>>> ANSWERED - Calling nextWord()');
            try {
                nextWord();
            } catch (error) {
                console.error('ERROR in nextWord:', error);
                alert('Lỗi khi chuyển từ: ' + error.message);
            }
        }
        else if (inputHasValue) {
            console.log('>>> HAS INPUT - Calling checkAnswer()');
            try {
                checkAnswer();
            } catch (error) {
                console.error('ERROR in checkAnswer:', error);
                alert('Lỗi khi kiểm tra đáp án: ' + error.message);
            }
        }
    }

    if (answerInput) {
        answerInput.addEventListener('keydown', handleEnterKey);
    } else {
        console.error('answerInput not found');
    }
    
    document.addEventListener('keydown', handleEnterKey);

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            console.log('Next button clicked');
            nextWord();
        });
    } else {
        console.error('nextButton not found');
    }
    
    if (mobileNextButton) {
        mobileNextButton.addEventListener('click', () => {
            console.log('Mobile next button clicked');
            nextWord();
        });
        mobileNextButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            console.log('Mobile next button touched');
            nextWord();
        });
    } else {
        console.error('mobileNextButton not found');
    }
    
    console.log('Event listeners initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (mobileHintNotification) {
            mobileHintNotification.classList.remove('show', 'active');
            if (mobileHintText) mobileHintText.textContent = '';
        }
        initEventListeners();
        loadVocabulary();
    });
} else {
    if (mobileHintNotification) {
        mobileHintNotification.classList.remove('show', 'active');
        if (mobileHintText) mobileHintText.textContent = '';
    }
    initEventListeners();
    loadVocabulary();
}

