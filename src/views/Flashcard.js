// Flashcard View Component - Wrapper that loads the old JS file
const Flashcard = {
  get template() {
    return window.Templates?.Flashcard || '<div>Loading template...</div>';
  },
  mounted() {
    // Add practice-page class to body để có cùng background với practice detail
    document.body.classList.add('practice-page');
    
    // Reset state when entering page
    if (typeof window.resetFlashcardState === 'function') {
      window.resetFlashcardState();
    }
    
    // Update back button to use router
    this.$nextTick(() => {
      const backButton = document.getElementById('backButton');
      if (backButton) {
        backButton.onclick = () => this.$router.push('/');
      }
      
      // Wait for elements to be rendered, then load vocabulary
      const waitForElements = () => {
        const vocabularyText = document.getElementById('vocabularyText');
        const meaningText = document.getElementById('meaningText');
        const flashcard = document.getElementById('flashcard');
        
        if (vocabularyText && meaningText && flashcard) {
          // Check if flashcard.js is already loaded
          if (typeof window.loadVocabulary === 'function') {
            window.loadVocabulary();
          } else {
            // Load flashcard.js script
            const existingScript = document.querySelector('script[src="src/utils/flashcard.js"]');
            if (existingScript) {
              existingScript.remove();
            }
            
            const script = document.createElement('script');
            script.src = 'src/utils/flashcard.js';
            script.onload = () => {
              if (typeof window.loadVocabulary === 'function') {
                window.loadVocabulary();
              }
            };
            document.head.appendChild(script);
          }
        } else {
          setTimeout(waitForElements, 100);
        }
      };
      
      waitForElements();
    });
  },
  beforeUnmount() {
    // Remove practice-page class from body
    document.body.classList.remove('practice-page');
    
    // Clean up when leaving page
    if (typeof window.resetFlashcardState === 'function') {
      window.resetFlashcardState();
    }
    
    // Remove flashcard.js script
    const script = document.querySelector('script[src="src/utils/flashcard.js"]');
    if (script) {
      script.remove();
    }
  }
};

