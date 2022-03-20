import { cws } from "../../../cws.js";
export class WordleKeyTile {
    constructor(parent, letter) {
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
    changeState(classList) {
        if (classList)
            this.tile.classList.add(classList);
    }
}
//# sourceMappingURL=keyboard-tile.component.js.map