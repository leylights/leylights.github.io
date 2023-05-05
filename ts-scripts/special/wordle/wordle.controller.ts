import { Molasses } from "../../molasses";
import { WordleLetterState } from "./data/wordle-letter-state";
import { WordleWordCheckResponse } from "./data/wordle-word-check-response";
import { WordleView } from "./wordle.view";

export class WordleController {
  private view: WordleView = new WordleView(this);
  private targetWord: string = null; // must be in lower case

  build(container: HTMLElement) {
    this.view.rebuild(container);
  }

  get word(): string {
    return this.targetWord;
  }

  async init(this: WordleController) {
    this.targetWord = await this.selectWord();
  }

  async receiveWord(word: string) {
    const me = this;
    const isValid = await this.validateWord(word);

    if (!isValid) return new WordleWordCheckResponse({ errorMessage: 'Not in word list' });

    const validities: WordleLetterState[] = word.toLowerCase().split('').map((letter: string, index: number) => {
      if (me.targetWord[index] === letter) return new WordleLetterState(letter, true, true);
      else if (me.targetWord.split('').find((targetLetter) => letter === targetLetter)) return new WordleLetterState(letter, true, false);
      else return new WordleLetterState(letter, false, false);
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
  }

  private getCharacterCounts(this: WordleController, word: string): { letter: string, count: number }[] {
    const counts = word.split('').map((letterA: string) => {
      return {
        letter: letterA,
        count: word.split('').filter(letterB => letterB === letterA).length
      }
    });

    return counts;
  }

  private async selectWord(this: WordleController): Promise<string> {
    const upperSelectionLimit: number = 2300;
    const today: number = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60 * 1000) / (1000 * 60 * 60 * 24));
    return ((await Molasses.getJSONFile('/json-data/wordle/words.json')).splice(0, 2300) as string[])[today % upperSelectionLimit].toLowerCase();
  }

  private async validateWord(this: WordleController, word: string): Promise<boolean> {
    const lowercaseWord = word.toLowerCase();
    const words = await Molasses.getJSONFile('/json-data/wordle/words.json') as string[];

    return !!words.find((value) => { return value.toLowerCase() === lowercaseWord; });
  }
}
