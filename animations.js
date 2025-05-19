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
        strings: ["your next Hire.^9900", "a Problem Solver.", "a Software Engineer."],
        loop: true,
        typeSpeed: 40,
        smartBackspace: true,
        backSpeed: 30,
        onLastStringBackspaced: () => typed.strPos = 0,
    });
});
