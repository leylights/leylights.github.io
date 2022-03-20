import { cws } from "../../../cws.js";

export class WordleKeyTile {
  letter: string;
  tile: HTMLElement;

  constructor(parent: HTMLElement, letter: string) {
    this.letter = letter;
    this.tile = cws.createElement({
      type: 'div',
      classList: 'wordle-key',
      innerText: this.letter,
    });

    parent.appendChild(this.tile);
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
    if (classList) this.tile.classList.add(classList);
  }
}
