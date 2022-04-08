import { WordleTile } from "./wordle-tile.component.js";

export class WordleAnswerTile extends WordleTile {
  index: number;

  constructor(index: number) {
    super(index * 300, 'wordle-answer');
    this.index = index;
  }
}
