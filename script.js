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
        strings: ["a Software Engineer.", "a Problem Solver.", "your Next Hire.^5000"],
        typeSpeed: 60,
        backSpeed: 40,
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