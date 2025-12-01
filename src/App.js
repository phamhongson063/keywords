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
        const cssLoaded = document.getElementById('page-css') || 
                          document.querySelector('link[href*="common.css"]');
        const vueLoaded = typeof Vue !== 'undefined';
        const routerLoaded = typeof VueRouter !== 'undefined';
        const appLoaded = typeof App !== 'undefined' && typeof router !== 'undefined';
        
        if (cssLoaded && vueLoaded && routerLoaded && appLoaded) {
          clearInterval(checkInterval);
          setTimeout(() => {
            this.isLoading = false;
            this.$nextTick(() => {
              if (this.shouldRedirectToHome && this.$router) {
                this.$router.push('/');
              }
            });
          }, 500);
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
