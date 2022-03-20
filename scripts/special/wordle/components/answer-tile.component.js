import { cws } from "../../../cws.js";
export class WordleAnswerTile {
    constructor() {
        this.element = cws.createElement({
            type: 'div',
            classList: 'wordle-letter',
        });
    }
    get letter() {
        return this.element.innerText;
    }
    set letter(letter) {
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
    changeState(classList) {
        if (classList)
            this.element.parentElement.classList.add(classList);
        this.element.parentElement.classList.add('flipped');
    }
}
//# sourceMappingURL=answer-tile.component.js.map