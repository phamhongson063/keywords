let vocabularyData = [];
let currentIndex = 0;
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
let wrongWords = [];

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

const circumference = 2 * Math.PI * 40;
const maxTime = 20;

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

function generateUpcomingWords() {
    try {
        if (upcomingWords.length > 0) {
            updateWordList();
            return;
        }
        
        if (!vocabularyData || vocabularyData.length === 0) {
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
        
        updateWordList();
    } catch (error) {
        console.error('Error in generateUpcomingWords:', error);
    }
}

function updateWordList() {
    if (!wordList) return;
    
    try {
        wordList.innerHTML = '';
        
        if (!Array.isArray(upcomingWords)) {
            upcomingWords = [];
        }
        
        const allWords = currentWord ? [currentWord, ...upcomingWords] : [...upcomingWords];
        const validWords = allWords.filter(word => word && word.vocabulary && word.meaning && word.id);
        
        validWords.forEach((word) => {
            try {
                const li = document.createElement('li');
                li.className = 'word-item';
                
                if (currentWord && word.id === currentWord.id) {
                    li.classList.add('current');
                }
                
                if (completedWords.includes(word.id) && word.id !== currentWord?.id) {
                    li.classList.add('completed');
                }
                
                // Hiển thị vocabulary trong danh sách
                const vocab = String(word.vocabulary || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                
                li.innerHTML = `
                    <div class="word-vocabulary">${vocab}</div>
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
    generateUpcomingWords();
    
    if (upcomingWords && upcomingWords.length > 0) {
        currentWord = upcomingWords[0];
        upcomingWords.shift();
        
        // Hiển thị VOCABULARY (tiếng Anh) - yêu cầu nhập lại VOCABULARY (tiếng Anh) đúng chính tả
        if (vocabularyText && currentWord) {
            vocabularyText.textContent = currentWord.vocabulary;
        }
        
        updateWordList();
        resetTimer();
        startTimer();
    }
}

let isNextWordProcessing = false;

function nextWord() {
    if (isNextWordProcessing) {
        return;
    }
    
    isNextWordProcessing = true;
    
    try {
        if (!Array.isArray(upcomingWords)) {
            upcomingWords = [];
        }
        
        if (!Array.isArray(completedWords)) {
            completedWords = [];
        }
        
        if (currentWord && currentWord.id) {
            if (!completedWords.includes(currentWord.id)) {
                completedWords.push(currentWord.id);
            }
        }
        
        if (upcomingWords.length === 0) {
            generateUpcomingWords();
        }
        
        if (!upcomingWords || upcomingWords.length === 0) {
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
            } else {
                upcomingWords.shift();
            }
        }
        
        if (!wordFound) {
            generateUpcomingWords();
            while (!wordFound && upcomingWords.length > 0) {
                currentWord = upcomingWords[0];
                if (currentWord && currentWord.vocabulary && currentWord.meaning && currentWord.id) {
                    upcomingWords.shift();
                    wordFound = true;
                } else {
                    upcomingWords.shift();
                }
            }
        }
        
        if (!wordFound || !currentWord || !currentWord.vocabulary) {
            if (vocabularyData && vocabularyData.length > 0) {
                for (let i = 0; i < vocabularyData.length; i++) {
                    const word = vocabularyData[i];
                    if (word && word.id && word.vocabulary && word.meaning) {
                        currentWord = word;
                        wordFound = true;
                        break;
                    }
                }
            }
            
            if (!wordFound || !currentWord || !currentWord.vocabulary) {
                if (vocabularyText) vocabularyText.textContent = 'Đã hết từ vựng!';
                isNextWordProcessing = false;
                return;
            }
        }
        
        // Hiển thị VOCABULARY (tiếng Anh) - yêu cầu nhập lại VOCABULARY (tiếng Anh) đúng chính tả
        if (vocabularyText && currentWord) {
            vocabularyText.textContent = currentWord.vocabulary;
        }
        
        if (answerInput) {
            answerInput.value = '';
            answerInput.className = 'answer-input';
            answerInput.disabled = false;
            answerInput.readOnly = false;
            answerInput.removeAttribute('data-answered');
        }
        
        if (feedback) {
            feedback.className = 'feedback';
            feedback.textContent = '';
        }
        
        if (nextButton) {
            nextButton.className = 'next-button';
        }
        
        isAnswered = false;
        
        setTimeout(() => {
            if (answerInput) {
                answerInput.focus();
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
    } catch (error) {
        console.error('Error in nextWord:', error);
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

// Generate hint cho vocabulary (hiển thị từng ký tự của vocabulary)
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
    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    const wordForTimer = currentWord;
    
    if (!wordForTimer || !wordForTimer.vocabulary || !wordForTimer.id) {
        return;
    }

    const startTime = Date.now();
    const wordId = wordForTimer.id;

    timer = setInterval(() => {
        try {
            if (currentWord && currentWord.id !== wordId) {
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
            
            // Hint hiển thị từng ký tự của vocabulary
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
        return;
    }

    if (!answerInput || !feedback) {
        return;
    }

    try {
        const userAnswer = answerInput.value.trim();
        // So sánh CHÍNH XÁC với vocabulary tiếng Anh (không normalize, yêu cầu chính tả đúng)
        const correctAnswer = currentWord.vocabulary;

        // So sánh chính xác tiếng Anh (case-insensitive nhưng giữ nguyên chính tả)
        const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

        isAnswered = true;
        
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        
        answerInput.readOnly = true;
        answerInput.disabled = false;
        answerInput.setAttribute('data-answered', 'true');

        const isMobile = window.innerWidth <= 600;
        
        if (isCorrect) {
            answerInput.className = 'answer-input correct';
            feedback.className = 'feedback correct show';
            feedback.textContent = `✅ Chính xác! Đáp án: "${currentWord.vocabulary}"`;
            score++;
            correctCount++;
        } else {
            answerInput.className = 'answer-input wrong';
            feedback.className = 'feedback wrong show';
            feedback.textContent = `❌ Sai rồi! Đáp án đúng: "${currentWord.vocabulary}"`;
            wrongCount++;
            
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
    if (!wrongWordsList) return;
    
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
                console.error('Error creating wrong word item:', error);
            }
        });
    } catch (error) {
        console.error('Error updating wrong words list:', error);
    }
}

function initEventListeners() {
    function handleEnterKey(e) {
        if (e.key !== 'Enter') return;
        
        e.preventDefault();
        e.stopPropagation();
        
        if (isNextWordProcessing) {
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
            try {
                nextWord();
            } catch (error) {
                console.error('ERROR in nextWord:', error);
            }
        }
        else if (inputHasValue) {
            try {
                checkAnswer();
            } catch (error) {
                console.error('ERROR in checkAnswer:', error);
            }
        }
    }

    if (answerInput) {
        answerInput.addEventListener('keydown', handleEnterKey);
    }
    
    document.addEventListener('keydown', handleEnterKey);

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            nextWord();
        });
    }
    
    if (mobileNextButton) {
        mobileNextButton.addEventListener('click', () => {
            nextWord();
        });
        mobileNextButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            nextWord();
        });
    }
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

