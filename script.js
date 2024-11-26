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

    setTimeout(() => {
        var typed = new Typed('.typing', {
          strings: ["a Problem Solver.", "a Software Engineer.", "your next Hire.^2000"],
          loop: true,
          typeSpeed: 60,
          smartBackspace: true,
          backSpeed: 40,
          onLastStringBackspaced: () => typed.strPos = 0
        });
      }, 750)
});