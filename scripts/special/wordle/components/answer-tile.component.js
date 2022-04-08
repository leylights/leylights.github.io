import { WordleTile } from "./wordle-tile.component.js";
export class WordleAnswerTile extends WordleTile {
    constructor(index) {
        super(index * 300, 'wordle-answer');
        this.index = index;
    }
}
//# sourceMappingURL=answer-tile.component.js.map