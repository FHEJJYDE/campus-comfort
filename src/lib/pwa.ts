// PWA registration and install prompt handler
let deferredPrompt: any;

export const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                    registration.update();
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('New Service Worker activated, refreshing content...');
        });
    }
};

export const initializeInstallPrompt = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        // Update UI to notify the user they can install the PWA
        showInstallPromotion();
    });
};

const showInstallPromotion = () => {
    // This function would update your UI to show an install button
    // For now, we'll just log to console
    console.log('PWA install prompt available');
};

export const showInstallPrompt = () => {
    // Show the install prompt
    if (deferredPrompt) {
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    }
};

// Initialize PWA features
registerServiceWorker();
initializeInstallPrompt();