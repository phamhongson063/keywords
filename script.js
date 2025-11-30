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
const wrongWordsList = document.getElementById('wrongWordsList');

const circumference = 2 * Math.PI * 40; // r = 40
const maxTime = 20;

// Load vocabulary data
async function loadVocabulary() {
    try {
        const response = await fetch('data/vocabulary.json');
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
        
        // Chỉ tạo danh sách mới nếu danh sách hiện tại đã hết
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
        
        // Tạo danh sách các từ chưa được sử dụng (trừ từ hiện tại)
        for (let i = 0; i < vocabularyData.length; i++) {
            const word = vocabularyData[i];
            if (word && word.id && word.vocabulary && word.meaning) {
                // Không thêm từ hiện tại vào danh sách
                if (word.id === currentWordId) {
                    continue;
                }
                // Chỉ thêm từ chưa được sử dụng và chưa hoàn thành
                if (!usedIndices.includes(i) && !completedWords.includes(word.id)) {
                    availableWords.push({ word: word, index: i });
                }
            }
        }
        
        // Nếu đã hết từ, reset và tạo lại (trừ từ hiện tại)
        if (availableWords.length === 0) {
            console.log('No available words, resetting...');
            usedIndices = [];
            // KHÔNG reset completedWords ở đây, chỉ reset usedIndices
            // completedWords = []; // Bỏ dòng này
            for (let i = 0; i < vocabularyData.length; i++) {
                const word = vocabularyData[i];
                if (word && word.id && word.vocabulary && word.meaning) {
                    // Chỉ loại trừ từ hiện tại, không loại trừ các từ đã completed
                    if (word.id !== currentWordId) {
                        availableWords.push({ word: word, index: i });
                    }
                }
            }
        }
        
        // Nếu vẫn không có từ (chỉ có 1 từ trong data), thì dùng lại từ đó
        if (availableWords.length === 0) {
            console.warn('No words available after reset, using current word or any word');
            // Nếu có từ hiện tại, dùng lại
            if (currentWord && currentWord.id && currentWord.vocabulary && currentWord.meaning) {
                availableWords.push({ word: currentWord, index: -1 });
            } else {
                // Nếu không có từ hiện tại, lấy từ đầu tiên trong data
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
        
        // Lấy ngẫu nhiên 5 từ
        const shuffled = availableWords.sort(() => 0.5 - Math.random());
        const count = Math.min(5, shuffled.length);
        
        upcomingWords = [];
        for (let i = 0; i < count; i++) {
            if (shuffled[i] && shuffled[i].word) {
                const word = shuffled[i].word;
                // Kiểm tra word hợp lệ trước khi thêm
                if (word.id && word.vocabulary && word.meaning) {
                    upcomingWords.push(word);
                    // Đánh dấu index đã được chọn
                    if (shuffled[i].index !== undefined) {
                        usedIndices.push(shuffled[i].index);
                    }
                }
            }
        }
        
        console.log('Generated', upcomingWords.length, 'upcoming words:', upcomingWords.map(w => w.vocabulary));
        updateWordList();
    } catch (error) {
        console.error('Error in generateUpcomingWords:', error);
        console.error('Error stack:', error.stack);
    }
}

function updateWordList() {
    console.log('updateWordList() called');
    
    if (!wordList) {
        console.error('wordList element not found');
        return;
    }
    
    try {
        console.log('Clearing word list...');
        wordList.innerHTML = '';
        
        // Đảm bảo upcomingWords là array
        if (!Array.isArray(upcomingWords)) {
            console.error('upcomingWords is not an array:', upcomingWords);
            upcomingWords = [];
        }
        
        // Hiển thị từ hiện tại và các từ còn lại trong danh sách
        const allWords = currentWord ? [currentWord, ...upcomingWords] : [...upcomingWords];
        console.log('allWords length:', allWords.length);
        
        // Lọc bỏ các word không hợp lệ
        const validWords = allWords.filter(word => word && word.vocabulary && word.meaning && word.id);
        console.log('validWords length:', validWords.length);
        
        console.log('Creating word items...');
        validWords.forEach((word, index) => {
            try {
                console.log(`Creating item ${index + 1}/${validWords.length} for word:`, word.vocabulary);
                
                const li = document.createElement('li');
                li.className = 'word-item';
                
                // Đánh dấu từ hiện tại
                if (currentWord && word.id === currentWord.id) {
                    li.classList.add('current');
                    console.log('Marked as current word');
                }
                
                // Đánh dấu từ đã hoàn thành
                if (completedWords.includes(word.id) && word.id !== currentWord?.id) {
                    li.classList.add('completed');
                    console.log('Marked as completed word');
                }
                
                // Escape HTML để tránh XSS và lỗi
                const vocab = String(word.vocabulary || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                
                li.innerHTML = `
                    <div class="word-vocabulary">${vocab}</div>
                `;
                
                if (wordList) {
                    wordList.appendChild(li);
                    console.log(`Item ${index + 1} appended successfully`);
                } else {
                    console.error('wordList is null when trying to append');
                }
            } catch (error) {
                console.error('Error creating word item:', error);
                console.error('Error stack:', error.stack);
                console.error('Word data:', word);
            }
        });
        console.log('All word items created');
        
        // Nếu chưa đủ 5 từ, hiển thị placeholder
        console.log('Checking if need placeholders, validWords.length:', validWords.length);
        if (validWords.length < 5) {
            const placeholdersNeeded = 5 - validWords.length;
            console.log('Adding', placeholdersNeeded, 'placeholders');
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
        console.log('updateWordList() completed successfully');
    } catch (error) {
        console.error('Error in updateWordList:', error);
        console.error('Error stack:', error.stack);
    }
}

function startGame() {
    console.log('=== startGame called ===');
    // Tạo danh sách 5 từ ban đầu
    generateUpcomingWords();
    console.log('After generateUpcomingWords, upcomingWords.length:', upcomingWords.length);
    
    // Lấy từ đầu tiên làm currentWord
    if (upcomingWords && upcomingWords.length > 0) {
        currentWord = upcomingWords[0];
        upcomingWords.shift();
        console.log('Initial currentWord:', currentWord);
        
        // Hiển thị từ đầu tiên
        if (vocabularyText && currentWord) {
            vocabularyText.textContent = currentWord.vocabulary;
        }
        
        // Cập nhật danh sách
        updateWordList();
        
        // Reset và start timer
        resetTimer();
        startTimer();
    } else {
        console.error('No words available to start game');
    }
}

// Biến để tránh gọi nextWord nhiều lần đồng thời
let isNextWordProcessing = false;

function nextWord() {
    // Tránh gọi nhiều lần đồng thời
    if (isNextWordProcessing) {
        console.warn('nextWord is already processing, ignoring call');
        return;
    }
    
    isNextWordProcessing = true;
    console.log('=== nextWord called ===');
    console.log('isAnswered:', isAnswered);
    
    // KHÔNG reset isAnswered ở đây, sẽ reset sau khi setup xong từ mới
    
    console.log('currentWord:', currentWord);
    console.log('upcomingWords.length:', upcomingWords ? upcomingWords.length : 'undefined');
    console.log('upcomingWords:', upcomingWords);
    
    try {
        // Đảm bảo upcomingWords là array
        if (!Array.isArray(upcomingWords)) {
            console.warn('upcomingWords is not an array, resetting...');
            upcomingWords = [];
        }
        
        // Đảm bảo completedWords là array
        if (!Array.isArray(completedWords)) {
            completedWords = [];
        }
        
        // Đánh dấu từ hiện tại là đã hoàn thành (trước khi chuyển)
        if (currentWord && currentWord.id) {
            if (!completedWords.includes(currentWord.id)) {
                completedWords.push(currentWord.id);
                console.log('Marked current word as completed:', currentWord.id, currentWord.vocabulary);
            }
        }
        
        // Nếu danh sách đã hết, tạo danh sách mới
        if (upcomingWords.length === 0) {
            console.log('Upcoming words empty, generating new list');
            generateUpcomingWords();
        }
        
        // Kiểm tra lại sau khi generate
        if (!upcomingWords || upcomingWords.length === 0) {
            console.error('No upcoming words available after generation');
            if (vocabularyText) vocabularyText.textContent = 'Đã hết từ vựng!';
            isNextWordProcessing = false;
            return;
        }
        
        // Lấy từ hợp lệ từ danh sách
        let wordFound = false;
        while (!wordFound && upcomingWords.length > 0) {
            currentWord = upcomingWords[0];
            if (currentWord && currentWord.vocabulary && currentWord.meaning && currentWord.id) {
                // Word hợp lệ
                upcomingWords.shift();
                wordFound = true;
                console.log('Selected valid word:', currentWord.vocabulary);
            } else {
                // Word không hợp lệ, xóa và thử tiếp
                console.warn('Invalid word found, removing:', currentWord);
                upcomingWords.shift();
            }
        }
        
        // Nếu vẫn chưa tìm được word hợp lệ, tạo danh sách mới
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
        
        // Kiểm tra lại currentWord
        if (!wordFound || !currentWord || !currentWord.vocabulary) {
            console.error('No valid word available after all attempts');
            // Fallback: thử lấy bất kỳ từ nào trong vocabularyData
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
            
            if (!wordFound || !currentWord || !currentWord.vocabulary) {
                if (vocabularyText) vocabularyText.textContent = 'Đã hết từ vựng!';
                isNextWordProcessing = false;
                return;
            }
        }
        
        console.log('Setting up new word:', currentWord.vocabulary);
        
        // Cập nhật DOM ngay lập tức - KHÔNG dùng requestAnimationFrame để tránh delay
        try {
            if (vocabularyText) {
                vocabularyText.textContent = currentWord.vocabulary;
                console.log('Vocabulary text updated to:', currentWord.vocabulary);
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
            console.error('Error stack:', error.stack);
        }
        
        // Reset isAnswered SAU KHI đã clear feedback
        isAnswered = false;
        console.log('isAnswered reset to false after setup');
        
        // Focus input sau một chút
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
        } else {
            if (hintText) {
                hintText.textContent = '';
                hintText.className = 'hint-text empty';
            }
            if (hintSection) hintSection.classList.remove('active');
        }

        // Cập nhật hiển thị danh sách
        console.log('Updating word list...');
        try {
            updateWordList();
            console.log('Word list updated successfully');
        } catch (error) {
            console.error('Error updating word list:', error);
            console.error('Error stack:', error.stack);
        }
        
        console.log('Resetting timer...');
        try {
            resetTimer();
            console.log('Timer reset successfully');
        } catch (error) {
            console.error('Error resetting timer:', error);
            console.error('Error stack:', error.stack);
        }
        
        console.log('Starting timer...');
        try {
            startTimer();
            console.log('Timer started successfully');
        } catch (error) {
            console.error('Error starting timer:', error);
            console.error('Error stack:', error.stack);
        }
        
        console.log('=== nextWord completed successfully ===');
    } catch (error) {
        console.error('Error in nextWord:', error);
        console.error('Error stack:', error.stack);
        alert('Có lỗi xảy ra: ' + error.message);
    } finally {
        // Luôn reset flag
        isNextWordProcessing = false;
    }
}

function resetTimer() {
    // Clear timer trước khi reset
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
    } else {
        if (hintText) {
            hintText.textContent = '';
            hintText.className = 'hint-text empty';
        }
        if (hintSection) hintSection.classList.remove('active');
    }
    hintShown = false;
}

function generateHint(meaning, timeLeft) {
    // Tính phần trăm thời gian đã trôi qua từ 10 giây
    // timeLeft từ 10 -> 0, progress từ 0 -> 1
    const progress = (10 - timeLeft) / 10; // 0 khi còn 10s, 1 khi còn 0s
    
    // Hiển thị từ 20% đến 90% số ký tự dựa trên thời gian
    const minPercent = 0.2; // Bắt đầu với 20%
    const maxPercent = 0.9; // Kết thúc với 90%
    const hintPercent = minPercent + (maxPercent - minPercent) * progress;
    
    const hintLength = Math.max(1, Math.floor(meaning.length * hintPercent));
    const hint = meaning.substring(0, hintLength);
    
    // Chỉ thêm "..." nếu chưa hiển thị đầy đủ
    return hintLength < meaning.length ? hint + '...' : hint;
}

function startTimer() {
    console.log('startTimer() called');
    
    // Clear timer cũ trước
    if (timer) {
        console.log('Clearing old timer');
        clearInterval(timer);
        timer = null;
    }

    // Lưu currentWord vào biến local để tránh truy cập currentWord đã bị thay đổi
    const wordForTimer = currentWord;
    console.log('wordForTimer:', wordForTimer);
    
    if (!wordForTimer || !wordForTimer.meaning || !wordForTimer.id) {
        console.warn('No valid word for timer, skipping timer start');
        return;
    }

    const startTime = Date.now();
    const duration = maxTime * 1000;
    const wordId = wordForTimer.id; // Lưu ID để kiểm tra xem word có còn là word hiện tại không
    console.log('Starting timer for word:', wordForTimer.vocabulary, 'id:', wordId);

    timer = setInterval(() => {
        try {
            // Kiểm tra xem word hiện tại có còn là word của timer này không
            if (currentWord && currentWord.id !== wordId) {
                // Word đã thay đổi, dừng timer này
                console.log('Word changed, stopping old timer');
                clearInterval(timer);
                timer = null;
                return;
            }

            // Kiểm tra xem đã trả lời chưa
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

            // Change color based on time left and show hint
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
            
            // Show and update hint gradually when 10 seconds left
            // Sử dụng wordForTimer thay vì currentWord để tránh truy cập word đã thay đổi
            const isMobile = window.innerWidth <= 600;
            
            if (timeLeft <= 10 && !isAnswered && wordForTimer) {
                const hint = generateHint(wordForTimer.meaning, timeLeft);
                
                if (isMobile) {
                    // Mobile: sử dụng mobile hint notification
                    if (mobileHintNotification && mobileHintText) {
                        if (!hintShown) {
                            hintShown = true;
                            mobileHintNotification.classList.add('show', 'active');
                        }
                        mobileHintText.textContent = hint;
                    }
                } else {
                    // Desktop: sử dụng hint-section như cũ
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
                // Reset hint text when time is above 10 seconds
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
    
    // Khóa input khi hết thời gian
        if (answerInput) {
            answerInput.readOnly = true;
            answerInput.disabled = false; // Giữ disabled = false để vẫn có thể focus và nhấn Enter
            answerInput.setAttribute('data-answered', 'true');
            answerInput.className = 'answer-input wrong';
        }
    
    if (feedback) {
        feedback.className = 'feedback timeout show';
        feedback.textContent = `⏰ Hết thời gian! Đáp án đúng: "${currentWord.meaning}"`;
    }
    
    wrongCount++;
    
    // Thêm từ vào danh sách từ sai (nếu chưa có)
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
}

function checkAnswer() {
    if (isAnswered) return;
    
    if (!currentWord || !currentWord.meaning) {
        console.error('No current word available');
        return;
    }

    if (!answerInput || !feedback) {
        console.error('DOM elements not found');
        return;
    }

    try {
        // Normalize Vietnamese text - bỏ dấu để so sánh
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
        const correctAnswer = currentWord.meaning;

        // So sánh theo 2 cách:
        // 1. So sánh trực tiếp (có dấu với có dấu)
        // 2. So sánh sau khi normalize (không dấu với không dấu)
        const directMatch = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
        const normalizedUser = normalize(userAnswer);
        const normalizedCorrect = normalize(correctAnswer);
        const normalizedMatch = normalizedUser === normalizedCorrect;

        // Chấp nhận nếu khớp theo một trong hai cách
        const isCorrect = directMatch || normalizedMatch;

        isAnswered = true;
        console.log('=== checkAnswer: isAnswered set to TRUE ===');
        console.log('User answer:', userAnswer);
        console.log('Correct answer:', correctAnswer);
        console.log('Direct match:', directMatch);
        console.log('Normalized match:', normalizedMatch);
        console.log('Final result:', isCorrect);
        
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        
        // Khóa input khi đã có kết quả
        answerInput.readOnly = true;
        answerInput.disabled = false; // Giữ disabled = false để vẫn có thể focus và nhấn Enter
        answerInput.setAttribute('data-answered', 'true');
        console.log('Input locked - disabled:', answerInput.disabled, 'readOnly:', answerInput.readOnly);

        if (isCorrect) {
            answerInput.className = 'answer-input correct';
            feedback.className = 'feedback correct show';
            feedback.textContent = `✅ Chính xác! Đáp án: "${currentWord.meaning}"`;
            score++;
            correctCount++;
            console.log('Answer is CORRECT');
        } else {
            answerInput.className = 'answer-input wrong';
            feedback.className = 'feedback wrong show';
            feedback.textContent = `❌ Sai rồi! Đáp án đúng: "${currentWord.meaning}"`;
            wrongCount++;
            console.log('Answer is WRONG');
            
            // Thêm từ vào danh sách từ sai (nếu chưa có)
            if (currentWord && !wrongWords.find(w => w.id === currentWord.id)) {
                wrongWords.push({
                    id: currentWord.id,
                    vocabulary: currentWord.vocabulary,
                    meaning: currentWord.meaning
                });
                updateWrongWordsList();
            }
        }
        
        console.log('Feedback classes after update:', Array.from(feedback.classList));
        console.log('Feedback text:', feedback.textContent);
        console.log('isAnswered after checkAnswer:', isAnswered);

        updateScore();
        if (nextButton) {
            nextButton.className = 'next-button show';
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

// Đảm bảo DOM đã load trước khi thêm event listeners
function initEventListeners() {
    console.log('Initializing event listeners...');
    console.log('answerInput:', answerInput);
    console.log('nextButton:', nextButton);
    
    // Hàm xử lý Enter key - LOGIC ĐƠN GIẢN NHẤT
    function handleEnterKey(e) {
        if (e.key !== 'Enter') return;
        
        e.preventDefault();
        e.stopPropagation();
        
        console.log('=== Enter pressed ===');
        console.log('isNextWordProcessing:', isNextWordProcessing);
        console.log('isAnswered:', isAnswered);
        
        // Tránh xử lý nhiều lần
        if (isNextWordProcessing) {
            console.log('nextWord is processing, ignoring');
            return;
        }
        
        // Kiểm tra feedback có đang hiển thị không - ĐIỀU KIỆN CHÍNH
        let feedbackVisible = false;
        if (feedback) {
            const hasShow = feedback.classList.contains('show');
            const hasText = feedback.textContent && feedback.textContent.trim() !== '';
            feedbackVisible = hasShow && hasText;
            console.log('feedback check:', {
                hasShow,
                hasText,
                classes: Array.from(feedback.classList),
                text: feedback.textContent.substring(0, 50)
            });
        }
        
        const inputHasValue = answerInput && answerInput.value.trim() !== '';
        console.log('inputHasValue:', inputHasValue);
        console.log('feedbackVisible:', feedbackVisible);
        
        // QUYẾT ĐỊNH: Kiểm tra input có bị khóa không (readOnly)
        const inputLocked = answerInput && answerInput.readOnly;
        console.log('inputLocked (readOnly):', inputLocked);
        
        // Nếu input bị khóa HOẶC feedback đang hiển thị -> đã có kết quả -> chuyển từ
        if (inputLocked || feedbackVisible || isAnswered) {
            console.log('>>> ANSWERED - Calling nextWord()');
            console.log('inputLocked:', inputLocked, 'feedbackVisible:', feedbackVisible, 'isAnswered:', isAnswered);
            try {
                nextWord();
            } catch (error) {
                console.error('ERROR in nextWord:', error);
                console.error('Stack:', error.stack);
                alert('Lỗi khi chuyển từ: ' + error.message);
            }
        }
        // Nếu chưa trả lời nhưng có nhập -> kiểm tra đáp án
        else if (inputHasValue) {
            console.log('>>> HAS INPUT - Calling checkAnswer()');
            try {
                checkAnswer();
            } catch (error) {
                console.error('ERROR in checkAnswer:', error);
                console.error('Stack:', error.stack);
                alert('Lỗi khi kiểm tra đáp án: ' + error.message);
            }
        } 
        // Chưa nhập gì -> bỏ qua
        else {
            console.log('>>> NO ACTION - empty input and no answer');
        }
    }

    // Chỉ dùng MỘT event listener cho tất cả
    if (answerInput) {
        answerInput.addEventListener('keydown', handleEnterKey);
    } else {
        console.error('answerInput not found');
    }
    
    // Backup listener cho document
    document.addEventListener('keydown', handleEnterKey);

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            console.log('Next button clicked');
            nextWord();
        });
    } else {
        console.error('nextButton not found');
    }
    
    console.log('Event listeners initialized');
}

// Khởi tạo event listeners khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Đảm bảo mobile hint notification bị ẩn khi khởi tạo
        if (mobileHintNotification) {
            mobileHintNotification.classList.remove('show', 'active');
            if (mobileHintText) mobileHintText.textContent = '';
        }
        initEventListeners();
        loadVocabulary();
    });
} else {
    // Đảm bảo mobile hint notification bị ẩn khi khởi tạo
    if (mobileHintNotification) {
        mobileHintNotification.classList.remove('show', 'active');
        if (mobileHintText) mobileHintText.textContent = '';
    }
    initEventListeners();
    loadVocabulary();
}

