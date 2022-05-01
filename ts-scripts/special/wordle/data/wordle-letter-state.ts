export class WordleLetterState {
  letter: string;
  state: {
    inWord: boolean,
    inPosition: boolean,
  } = {
    inWord: null,
    inPosition: null,
  }

  constructor(letter: string, isInWord: boolean, isInRightPlace: boolean) {
    this.letter = letter;
    this.state = {
      inWord: isInWord,
      inPosition: isInRightPlace,
    }
  }
}
