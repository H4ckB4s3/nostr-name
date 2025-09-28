// settings.js
function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('dcall-dark-mode', isDarkMode);
    updateThemeIcon();
}

function loadTheme() {
    const isDarkMode = localStorage.getItem('dcall-dark-mode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.textContent = document.body.classList.contains('dark-mode') ? 'light_mode' : 'dark_mode';
    }
}

document.addEventListener('DOMContentLoaded', loadTheme);
