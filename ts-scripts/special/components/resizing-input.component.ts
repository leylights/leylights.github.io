import { cws } from "../../cws.js";
import { InputComponent } from "./input.component.js";

/**
 * An HTMLInputElement that resizes to the width of its contents and placeholder
 */
export class ResizingInput extends InputComponent {
  considerPlaceholder: boolean;

  constructor(element: HTMLInputElement) {
    super({ element });
    const me = this;

    this.considerPlaceholder = !this.classList.contains(ResizingInput.onlyToValueClassName);
    this.addEventListener('input', (e: Event) => {
      this.resizeToContent();
    });

    this.classList.add(ResizingInput.createdClassName);

    // resizing
    this.addChangeListener('placeholder', () => { me.resizeToContent(); });
    this.addChangeListener('value', () => { me.resizeToContent(); });

    ResizingInput.resizeOnLoad(this);
  }

  resizeToContent(): void {
    const content = this.value;
    const placeholder = this.placeholder;

    if (!this.parentNode) return; // not yet in DOM

    const textComparator = document.createElement('span');
    let insertedComparator = this.parentNode.insertBefore(textComparator, null);

    let contentLen: number, placeholderLen: number;

    insertedComparator.innerText = content;
    insertedComparator.style.position = 'absolute';

    contentLen = insertedComparator.getBoundingClientRect().width;
    if (this.considerPlaceholder) {
      insertedComparator.innerText = placeholder;
    } else {
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

  static fitToContentClassName = 'fit-to-content';
  static createdClassName = 'resizing-input-created';
  static onlyToValueClassName = 'only-to-value';

  /**
   * Parses through the HTML, initializing all input elements as necessary  
   */
  static findAndCreate(searchContainer?: HTMLElement): ResizingInput[] {
    const output: ResizingInput[] = [];
    const selection = searchContainer
      ? searchContainer.querySelectorAll(`.${ResizingInput.fitToContentClassName}`)
      : document.getElementsByClassName(ResizingInput.fitToContentClassName);
      
    const results: HTMLInputElement[] = Array.from(selection) as HTMLInputElement[];
    results.forEach((el: HTMLInputElement) => {
      if (!el.classList.contains(this.createdClassName))
        output.push(new ResizingInput(el));
    });

    ResizingInput.resizeOnLoad(output);

    return output;
  }

  static getInputFromArray(array: ResizingInput[], inputEl: HTMLInputElement): ResizingInput | null {
    const result = array.filter((input: ResizingInput) => {
      return input.element.isSameNode(inputEl);
    });

    if (result.length === 0)
      return null;
    else return result[0];
  }

  static resizeOnLoad(elements: ResizingInput[] | ResizingInput) {
    if (!Array.isArray(elements))
      elements = [elements];

    if (document.readyState === 'complete') {
      resizeAll();
    } else {
      if ((document as any).fonts) {
        (document as any).fonts.ready.then(resizeAll)
      } else {
        window.addEventListener('load', (e: Event) => {
          resizeAll();
        });
      }
    }

    function resizeAll() {
      (elements as ResizingInput[]).forEach((el: ResizingInput) => {
        el.resizeToContent();
      });
    }
  }
}