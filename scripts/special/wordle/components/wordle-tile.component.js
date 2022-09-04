import { Leylights } from "../../../leylights.js";
export class WordleTile {
    constructor(flipDelay, classList) {
        this._letter = null;
        this._flipDelay = flipDelay;
        this.front = Leylights.createElement({
            type: 'div',
            classList: 'front',
            children: [Leylights.createElement({ type: 'div', classList: 'letter-text', })],
        });
        this.back = Leylights.createElement({
            type: 'div',
            classList: 'back',
            children: [Leylights.createElement({ type: 'div', classList: 'letter-text', })],
        });
        this.element = Leylights.createElement({
            type: 'div',
            classList: 'wordle-tile ' + classList,
            children: [Leylights.createElement({
                    type: 'div',
                    classList: 'inner',
                    children: [this.front, this.back],
                })],
        });
    }
    get letter() {
        return this._letter;
    }
    set letter(letter) {
        this._letter = letter;
        this.front.querySelector('.letter-text').innerText = this._letter;
        this.back.querySelector('.letter-text').innerText = this._letter;
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
        const me = this;
        if (classList)
            this.element.classList.add(classList);
        setTimeout(() => {
            me.element.classList.add('flipped');
        }, this._flipDelay);
    }
}
//# sourceMappingURL=wordle-tile.component.js.map