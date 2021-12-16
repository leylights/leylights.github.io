import { cws } from "../cws.js";
/**
 * An HTMLInputElement that resizes to the width of its contents and placeholder
 */
export class ResizingInput {
    constructor(element) {
        this.element = element;
        this.id = ResizingInput.nextId;
        this.considerPlaceholder = !this.element.classList.contains(ResizingInput.onlyToValueClassName);
        this.element.addEventListener('input', (e) => {
            this.resizeToContent();
        });
        this.element.classList.add(ResizingInput.createdClassName);
        ResizingInput.resizeOnLoad(this);
    }
    get placeholder() {
        return this.element.placeholder;
    }
    get value() {
        return this.element.value;
    }
    set placeholder(placeholder) {
        this.element.placeholder = placeholder;
        this.resizeToContent();
    }
    set value(value) {
        this.element.value = value;
        this.resizeToContent();
    }
    resizeToContent() {
        const content = this.element.value;
        const placeholder = this.element.placeholder;
        const textComparator = document.createElement('span');
        let insertedComparator = this.element.parentNode.insertBefore(textComparator, null);
        let contentLen, placeholderLen;
        insertedComparator.innerText = content;
        insertedComparator.style.position = 'absolute';
        contentLen = insertedComparator.getBoundingClientRect().width;
        if (this.considerPlaceholder) {
            insertedComparator.innerText = placeholder;
        }
        else {
            insertedComparator.innerText = 'o'; // makes sure the element still has a width
        }
        placeholderLen = insertedComparator.getBoundingClientRect().width;
        insertedComparator.remove();
        textComparator.remove();
        const finalLen = Math.max(contentLen, placeholderLen)
            + parseFloat(window.getComputedStyle(this.element).paddingLeft)
            + parseFloat(window.getComputedStyle(this.element).paddingRight);
        this.element.style.width = finalLen + 'px';
    }
    /**
     * Parses through the HTML, initializing all input elements as necessary
     */
    static findAndCreate() {
        const output = [];
        const results = cws.Array.from.HTMLCollection(document.getElementsByClassName(ResizingInput.fitToContentClassName));
        results.forEach((el) => {
            if (!el.classList.contains(this.createdClassName))
                output.push(new ResizingInput(el));
        });
        ResizingInput.resizeOnLoad(output);
        return output;
    }
    static getInputFromArray(array, inputEl) {
        const result = array.filter((input) => {
            return input.element.isSameNode(inputEl);
        });
        if (result.length === 0)
            return null;
        else
            return result[0];
    }
    static resizeOnLoad(elements) {
        if (!Array.isArray(elements))
            elements = [elements];
        if (document.readyState === 'complete') {
            resizeAll();
        }
        else {
            if (document.fonts) {
                document.fonts.ready.then(resizeAll);
            }
            else {
                window.addEventListener('load', (e) => {
                    resizeAll();
                });
            }
        }
        function resizeAll() {
            elements.forEach((el) => {
                el.resizeToContent();
            });
        }
    }
    static get nextId() {
        return ++ResizingInput._nextId;
    }
}
ResizingInput.fitToContentClassName = 'fit-to-content';
ResizingInput.createdClassName = 'resizing-input-created';
ResizingInput.onlyToValueClassName = 'only-to-value';
ResizingInput._nextId = 1;
//# sourceMappingURL=resizing-input.js.map