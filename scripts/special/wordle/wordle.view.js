import { cws } from "../../cws.js";
import { WordleKeyTile } from "./components/key-tile.component.js";
export class WordleView {
    constructor(creator) {
        this.grid = {
            container: null,
            rows: [],
        };
        this.keyboard = {
            container: null,
            rows: []
        };
        this.currentWordAttempt = '';
        function isValidLetter(key) {
            return ('a'.charCodeAt(0) <= key.toLowerCase().charCodeAt(0) &&
                'z'.charCodeAt(0) >= key.toLowerCase().charCodeAt(0));
        }
        window.addEventListener('keydown', (event) => {
            if (isValidLetter(event.key))
                this.addLetter(event.key);
            else if (event.key === 'Backspace')
                this.deleteLetter();
            else if (event.key === 'Enter' && this.currentWordAttempt.length === 5)
                this.submitWord();
        });
    }
    rebuild(container) {
        // grid
        const rows = [];
        for (let i = 0; i < 6; i++) {
            const row = [];
            for (let j = 0; j < 5; j++) {
                row.push(cws.createElement({
                    type: 'td',
                    id: 'wordle-cell'
                }));
            }
            rows.push(row);
        }
        this.grid.rows = rows;
        const table = cws.createTable({
            body: rows,
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
        const keyboardContainer = cws.createElement({
            type: 'div',
            id: 'wordle-keyboard-container'
        });
        keys.forEach(rowData => {
            const row = cws.createElement({
                type: 'div',
                classList: 'key-row',
            });
            const rowKeys = [];
            rowData.forEach(letter => {
                rowKeys.push(new WordleKeyTile(row, letter));
            });
            keyboardContainer.appendChild(row);
            this.keyboard.rows.push(rowKeys);
        });
        if (this.keyboard.container)
            this.keyboard.container.replaceWith(keyboardContainer);
        else
            container.appendChild(keyboardContainer);
        this.keyboard.container = keyboardContainer;
    }
}
//# sourceMappingURL=wordle.view.js.map