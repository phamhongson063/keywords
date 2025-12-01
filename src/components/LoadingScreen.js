const LoadingScreenTemplate = `<div class="loading-screen" :class="{ 'hidden': !isLoading }">
  <div class="loading-container">
    <div class="loading-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="progress-text">{{ progress }}%</div>
    </div>
    <div class="loading-message">{{ loadingMessage }}</div>
  </div>
</div>`;

const LoadingScreen = {
  template: LoadingScreenTemplate,
  data() {
    return {
      isLoading: true,
      progress: 0,
      loadingMessage: 'Đang tải tài nguyên...'
    };
  },
  mounted() {
    this.simulateLoading();
  },
  methods: {
    simulateLoading() {
      const steps = [
        { progress: 20, message: 'Đang tải CSS...' },
        { progress: 40, message: 'Đang tải JavaScript...' },
        { progress: 60, message: 'Đang tải dữ liệu...' },
        { progress: 80, message: 'Đang khởi tạo ứng dụng...' },
        { progress: 100, message: 'Hoàn tất!' }
      ];
      
      let currentStep = 0;
      const stepInterval = setInterval(() => {
        if (currentStep < steps.length) {
          this.progress = steps[currentStep].progress;
          this.loadingMessage = steps[currentStep].message;
          currentStep++;
        } else {
          clearInterval(stepInterval);
          setTimeout(() => {
            this.isLoading = false;
            this.$emit('loaded');
          }, 500);
        }
      }, 600);
    },
    hide() {
      this.isLoading = false;
    }
  }
};

