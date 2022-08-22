import { cws } from "../cws.js";
import { BASE_TEMP_HIGHLIGHT_TIME } from "./general.js";
var ButtonCreationMethod;
(function (ButtonCreationMethod) {
    ButtonCreationMethod[ButtonCreationMethod["attach"] = 0] = "attach";
    ButtonCreationMethod[ButtonCreationMethod["replace"] = 1] = "replace";
    ButtonCreationMethod[ButtonCreationMethod["append"] = 2] = "append";
})(ButtonCreationMethod || (ButtonCreationMethod = {}));
export class Button {
    /**
     * @param clickAction The action taken when the button is clicked
     * @param attach
     * If true, attaches this object to an existing HTML element.
     *
     * If false, replaces the buttonElement with a new element.
     * @param buttonElement
     */
    constructor(clickAction, method, buttonElement, data) {
        this._errorAction = null;
        this._rejectErrors = true;
        this.rejectionTime = -1;
        this.classFlashLength = BASE_TEMP_HIGHLIGHT_TIME;
        this._swallowErrors = false;
        this.warnTime = -1;
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
        this.element.addEventListener('click', (e) => { Button.runListener(this, e); });
    }
    get HTMLText() {
        return this.element.innerText;
    }
    get isDisabled() {
        return this._isDisabled;
    }
    set HTMLText(s) {
        this.element.innerText = s;
    }
    set rejectErrors(value) {
        this._rejectErrors = value;
    }
    set swallowErrors(value) {
        this.swallowErrors = value;
    }
    set errorAction(fn) {
        this._errorAction = fn;
    }
    /**
     * The function that runs when the button is clicked
     */
    clickListener(event) {
        if (this.isDisabled)
            return;
        try {
            this.clickAction(event);
        }
        catch (e) {
            if (this._rejectErrors) {
                this.reject();
                if (this._errorAction)
                    this._errorAction(e);
            }
            if (!this._swallowErrors)
                throw e;
        }
    }
    disable() {
        this.setEnabled(false);
    }
    enable() {
        this.setEnabled(true);
    }
    /**
     * Adds a class to the button, then removes it moments later
     *   Note: Client should set lastFlashTime = Date.now() after calling this
     */
    genericClassFlash(className, lastFlashTime) {
        this.element.classList.add(className);
        setTimeout(() => {
            if (Date.now() - lastFlashTime >= this.classFlashLength)
                this.element.classList.remove(className);
        }, this.classFlashLength);
    }
    /**
     * Gives a button the appearance of being rejected
     */
    reject() {
        this.genericClassFlash('button-reject', this.rejectionTime);
        this.rejectionTime = Date.now();
    }
    setEnabled(isEnabled) {
        this._isDisabled = !isEnabled;
        if (isEnabled) {
            this.element.classList.remove('button-disabled');
        }
        else {
            this.element.classList.add('button-disabled');
        }
    }
    /**
     * Gives a button the appearance of being rejected
     */
    warn() {
        this.genericClassFlash('button-warn', this.warnTime);
        this.warnTime = Date.now();
    }
    /**
     * Takes an existing element in the HTML and gives it a Button child
     */
    static createByAppending(parentElement, clickAction, text, giveButtonClass, id, classes, name) {
        return Button.genericCreate(ButtonCreationMethod.append, parentElement, clickAction, name, giveButtonClass, text, id, classes);
    }
    /**
     * Takes an existing button in the HTML and attaches a js Button class to it
     */
    static createByAttachment(existingButton, clickAction, name) {
        return Button.genericCreate(ButtonCreationMethod.attach, existingButton, clickAction, name);
    }
    /**
     * Replaces the target with a Button
     */
    static createByReplacement(replacedElement, clickAction, text, giveButtonClass, id, classes, name) {
        return Button.genericCreate(ButtonCreationMethod.replace, replacedElement, clickAction, name, giveButtonClass, text, id, classes);
    }
    static runListener(button, event) {
        button.clickListener(event);
    }
    static genericCreate(method, target, clickAction, name, giveButtonClass, text, id, classes) {
        if (!Array.isArray(classes))
            classes = classes ? [classes] : [];
        const data = {
            innerText: text || "",
            id: id || "",
            classes: classes || [],
            name: name || null,
            giveButtonClass: giveButtonClass,
        };
        if (typeof giveButtonClass === "undefined")
            data.giveButtonClass = true;
        return new Button(clickAction, method, target, data);
    }
    /**
     * @returns The HTML Element for a new button
     */
    static generateHTML(data) {
        let el = cws.createElement({
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
//# sourceMappingURL=button.component.js.map