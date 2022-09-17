import { Molasses } from "../molasses.js";
import { BASE_TEMP_HIGHLIGHT_TIME } from "./general.js";

type ButtonData = {
  innerText: string,
  giveButtonClass: boolean,
  id?: string | null,
  classes?: string[] | null,
  name?: string | null,
}

enum ButtonCreationMethod {
  attach,
  replace,
  append
}

export class Button {
  element: HTMLElement;
  clickAction: (event?: PointerEvent) => void;
  internalName: string | null;

  private _errorAction?: (e?: Error) => void = null;

  private _rejectErrors: boolean = true;
  private rejectionTime: number = -1;
  private classFlashLength: number = BASE_TEMP_HIGHLIGHT_TIME;
  private _swallowErrors: boolean = false;
  private warnTime: number = -1; 
  private _isDisabled: boolean;

  /**
   * @param clickAction The action taken when the button is clicked
   * @param attach 
   * If true, attaches this object to an existing HTML element.  
   * 
   * If false, replaces the buttonElement with a new element.
   * @param buttonElement 
   */
  private constructor(clickAction: (event: PointerEvent) => void, method: ButtonCreationMethod, buttonElement: HTMLElement, data: ButtonData) {
    this.clickAction = clickAction;
    this.internalName = data.name;
    this._isDisabled = false;

    switch (method) {
      case ButtonCreationMethod.append:
        this.element = Button.generateHTML(data);

        buttonElement.appendChild(this.element);
        break;
      case ButtonCreationMethod.attach:
        this.element = buttonElement;
        break;
      case ButtonCreationMethod.replace:
        this.element = Button.generateHTML(data);

        buttonElement.replaceWith(this.element);
        break;
    }

    this.element.addEventListener('click', (e: PointerEvent) => { Button.runListener(this, e); });
  }

  get HTMLText(): string {
    return this.element.innerText;
  }

  get isDisabled() {
    return this._isDisabled;
  }

  set HTMLText(s: string) {
    this.element.innerText = s;
  }

  set rejectErrors(value: boolean) {
    this._rejectErrors = value;
  }

  set swallowErrors(value: boolean) {
    this.swallowErrors = value;
  }

  set errorAction(fn: (e?: Error) => void) {
    this._errorAction = fn;
  }

  /**
   * The function that runs when the button is clicked
   */
  clickListener(this: Button, event: PointerEvent): void {
    if (this.isDisabled)
      return;

    try {
      this.clickAction(event);
    } catch (e) {
      if (this._rejectErrors) {
        this.reject();
        if (this._errorAction)
          this._errorAction(e);
      }

      if (!this._swallowErrors)
        throw e;
    }
  }

  disable(this: Button) {
    this.setEnabled(false);
  }

  enable(this: Button) {
    this.setEnabled(true);
  }

  /**
   * Adds a class to the button, then removes it moments later
   *   Note: Client should set lastFlashTime = Date.now() after calling this
   */
  private genericClassFlash(this: Button, className: string, lastFlashTime: number): void {
    this.element.classList.add(className);
    
    setTimeout(() => {
      if (Date.now() - lastFlashTime >= this.classFlashLength)
        this.element.classList.remove(className);
    }, this.classFlashLength);
  }

  /**
   * Gives a button the appearance of being rejected
   */
  reject(this: Button): void {
    this.genericClassFlash('button-reject', this.rejectionTime);
    this.rejectionTime = Date.now();
  }

  setEnabled(this: Button, isEnabled: boolean) {
    this._isDisabled = !isEnabled;
    if (isEnabled) {
      this.element.classList.remove('button-disabled');
    } else {
      this.element.classList.add('button-disabled');
    }
  }

  /**
   * Gives a button the appearance of being rejected
   */
  warn(this: Button): void {
    this.genericClassFlash('button-warn', this.warnTime);
    this.warnTime = Date.now();
  }

  /**
   * Takes an existing element in the HTML and gives it a Button child 
   */
  static createByAppending(parentElement: HTMLElement, clickAction: (event?: PointerEvent) => void, text: string, giveButtonClass: boolean, id?: string, classes?: string | string[], name?: string): Button {
    return Button.genericCreate(ButtonCreationMethod.append, parentElement, clickAction, name, giveButtonClass, text, id, classes);
  }

  /**
   * Takes an existing button in the HTML and attaches a js Button class to it
   */
  static createByAttachment(existingButton: HTMLElement, clickAction: (event: PointerEvent) => void, name?: string): Button {
    return Button.genericCreate(ButtonCreationMethod.attach, existingButton, clickAction, name);
  }

  /**
   * Replaces the target with a Button
   */
  static createByReplacement(replacedElement: HTMLElement, clickAction: (event: PointerEvent) => void, text: string, giveButtonClass?: boolean, id?: string, classes?: string | string[], name?: string): Button {
    return Button.genericCreate(ButtonCreationMethod.replace, replacedElement, clickAction, name, giveButtonClass, text, id, classes);
  }

  private static runListener(button: Button, event: PointerEvent) {
    button.clickListener(event);
  }

  private static genericCreate(method: ButtonCreationMethod, target: HTMLElement, clickAction: (event: PointerEvent) => void, name?: string, giveButtonClass?: boolean, text?: string, id?: string, classes?: string | string[]): Button {
    if (!Array.isArray(classes))
      classes = classes ? [classes] : [];

    const data: ButtonData = {
      innerText: text || "",
      id: id || "",
      classes: classes || [],
      name: name || null,
      giveButtonClass: giveButtonClass,
    }

    if (typeof giveButtonClass === "undefined")
      data.giveButtonClass = true;

    return new Button(clickAction, method, target, data);
  }

  /**
   * @returns The HTML Element for a new button
   */
  private static generateHTML(data: ButtonData): HTMLDivElement {
    let el: HTMLDivElement = Molasses.createElement({
      type: 'div',
      id: data.id,
      classList: data.giveButtonClass
        ? ['button'].concat(data.classes)
        : (data.classes || []),
      innerHTML: data.innerText
    });

    return el;
  }
}
