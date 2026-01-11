/**
 * InfiniteScrollCarousel
 * 
 * A standalone, dependency-free infinite scrolling carousel component with
 * grab-and-drag interaction, momentum scrolling, and seamless looping.
 * 
 * @class InfiniteScrollCarousel
 */
(function(window) {
    'use strict';

    /**
     * Creates an infinite scrolling carousel instance
     * 
     * @param {HTMLElement|string} container - Container element or selector
     * @param {Object} options - Configuration options
     * @param {number} options.speed - Scroll speed in pixels per second, clamped to minimum 0 (default: 50)
     * @param {boolean} options.reverseDirection - Scroll in reverse direction (right to left) (default: false)
     * @param {boolean} options.pauseOnHover - Pause scrolling on hover (default: true)
     * @param {boolean} options.responsive - Recalculate on window resize (default: true)
     * @param {number} options.momentumDecay - Momentum decay factor, clamped to 0.1-0.99 (default: 0.95)
     * @param {number} options.maxMomentumSpeed - Max momentum speed in px/ms, clamped to 0.5-25 (default: 2.0)
     * @param {string} options.fadeColor - Color of the fade gradient in hex, rgb, or rgba format (default: #ffffff)
     * @param {number} options.copies - Number of item copies for seamless loop (default: 3)
     */
    function InfiniteScrollCarousel(container, options) {
        // Resolve container element
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        
        if (!container || !(container instanceof HTMLElement)) {
            throw new Error('InfiniteScrollCarousel: Container element not found');
        }
        
        this.container = container;
        this.options = {
            speed: options && options.speed !== undefined ? options.speed : 50,
            reverseDirection: options && options.reverseDirection === true,
            pauseOnHover: options && options.pauseOnHover !== false,
            responsive: options && options.responsive !== false,
            momentumDecay: options && options.momentumDecay !== undefined ? options.momentumDecay : 0.95,
            maxMomentumSpeed: options && options.maxMomentumSpeed !== undefined ? options.maxMomentumSpeed : 2.0,
            fadeColor: options && options.fadeColor !== undefined ? options.fadeColor : '#ffffff',
            copies: options && options.copies !== undefined ? options.copies : 3,
            ...options
        };
        
        // Validate and clamp option values
        this.validateOptions();
        
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
        this.originalItemCount = 0;
        this.hasDuplicated = false;
        
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
        
        // Event handler references for cleanup
        this.boundHandlers = {
            mouseenter: null,
            mouseleave: null,
            mousedown: null,
            mousemove: null,
            mouseup: null,
            mouseleaveWindow: null,
            touchstart: null,
            touchmove: null,
            touchend: null,
            selectstart: null
        };
        
        this.init();
    }
    
    /**
     * Validate and clamp option values to valid ranges
     */
    InfiniteScrollCarousel.prototype.validateOptions = function() {
        // Validate and clamp speed: must be >= 0
        // If negative speed is provided, convert to positive and set reverseDirection
        if (this.options.speed < 0) {
            const originalValue = this.options.speed;
            this.options.speed = Math.abs(this.options.speed);
            this.options.reverseDirection = true;
            console.warn(
                'InfiniteScrollCarousel: Negative speed value ' + originalValue + 
                ' is deprecated. Use positive speed with reverseDirection: true instead. ' +
                'Speed clamped to ' + this.options.speed + ' and reverseDirection set to true.'
            );
        }
        
        // Ensure speed is at least 0
        if (this.options.speed < 0) {
            this.options.speed = 0;
        }
        
        // Validate momentumDecay: must be between 0.5 and 0.99
        if (this.options.momentumDecay < 0.5 || this.options.momentumDecay > 0.99) {
            const originalValue = this.options.momentumDecay;
            this.options.momentumDecay = Math.max(0.5, Math.min(0.99, this.options.momentumDecay));
            console.warn(
                'InfiniteScrollCarousel: momentumDecay value ' + originalValue + 
                ' is outside valid range (0.5 - 0.99). Clamped to ' + this.options.momentumDecay + '.'
            );
        }
        
        // Validate maxMomentumSpeed: must be between 0.5 and 25
        if (this.options.maxMomentumSpeed < 0.5 || this.options.maxMomentumSpeed > 25) {
            const originalValue = this.options.maxMomentumSpeed;
            this.options.maxMomentumSpeed = Math.max(0.5, Math.min(25, this.options.maxMomentumSpeed));
            console.warn(
                'InfiniteScrollCarousel: maxMomentumSpeed value ' + originalValue + 
                ' is outside valid range (0.5 - 25). Clamped to ' + this.options.maxMomentumSpeed + '.'
            );
        }

        // Validate copies: must be between 3 and 100
        if (this.options.copies < 3) {
            const originalValue = this.options.copies;
            this.options.copies = Math.max(3, Math.min(100, this.options.copies));
            console.warn(
                'InfiniteScrollCarousel: copies value ' + originalValue + 
                ' must be greater than or equal to 3. Clamped to ' + this.options.copies + '.'
            );
        }
    };
    
    /**
     * Initialize the carousel
     */
    InfiniteScrollCarousel.prototype.init = function() {
        // Ensure DOM is ready and styles are applied
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.initialize.bind(this));
        } else {
            this.initialize();
        }
    };
    
    /**
     * Perform initialization after DOM is ready
     */
    InfiniteScrollCarousel.prototype.initialize = function() {
        // Apply fade color to wrapper
        this.applyFadeColor();
        
        // Duplicate items to create seamless loop
        this.duplicateItems();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Wait for responsive styles to be applied before initial calculation
        // This is especially important on mobile where styles may not be ready immediately
        setTimeout(function() {
            // Calculate distance first, then start scrolling after measurement completes
            this.calculateScrollDistance(function() {
                this.setInitialPosition();
                this.startScrolling();
            }.bind(this));
        }.bind(this), 50);
    };
    
    /**
     * Convert color string to rgba format with opacity
     * @param {string} color - Color in hex, rgb, or rgba format
     * @param {number} opacity - Opacity value 0-1 (default: 0.3)
     * @returns {string} rgba color string
     */
    InfiniteScrollCarousel.prototype.colorToRgba = function(color, opacity) {
        if (opacity === undefined) opacity = 0.3;
        
        // If already rgba, extract rgb values and apply new opacity
        if (color.startsWith('rgba')) {
            const rgbaMatch = color.match(/rgba?\(([^)]+)\)/);
            if (rgbaMatch) {
                const values = rgbaMatch[1].split(',').map(function(v) { return v.trim(); });
                return 'rgba(' + values[0] + ', ' + values[1] + ', ' + values[2] + ', ' + opacity + ')';
            }
        }
        
        // If rgb, extract values and convert to rgba
        if (color.startsWith('rgb')) {
            const rgbMatch = color.match(/rgb\(([^)]+)\)/);
            if (rgbMatch) {
                const values = rgbMatch[1].split(',').map(function(v) { return v.trim(); });
                return 'rgba(' + values[0] + ', ' + values[1] + ', ' + values[2] + ', ' + opacity + ')';
            }
        }
        
        // If hex, convert to rgb then rgba
        if (color.startsWith('#')) {
            // Remove # if present
            color = color.replace('#', '');
            
            // Handle 3-digit hex
            if (color.length === 3) {
                color = color.split('').map(function(c) { return c + c; }).join('');
            }
            
            // Convert to rgb
            const r = parseInt(color.substring(0, 2), 16);
            const g = parseInt(color.substring(2, 4), 16);
            const b = parseInt(color.substring(4, 6), 16);
            
            return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
        }
        
        // Fallback: try to use the color as-is (for named colors, might not work)
        return color;
    };
    
    /**
     * Apply fade color to the wrapper element
     */
    InfiniteScrollCarousel.prototype.applyFadeColor = function() {
        // Find the wrapper element (parent of container with class infinite-scroll-wrapper)
        let wrapper = this.container.parentElement;
        
        // If parent doesn't have the wrapper class, try to find it
        if (!wrapper || !wrapper.classList || !wrapper.classList.contains('infinite-scroll-wrapper')) {
            // Look for wrapper in parent chain
            let current = this.container.parentElement;
            while (current && current !== document.body) {
                if (current.classList && current.classList.contains('infinite-scroll-wrapper')) {
                    wrapper = current;
                    break;
                }
                current = current.parentElement;
            }
        }
        
        if (!wrapper) {
            console.warn('InfiniteScrollCarousel: Could not find wrapper element');
            return;
        }
        
        // Convert fade color to rgba with opacity
        const fadeColorRgba = this.colorToRgba(this.options.fadeColor, 1.0);
        
        // Set CSS custom properties for left and right gradients
        wrapper.style.setProperty('--fade-gradient-left', 'linear-gradient(to right, ' + fadeColorRgba + ', transparent)');
        wrapper.style.setProperty('--fade-gradient-right', 'linear-gradient(to left, ' + fadeColorRgba + ', transparent)');
        
        // Add data attribute to activate the CSS rule
        wrapper.setAttribute('data-fade-color', '');
    };
    
    /**
     * Duplicate container children to create seamless infinite loop
     */
    InfiniteScrollCarousel.prototype.duplicateItems = function() {
        if (this.hasDuplicated) return;
        
        // Get original children
        const originalItems = Array.from(this.container.children);
        if (originalItems.length === 0) {
            console.warn('InfiniteScrollCarousel: No children found in container');
            this.originalItemCount = 0;
            return;
        }
        
        this.originalItemCount = originalItems.length;
        
        // Create copies
        const copies = this.options.copies || 3;
        for (let i = 1; i < copies; i++) {
            originalItems.forEach(function(item) {
                const clone = item.cloneNode(true);
                this.container.appendChild(clone);
            }.bind(this));
        }
        
        this.hasDuplicated = true;
    };
    
    /**
     * Calculate scroll distance for seamless looping
     * @param {Function} callback - Callback to execute after calculation
     */
    InfiniteScrollCarousel.prototype.calculateScrollDistance = function(callback) {
        // Prevent concurrent measurements
        if (this.isMeasuring) {
            // If already measuring, queue the callback
            if (callback) {
                const checkInterval = setInterval(function() {
                    if (!this.isMeasuring) {
                        clearInterval(checkInterval);
                        callback();
                    }
                }.bind(this), 10);
            }
            return;
        }
        this.isMeasuring = true;
        
        try {
            // Get all items (including duplicates)
            const items = Array.from(this.container.children);
            if (items.length === 0) {
                this.isMeasuring = false;
                if (callback) callback();
                return;
            }
            
            // Calculate item count per set (original items)
            // originalItemCount should be set by duplicateItems()
            if (!this.originalItemCount || this.originalItemCount === 0) {
                console.warn('InfiniteScrollCarousel: No items to scroll');
                this.isMeasuring = false;
                if (callback) callback();
                return;
            }
            
            const itemCount = this.originalItemCount;
            
            // Store current state to restore after measurement
            const wasScrolling = this.isScrolling;
            const savedPosition = this.currentPosition;
            const savedTransform = this.container.style.transform;
            const oldTotalSetWidth = this.totalSetWidth; // Store old width for proportional adjustment
            
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
            requestAnimationFrame(function() {
                // Calculate total width by measuring actual rendered width of first set
                // This is more accurate than summing individual items due to flexbox behavior
                let totalSetWidth = 0;
                
                // Method 1: Measure the actual distance from first item to first item of second set
                // This accounts for all margins, padding, and flexbox spacing correctly
                if (items.length >= itemCount * 2) {
                    const firstItemRect = items[0].getBoundingClientRect();
                    const secondSetFirstItemRect = items[itemCount].getBoundingClientRect();
                    totalSetWidth = secondSetFirstItemRect.left - firstItemRect.left;
                } else {
                    // Fallback: Sum item widths and margins (only between items, not after last)
                    const firstItemStyle = window.getComputedStyle(items[0]);
                    const marginRight = parseFloat(firstItemStyle.marginRight) || 0;
                    
                    for (let i = 0; i < itemCount; i++) {
                        const item = items[i];
                        if (!item) continue;
                        
                        // Get the actual rendered width (includes padding and border)
                        const itemWidth = item.offsetWidth;
                        totalSetWidth += itemWidth;
                        
                        // Add margin only between items (not after the last item)
                        if (i < itemCount - 1) {
                            totalSetWidth += marginRight;
                        }
                    }
                }
                
                // Round to avoid sub-pixel issues, but keep precision for smooth animation
                const newTotalSetWidth = Math.round(totalSetWidth * 100) / 100;
                
                // Calculate the reset position
                // Reset when we've scrolled exactly one set width
                const newResetPosition = -newTotalSetWidth;
                
                // Adjust position proportionally if dimensions changed
                let adjustedPosition = savedPosition;
                if (oldTotalSetWidth && oldTotalSetWidth !== newTotalSetWidth && savedPosition !== 0) {
                    // Calculate the ratio of change
                    const ratio = newTotalSetWidth / oldTotalSetWidth;
                    adjustedPosition = savedPosition * ratio;
                    
                    // Clamp position to valid bounds: resetPosition < position < 0
                    if (adjustedPosition >= 0) {
                        // Too far right, snap to appropriate position based on direction
                        adjustedPosition = this.options.reverseDirection ? newResetPosition : 0;
                    } else if (adjustedPosition <= newResetPosition) {
                        // Too far left, snap to reset position
                        adjustedPosition = newResetPosition;
                    }
                }
                
                // Update dimensions
                this.totalSetWidth = newTotalSetWidth;
                this.resetPosition = newResetPosition;
                
                // Restore adjusted position
                this.container.style.transform = 'translateX(' + adjustedPosition + 'px)';
                this.currentPosition = adjustedPosition;
                this.isScrolling = wasScrolling;
                
                // Force another layout recalculation
                void this.container.offsetHeight;
                
                // Recalculate drag boundaries
                this.calculateDragBoundaries();
                
                // Snap to valid position to ensure we're not at a boundary that would trigger immediate reset
                this.snapToValidPosition();
                
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
            }.bind(this));
        } catch (error) {
            console.error('InfiniteScrollCarousel: Error calculating scroll distance:', error);
            this.isMeasuring = false;
            if (callback) callback();
        }
    };
    
    /**
     * Set initial position based on scroll direction
     * For reverse scrolling, start at the second copy position so items are visible on both sides
     */
    InfiniteScrollCarousel.prototype.setInitialPosition = function() {
        if (this.resetPosition === null) return;
        
        // For reverse scrolling, start at the second copy position
        // This ensures items are visible on both sides when scrolling right
        if (this.options.reverseDirection) {
            this.currentPosition = this.resetPosition; // -totalSetWidth
            this.container.style.transform = 'translateX(' + this.currentPosition + 'px)';
        } else {
            // For forward scrolling, start at 0 (first copy)
            this.currentPosition = 0;
            this.container.style.transform = 'translateX(0px)';
        }
    };
    
    /**
     * Calculate drag boundaries for infinite dragging
     */
    InfiniteScrollCarousel.prototype.calculateDragBoundaries = function() {
        if (this.resetPosition === null) return;
        
        // Boundaries are the same for both directions
        // Min boundary is reset position (left), max is 0 (right)
        // Valid range: resetPosition < position < 0 (exclusive boundaries to avoid seams)
        this.minDragBoundary = this.resetPosition;
        this.maxDragBoundary = 0;
    };
    
    /**
     * Setup event listeners for interaction
     */
    InfiniteScrollCarousel.prototype.setupEventListeners = function() {
        // Clean up any existing listeners if re-initializing
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        
        // Pause on hover
        if (this.options.pauseOnHover) {
            this.boundHandlers.mouseenter = function() {
                if (!this.isDragging && !this.isMomentumActive) {
                    this.pause();
                }
            }.bind(this);
            
            this.boundHandlers.mouseleave = function() {
                if (!this.isDragging && !this.isMomentumActive) {
                    this.resume();
                }
            }.bind(this);
            
            this.container.addEventListener('mouseenter', this.boundHandlers.mouseenter);
            this.container.addEventListener('mouseleave', this.boundHandlers.mouseleave);
        }
        
        // Mouse events for dragging
        this.boundHandlers.mousedown = this.startDragging.bind(this);
        this.boundHandlers.mousemove = this.handleDrag.bind(this);
        this.boundHandlers.mouseup = this.endDragging.bind(this);
        
        this.container.addEventListener('mousedown', this.boundHandlers.mousedown);
        document.addEventListener('mousemove', this.boundHandlers.mousemove);
        document.addEventListener('mouseup', this.boundHandlers.mouseup);
        
        // Handle case where mouse leaves window during drag
        this.boundHandlers.mouseleaveWindow = function() {
            if (this.isDragging) {
                this.endDragging();
            }
        }.bind(this);
        window.addEventListener('mouseleave', this.boundHandlers.mouseleaveWindow);
        
        // Touch events for mobile
        this.boundHandlers.touchstart = this.startDragging.bind(this);
        this.boundHandlers.touchmove = this.handleDrag.bind(this);
        this.boundHandlers.touchend = this.endDragging.bind(this);
        
        this.container.addEventListener('touchstart', this.boundHandlers.touchstart, { passive: false });
        document.addEventListener('touchmove', this.boundHandlers.touchmove, { passive: false });
        document.addEventListener('touchend', this.boundHandlers.touchend);
        
        // Prevent text selection during drag
        this.boundHandlers.selectstart = function(e) {
            e.preventDefault();
        };
        this.container.addEventListener('selectstart', this.boundHandlers.selectstart);
        
        // Resize handler with proper debouncing
        this.resizeHandler = function() {
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
            this.resizeDelayTimeout = setTimeout(function() {
                this.lastWidth = currentWidth;
                this.resizeDelayTimeout = null;
                this.calculateScrollDistance();
            }.bind(this), 50);
        }.bind(this);
        
        window.addEventListener('resize', this.resizeHandler);
    };
    
    /**
     * Start dragging interaction
     * @param {Event} event - Mouse or touch event
     */
    InfiniteScrollCarousel.prototype.startDragging = function(event) {
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
    };
    
    /**
     * Handle drag movement
     * @param {Event} event - Mouse or touch event
     */
    InfiniteScrollCarousel.prototype.handleDrag = function(event) {
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
        this.container.style.transform = 'translateX(' + this.currentPosition + 'px)';
        
        // Prevent default behavior
        event.preventDefault();
    };
    
    /**
     * End dragging interaction
     */
    InfiniteScrollCarousel.prototype.endDragging = function() {
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
    };
    
    /**
     * Start momentum animation after drag
     */
    InfiniteScrollCarousel.prototype.startMomentum = function() {
        this.isMomentumActive = true;
        this.container.style.cursor = 'grab';
        this.animateMomentum();
    };
    
    /**
     * Animate momentum scrolling
     */
    InfiniteScrollCarousel.prototype.animateMomentum = function() {
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
        this.container.style.transform = 'translateX(' + this.currentPosition + 'px)';
        
        // Stop momentum when velocity is too low
        if (Math.abs(this.velocity) < 0.02) {
            this.isMomentumActive = false;
            this.velocity = 0;
            this.snapToValidPosition();
            this.resume();
            return;
        }
        
        // Continue momentum animation
        requestAnimationFrame(this.animateMomentum.bind(this));
    };
    
    /**
     * Snap to valid position after interaction
     */
    InfiniteScrollCarousel.prototype.snapToValidPosition = function() {
        if (this.resetPosition === null) return;
        
        // Unified logic for both directions
        if (this.options.reverseDirection) {
            // Reverse direction: snap if we're too far right (>= 0)
            if (this.currentPosition >= 0) {
                this.currentPosition = this.resetPosition; // -totalSetWidth
                this.container.style.transform = 'translateX(' + this.currentPosition + 'px)';
            }
        } else {
            // Forward direction: snap if we're too far left (<= resetPosition)
            if (this.currentPosition <= this.resetPosition) {
                this.currentPosition = 0;
                this.container.style.transform = 'translateX(0px)';
            }
        }
    };
    
    /**
     * Start automatic scrolling
     */
    InfiniteScrollCarousel.prototype.startScrolling = function() {
        if (this.isScrolling) return; // Already scrolling
        
        this.isScrolling = true;
        this.lastTimestamp = 0; // Reset timestamp for accurate delta calculation
        this.animate();
    };
    
    /**
     * Pause automatic scrolling
     */
    InfiniteScrollCarousel.prototype.pause = function() {
        this.isPaused = true;
    };
    
    /**
     * Resume automatic scrolling
     */
    InfiniteScrollCarousel.prototype.resume = function() {
        this.isPaused = false;
        if (this.isScrolling && !this.animationId && !this.isMomentumActive) {
            this.lastTimestamp = 0; // Reset timestamp for accurate delta calculation
            this.animate();
        }
    };
    
    /**
     * Stop automatic scrolling
     */
    InfiniteScrollCarousel.prototype.stop = function() {
        this.isScrolling = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    };
    
    /**
     * Main animation loop
     * @param {number} timestamp - Animation frame timestamp
     */
    InfiniteScrollCarousel.prototype.animate = function(timestamp) {
        if (!this.isScrolling) {
            this.animationId = null;
            return;
        }
        
        // Initialize timestamp on first frame
        if (this.lastTimestamp === 0) {
            this.lastTimestamp = timestamp || 0;
            this.animationId = requestAnimationFrame(this.animate.bind(this));
            return;
        }
        
        const deltaTime = (timestamp || 0) - this.lastTimestamp;
        this.lastTimestamp = timestamp || 0;
        
        if (!this.isPaused && deltaTime > 0 && !this.isDragging && !this.isMomentumActive) {
            // Cap deltaTime to prevent large jumps when animation is throttled
            const maxDeltaTime = 100; // Maximum 100ms between frames
            const clampedDeltaTime = Math.min(deltaTime, maxDeltaTime);
            
            const speed = this.options.speed;
            const pixelsPerFrame = (speed / 1000) * clampedDeltaTime;
            
            // Calculate new position based on direction
            // Forward: move left (decrease position)
            // Reverse: move right (increase position)
            let newPosition;
            if (this.options.reverseDirection) {
                newPosition = this.currentPosition + pixelsPerFrame;
            } else {
                newPosition = this.currentPosition - pixelsPerFrame;
            }
            
            // Reset position when we reach the reset point
            // Unified logic for both directions
            // Check boundaries BEFORE updating to prevent visible jump
            // Add small buffer (1px) to prevent premature resets due to floating point precision
            const resetBuffer = 1;
            if (this.resetPosition !== null) {
                if (this.options.reverseDirection) {
                    // Reverse direction: moving right (increasing), reset when >= 0 - buffer
                    if (newPosition >= 0 - resetBuffer) {
                        this.currentPosition = this.resetPosition; // -totalSetWidth
                    } else {
                        this.currentPosition = newPosition;
                    }
                } else {
                    // Forward direction: moving left (decreasing), reset when <= resetPosition + buffer
                    if (newPosition <= this.resetPosition + resetBuffer) {
                        this.currentPosition = 0;
                    } else {
                        this.currentPosition = newPosition;
                    }
                }
            } else {
                this.currentPosition = newPosition;
            }
            
            // Update transform with sub-pixel precision
            this.container.style.transform = 'translateX(' + this.currentPosition + 'px)';
        }
        
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    };
    
    /**
     * Cleanup method for proper resource management
     */
    InfiniteScrollCarousel.prototype.destroy = function() {
        this.stop();
        
        // Remove event listeners
        if (this.boundHandlers.mouseenter) {
            this.container.removeEventListener('mouseenter', this.boundHandlers.mouseenter);
        }
        if (this.boundHandlers.mouseleave) {
            this.container.removeEventListener('mouseleave', this.boundHandlers.mouseleave);
        }
        if (this.boundHandlers.mousedown) {
            this.container.removeEventListener('mousedown', this.boundHandlers.mousedown);
        }
        if (this.boundHandlers.mousemove) {
            document.removeEventListener('mousemove', this.boundHandlers.mousemove);
        }
        if (this.boundHandlers.mouseup) {
            document.removeEventListener('mouseup', this.boundHandlers.mouseup);
        }
        if (this.boundHandlers.mouseleaveWindow) {
            window.removeEventListener('mouseleave', this.boundHandlers.mouseleaveWindow);
        }
        if (this.boundHandlers.touchstart) {
            this.container.removeEventListener('touchstart', this.boundHandlers.touchstart);
        }
        if (this.boundHandlers.touchmove) {
            document.removeEventListener('touchmove', this.boundHandlers.touchmove);
        }
        if (this.boundHandlers.touchend) {
            document.removeEventListener('touchend', this.boundHandlers.touchend);
        }
        if (this.boundHandlers.selectstart) {
            this.container.removeEventListener('selectstart', this.boundHandlers.selectstart);
        }
        
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        
        if (this.resizeDelayTimeout) {
            clearTimeout(this.resizeDelayTimeout);
            this.resizeDelayTimeout = null;
        }
        
        // Reset container styles
        this.container.style.transform = '';
        this.container.style.cursor = '';
    };
    
    // Export to global scope
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = InfiniteScrollCarousel;
    } else {
        window.InfiniteScrollCarousel = InfiniteScrollCarousel;
    }
    
})(typeof window !== 'undefined' ? window : this);

