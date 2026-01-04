// Calculate current year once
var currentYear = new Date().getFullYear();

// Update current year in footer when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-current-year]').forEach(element => {
        element.textContent = currentYear;
    });
});

