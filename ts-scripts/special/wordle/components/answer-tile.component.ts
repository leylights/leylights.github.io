import { cws } from "../../../cws.js";

export class WordleAnswerTile {
  element: HTMLElement;

  constructor() {
    this.element = cws.createElement({
      type: 'div',
      classList: 'wordle-letter',
    });
  }

  get letter(): string {
    return this.element.innerText;
  }

  set letter(letter: string) {
    this.element.innerText = letter;
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
    if (classList) this.element.parentElement.classList.add(classList);
    this.element.parentElement.classList.add('flipped');
  }
}
