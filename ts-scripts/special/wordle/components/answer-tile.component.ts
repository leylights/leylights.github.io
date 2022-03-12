import { cws } from "../../../cws.js";

export class WordleAnswerTile {
  background: HTMLElement;

  constructor(parent: HTMLElement) {
    this.background = cws.createElement({
      type: 'div',
      classList: 'tile-background',
    });

    parent.appendChild(this.background);
  }
}