import { cws } from "../../cws.js";
import { WordleAnswerTile } from "./components/answer-tile.component.js";
import { WordleKeyTile } from "./components/keyboard-tile.component.js";
import { WordleLetterState } from "./data/wordle-letter-state.js";
import { WordleController } from "./wordle.controller.js";

export class WordleView {
  private alertMessageBox: HTMLElement = null;

  private grid: {
    container: HTMLElement,
    rows: WordleAnswerTile[][],
  } = {
      container: null,
      rows: [],
    };

  private keyboard: {
    container: HTMLElement,
    rows: WordleKeyTile[][]
  } = {
      container: null,
      rows: []
    }

  private readonly WORD_LENGTH = 5;

  private currentWordAttempt: string[] = [];
  private currentRowIndex = 0;

  constructor(creator: WordleController) {
    const me = this;

    window.addEventListener('keydown', (event) => {
      if (me.isValidLetter(event.key)) me.addLetter(event.key);
      else if (event.key === 'Backspace') me.deleteLetter();
      else if (event.key === 'Enter' && me.currentWordAttempt.length === 5) me.submitWord(creator);
    });
  }

  private get currentRow(): WordleAnswerTile[] {
    return this.grid.rows[this.currentRowIndex];
  }

  private get endOfCurrentWordCell(): WordleAnswerTile {
    const currentRow = this.currentRow;

    for (let i = 0; i < currentRow.length; i++) {
      if (currentRow[i].letter === '')
        return currentRow[i - 1];
    }

    return currentRow[currentRow.length - 1];
  }

  private get nextEmptyCharacterCell(): WordleAnswerTile {
    const currentRow = this.currentRow;

    for (let i = 0; i < currentRow.length; i++) {
      if (currentRow[i].letter === '')
        return currentRow[i];
    }

    return null;
  }

  private addLetter(this: WordleView, letter: string) {
    if (this.currentWordAttempt.length >= 5) return;
    this.currentWordAttempt.push(letter);

    this.nextEmptyCharacterCell.letter = letter;
  }

  private deleteLetter(this: WordleView) {
    if (this.currentWordAttempt.length <= 0) return;
    this.currentWordAttempt.pop();

    const cell = this.endOfCurrentWordCell;
    if (cell) cell.letter = '';
  }

  private getKey(key: string): WordleKeyTile {
    return this.keyboard.rows.map(row => {
      return row.filter((tile) => tile.letter.toLowerCase() === key.toLowerCase())[0];
    }).filter(rowResult => rowResult)[0];
  }

  private lose(correctWord: string) {
    alert(`You lose: the correct word was ${correctWord}.`);
  }

  private isValidLetter(this: WordleView, key: string) {
    return ('a'.charCodeAt(0) <= key.toLowerCase().charCodeAt(0) &&
      'z'.charCodeAt(0) >= key.toLowerCase().charCodeAt(0) &&
      key.length === 1);
  }

  rebuild(this: WordleView, container: HTMLElement) {
    // alert message
    this.alertMessageBox = cws.createElement({
      type: 'div',
      classList: 'wordle-message-box'
    });
    container.appendChild(this.alertMessageBox);

    // grid

    const elementRows = [];

    for (let i = 0; i < 6; i++) {
      const row: HTMLElement[] = [];
      this.grid.rows.push([]);

      for (let j = 0; j < 5; j++) {
        const tile = new WordleAnswerTile();

        this.grid.rows[i].push(tile);
        row.push(tile.element);
      }

      elementRows.push(row);
    }

    const table = cws.createTable({
      body: elementRows,
      id: 'wordle-answers-grid'
    });

    if (this.grid.container) this.grid.container.replaceWith(table);
    else container.appendChild(table);

    this.grid.container = table;

    // keyboard
    const keys: string[][] = [
      'qwertyuiop',
      'asdfghjkl',
      'zxcvbnm'
    ].map(s => s.split(''));

    const keyboardContainer = cws.createElement({
      type: 'div',
      id: 'wordle-keyboard-container'
    });

    keys.forEach(rowData => {
      const interior: HTMLElement = cws.createElement({
        type: 'div',
        classList: 'key-row-interior',
      });
      const row: HTMLElement = cws.createElement({
        type: 'div',
        classList: 'key-row',
        children: [interior],
      });

      const rowKeys: WordleKeyTile[] = [];

      rowData.forEach(letter => {
        rowKeys.push(new WordleKeyTile(interior, letter));
      });

      keyboardContainer.appendChild(row);
      this.keyboard.rows.push(rowKeys);
    });

    if (this.keyboard.container) this.keyboard.container.replaceWith(keyboardContainer);
    else container.appendChild(keyboardContainer);

    this.keyboard.container = keyboardContainer;
  }

  rejectWithMessage(this: WordleView, message: string) {
    this.alertMessageBox.innerText = message;

    this.alertMessageBox.classList.add('visible');
    setTimeout(() => {
      this.alertMessageBox.classList.remove('visible');
    }, 3000);
  }

  private async submitWord(this: WordleView, receiver: WordleController) {
    const me = this,
      response = await receiver.receiveWord(this.currentWordAttempt.join(''));

    if (response.error) this.rejectWithMessage(response.errorMessage);
    else {
      response.characterValidities.forEach((character: WordleLetterState, index: number) => {
        if (character.state.inPosition) {
          this.getKey(character.letter).setSuccess();
          this.currentRow[index].setSuccess();
        } else if (character.state.inWord) {
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

      if (response.success) me.win(receiver.word);
      else if (me.currentRowIndex >= me.grid.rows.length) me.lose(receiver.word);
    }
  }

  private win(word: string) {
    alert(`You win!`);
  }
}
