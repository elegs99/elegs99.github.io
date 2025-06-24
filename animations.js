$(document).ready(function(){
    // Skills Scrolling Animation
    class SkillsScroller {
        constructor(container, options = {}) {
            this.container = container;
            this.options = {
                speed: options.speed || 50, // pixels per second
                pauseOnHover: options.pauseOnHover !== false,
                responsive: options.responsive !== false,
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
            this.resetPosition = -(totalWidth + gap) - responsiveResetOffset;
            
            // Calculate drag boundaries
            this.calculateDragBoundaries();
            
            // Reset position to start
            this.currentPosition = 0;
            this.container.style.transform = `translateX(0px)`;
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
                    if (!this.isDragging) {
                        this.pause();
                    }
                });
                
                this.container.addEventListener('mouseleave', () => {
                    if (!this.isDragging) {
                        this.resume();
                    }
                });
            }
            
            // Mouse events for dragging
            this.container.addEventListener('mousedown', (e) => this.startDragging(e));
            document.addEventListener('mousemove', (e) => this.handleDrag(e));
            document.addEventListener('mouseup', () => this.endDragging());
            
            // Touch events for mobile - use non-passive since we need preventDefault
            this.container.addEventListener('touchstart', (e) => this.startDragging(e), { passive: false });
            document.addEventListener('touchmove', (e) => this.handleDrag(e), { passive: false });
            document.addEventListener('touchend', () => this.endDragging());
            
            // Prevent text selection during drag
            this.container.addEventListener('selectstart', (e) => e.preventDefault());
        }
        
        startDragging(event) {
            this.isDragging = true;
            this.pause();
            
            // Get the starting position
            const clientX = event.clientX || (event.touches && event.touches[0].clientX);
            this.dragStartX = clientX;
            this.dragStartPosition = this.currentPosition;
            
            // Change cursor
            this.container.style.cursor = 'grabbing';
            
            // Prevent default behavior
            event.preventDefault();
        }
        
        handleDrag(event) {
            if (!this.isDragging) return;
            
            const clientX = event.clientX || (event.touches && event.touches[0].clientX);
            const deltaX = clientX - this.dragStartX;
            
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
            if (!this.isDragging) return;
            
            this.isDragging = false;
            
            // Snap to valid position if needed
            this.snapToValidPosition();
            
            // Reset cursor
            this.container.style.cursor = 'grab';
            
            // Resume scrolling
            this.resume();
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
            if (!this.animationId) {
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
                let speed = this.options.speed;
                const pixelsPerFrame = (speed / 1000) * deltaTime;
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
        });
    }
    
    if (iconContainer2) {
        new SkillsScroller(iconContainer2, {
            speed: 25, // Even slower speed for bottom row
            pauseOnHover: true,
            responsive: true,
        });
    }

    // Typing animation
    var typed = new Typed('.typing', {
        strings: ["your next Hire.^6000", "a Problem Solver.", "a Software Engineer."],
        loop: true,
        typeSpeed: 40,
        smartBackspace: true,
        backSpeed: 30,
        onLastStringBackspaced: () => typed.strPos = 0,
    });
});
