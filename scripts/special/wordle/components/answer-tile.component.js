import { cws } from "../../../cws.js";
export class WordleAnswerTile {
    constructor(parent) {
        this.background = cws.createElement({
            type: 'div',
            classList: 'tile-background',
        });
        parent.appendChild(this.background);
    }
}
//# sourceMappingURL=answer-tile.component.js.map