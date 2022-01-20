export class SpotlightHeader {
    constructor(mainShowcaseElement) {
        window.addEventListener('scroll', () => {
            mainShowcaseElement.style.top = Math.round(window.scrollY / 3) + 'px';
        });
    }
}
//# sourceMappingURL=main-showcase-scroller.js.map