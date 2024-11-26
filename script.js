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

    // Typing animation setup
    /*new Typed(".typing", {
        strings: ["a Problem Solver.", "your Next Hire.^5000"],
        typeSpeed: 60,
        backSpeed: 40,
        startDelay: 1000,
        loop: true
    });*/
    setTimeout(() => {
        var typed = new Typed('.typing', {
          strings: ["a Software Engineer.", "a Problem Solver.", "your Next Hire.^2000"],
          loop: true,
          typeSpeed: 60,
          smartBackspace: true,
          backSpeed: 40,
          onLastStringBackspaced: () => typed.strPos = 1
        });
      }, 750)
});