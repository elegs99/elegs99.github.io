$(document).ready(function(){
    // Skills Scrolling Animation
    class SkillsScroller {
        constructor(container, options = {}) {
            this.container = container;
            this.options = {
                speed: options.speed || 50, // pixels per second
                pauseOnHover: options.pauseOnHover !== false,
                responsive: options.responsive !== false,
                momentumDecay: options.momentumDecay || 0.95, // How quickly momentum decays
                maxMomentumSpeed: options.maxMomentumSpeed || 2.0, // Max speed multiplier for momentum
                ...options
            };
            
            this.isScrolling = true;
            this.isPaused = false;
            this.isDragging = false;
            this.currentPosition = 0;
            this.animationId = null;
            this.lastTimestamp = 0;
            
            // Dragging properties
            this.dragStartX = 0;
            this.dragStartPosition = 0;
            this.minDragBoundary = 0;
            this.maxDragBoundary = 0;
            
            // Momentum properties
            this.velocity = 0;
            this.lastDragTime = 0;
            this.lastDragX = 0;
            this.isMomentumActive = false;
            
            this.init();
        }
        
        init() {
            this.calculateScrollDistance();
            this.setupEventListeners();
            this.startScrolling();
            
            // Recalculate on window resize
            window.addEventListener('resize', () => {
                this.calculateScrollDistance();
            });
        }
        
        calculateScrollDistance() {
            // Get all items
            const items = Array.from(this.container.children);
            const itemCount = items.length / 3; // Since we have 3 copies
            
            // Calculate total width of one complete set
            let totalWidth = 0;
            for (let i = 0; i < itemCount; i++) {
                totalWidth += items[i].offsetWidth;
            }
            
            // Add gaps between items - read the actual computed gap from CSS
            const computedStyle = window.getComputedStyle(this.container);
            const gap = parseInt(computedStyle.gap) || 0;
            totalWidth += gap * (itemCount - 1);
            
            // Calculate responsive reset offset based on screen width
            const isMobile = window.innerWidth <= 650;
            const responsiveResetOffset = isMobile ? 
                (this.container.classList.contains('icon-container') ? 12 : 15) : 
                (this.container.classList.contains('icon-container') ? -2 : 2);
                        
            // Calculate the reset position
            // We want to reset when the next instance of the first skill reaches the starting position
            // The starting position is where the first skill begins (0)
            // The next instance starts at position: totalWidth + gap
            const newResetPosition = -(totalWidth + gap) - responsiveResetOffset;
            
            // Only reset if the current position has exceeded the new reset position
            // or if this is the first time calculating (no previous reset position)
            if (this.resetPosition === undefined || this.currentPosition <= newResetPosition) {
                this.currentPosition = 0;
                this.container.style.transform = `translateX(0px)`;
            }
            
            this.resetPosition = newResetPosition;
            
            // Calculate drag boundaries
            this.calculateDragBoundaries();
        }
        
        calculateDragBoundaries() {
            // Min boundary: Don't show the end (reset position)
            this.minDragBoundary = this.resetPosition;
            
            // Max boundary: Don't show the beginning (0 position)
            this.maxDragBoundary = 0;
        }
        
        setupEventListeners() {
            if (this.options.pauseOnHover) {
                this.container.addEventListener('mouseenter', () => {
                    if (!this.isDragging && !this.isMomentumActive) {
                        this.pause();
                        //console.log('pause');
                    }
                });
                
                this.container.addEventListener('mouseleave', () => {
                    if (!this.isDragging && !this.isMomentumActive) {
                        this.resume();
                        //console.log('resume');
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
            
            // Touch events for mobile - use non-passive since we need preventDefault
            this.container.addEventListener('touchstart', (e) => this.startDragging(e), { passive: false });
            document.addEventListener('touchmove', (e) => this.handleDrag(e), { passive: false });
            document.addEventListener('touchend', () => this.endDragging());
            
            // Prevent text selection during drag
            this.container.addEventListener('selectstart', (e) => e.preventDefault());
        }
        
        startDragging(event) {
            this.isDragging = true;
            this.isMomentumActive = false;
            this.pause();
            
            // Get the starting position
            let clientX = event.clientX || (event.touches && event.touches[0].clientX);
            
            // Validate clientX - if invalid, use 0 as fallback
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
            //console.log('grabbing');
            
            // Prevent default behavior
            event.preventDefault();
        }
        
        handleDrag(event) {
            if (!this.isDragging) return;
            
            let clientX = event.clientX || (event.touches && event.touches[0].clientX);
            
            // Use last valid clientX if current is invalid (mouse left document area)
            if (clientX === undefined || clientX === null || isNaN(clientX)) {
                if (this.lastDragX !== undefined && this.lastDragX !== null && !isNaN(this.lastDragX)) {
                    clientX = this.lastDragX;
                } else {
                    // If no valid last position, skip this update
                    return;
                }
            }
            
            const currentTime = Date.now();
            const deltaX = clientX - this.dragStartX;
            
            // Calculate velocity for momentum
            if (currentTime > this.lastDragTime && this.lastDragX !== undefined && this.lastDragX !== null && !isNaN(this.lastDragX)) {
                const timeDelta = currentTime - this.lastDragTime;
                const distanceDelta = clientX - this.lastDragX;
                this.velocity = distanceDelta / timeDelta; // pixels per millisecond
                
                // Clamp velocity to reasonable bounds
                this.velocity = Math.max(-this.options.maxMomentumSpeed, 
                                       Math.min(this.options.maxMomentumSpeed, this.velocity));
            }
            
            this.lastDragTime = currentTime;
            this.lastDragX = clientX;
            
            // Calculate new position
            let newPosition = this.dragStartPosition + deltaX;
            
            // Handle infinite dragging by resetting position when reaching boundaries
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
            
            // Update position
            this.currentPosition = newPosition;
            this.container.style.transform = `translateX(${this.currentPosition}px)`;
            
            // Prevent default behavior
            event.preventDefault();
        }
        
        endDragging() {
            if (!this.isDragging){
                this.resume();
                return;
            } 
            
            this.isDragging = false;
            
            // Ensure velocity is valid (not null/NaN/undefined)
            const validVelocity = (this.velocity !== null && this.velocity !== undefined && !isNaN(this.velocity)) ? this.velocity : 0;
            
            // Start momentum animation if velocity is significant
            if (Math.abs(validVelocity) > 0.01) {
                this.velocity = validVelocity;
                this.startMomentum();
            } else {
                // Reset velocity to 0 if invalid
                this.velocity = 0;
                // Snap to valid position if needed
                this.snapToValidPosition();
                
                // Reset cursor
                this.container.style.cursor = 'grab';
                //console.log('grab');
                
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
            
            // Apply velocity
            this.currentPosition += this.velocity * 16; // Assuming 60fps (16ms per frame)
            
            // Decay velocity
            this.velocity *= this.options.momentumDecay;
            
            // Handle boundaries during momentum
            if (this.currentPosition <= this.minDragBoundary) {
                this.currentPosition = this.maxDragBoundary + (this.currentPosition - this.minDragBoundary);
            } else if (this.currentPosition >= this.maxDragBoundary) {
                this.currentPosition = this.minDragBoundary + (this.currentPosition - this.maxDragBoundary);
            }
            
            // Update transform
            this.container.style.transform = `translateX(${this.currentPosition}px)`;
            
            // Stop momentum when velocity is too low
            if (Math.abs(this.velocity) < 0.01) {
                this.isMomentumActive = false;
                this.snapToValidPosition();
                this.resume();
                return;
            }
            
            // Continue momentum animation
            requestAnimationFrame(() => this.animateMomentum());
        }
        
        snapToValidPosition() {
            // If we're at or past the reset position, snap to the beginning
            if (this.currentPosition <= this.resetPosition) {
                this.currentPosition = 0;
                this.container.style.transform = `translateX(0px)`;
            }
        }
        
        startScrolling() {
            this.isScrolling = true;
            this.animate();
        }
        
        pause() {
            this.isPaused = true;
        }
        
        resume() {
            this.isPaused = false;
            if (!this.animationId && !this.isMomentumActive) {
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
            if (!this.isScrolling) return;
            
            if (this.lastTimestamp === 0) {
                this.lastTimestamp = timestamp;
            }
            
            const deltaTime = timestamp - this.lastTimestamp;
            this.lastTimestamp = timestamp;
            
            if (!this.isPaused && deltaTime > 0) {
                // Cap deltaTime to prevent large jumps when animation is throttled (mobile scrolling)
                const maxDeltaTime = 100; // Maximum 100ms between frames
                const clampedDeltaTime = Math.min(deltaTime, maxDeltaTime);
                
                let speed = this.options.speed;
                const pixelsPerFrame = (speed / 1000) * clampedDeltaTime;
                this.currentPosition -= pixelsPerFrame;
                
                // Reset position when we reach the reset point
                // This ensures the next instance of the first skill appears in the same position
                if (this.currentPosition <= this.resetPosition) {
                    this.currentPosition = 0;
                }
                
                this.container.style.transform = `translateX(${this.currentPosition}px)`;
            }
            
            this.animationId = requestAnimationFrame((timestamp) => this.animate(timestamp));
        }
    }
    
    // Initialize skills scrollers
    const iconContainer = document.querySelector('.icon-container');
    const iconContainer2 = document.querySelector('.icon-container2');
    
    if (iconContainer) {
        new SkillsScroller(iconContainer, {
            speed: 30, // Slower speed for top row
            pauseOnHover: true,
            responsive: true,
            momentumDecay: 0.92, // Slightly more springy
            maxMomentumSpeed: 2.5, // Allow higher momentum speeds
        });
    }
    
    if (iconContainer2) {
        new SkillsScroller(iconContainer2, {
            speed: 25, // Even slower speed for bottom row
            pauseOnHover: true,
            responsive: true,
            momentumDecay: 0.92, // Slightly more springy
            maxMomentumSpeed: 2.5, // Allow higher momentum speeds
        });
    }
});
