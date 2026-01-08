$(document).ready(function(){
    // Skills Scrolling Animation
    class SkillsScroller {
        constructor(container, options = {}) {
            this.container = container;
            this.options = {
                speed: options.speed || 50, // pixels per second
                pauseOnHover: options.pauseOnHover !== false,
                responsive: options.responsive !== false,
                momentumDecay: options.momentumDecay || 0.95,
                maxMomentumSpeed: options.maxMomentumSpeed || 2.0,
                ...options
            };
            
            // Animation state
            this.isScrolling = false;
            this.isPaused = false;
            this.isDragging = false;
            this.isMomentumActive = false;
            this.currentPosition = 0;
            this.animationId = null;
            this.lastTimestamp = 0;
            
            // Measurement state
            this.resetPosition = null;
            this.totalSetWidth = null;
            this.isMeasuring = false;
            
            // Dragging state
            this.dragStartX = 0;
            this.dragStartPosition = 0;
            this.minDragBoundary = 0;
            this.maxDragBoundary = 0;
            
            // Momentum state
            this.velocity = 0;
            this.lastDragTime = 0;
            this.lastDragX = 0;
            
            // Resize handler cleanup
            this.resizeHandler = null;
            this.resizeDelayTimeout = null;
            this.lastWidth = window.innerWidth;
            
            this.init();
        }
        
        init() {
            // Ensure DOM is ready and styles are applied
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initialize());
            } else {
                this.initialize();
            }
        }
        
        initialize() {
            this.setupEventListeners();
            // Wait for responsive styles to be applied before initial calculation
            // This is especially important on mobile where styles may not be ready immediately
            setTimeout(() => {
                // Calculate distance first, then start scrolling after measurement completes
                this.calculateScrollDistance(() => {
                    this.startScrolling();
                });
            }, 50);
        }
        
        calculateScrollDistance(callback) {
            // Prevent concurrent measurements
            if (this.isMeasuring) {
                // If already measuring, queue the callback
                if (callback) {
                    const checkInterval = setInterval(() => {
                        if (!this.isMeasuring) {
                            clearInterval(checkInterval);
                            callback();
                        }
                    }, 10);
                }
                return;
            }
            this.isMeasuring = true;
            
            try {
                // Get all items
                const items = Array.from(this.container.children);
                if (items.length === 0) {
                    this.isMeasuring = false;
                    if (callback) callback();
                    return;
                }
                
                const itemCount = items.length / 3; // Since we have 3 copies
                if (itemCount === 0) {
                    this.isMeasuring = false;
                    if (callback) callback();
                    return;
                }
                
                // Store current state to restore after measurement
                const wasScrolling = this.isScrolling;
                const savedPosition = this.currentPosition;
                const savedTransform = this.container.style.transform;
                
                // Temporarily pause and reset to natural position for accurate measurement
                this.isScrolling = false;
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
                
                // Reset transform to measure natural layout
                this.container.style.transform = 'translateX(0px)';
                this.currentPosition = 0;
                
                // Force layout recalculation
                void this.container.offsetHeight;
                
                // Wait for next frame to ensure layout is settled
                requestAnimationFrame(() => {
                    // Calculate total width by summing item widths and margins
                    let totalSetWidth = 0;
                    
                    // Get computed margin-right from the first item
                    const firstItemStyle = window.getComputedStyle(items[0]);
                    const marginRight = parseFloat(firstItemStyle.marginRight) || 0;
                    
                    // Sum up all item widths and margins in the first set
                    for (let i = 0; i < itemCount; i++) {
                        const item = items[i];
                        if (!item) continue;
                        
                        // Get the actual rendered width (includes padding and border)
                        const itemWidth = item.offsetWidth;
                        totalSetWidth += itemWidth;
                        
                        // Add margin after each item (including the last one)
                        totalSetWidth += marginRight;
                    }
                    
                    // Round to avoid sub-pixel issues, but keep precision for smooth animation
                    this.totalSetWidth = Math.round(totalSetWidth * 100) / 100;
                    
                    // Calculate the reset position
                    // Reset when we've scrolled exactly one set width
                    this.resetPosition = -this.totalSetWidth;
                    
                    // Restore previous state
                    this.container.style.transform = savedTransform;
                    this.currentPosition = savedPosition;
                    this.isScrolling = wasScrolling;
                    
                    // Force another layout recalculation
                    void this.container.offsetHeight;
                    
                    // Recalculate drag boundaries
                    this.calculateDragBoundaries();
                    
                    // If we were scrolling, restart animation
                    // Check if animation loop is actually running, if not, restart it
                    if (wasScrolling && !this.isPaused && !this.isDragging && !this.isMomentumActive) {
                        // Ensure animation loop is running
                        if (!this.animationId) {
                            this.lastTimestamp = 0; // Reset timestamp for accurate delta calculation
                            this.animate();
                        }
                    }
                    
                    this.isMeasuring = false;
                    
                    // Call callback if provided
                    if (callback) {
                        callback();
                    }
                });
            } catch (error) {
                console.error('Error calculating scroll distance:', error);
                this.isMeasuring = false;
                if (callback) callback();
            }
        }
        
        calculateDragBoundaries() {
            if (this.resetPosition === null) return;
            
            // Min boundary: Don't show the end (reset position)
            this.minDragBoundary = this.resetPosition;
            
            // Max boundary: Don't show the beginning (0 position)
            this.maxDragBoundary = 0;
        }
        
        setupEventListeners() {
            // Clean up any existing listeners if re-initializing
            if (this.resizeHandler) {
                window.removeEventListener('resize', this.resizeHandler);
            }
            
            // Pause on hover
            if (this.options.pauseOnHover) {
                this.container.addEventListener('mouseenter', () => {
                    if (!this.isDragging && !this.isMomentumActive) {
                        this.pause();
                    }
                });
                
                this.container.addEventListener('mouseleave', () => {
                    if (!this.isDragging && !this.isMomentumActive) {
                        this.resume();
                    }
                });
            }
            
            // Mouse events for dragging
            this.container.addEventListener('mousedown', (e) => this.startDragging(e));
            document.addEventListener('mousemove', (e) => this.handleDrag(e));
            document.addEventListener('mouseup', () => this.endDragging());
            
            // Handle case where mouse leaves window during drag
            window.addEventListener('mouseleave', () => {
                if (this.isDragging) {
                    this.endDragging();
                }
            });
            
            // Touch events for mobile
            this.container.addEventListener('touchstart', (e) => this.startDragging(e), { passive: false });
            document.addEventListener('touchmove', (e) => this.handleDrag(e), { passive: false });
            document.addEventListener('touchend', () => this.endDragging());
            
            // Prevent text selection during drag
            this.container.addEventListener('selectstart', (e) => e.preventDefault());
            
            // Resize handler with proper debouncing
            this.resizeHandler = () => {
                const currentWidth = window.innerWidth;
                
                // Only recalculate if width has changed
                if (currentWidth === this.lastWidth) {
                    return;
                }
                
                // Clear any pending resize calculations
                if (this.resizeDelayTimeout) {
                    clearTimeout(this.resizeDelayTimeout);
                    this.resizeDelayTimeout = null;
                }
                
                // Wait for responsive styles to be applied before recalculating
                this.resizeDelayTimeout = setTimeout(() => {
                    this.lastWidth = currentWidth;
                    this.resizeDelayTimeout = null;
                    this.calculateScrollDistance();
                }, 50);
            };
            
            window.addEventListener('resize', this.resizeHandler);
        }
        
        startDragging(event) {
            this.isDragging = true;
            this.isMomentumActive = false;
            this.pause();
            
            // Get the starting position
            let clientX = event.clientX || (event.touches && event.touches[0].clientX);
            
            // Validate clientX
            if (clientX === undefined || clientX === null || isNaN(clientX)) {
                clientX = 0;
            }
            
            this.dragStartX = clientX;
            this.dragStartPosition = this.currentPosition;
            
            // Initialize momentum tracking
            this.lastDragTime = Date.now();
            this.lastDragX = clientX;
            this.velocity = 0;
            
            // Change cursor
            this.container.style.cursor = 'grabbing';
            
            // Prevent default behavior
            event.preventDefault();
        }
        
        handleDrag(event) {
            if (!this.isDragging) return;
            
            let clientX = event.clientX || (event.touches && event.touches[0].clientX);
            
            // Use last valid clientX if current is invalid
            if (clientX === undefined || clientX === null || isNaN(clientX)) {
                if (this.lastDragX !== undefined && this.lastDragX !== null && !isNaN(this.lastDragX)) {
                    clientX = this.lastDragX;
                } else {
                    return;
                }
            }
            
            const currentTime = Date.now();
            const deltaX = clientX - this.dragStartX;
            
            // Calculate velocity for momentum
            if (currentTime > this.lastDragTime && this.lastDragX !== undefined && this.lastDragX !== null && !isNaN(this.lastDragX)) {
                const timeDelta = currentTime - this.lastDragTime;
                const distanceDelta = clientX - this.lastDragX;
                
                if (timeDelta > 0) {
                    this.velocity = distanceDelta / timeDelta; // pixels per millisecond
                    
                    // Clamp velocity to reasonable bounds
                    this.velocity = Math.max(-this.options.maxMomentumSpeed, 
                                           Math.min(this.options.maxMomentumSpeed, this.velocity));
                }
            }
            
            this.lastDragTime = currentTime;
            this.lastDragX = clientX;
            
            // Calculate new position
            let newPosition = this.dragStartPosition + deltaX;
            
            // Handle infinite dragging by resetting position when reaching boundaries
            if (this.resetPosition !== null) {
                if (newPosition <= this.minDragBoundary) {
                    // Reset to beginning and adjust drag start
                    newPosition = this.maxDragBoundary + (newPosition - this.minDragBoundary);
                    this.dragStartPosition = newPosition;
                    this.dragStartX = clientX;
                } else if (newPosition >= this.maxDragBoundary) {
                    // Reset to end and adjust drag start
                    newPosition = this.minDragBoundary + (newPosition - this.maxDragBoundary);
                    this.dragStartPosition = newPosition;
                    this.dragStartX = clientX;
                }
            }
            
            // Update position with sub-pixel precision
            this.currentPosition = newPosition;
            this.container.style.transform = `translateX(${this.currentPosition}px)`;
            
            // Prevent default behavior
            event.preventDefault();
        }
        
        endDragging() {
            if (!this.isDragging) {
                this.resume();
                return;
            }
            
            this.isDragging = false;
            
            // Ensure velocity is valid
            const validVelocity = (this.velocity !== null && this.velocity !== undefined && !isNaN(this.velocity)) ? this.velocity : 0;
            
            // Start momentum animation if velocity is significant
            if (Math.abs(validVelocity) > 0.01) {
                this.velocity = validVelocity;
                this.startMomentum();
            } else {
                // Reset velocity
                this.velocity = 0;
                // Snap to valid position if needed
                this.snapToValidPosition();
                
                // Reset cursor
                this.container.style.cursor = 'grab';
                
                // Resume scrolling
                this.resume();
            }
        }
        
        startMomentum() {
            this.isMomentumActive = true;
            this.container.style.cursor = 'grab';
            this.animateMomentum();
        }
        
        animateMomentum() {
            if (!this.isMomentumActive) return;
            
            // Apply velocity (assuming 60fps = 16ms per frame)
            this.currentPosition += this.velocity * 16;
            
            // Decay velocity
            this.velocity *= this.options.momentumDecay;
            
            // Handle boundaries during momentum
            if (this.resetPosition !== null) {
                if (this.currentPosition <= this.minDragBoundary) {
                    this.currentPosition = this.maxDragBoundary + (this.currentPosition - this.minDragBoundary);
                } else if (this.currentPosition >= this.maxDragBoundary) {
                    this.currentPosition = this.minDragBoundary + (this.currentPosition - this.maxDragBoundary);
                }
            }
            
            // Update transform with sub-pixel precision
            this.container.style.transform = `translateX(${this.currentPosition}px)`;
            
            // Stop momentum when velocity is too low
            if (Math.abs(this.velocity) < 0.01) {
                this.isMomentumActive = false;
                this.velocity = 0;
                this.snapToValidPosition();
                this.resume();
                return;
            }
            
            // Continue momentum animation
            requestAnimationFrame(() => this.animateMomentum());
        }
        
        snapToValidPosition() {
            // If we're at or past the reset position, snap to the beginning
            if (this.resetPosition !== null && this.currentPosition <= this.resetPosition) {
                this.currentPosition = 0;
                this.container.style.transform = `translateX(0px)`;
            }
        }
        
        startScrolling() {
            if (this.isScrolling) return; // Already scrolling
            
            this.isScrolling = true;
            this.lastTimestamp = 0; // Reset timestamp for accurate delta calculation
            this.animate();
        }
        
        pause() {
            this.isPaused = true;
        }
        
        resume() {
            this.isPaused = false;
            if (this.isScrolling && !this.animationId && !this.isMomentumActive) {
                this.lastTimestamp = 0; // Reset timestamp for accurate delta calculation
                this.animate();
            }
        }
        
        stop() {
            this.isScrolling = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
        
        animate(timestamp = 0) {
            if (!this.isScrolling) {
                this.animationId = null;
                return;
            }
            
            // Initialize timestamp on first frame
            if (this.lastTimestamp === 0) {
                this.lastTimestamp = timestamp;
                this.animationId = requestAnimationFrame((ts) => this.animate(ts));
                return;
            }
            
            const deltaTime = timestamp - this.lastTimestamp;
            this.lastTimestamp = timestamp;
            
            if (!this.isPaused && deltaTime > 0 && !this.isDragging && !this.isMomentumActive) {
                // Cap deltaTime to prevent large jumps when animation is throttled
                const maxDeltaTime = 100; // Maximum 100ms between frames
                const clampedDeltaTime = Math.min(deltaTime, maxDeltaTime);
                
                const speed = this.options.speed;
                const pixelsPerFrame = (speed / 1000) * clampedDeltaTime;
                this.currentPosition -= pixelsPerFrame;
                
                // Reset position when we reach the reset point
                if (this.resetPosition !== null && this.currentPosition <= this.resetPosition) {
                    this.currentPosition = 0;
                }
                
                // Update transform with sub-pixel precision
                this.container.style.transform = `translateX(${this.currentPosition}px)`;
            }
            
            this.animationId = requestAnimationFrame((ts) => this.animate(ts));
        }
        
        // Cleanup method for proper resource management
        destroy() {
            this.stop();
            
            if (this.resizeHandler) {
                window.removeEventListener('resize', this.resizeHandler);
                this.resizeHandler = null;
            }
            
            if (this.resizeDelayTimeout) {
                clearTimeout(this.resizeDelayTimeout);
                this.resizeDelayTimeout = null;
            }
        }
    }
    
    // Initialize skills scrollers
    const iconContainer = document.querySelector('.icon-container');
    const iconContainer2 = document.querySelector('.icon-container2');
    
    if (iconContainer) {
        new SkillsScroller(iconContainer, {
            speed: 30,
            pauseOnHover: true,
            responsive: true,
            momentumDecay: 0.92,
            maxMomentumSpeed: 2.5,
        });
    }
    
    if (iconContainer2) {
        new SkillsScroller(iconContainer2, {
            speed: 25,
            pauseOnHover: true,
            responsive: true,
            momentumDecay: 0.92,
            maxMomentumSpeed: 2.5,
        });
    }
    
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
        const waveDuration = 1000; // 0.6 seconds to match CSS animation
        
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
