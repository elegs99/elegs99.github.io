# Grab-n-Drag Infinite Scrolling Carousel

A lightweight, dependency-free infinite scrolling carousel component with grab-and-drag interaction, momentum scrolling, and seamless looping. Perfect for showcasing logos, skills, testimonials, or any horizontally scrollable content.

## Features

- **Infinite Seamless Loop** - Automatically duplicates items for continuous scrolling with no visible jumps
- **Grab and Drag** - Interactive dragging with mouse and touch support
- **Momentum Scrolling** - Natural momentum physics after drag release
- **Responsive** - Automatically recalculates on window resize
- **Pause on Hover** - Optional pause when hovering over the carousel
- **Zero Dependencies** - Pure vanilla JavaScript, no jQuery or frameworks required
- **Lightweight** - Works in all modern browsers
- **HTML Accessible** - Maintains keyboard navigation and screen reader compatibility

## Demo

![Demo GIF of Infinite Scrolling Carousel](docs/demo.gif)
<!-- Replace the above with an actual GIF (e.g., demo/demo.gif) after creating a screen capture -->
View the interactive [demo page](https://www.ethanlegum.com/Open-Source-Grab-n-Drag-Infinite-Scroll-Carousel/) for live examples and usage.

## Installation

### npm (Recommended)

```bash
npm install grab-n-drag-infinite-carousel
```

Then import in your project:

```javascript
// ES Modules
import InfiniteScrollCarousel from 'grab-n-drag-infinite-carousel';
import 'grab-n-drag-infinite-carousel/grab-n-drag-infinite-carousel.css';

// CommonJS
const InfiniteScrollCarousel = require('grab-n-drag-infinite-carousel');
require('grab-n-drag-infinite-carousel/grab-n-drag-infinite-carousel.css');
```

### CDN

```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/grab-n-drag-infinite-carousel@latest/grab-n-drag-infinite-carousel.css">

<!-- JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/grab-n-drag-infinite-carousel@latest/grab-n-drag-infinite-carousel.js"></script>
```

### Manual Download

Download the files directly from the repository:
- `grab-n-drag-infinite-carousel.js` (or `grab-n-drag-infinite-carousel.min.js` for production)
- `grab-n-drag-infinite-carousel.css` (or `grab-n-drag-infinite-carousel.min.css` for production)

### TypeScript Support

TypeScript definitions are included! If you're using TypeScript, you'll get full type checking and IntelliSense support:

```typescript
import InfiniteScrollCarousel, { InfiniteScrollCarouselOptions } from 'grab-n-drag-infinite-carousel';

const options: InfiniteScrollCarouselOptions = {
  speed: 50,
  pauseOnHover: true
};

const carousel = new InfiniteScrollCarousel('#myCarousel', options);
```

## Quickstart

### 1. Include the Files

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="grab-n-drag-infinite-carousel.css">
</head>
<body>
    <!-- Your carousel markup -->
    
    <script src="grab-n-drag-infinite-carousel.js"></script>
    <script>
        // Initialize carousel
    </script>
</body>
</html>
```

### 2. Basic HTML Structure

```html
<div class="infinite-scroll-wrapper">
    <div class="infinite-scroll-container" id="myCarousel">
        <div class="infinite-scroll-item">Item 1</div>
        <div class="infinite-scroll-item">Item 2</div>
        <div class="infinite-scroll-item">Item 3</div>
        <!-- Add more items as needed -->
    </div>
</div>
```

### 3. Initialize the Carousel

```javascript
// Get the container element
const container = document.querySelector('#myCarousel');

// Create carousel instance
const carousel = new InfiniteScrollCarousel(container, {
    speed: 50,              // pixels per second
    pauseOnHover: true,     // pause on hover
    momentumDecay: 0.95,    // momentum decay factor
    maxMomentumSpeed: 2.0   // max momentum speed
});
```

That's it! The carousel will automatically start scrolling.

## API Reference

### Constructor

```javascript
new InfiniteScrollCarousel(container, options)
```

#### Parameters

- **container** (`HTMLElement` or `string`) - The container element or CSS selector. Must contain direct children that will be scrolled.
- **options** (`Object`, optional) - Configuration object


### Options

| Option | Type | Default | Description |
|------|------|---------|-------------|
| `speed` | number | `50` | Auto-scroll speed (pixels/sec).<br>Set to `0` to disable. |
| `reverseDirection` | boolean | `false` | Scroll direction.<br>`false`: right → left<br>`true`: left → right |
| `pauseOnHover` | boolean | `true` | Pauses scrolling when the pointer enters the container. |
| `responsive` | boolean | `true` | Recalculate dimensions on window resize. |
| `momentumDecay` | number | `0.95` | Drag momentum decay factor.<br>Range: `0.5–0.99` |
| `maxMomentumSpeed` | number | `2.0` | Maximum momentum speed (px/ms).<br>Range: `0.5–25` |
| `fadeColor` | string | `#ffffff` | Edge fade color (`hex`, `rgb`, `rgba`).<br>Use `transparent` to disable. |
| `copies` | number | `3` | Number of duplicated item sets for seamless looping. |


### Methods

#### `startScrolling()`
Start automatic scrolling (if stopped).

```javascript
carousel.startScrolling();
```

#### `stop()`
Stop automatic scrolling.

```javascript
carousel.stop();
```

#### `pause()`
Pause scrolling (resumed when interacted).

```javascript
carousel.pause();
```

#### `resume()`
Resume paused scrolling.

```javascript
carousel.resume();
```

#### `destroy()`
Clean up event listeners and reset the carousel. Call this when removing the carousel from an active page.

```javascript
carousel.destroy();
```

## Examples

### Example 1: Logo Carousel

```html
<div class="infinite-scroll-wrapper">
    <div class="infinite-scroll-container" id="logoCarousel">
        <div class="infinite-scroll-item">
            <img src="logo1.png" alt="Company 1">
        </div>
        <div class="infinite-scroll-item">
            <img src="logo2.png" alt="Company 2">
        </div>
        <div class="infinite-scroll-item">
            <img src="logo3.png" alt="Company 3">
        </div>
    </div>
</div>

<script>
    const carousel = new InfiniteScrollCarousel('#logoCarousel', {
        speed: 30
    });
</script>
```

### Example 2: Skills Icons

```html
<div class="infinite-scroll-wrapper">
    <div class="infinite-scroll-container" id="skillsCarousel">
        <div class="infinite-scroll-item">
            <i class="fab fa-html5"></i>
            <span>HTML</span>
        </div>
        <div class="infinite-scroll-item">
            <i class="fab fa-css3"></i>
            <span>CSS</span>
        </div>
        <div class="infinite-scroll-item">
            <i class="fab fa-js"></i>
            <span>JavaScript</span>
        </div>
    </div>
</div>

<script>
    const carousel = new InfiniteScrollCarousel('#skillsCarousel', {
        speed: 40,
        pauseOnHover: true
    });
</script>
```

### Example 3: Multiple Carousels

```javascript
// Initialize multiple carousels with different settings
const carousel1 = new InfiniteScrollCarousel('#carousel1', {
    speed: 50
});

const carousel2 = new InfiniteScrollCarousel('#carousel2', {
    speed: 30,
    pauseOnHover: false
});
```

### Example 4: Custom Styling

```html
<style>
    .my-carousel-wrapper {
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .my-carousel-item {
        padding: 20px;
        margin-right: 30px;
        background: #f0f0f0;
        border-radius: 8px;
    }
</style>

<div class="infinite-scroll-wrapper my-carousel-wrapper">
    <div class="infinite-scroll-container" id="customCarousel">
        <div class="infinite-scroll-item my-carousel-item">Card 1</div>
        <div class="infinite-scroll-item my-carousel-item">Card 2</div>
        <div class="infinite-scroll-item my-carousel-item">Card 3</div>
    </div>
</div>
```

## Styling

### Required Classes

- `.infinite-scroll-wrapper` - Outer wrapper (handles overflow)
- `.infinite-scroll-container` - Scrolling container
- `.infinite-scroll-item` - Individual items (direct children of container)

### Customization

You can fully customize the look and feel of the carousel by adding your own CSS or extending the default classes.

**1. Item Spacing:**

Change the spacing between items (adjust margin or padding):

```css
.infinite-scroll-item {
    margin-right: 40px; /* Increase space between items */
}
```

**2. Item Styling:**

Style individual items (such as background, border, typography):

```css
.infinite-scroll-item {
    background: #f8f8fc;
    border-radius: 8px;
    padding: 16px 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    color: #222;
    font-weight: 500;
}
```

**3. Fade Gradient Colors:**

Override the fade color (defaults to white) on the wrapper edges, either via the API or by customizing CSS if needed. (Set `fadeColor` option in JS.)

**4. Carousel Height and Alignment:**

Adjust item alignment or carousel height to fit your content:

```css
.infinite-scroll-container {
    align-items: flex-start; /* or center, flex-end */
    min-height: 50px;
}
```

**5. Responsive Layouts:**

Make the carousel responsive by adjusting sizes and spacing at different breakpoints:

```css
@media (max-width: 600px) {
    .infinite-scroll-item {
        margin-right: 16px;
        padding: 10px 14px;
        font-size: 0.95em;
    }
}
```

#### Advanced: Add Custom Classes

You can apply your own classes to the wrapper, container, or items for more specific targeting, e.g.

```html
<div class="infinite-scroll-wrapper my-carousel-wrapper">
    <div class="infinite-scroll-container" id="customCarousel">
        <div class="infinite-scroll-item my-carousel-item">Custom 1</div>
        <div class="infinite-scroll-item my-carousel-item">Custom 2</div>
        <div class="infinite-scroll-item my-carousel-item">Custom 3</div>
    </div>
</div>
```

And then:

```css
.my-carousel-wrapper {
    max-width: 900px;
    margin: 0 auto;
    border: 1px solid #ddd;
    background: #fafbfc;
}
.my-carousel-item {
    padding: 24px;
    margin-right: 32px;
    font-size: 18px;
    color: #225577;
}
```

#### Tip

- You can use *any* content inside `.infinite-scroll-item`—icons, images, cards, links, etc.
- You can stack multiple carousels with different IDs and provide tailored styles for each. [See Demo 🠚](https://www.ethanlegum.com/Open-Source-Grab-n-Drag-Infinite-Scroll-Carousel/)

For more advanced interactivity, combine with your JS events or frameworks—just ensure you keep the core class structure for the carousel JavaScript to work.


## Browser Compatibility

- Chrome/Edge: ✅ (latest)
- Firefox: ✅ (latest)
- Safari: ✅ (latest)
- iOS Safari: ✅ (latest)
- Android Chrome: ✅ (latest)

Requires support for:
- `requestAnimationFrame`
- `transform` CSS property
- `addEventListener`

## Accessibility

- **Keyboard Navigation**: Items remain keyboard accessible
- **Screen Readers**: Content is readable by screen readers
- **Focus Management**: Focus states are preserved
- **Touch Support**: Full touch gesture support on mobile devices

### Best Practices

1. Ensure items have proper `alt` text for images
2. Use semantic HTML for carousel items
3. Provide alternative navigation for users who cannot use drag gestures
4. Test with keyboard-only navigation

## Performance

- Uses `requestAnimationFrame` for smooth 60fps animations
- Sub-pixel precision for smooth scrolling
- Efficient event handling with proper cleanup
- Minimal DOM manipulation
- Debounced resize calculations

### Optimization Tips

1. **Limit Item Count**: While the carousel handles many items, keep it reasonable (< 100 items)
2. **Optimize Images**: Use optimized images for logo/item carousels
3. **Use `will-change`**: Already included in the CSS for optimal performance
4. **Avoid Heavy Animations**: Don't add heavy CSS animations to items

## Common Pitfalls

### Items Not Scrolling

**Problem**: Carousel doesn't scroll or items don't move.

**Solutions**:
- Ensure `.infinite-scroll-wrapper` has `overflow: hidden`
- Check that container has direct children
- Verify CSS file is loaded
- Check browser console for errors

### Items Jumping or Glitching

**Problem**: Visible jumps or glitches during scrolling.

**Solutions**:
- Ensure items have consistent widths
- Don't modify item count after initialization
- Wait for images to load before initializing (if using images)

### Drag Not Working

**Problem**: Can't drag the carousel.

**Solutions**:
- Ensure container has `cursor: grab` (included in CSS)
- Check for CSS that might be blocking pointer events
- Verify JavaScript file is loaded
- Check for JavaScript errors in console

### Items Too Close Together

**Problem**: Items are overlapping or too close.

**Solution**: Add margin to items:
```css
.infinite-scroll-item {
    margin-right: 30px; /* Adjust as needed */
}
```

### Carousel Too Fast/Slow

**Problem**: Scrolling speed is not right.

**Solution**: Adjust the `speed` option:
```javascript
const carousel = new InfiniteScrollCarousel(container, {
    speed: 30  // Lower = slower, Higher = faster
});
```

## License

This project is licensed under CC0 1.0 Universal - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or contributions, please open an issue on the repository.
