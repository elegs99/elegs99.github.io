$(document).ready(function(){
    // Status dot pulse animation
    const statusDot = document.querySelector('.status-dot');
    const availabilityStatus = document.querySelector('.availability-status');
    
    if (statusDot) {
        let isPulsing = false;
        const animationDuration = 1200; // 1.2 seconds to match CSS animation
        
        // Function to trigger pulse animation
        function triggerPulse() {
            // Don't trigger if already pulsing
            if (isPulsing) return;
            
            isPulsing = true;
            statusDot.classList.remove('pulse');
            // Force reflow to restart animation
            void statusDot.offsetWidth;
            statusDot.classList.add('pulse');
            
            // Allow next pulse after animation completes
            setTimeout(() => {
                isPulsing = false;
            }, animationDuration);
        }
        
        // Pulse every 15 seconds
        setInterval(triggerPulse, 15000);
        
        // Pulse on hover over status dot or availability text
        if (availabilityStatus) {
            availabilityStatus.addEventListener('mouseenter', triggerPulse);
        }
        statusDot.addEventListener('mouseenter', triggerPulse);
    }

    
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
