import { cws } from "../../../cws.js";

export class WordleKeyTile {
  background: HTMLElement;

  constructor(parent: HTMLElement, letter: string) {
    this.background = cws.createElement({
      type: 'div',
      classList: 'key-background',
      innerText: letter,
    });

    parent.appendChild(this.background);
  }
}