import { Molasses } from "../../../molasses.js";

export class WordleTile {
  private _flipDelay: number;
  private _letter: string = null;

  element: HTMLElement;

  private front: HTMLElement;
  private back: HTMLElement;

  constructor(flipDelay: number, classList: string) {
    this._flipDelay = flipDelay;
    this.front = Molasses.createElement({
      type: 'div',
      classList: 'front',
      children: [Molasses.createElement({ type: 'div', classList: 'letter-text', })],
    });
    this.back = Molasses.createElement({
      type: 'div',
      classList: 'back',
      children: [Molasses.createElement({ type: 'div', classList: 'letter-text', })],
    });

    this.element = Molasses.createElement({
      type: 'div',
      classList: 'wordle-tile ' + classList,
      children: [Molasses.createElement({
        type: 'div',
        classList: 'inner',
        children: [this.front, this.back],
      })],
    });
  }

  get letter(): string {
    return this._letter;
  }

  set letter(letter: string) {
    this._letter = letter;

    (this.front.querySelector('.letter-text') as HTMLElement).innerText = this._letter;
    (this.back.querySelector('.letter-text') as HTMLElement).innerText = this._letter;
  }

  setCorrectLetter() {
    this.changeState('correct-letter');
  }

  setSuccess() {
    this.changeState('success');
  }

  setWrongLetter() {
    this.changeState('incorrect');
  }

  private changeState(classList?: string) {
    const me: WordleTile = this;

    if (classList) this.element.classList.add(classList);
    setTimeout(() => {
      me.element.classList.add('flipped');
    }, this._flipDelay);
  }
}
