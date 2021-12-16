export class MouseListener {
    constructor(target) {
        const me = this;
        this.target = target;
        target.addEventListener('mousedown', () => {
            me._isClicked = true;
        });
        target.addEventListener('mouseup', () => {
            me._isClicked = false;
        });
        target.addEventListener('mouseenter', () => {
            me._isHovering = true;
        });
        target.addEventListener('mouseleave', () => {
            me._isHovering = false;
        });
    }
    get currentClick() {
        return 'l';
    }
    get isClicked() {
        return this._isClicked;
    }
    get isHovering() {
        return this._isHovering;
    }
}
//# sourceMappingURL=mouse-listener.js.map