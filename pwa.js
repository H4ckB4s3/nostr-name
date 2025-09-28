// pwa.js
document.addEventListener('DOMContentLoaded', () => {
    const settingsMenu = document.getElementById('settingsMenu');
    let deferredPrompt = null;

    // Check if the app is already installed (running in standalone mode)
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                        navigator.standalone || 
                        document.fullscreenElement;

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the default browser prompt
        e.preventDefault();
        // Store the event for later use
        deferredPrompt = e;

        // Only show the install option if the app is not already installed
        if (!isInstalled) {
            // Create the "Install App" settings item
            const installItem = document.createElement('div');
            installItem.className = 'settings-item';
            installItem.id = 'installAppBtn';
            installItem.innerHTML = `
                <i class="material-icons">get_app</i>
                <span>Install App</span>
            `;
            settingsMenu.appendChild(installItem);

            // Add click event listener to trigger the install prompt
            installItem.addEventListener('click', async () => {
                if (deferredPrompt) {
                    // Show the install prompt
                    deferredPrompt.prompt();
                    // Wait for the user to respond to the prompt
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                        // Optionally hide the install button after acceptance
                        installItem.remove();
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    deferredPrompt = null;
                }
            });
        }
    });

    // Listen for the appinstalled event to confirm installation
    window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
        // Remove the install button if it exists
        const installButton = document.getElementById('installAppBtn');
        if (installButton) {
            installButton.remove();
        }
    });
});
