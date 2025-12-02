const UpdateNotificationTemplate = `<teleport to="body">
  <div v-if="showUpdateNotification" class="update-notification">
    <div class="update-notification-content">
      <div class="update-notification-text">
        <div class="update-notification-message">A new version is available.</div>
      </div>
      <button class="update-notification-button" @click="updateApp">
        <svg class="update-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.5 2.5V8.5H15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2.5 21.5V15.5H8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21.5 8.5C20.5 4.5 17 2.5 12 2.5C5.5 2.5 2.5 7.5 2.5 12C2.5 16.5 5.5 21.5 12 21.5C16.5 21.5 20 19.5 21.5 15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2.5 15.5C3.5 19.5 7 21.5 12 21.5C18.5 21.5 21.5 16.5 21.5 12C21.5 7.5 18.5 2.5 12 2.5C7.5 2.5 4 4.5 2.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</teleport>`;

const UpdateNotification = {
  template: UpdateNotificationTemplate,
  data() {
    return {
      showUpdateNotification: false,
      registration: null,
      updateCheckInterval: null,
    };
  },
  mounted() {
    const isLocalhost =
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1" ||
      location.hostname === "";
    const isHttps = location.protocol === "https:";
    const isHttp = location.protocol === "http:";

    if ("serviceWorker" in navigator && (isHttps || isLocalhost || isHttp)) {
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
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed") {
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
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .getRegistration()
          .then((registration) => {
            if (registration) {
              if (registration.waiting) {
                this.registration = registration;
                this.showUpdateNotification = true;
                return;
              }

              if (registration.installing) {
                const newWorker = registration.installing;
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed") {
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
          })
          .catch((error) => {
            console.error("Error checking for updates:", error);
          });
      }
    },
    listenForUpdates() {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        });
      }
    },
    updateApp() {
      if (this.registration && this.registration.waiting) {
        this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    },
  },
};
