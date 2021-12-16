var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BST } from "./bst.js";
export class KeyboardListener {
    constructor(target) {
        this.letters = [];
        this.numbers = [];
        this.listeners = [];
        this.nextListenerId = 0;
        this.loggingListenerId = -1;
        /**
         * Tracks a key being pressed down
         * @param {KeyboardEvent} e
         */
        this.keyDown = function (e) {
            if (e.key.length == 1) {
                let letterKeycode = e.key.toLowerCase().charCodeAt(0);
                if (!isNaN(parseInt(e.key))) {
                    this.numbers[parseInt(e.key)] = true;
                }
                else if (letterKeycode >= 97 && letterKeycode <= 122) {
                    this.letters[letterKeycode - 97] = true;
                }
                else {
                    this.miscKeys.add(e.key, true);
                }
            }
            else {
                this.miscKeys.add(e.key, true);
            }
            this.fireEventListeners(e);
        };
        /**
         * Tracks a key being released
         * @param {KeyboardEvent} e
         */
        this.keyUp = function (e) {
            const me = this;
            if (e.key.length == 1) {
                let letterKeycode = e.key.toLowerCase().charCodeAt(0);
                if (!isNaN(parseInt(e.key))) {
                    this.numbers[parseInt(e.key)] = false;
                }
                else if (letterKeycode >= 97 && letterKeycode <= 122) {
                    this.letters[letterKeycode - 97] = false;
                }
                else {
                    removeMiscKey(e.key);
                }
            }
            else {
                removeMiscKey(e.key);
            }
            this.fireEventListeners(e);
            function removeMiscKey(key) {
                try {
                    me.miscKeys.setValue(key, false);
                }
                catch (e) {
                    if (e instanceof Error) {
                        if (e.message === me.miscKeys.getErrorMessages(key).notInTree) {
                            me.miscKeys.add(key, false);
                        }
                    }
                }
            }
        };
        /**
         * Determines if the given key is down
         */
        this.isKeyDown = function (key) {
            if (key.length == 1) {
                let letterKeycode = key.toLowerCase().charCodeAt(0);
                if (!isNaN(parseInt(key))) {
                    return this.numbers[parseInt(key)];
                }
                else if (letterKeycode >= 97 && letterKeycode <= 122) {
                    return this.letters[letterKeycode - 97];
                }
                else {
                    if (this.miscKeys.containsKey(key)) {
                        return this.miscKeys.getValue(key);
                    }
                    else {
                        this.miscKeys.add(key, false);
                        return false;
                    }
                }
            }
            else {
                if (this.miscKeys.containsKey(key)) {
                    return this.miscKeys.getValue(key);
                }
                else {
                    this.miscKeys.add(key, false);
                    return false;
                }
            }
        };
        /**
         * Starts / stops logging clicks to the console
         */
        this.logClicks = function () {
            if (this.loggingListenerId == -1) {
                this.loggingListenerId = this.addEventListener((keyboardListenerInstance, e) => {
                    return true;
                }, (keyboardListenerInstance, e) => {
                    console.log("Current Keys: " + this.printPressedKeys());
                });
            }
            else {
                const removed = this.removeEventListener(this.loggingListenerId);
                if (removed === null)
                    throw "listener was already removed and should not have been.";
                this.loggingListenerId = -1;
            }
        };
        /**
         * Returns a string of all keys currently pressed
         */
        this.printPressedKeys = function () {
            let output = "";
            const A_CODE = "a".charCodeAt(0);
            for (let i = 0; i < this.letters.length; i++) {
                if (this.letters[i]) {
                    output += String.fromCharCode(A_CODE + i) + ",";
                }
            }
            for (let i = 0; i < this.numbers.length; i++) {
                if (this.numbers[i]) {
                    output += i + ",";
                }
            }
            output += "\n";
            output += this.miscKeys.print();
            return output;
        };
        for (let i = 0; i < 26; i++) {
            this.letters[i] = false;
        }
        for (let i = 0; i < 10; i++) {
            this.numbers[i] = false;
        }
        this.miscKeys = new BST();
        registerKeyboardListener(this, target);
    }
    /**
     * Determines if all keys are down
     */
    areKeysDown(keys, method) {
        for (const key of keys) {
            if (this.isKeyDown(key)) {
                if (method === 'or')
                    return true; // short circuit evaluation
            }
            else if (method === 'and') // key is up
                return false; // short circuit evaluation
        }
        if (method === 'or') {
            return false;
        }
        else {
            return true;
        }
    }
    /**
     * NOTE: Words longer than four characters are likely to fail due to hardware constraints.
     */
    isWordDown(word) {
        return this.areKeysDown(word.split(''), 'and');
    }
    /**
     * Adds an event listener, to be fired whenever a key's pressed quality is changed.
     * @returns The id of the listener, used in removeEventListener
     */
    addEventListener(condition, action) {
        this.listeners.push({
            condition: condition,
            action: action,
            id: this.nextListenerId,
        });
        this.nextListenerId++;
        return this.nextListenerId - 1; // returns the id of the listener
    }
    /**
     * Adds an event listener, to be fired whenever a key's pressed quality is changed.
     * @returns The id of the listener, used in removeEventListener
     */
    addKeyboardEventListener(listener) {
        this.listeners.push(listener);
        this.nextListenerId++;
        return listener.id; // returns the id of the listener
    }
    /**
     * Fires any event listeners whose conditions are satisfied
     */
    fireEventListeners(event) {
        if (this.listeners.length == 0)
            return;
        this.listeners.forEach((listener) => __awaiter(this, void 0, void 0, function* () {
            if (yield listener.condition(this, event)) {
                yield listener.action(this, event);
            }
        }));
    }
    /**
     * Removes an event listener.
     * @returns The event listener removed, or null if none was found
     */
    removeEventListener(removedId) {
        for (let i = 0; i < this.listeners.length; i++) {
            if (this.listeners[i].id == removedId) {
                return this.listeners.splice(i, 1)[0];
            }
        }
        return null;
    }
}
function registerKeyboardListener(listener, target) {
    target.addEventListener("keydown", function (e) {
        listener.keyDown(e);
    });
    target.addEventListener("keyup", function (e) {
        listener.keyUp(e);
    });
}
//# sourceMappingURL=keyboard-listener.js.map