import { WordleTile } from "./wordle-tile.component.js";
export class WordleKeyTile extends WordleTile {
    constructor(letter, clickAction) {
        super(0, 'wordle-key');
        const me = this;
        this.element.addEventListener('click', () => {
            me.clickAction();
        });
        this.letter = letter;
        this.clickAction = clickAction;
    }
    overrideAction(keyId, action) {
        this.element.id = keyId;
        this.clickAction = action;
    }
}
//# sourceMappingURL=keyboard-tile.component.js.map