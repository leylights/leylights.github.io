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
import { WordleLetterState } from "./data/wordle-letter-state.js";
import { WordleWordCheckResponse } from "./data/wordle-word-check-response.js";
import { WordleView } from "./wordle.view.js";
export class WordleController {
    constructor() {
        this.view = new WordleView(this);
        this.targetWord = null; // must be in lower case
    }
    build(container) {
        this.view.rebuild(container);
    }
    get word() {
        return this.targetWord;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.targetWord = yield this.selectWord();
        });
    }
    receiveWord(word) {
        return __awaiter(this, void 0, void 0, function* () {
            const me = this;
            const isValid = yield this.validateWord(word);
            if (!isValid)
                return new WordleWordCheckResponse({ errorMessage: 'Not in word list' });
            const validities = word.toLowerCase().split('').map((letter, index) => {
                if (me.targetWord[index] === letter)
                    return new WordleLetterState(letter, true, true);
                else if (me.targetWord.split('').find((targetLetter) => letter === targetLetter))
                    return new WordleLetterState(letter, true, false);
                else
                    return new WordleLetterState(letter, false, false);
            });
            // deal with duplicates
            const targetCharCounts = this.getCharacterCounts(this.targetWord);
            // first remove anything in the right position right letter
            validities.forEach(validity => {
                if (validity.state.inPosition)
                    targetCharCounts.find(count => count.letter === validity.letter).count--;
            });
            // then deal with right letter wrong position
            validities.forEach(validity => {
                const charCount = targetCharCounts.find(count => count.letter === validity.letter);
                if (!validity.state.inPosition && validity.state.inWord) {
                    if (charCount.count > 0)
                        charCount.count--;
                    else
                        validity.state.inWord = false;
                }
            });
            return new WordleWordCheckResponse({
                success: this.targetWord === word.toLowerCase(),
                characterValidities: validities,
            });
        });
    }
    getCharacterCounts(word) {
        const counts = word.split('').map((letterA) => {
            return {
                letter: letterA,
                count: word.split('').filter(letterB => letterB === letterA).length
            };
        });
        return counts;
    }
    selectWord() {
        return __awaiter(this, void 0, void 0, function* () {
            return cws.Array.get.randomElement((yield cws.getJSONFile('/json-data/wordle/words.json')).splice(0, 2300)).toLowerCase();
        });
    }
    validateWord(word) {
        return __awaiter(this, void 0, void 0, function* () {
            const lowercaseWord = word.toLowerCase();
            const words = yield cws.getJSONFile('/json-data/wordle/words.json');
            return !!words.find((value) => { return value.toLowerCase() === lowercaseWord; });
        });
    }
}
//# sourceMappingURL=wordle.controller.js.map