import { WordleLetterState } from "./wordle-letter-state.js";

interface WordleWordCheckResponseConfig {
  errorMessage?: string,
  success?: boolean,
  characterValidities?: WordleLetterState[],
}

export class WordleWordCheckResponse {
  error: boolean;
  errorMessage: string;

  success: boolean;
  characterValidities: WordleLetterState[];

  constructor(config: WordleWordCheckResponseConfig) {
    this.error = !!config.errorMessage;
    this.errorMessage = config.errorMessage;
    this.success = config.success;
    this.characterValidities = config.characterValidities;
  }
}
