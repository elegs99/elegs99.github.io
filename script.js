$(document).ready(function(){

    const containers = document.querySelectorAll('.icon-container, .icon-container2, .icon-container3');

    containers.forEach((container) => {
        container.addEventListener('mouseover', () => {
            container.style.animationPlayState = 'paused';
        });
        container.addEventListener('mouseout', () => {
            container.style.animationPlayState = 'running';
        });
    });

    // Initialize popups and related elements as hidden
    $('.popup-content, .project1, .project2, .project3, .project4, .project5').hide();

    // Header background and scroll up button behavior on scroll
    $(window).scroll(function(){
        // Sticky navbar activation
        if(this.scrollY > 20){
            $('.navbar').addClass("sticky");
        } else {
            $('.navbar').removeClass("sticky");
        }

        // Scroll-up button visibility
        if(this.scrollY > 500 && !$('.overlay').hasClass("show")){
            $('.scroll-up-btn').addClass("show");
        } else {
            $('.scroll-up-btn').removeClass("show");
        }
    });

    // Toggle menu/navbar button
    $('.menu-btn').click(function(){
        $('.navbar .menu').toggleClass("active");
        $('.menu-btn i').toggleClass("active");
    });

    // Typing animation setup
    new Typed(".typing", {
        strings: ["a Computer Vision Specialist.", "a Programmer.", "a Problem Solver.", "your Next Hire.", "your Next Hire.", "your Next Hire."],
        typeSpeed: 100,
        backSpeed: 50,
        loop: true
    });

    // Modify the popup openers to include image loading
    $('.grid-item1, .grid-item2, .grid-item3, .grid-item4, .grid-item5').click(function(){
        var projectClass = '.project' + this.className.slice(-1);
        var projectPopup = $(projectClass);
        $('.overlay, ' + projectClass + ', .popup-content').show();
        loadPopupImages(projectPopup); // Load images when the popup is opened
        $('.scroll-up-btn').removeClass("show");
        $('body').css('overflow', 'hidden');
    });

    // Popup closer for close button and overlay click outside popup content
    $('.close-btn').click(function(event){
        $('.overlay, .project1, .project2, .project3, .project4, .project5, .popup-content').hide();
        $('.scroll-up-btn').addClass("show");
        $('body').css('overflow', 'auto');
    });
    $('.overlay').click(function(event){
        if ($(event.target).closest('.popup-content').length === 0) {
            $('.overlay, .project1, .project2, .project3, .project4, .project5, .popup-content').hide();
            $('.scroll-up-btn').addClass("show");
            $('body').css('overflow', 'auto');
        }
    });
});

// Slideshow functionality
var slideIndex = [1, 2];  // Index for each slideshow
var slideId = ["NiSlides", "ErSlides", "EmSlides", "jtvrSlides", "epSlides"];  // IDs for each slideshow

// Initialize slideshows
// showSlides(7, 5);
showSlides(7, 4);
showSlides(7, 3);
showSlides(7, 2);
showSlides(7, 1);
showSlides(7, 0);

// Functions to control next/previous slides
function plusSlides(n, no) {
  showSlides(slideIndex[no] += n, no);
}

// Function to display the correct slide
function showSlides(n, no) {
  var x = document.getElementsByClassName(slideId[no]);
  if (n > x.length) { slideIndex[no] = 1; }
  if (n < 1) { slideIndex[no] = x.length; }
  for (var i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  x[slideIndex[no]-1].style.display = "block";
}

// Function to load images in the popup
function loadPopupImages(popupElement) {
    var lazyImages = $(popupElement).find('img[data-src][loading="lazy"]');
    lazyImages.each(function() {
        $(this).attr('src', $(this).data('src')); // Set the source of the image
        $(this).removeAttr('loading'); // Remove the 'loading' attribute
    });
}