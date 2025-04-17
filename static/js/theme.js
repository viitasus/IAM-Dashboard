// Function to toggle between dark and light mode
function toggleTheme() {
    // If the current theme is light, switch to dark, or vice versa
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Save theme preference to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update toggle checkbox if it exists
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.checked = newTheme === 'dark';
    }
}

// Function to initialize theme on page load
function initializeTheme() {
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme');
    
    // If user has previously chosen a theme, use that
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update toggle checkbox if it exists
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.checked = savedTheme === 'dark';
        }
    } 
    // Otherwise, check user's system preference
    else {
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            
            // Update toggle checkbox if it exists
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.checked = true;
            }
        }
    }
}

// Add event listener to toggle switch
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    
    // Add event listener to theme toggle if it exists
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
    }
});