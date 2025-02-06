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
    var typed = new Typed('.typing', {
        strings: ["a Problem Solver.", "a Software Engineer.^700", "your next Hire.^9900"],
        loop: true,
        typeSpeed: 50,
        smartBackspace: true,
        backSpeed: 30,
        onLastStringBackspaced: () => typed.strPos = 0,
    });
});