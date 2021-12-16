type ChangeListenerType = 'value' | 'placeholder';
type ChangeListener = {
  type: ChangeListenerType,
  fn: (me: InputComponent) => void,
}

export class InputComponent {
  element: HTMLInputElement;
  /**
   * Note: inconsistent across pages, page reloads
   */
  id: number;

  private _changeListeners: ChangeListener[] = [];
  private _rejectionTime: number;

  constructor(data: {
    element: HTMLInputElement;
  }) {
    this.element = data.element;
    this.id = InputComponent.nextId;
  }

  get classList(): DOMTokenList {
    return this.element.classList;
  }

  get isRejected(): boolean {
    return this.classList.contains(InputComponent.REJECTION_CLASS);
  }

  get parentNode() {
    return this.element.parentNode;
  }

  get placeholder(): string {
    return this.element.placeholder;
  }

  set placeholder(s: string) {
    this.element.placeholder = s;
    this.fireChangeListeners('placeholder');
  }

  get style(): CSSStyleDeclaration {
    return this.element.style;
  }

  get value(): string {
    return this.element.value;
  }

  set value(s: string) {
    this.element.value = s;
    this.fireChangeListeners('value');
  }

  addChangeListener(this: InputComponent, type: ChangeListenerType, listener: (me: InputComponent) => any): void {
    this._changeListeners.push({
      type: type,
      fn: listener
    })
  }

  addEventListener<K extends keyof HTMLElementEventMap>(this: InputComponent, type: keyof HTMLElementEventMap, listener: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any): void {
    return this.element.addEventListener(type, listener);
  }

  fireChangeListeners(this: InputComponent, type: ChangeListenerType): void {
    const me = this;
    this._changeListeners.filter((listener: ChangeListener) => {
      return listener.type === type;
    }).forEach((listener: ChangeListener) => {
      listener.fn(me);
    })
  }

  reject(this: InputComponent) {
    const me = this;
    this.element.classList.add(InputComponent.REJECTION_CLASS);
    me._rejectionTime = Date.now();

    setTimeout(() => {
      const now = Date.now();
      if (now >= me._rejectionTime + InputComponent.REJECTION_DELAY)
        this.element.classList.remove(InputComponent.REJECTION_CLASS);
    }, InputComponent.REJECTION_DELAY);
  }

  private static REJECTION_DELAY: number = 1.5 * 1000;
  private static REJECTION_CLASS: string = 'input-reject';

  private static _nextId = 1;
  static get nextId(): number {
    return ++InputComponent._nextId;
  }
}