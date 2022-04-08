import { cws } from "../../../cws.js";
export class WordleTile {
    constructor(flipDelay, classList) {
        this._letter = null;
        this._flipDelay = flipDelay;
        this.front = cws.createElement({
            type: 'div',
            classList: 'front',
            children: [cws.createElement({ type: 'div', classList: 'letter-text', })],
        });
        this.back = cws.createElement({
            type: 'div',
            classList: 'back',
            children: [cws.createElement({ type: 'div', classList: 'letter-text', })],
        });
        this.element = cws.createElement({
            type: 'div',
            classList: 'wordle-tile ' + classList,
            children: [cws.createElement({
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