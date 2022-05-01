import { BST } from "./bst.js";

type ListenerCondition = (keyboardListenerInstance: KeyboardListener, e: KeyboardEvent) => (boolean | Promise<boolean>);
type ListenerAction = (keyboardListenerInstance: KeyboardListener, e: KeyboardEvent) => void;

type KeyboardEventListener = {
  condition: ListenerCondition,
  action: ListenerAction,
  id: number,
}

export class KeyboardListener {
  letters: boolean[] = [];
  numbers: boolean[] = [];
  miscKeys: BST; // BST

  listeners: KeyboardEventListener[] = [];
  nextListenerId: number = 0;

  loggingListenerId: number = -1;

  constructor(target: EventTarget) {
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
   * Tracks a key being pressed down
   * @param {KeyboardEvent} e 
   */
  keyDown = function (this: KeyboardListener, e: KeyboardEvent): void {
    if (e.key.length == 1) {
      const letterKeycode = e.key.toLowerCase().charCodeAt(0);
      if (!isNaN(parseInt(e.key))) {
        this.numbers[parseInt(e.key)] = true;
      } else if (letterKeycode >= 97 && letterKeycode <= 122) {
        this.letters[letterKeycode - 97] = true;
      } else {
        this.miscKeys.add(e.key, true);
      }
    } else {
      this.miscKeys.add(e.key, true);
    }

    this.fireEventListeners(e);
  }

  /**
   * Tracks a key being released
   * @param {KeyboardEvent} e 
   */
  keyUp = function (this: KeyboardListener, e: KeyboardEvent): void {
    const me = this;

    if (e.key.length == 1) {
      const letterKeycode = e.key.toLowerCase().charCodeAt(0);
      if (!isNaN(parseInt(e.key))) {
        this.numbers[parseInt(e.key)] = false;
      } else if (letterKeycode >= 97 && letterKeycode <= 122) {
        this.letters[letterKeycode - 97] = false;
      } else {
        removeMiscKey(e.key);
      }
    } else {
      removeMiscKey(e.key);
    }

    this.fireEventListeners(e);

    function removeMiscKey(key: string) {
      try {
        me.miscKeys.setValue(key, false);
      } catch (e) {
        if (e instanceof Error) {
          if (e.message === me.miscKeys.getErrorMessages(key).notInTree) {
            me.miscKeys.add(key, false);
          }
        }
      }
    }
  }

  /**
   * Determines if the given key is down
   */
  isKeyDown = function (this: KeyboardListener, key: string): boolean {
    if (key.length == 1) {
      const letterKeycode = key.toLowerCase().charCodeAt(0);
      if (!isNaN(parseInt(key))) {
        return this.numbers[parseInt(key)];
      } else if (letterKeycode >= 97 && letterKeycode <= 122) {
        return this.letters[letterKeycode - 97];
      } else {
        if (this.miscKeys.containsKey(key)) {
          return this.miscKeys.getValue(key);
        } else {
          this.miscKeys.add(key, false);
          return false;
        }
      }
    } else {
      if (this.miscKeys.containsKey(key)) {
        return this.miscKeys.getValue(key);
      } else {
        this.miscKeys.add(key, false);
        return false;
      }
    }
  }

  /**
   * Determines if all keys are down
   */
  areKeysDown(this: KeyboardListener, keys: string[], method: 'or' | 'and'): boolean {
    for (const key of keys) {
      if (this.isKeyDown(key)) {
        if (method === 'or')
          return true; // short circuit evaluation
      } else if (method === 'and') // key is up
        return false; // short circuit evaluation
    }

    if (method === 'or') {
      return false;
    } else {
      return true;
    }
  }

  /**
   * NOTE: Words longer than four characters are likely to fail due to hardware constraints.
   */
  isWordDown(this: KeyboardListener, word: string): boolean {
    return this.areKeysDown(word.split(''), 'and');
  }

  /**
   * Adds an event listener, to be fired whenever a key's pressed quality is changed.
   * @returns The id of the listener, used in removeEventListener
   */
  addEventListener(this: KeyboardListener, condition: ListenerCondition, action: ListenerAction): number {
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
  addKeyboardEventListener(this: KeyboardListener, listener: KeyboardEventListener): number {
    this.listeners.push(listener);

    this.nextListenerId++;
    return listener.id; // returns the id of the listener
  }

  /**
   * Fires any event listeners whose conditions are satisfied
   */
  fireEventListeners(this: KeyboardListener, event: KeyboardEvent): void {
    if (this.listeners.length == 0)
      return;

    this.listeners.forEach(async (listener: KeyboardEventListener) => {
      if (await listener.condition(this, event)) {
        await listener.action(this, event);
      }
    });
  }

  /**
   * Starts / stops logging clicks to the console
   */
  logClicks = function (this: KeyboardListener): void {
    if (this.loggingListenerId == -1) {
      this.loggingListenerId = this.addEventListener(() => {
        return true;
      }, () => {
        console.log("Current Keys: " + this.printPressedKeys());
      });
    } else {
      const removed = this.removeEventListener(this.loggingListenerId);

      if (removed === null)
        throw "listener was already removed and should not have been.";

      this.loggingListenerId = -1;
    }
  }

  /**
   * Returns a string of all keys currently pressed
   */
  printPressedKeys = function (this: KeyboardListener): string {
    let output: string = "";
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
  }

  /**
   * Removes an event listener.
   * @returns The event listener removed, or null if none was found
   */
  removeEventListener(this: KeyboardListener, removedId: number): KeyboardEventListener {
    for (let i = 0; i < this.listeners.length; i++) {
      if (this.listeners[i].id == removedId) {
        return this.listeners.splice(i, 1)[0];
      }
    }

    return null;
  }
}

function registerKeyboardListener(listener: KeyboardListener, target: EventTarget) {
  target.addEventListener("keydown", function (e: KeyboardEvent) {
    listener.keyDown(e);
  });

  target.addEventListener("keyup", function (e: KeyboardEvent) {
    listener.keyUp(e);
  });
}
