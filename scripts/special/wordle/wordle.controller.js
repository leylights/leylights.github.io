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
import { WordleView } from "./wordle.view.js";
export class WordleController {
    constructor() {
        this.view = new WordleView(this);
        this.targetWord = null;
    }
    build(container) {
        this.view.rebuild(container);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.targetWord = yield this.selectWord();
        });
    }
    receiveWord(word) {
    }
    selectWord() {
        return __awaiter(this, void 0, void 0, function* () {
            return cws.Array.get.randomElement((yield cws.getJSONFile('/json-data/wordle/words.json')).words);
        });
    }
}
//# sourceMappingURL=wordle.controller.js.map