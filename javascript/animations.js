$(document).ready(function(){    
    // Hand wave animation - ensure it completes at least one cycle
    const heroGreeting = document.querySelector('.hero-greeting');
    const handEmoji = document.querySelector('.hand-emoji');
    const profilePicture = document.querySelector('.profile-picture');
    
    if (heroGreeting && handEmoji && profilePicture) {
        let waveTimeout = null;
        const waveDuration = 1000; // Match 1 second CSS animation
        
        // Greeting text trigger
        heroGreeting.addEventListener('mouseenter', () => {
            // Clear any pending timeout
            if (waveTimeout) {
                clearTimeout(waveTimeout);
                waveTimeout = null;
            }
            // Start waving
            handEmoji.classList.add('waving');
        });
        
        heroGreeting.addEventListener('mouseleave', () => {
            // Wait for at least one complete animation cycle before stopping
            waveTimeout = setTimeout(() => {
                handEmoji.classList.remove('waving');
                waveTimeout = null;
            }, waveDuration);
        });
        // Profile picture trigger
        profilePicture.addEventListener('mouseenter', () => {
            // Clear any pending timeout
            if (waveTimeout) {
                clearTimeout(waveTimeout);
                waveTimeout = null;
            }
            // Start waving
            handEmoji.classList.add('waving');
        });

        profilePicture.addEventListener('mouseleave', () => {
            // Wait for at least one complete animation cycle before stopping
            waveTimeout = setTimeout(() => {
                handEmoji.classList.remove('waving');
                waveTimeout = null;
            }, waveDuration);
        });
    }
});
