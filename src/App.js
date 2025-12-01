const App = {
  components: {
    LoadingScreen
  },
  data() {
    return {
      isLoading: true,
      shouldRedirectToHome: false
    };
  },
  mounted() {
    this.checkDirectAccess();
    this.checkResourcesLoaded();
  },
  methods: {
    checkDirectAccess() {
      const hash = window.location.hash || '#/';
      if (hash !== '#/' && hash !== '#') {
        this.shouldRedirectToHome = true;
      }
    },
    checkResourcesLoaded() {
      const checkInterval = setInterval(() => {
        const commonCssLoaded = document.querySelector('link[href*="common.css"]');
        const loadingCssLoaded = document.querySelector('link[href*="loading.css"]');
        const homeCssLoaded = document.querySelector('link[href*="home.css"]');
        const practiceMenuCssLoaded = document.querySelector('link[href*="practice-menu.css"]');
        const practiceCssLoaded = document.querySelector('link[href*="practice.css"]');
        const flashcardCssLoaded = document.querySelector('link[href*="flashcard.css"]');
        const vueLoaded = typeof Vue !== 'undefined';
        const routerLoaded = typeof VueRouter !== 'undefined';
        const appLoaded = typeof App !== 'undefined' && typeof router !== 'undefined';
        
        if (commonCssLoaded && loadingCssLoaded && homeCssLoaded && 
            practiceMenuCssLoaded && practiceCssLoaded && flashcardCssLoaded &&
            vueLoaded && routerLoaded && appLoaded) {
          clearInterval(checkInterval);
          setTimeout(() => {
            this.isLoading = false;
            this.$nextTick(() => {
              if (this.shouldRedirectToHome && this.$router) {
                this.$router.push('/');
              }
            });
          }, 300);
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkInterval);
        this.isLoading = false;
        this.$nextTick(() => {
          if (this.shouldRedirectToHome && this.$router) {
            this.$router.push('/');
          }
        });
      }, 5000);
    },
    handleLoadingComplete() {
      this.isLoading = false;
      this.$nextTick(() => {
        if (this.shouldRedirectToHome && this.$router) {
          this.$router.push('/');
        }
      });
    }
  },
  template: `
    <div>
      <LoadingScreen v-if="isLoading" @loaded="handleLoadingComplete" />
      <router-view v-if="!isLoading"></router-view>
    </div>
  `
};
