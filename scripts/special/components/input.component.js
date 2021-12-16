export class InputComponent {
    constructor(data) {
        this._changeListeners = [];
        this.element = data.element;
        this.id = InputComponent.nextId;
    }
    get classList() {
        return this.element.classList;
    }
    get isRejected() {
        return this.classList.contains(InputComponent.REJECTION_CLASS);
    }
    get parentNode() {
        return this.element.parentNode;
    }
    get placeholder() {
        return this.element.placeholder;
    }
    set placeholder(s) {
        this.element.placeholder = s;
        this.fireChangeListeners('placeholder');
    }
    get style() {
        return this.element.style;
    }
    get value() {
        return this.element.value;
    }
    set value(s) {
        this.element.value = s;
        this.fireChangeListeners('value');
    }
    addChangeListener(type, listener) {
        this._changeListeners.push({
            type: type,
            fn: listener
        });
    }
    addEventListener(type, listener) {
        return this.element.addEventListener(type, listener);
    }
    fireChangeListeners(type) {
        const me = this;
        this._changeListeners.filter((listener) => {
            return listener.type === type;
        }).forEach((listener) => {
            listener.fn(me);
        });
    }
    reject() {
        const me = this;
        this.element.classList.add(InputComponent.REJECTION_CLASS);
        me._rejectionTime = Date.now();
        setTimeout(() => {
            const now = Date.now();
            if (now >= me._rejectionTime + InputComponent.REJECTION_DELAY)
                this.element.classList.remove(InputComponent.REJECTION_CLASS);
        }, InputComponent.REJECTION_DELAY);
    }
    static get nextId() {
        return ++InputComponent._nextId;
    }
}
InputComponent.REJECTION_DELAY = 1.5 * 1000;
InputComponent.REJECTION_CLASS = 'input-reject';
InputComponent._nextId = 1;
//# sourceMappingURL=input.component.js.map