import { cws } from "../../../cws.js";
export class WordleKeyTile {
    constructor(parent, letter) {
        this.background = cws.createElement({
            type: 'div',
            classList: 'wordle-key',
            innerText: letter,
        });
        parent.appendChild(this.background);
    }
}
//# sourceMappingURL=key-tile.component.js.map