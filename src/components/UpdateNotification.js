const UpdateNotificationTemplate = `<div v-if="showUpdateNotification" class="update-notification">
  <div class="update-notification-content">
    <div class="update-notification-icon">🔄</div>
    <div class="update-notification-text">
      <div class="update-notification-title">Có bản cập nhật mới</div>
      <div class="update-notification-message">Ứng dụng đã được cập nhật. Vui lòng tải lại để sử dụng phiên bản mới nhất.</div>
    </div>
    <button class="update-notification-button" @click="updateApp">Cập nhật</button>
  </div>
</div>`;

const UpdateNotification = {
  template: UpdateNotificationTemplate,
  data() {
    return {
      showUpdateNotification: false,
      registration: null,
      updateCheckInterval: null
    };
  },
  mounted() {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      this.setupUpdateCheck();
      this.listenForUpdates();
    }
  },
  beforeUnmount() {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
    }
  },
  methods: {
    setupUpdateCheck() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      this.registration = registration;
                      this.showUpdateNotification = true;
                    }
                  }
                });
              }
            });
            
            if (registration.waiting) {
              this.registration = registration;
              this.showUpdateNotification = true;
            }
          }
        });
      }
      
      this.checkForUpdates();
      this.updateCheckInterval = setInterval(() => {
        this.checkForUpdates();
      }, 60000);
    },
    checkForUpdates() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            if (registration.waiting) {
              this.registration = registration;
              this.showUpdateNotification = true;
              return;
            }
            
            if (registration.installing) {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    this.registration = registration;
                    this.showUpdateNotification = true;
                  }
                }
              });
            } else {
              registration.update();
            }
          }
        }).catch((error) => {
          console.error('Error checking for updates:', error);
        });
      }
    },
    listenForUpdates() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      }
    },
    updateApp() {
      if (this.registration && this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  }
};

