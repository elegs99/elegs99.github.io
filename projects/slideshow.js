// Slideshow functionality
let slideIndex = 1;

// Initialize the slideshow
showSlides(slideIndex);

// Function to control next/previous slides
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Function to display the correct slide
function showSlides(n) {
  const slides = document.getElementsByClassName("epSlides");
  if (n > slides.length) { slideIndex = 1; }
  if (n < 1) { slideIndex = slides.length; }
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex - 1].style.display = "block";
}

// Event listener for lazy loading images when the slideshow is first loaded
document.addEventListener("DOMContentLoaded", function() {
  const lazyImages = document.querySelectorAll('img[data-src][loading="lazy"]');
  lazyImages.forEach(img => {
    img.src = img.dataset.src;
    img.removeAttribute('loading');
  });
});
