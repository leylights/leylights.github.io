export class WordleWordCheckResponse {
    constructor(config) {
        this.error = !!config.errorMessage;
        this.errorMessage = config.errorMessage;
        this.success = config.success;
        this.characterValidities = config.characterValidities;
    }
}
//# sourceMappingURL=wordle-word-check-response.js.map