import { cws } from "../../cws.js";
import { WordleView } from "./wordle.view.js";

export class WordleController {
  private view: WordleView = new WordleView(this);
  private targetWord: string = null;

  build(container: HTMLElement) {
    this.view.rebuild(container);
  }

  async init(this: WordleController) {
    this.targetWord = await this.selectWord();
  }

  receiveWord(word: string) {

  }

  private async selectWord(this: WordleController): Promise<string> {
    return cws.Array.get.randomElement((await cws.getJSONFile('/json-data/wordle/words.json')).words as string[]);
  }
}