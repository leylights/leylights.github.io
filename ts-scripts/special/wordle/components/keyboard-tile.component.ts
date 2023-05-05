
import { WordleTile } from "./wordle-tile.component";

export class WordleKeyTile extends WordleTile {
  tile: HTMLElement;
  clickAction: () => void;

  constructor(letter: string, clickAction: () => void) {
    super(0, 'wordle-key');

    const me = this;
    this.element.addEventListener('click', () => {
      me.clickAction();
    });

    this.letter = letter;
    this.clickAction = clickAction;
  }

  overrideAction(keyId: string, action: () => void) {
    this.element.id = keyId;
    this.clickAction = action;
  }
}
