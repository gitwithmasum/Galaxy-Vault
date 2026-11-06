(() => {
  "use strict";

  const installButton = document.getElementById("pwaInstallBtn");
  const statusBox = document.getElementById("pwaStatus");
  let installPrompt = null;
  let statusTimer = null;

  function showStatus(message, persistent = false) {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.classList.remove("hidden");
    if (statusTimer) clearTimeout(statusTimer);
    if (!persistent) {
      statusTimer = setTimeout(() => statusBox.classList.add("hidden"), 5000);
    }
  }

  function updateConnectionStatus() {
    if (!navigator.onLine) {
      showStatus("OFFLINE MODE · Cached app shell available. External services may be unavailable.", true);
    } else {
      showStatus("ONLINE · VAULT is connected.", false);
    }
  }

  window.addEventListener("online", updateConnectionStatus);
  window.addEventListener("offline", updateConnectionStatus);

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    if (installButton) installButton.classList.remove("hidden");
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    if (installButton) installButton.classList.add("hidden");
    showStatus("VAULT installed successfully.");
  });

  if (installButton) {
    installButton.addEventListener("click", async () => {
      if (!installPrompt) {
        showStatus("If no install prompt appears, use your browser menu → Install app or Add to Home Screen.", true);
        return;
      }

      installButton.disabled = true;
      try {
        installPrompt.prompt();
        await installPrompt.userChoice;
      } catch (error) {
        console.warn("VAULT install prompt was not completed:", error);
      } finally {
        installPrompt = null;
        installButton.disabled = false;
        installButton.classList.add("hidden");
      }
    });
  }

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./" });
        if (registration.waiting) {
          showStatus("A VAULT update is ready. Reload this page when convenient.");
        }
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              showStatus("VAULT update cached. Reload to use the latest version.");
            }
          });
        });
        console.info("VAULT service worker registered:", registration.scope);
      } catch (error) {
        console.warn("VAULT offline support could not be registered:", error);
        showStatus("Offline support could not start in this browser.");
      }
    });
  } else {
    showStatus("Install/offline support requires HTTPS or localhost.");
  }

  updateConnectionStatus();
})();
