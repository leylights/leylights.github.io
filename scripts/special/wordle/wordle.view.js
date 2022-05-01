var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cws } from "../../cws.js";
import { WordleAnswerTile } from "./components/answer-tile.component.js";
import { WordleKeyTile } from "./components/keyboard-tile.component.js";
export class WordleView {
    constructor(creator) {
        this.alertMessageBox = null;
        this.grid = {
            container: null,
            rows: [],
        };
        this.keyboard = {
            container: null,
            rows: []
        };
        this.submitFn = null;
        this.WORD_LENGTH = 5;
        this.currentWordAttempt = [];
        this.currentRowIndex = 0;
        this._isGameRunning = true;
        const me = this;
        this.submitFn = () => me.submitWord(creator);
        window.addEventListener('keydown', (event) => {
            if (!me.isGameRunning)
                return;
            if (me.isValidLetter(event.key))
                me.addLetter(event.key);
            else if (event.key === 'Backspace')
                me.deleteLetter();
            else if (event.key === 'Enter' && me.currentWordAttempt.length === me.WORD_LENGTH)
                me.submitFn();
        });
    }
    get isGameRunning() {
        return this._isGameRunning;
    }
    get currentRow() {
        return this.grid.rows[this.currentRowIndex];
    }
    get endOfCurrentWordCell() {
        const currentRow = this.currentRow;
        for (let i = 0; i < currentRow.length; i++) {
            if (!currentRow[i].letter)
                return currentRow[i - 1];
        }
        return currentRow[currentRow.length - 1];
    }
    get nextEmptyCharacterCell() {
        const currentRow = this.currentRow;
        for (let i = 0; i < currentRow.length; i++) {
            if (!currentRow[i].letter)
                return currentRow[i];
        }
        return null;
    }
    addLetter(letter) {
        if (this.currentWordAttempt.length >= 5)
            return;
        this.currentWordAttempt.push(letter);
        this.nextEmptyCharacterCell.letter = letter;
    }
    deleteLetter() {
        if (this.currentWordAttempt.length <= 0)
            return;
        this.currentWordAttempt.pop();
        const cell = this.endOfCurrentWordCell;
        if (cell)
            cell.letter = '';
    }
    getKey(key) {
        return this.keyboard.rows.map(row => {
            return row.filter((tile) => tile.letter.toLowerCase() === key.toLowerCase())[0];
        }).filter(rowResult => rowResult)[0];
    }
    lose(correctWord) {
        this.alertMessageBox.innerText = correctWord.toUpperCase();
        this.alertMessageBox.classList.add('visible');
        this._isGameRunning = false;
    }
    isValidLetter(key) {
        return ('a'.charCodeAt(0) <= key.toLowerCase().charCodeAt(0) &&
            'z'.charCodeAt(0) >= key.toLowerCase().charCodeAt(0) &&
            key.length === 1);
    }
    rebuild(container) {
        const me = this;
        // alert message
        this.alertMessageBox = cws.createElement({
            type: 'div',
            classList: 'wordle-message-box'
        });
        container.appendChild(this.alertMessageBox);
        // grid
        const elementRows = [];
        for (let i = 0; i < 6; i++) {
            const row = [];
            this.grid.rows.push([]);
            for (let j = 0; j < 5; j++) {
                const tile = new WordleAnswerTile(j);
                this.grid.rows[i].push(tile);
                row.push(tile.element);
            }
            elementRows.push(row);
        }
        const table = cws.createTable({
            body: elementRows,
            id: 'wordle-answers-grid'
        });
        if (this.grid.container)
            this.grid.container.replaceWith(table);
        else
            container.appendChild(table);
        this.grid.container = table;
        // keyboard
        const keys = [
            'qwertyuiop',
            'asdfghjkl',
            'zxcvbnm'
        ].map(s => s.split(''));
        keys[2].unshift('←');
        keys[2].push('ENTER');
        const keyboardContainer = cws.createElement({
            type: 'div',
            id: 'wordle-keyboard-container'
        });
        keys.forEach(rowData => {
            const keyElements = [];
            const rowKeys = [];
            rowData.forEach(letter => {
                const tile = new WordleKeyTile(letter, () => {
                    if (!me.isGameRunning)
                        return;
                    me.addLetter(letter);
                });
                rowKeys.push(tile);
                keyElements.push(tile.element);
            });
            const row = cws.createTable({
                body: [keyElements],
                classList: ['key-row']
            });
            keyboardContainer.appendChild(row);
            this.keyboard.rows.push(rowKeys);
        });
        this.keyboard.rows[2][0].overrideAction('wordle-delete-key', () => {
            me.deleteLetter();
        });
        this.keyboard.rows[2][this.keyboard.rows[2].length - 1].overrideAction('wordle-enter-key', () => {
            me.submitFn();
        });
        if (this.keyboard.container)
            this.keyboard.container.replaceWith(keyboardContainer);
        else
            container.appendChild(keyboardContainer);
        this.keyboard.container = keyboardContainer;
    }
    rejectWithMessage(message) {
        this.alertMessageBox.innerText = message;
        this.alertMessageBox.classList.add('visible');
        setTimeout(() => {
            this.alertMessageBox.classList.remove('visible');
        }, 3000);
    }
    submitWord(receiver) {
        return __awaiter(this, void 0, void 0, function* () {
            const me = this, response = yield receiver.receiveWord(this.currentWordAttempt.join(''));
            if (response.error)
                this.rejectWithMessage(response.errorMessage);
            else {
                response.characterValidities.forEach((character, index) => {
                    if (character.state.inPosition) {
                        this.getKey(character.letter).setSuccess();
                        this.currentRow[index].setSuccess();
                    }
                    else if (character.state.inWord) {
                        this.getKey(character.letter).setCorrectLetter();
                        this.currentRow[index].setCorrectLetter();
                    }
                    else {
                        this.getKey(character.letter).setWrongLetter();
                        this.currentRow[index].setWrongLetter();
                    }
                });
                this.currentWordAttempt = [];
                me.currentRowIndex++;
                if (response.success)
                    me.win();
                else if (me.currentRowIndex >= me.grid.rows.length)
                    me.lose(receiver.word);
            }
        });
    }
    win() {
        this._isGameRunning = false;
    }
}
//# sourceMappingURL=wordle.view.js.map