// Lightweight scroll-triggered hover effects for mobile
// Only runs on mobile devices to avoid interfering with desktop hover states

(function() {
    'use strict';
    
    // Only initialize if on mobile
    if (!window.innerWidth <= 650) {
        return;
    }
    
    // Multiple intersection observers for more consistent triggering
    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -50% 0px', // dead zones on top and bottom
        threshold: [0.1, 0.3, 0.5] // Multiple thresholds for more responsive detection
    };
    
    // Create intersection observer with throttling for better performance
    let isProcessing = false;
    
    const observer = new IntersectionObserver((entries) => {
        if (isProcessing) return;
        
        isProcessing = true;
        requestAnimationFrame(() => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                    // Add scroll-in-view class when element comes into view
                    entry.target.classList.add('scroll-in-view');
                } else {
                    entry.target.classList.remove('scroll-in-view');
                }
            });
            isProcessing = false;
        });
    }, observerOptions);
    
    // Observe project cards and expertise cards
    function initScrollHover() {
        // Disconnect any existing observers
        observer.disconnect();
        
        const projectCards = document.querySelectorAll('.project-card');
        const expertiseCards = document.querySelectorAll('.expertise-card');
        
        // Observe all project cards
        projectCards.forEach(card => {
            observer.observe(card);
        });
        
        // Observe all expertise cards
        expertiseCards.forEach(card => {
            observer.observe(card);
        });
        
        // Fallback: Add class to visible elements immediately
        const allCards = [...projectCards, ...expertiseCards];
        allCards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                card.classList.add('scroll-in-view');
            }
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollHover);
    } else {
        initScrollHover();
    }
    
    // Re-initialize on window resize (in case user rotates device)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (isMobile()) {
                // Re-observe elements if switching to mobile
                initScrollHover();
            } else {
                // Clean up if switching to desktop
                observer.disconnect();
            }
        }, 250);
    });
    
})();
