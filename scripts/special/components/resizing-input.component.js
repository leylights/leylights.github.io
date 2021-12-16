import { cws } from "../../cws.js";
import { InputComponent } from "./input.component.js";
/**
 * An HTMLInputElement that resizes to the width of its contents and placeholder
 */
export class ResizingInput extends InputComponent {
    constructor(element) {
        super({ element });
        const me = this;
        this.considerPlaceholder = !this.classList.contains(ResizingInput.onlyToValueClassName);
        this.addEventListener('input', (e) => {
            this.resizeToContent();
        });
        this.classList.add(ResizingInput.createdClassName);
        // resizing
        this.addChangeListener('placeholder', () => { me.resizeToContent(); });
        this.addChangeListener('value', () => { me.resizeToContent(); });
        ResizingInput.resizeOnLoad(this);
    }
    resizeToContent() {
        const content = this.value;
        const placeholder = this.placeholder;
        if (!this.parentNode)
            return; // not yet in DOM
        const textComparator = document.createElement('span');
        let insertedComparator = this.parentNode.insertBefore(textComparator, null);
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
        this.style.width = finalLen + 'px';
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
}
ResizingInput.fitToContentClassName = 'fit-to-content';
ResizingInput.createdClassName = 'resizing-input-created';
ResizingInput.onlyToValueClassName = 'only-to-value';
//# sourceMappingURL=resizing-input.component.js.map