import { WiresConstants } from "./constants.js";
export var WiresWinStateEnum;
(function (WiresWinStateEnum) {
    WiresWinStateEnum[WiresWinStateEnum["win"] = 1] = "win";
    WiresWinStateEnum[WiresWinStateEnum["ongoing"] = -1] = "ongoing";
    WiresWinStateEnum[WiresWinStateEnum["loss"] = 0] = "loss";
})(WiresWinStateEnum || (WiresWinStateEnum = {}));
export class WiresState {
    static get livesCounterOuterWidth() {
        return WiresState.isCompetitive ? WiresConstants.LIVES_COUNTER.INNER_WIDTH + WiresConstants.BORDER.WIDTH * 2 : 0;
    }
    static get elapsedWins() {
        if (WiresState.isCompetitive)
            return WiresState.elapsedCompetitiveWins;
        else
            return WiresState.elapsedRelaxedWins;
    }
    static set elapsedWins(n) {
        if (WiresState.isCompetitive)
            WiresState.elapsedCompetitiveWins = n;
        else
            WiresState.elapsedRelaxedWins = n;
    }
    static get elapsedRelaxedWins() {
        const result = localStorage.getItem(WiresState.winsKey);
        if (!result)
            return 0;
        else
            return parseInt(result);
    }
    static set elapsedRelaxedWins(n) {
        localStorage.setItem(WiresState.winsKey, n + '');
    }
    static get elapsedCompetitiveWins() {
        const result = localStorage.getItem(WiresState.competitiveWinsKey);
        if (!result)
            return 0;
        else
            return parseInt(result);
    }
    static set elapsedCompetitiveWins(n) {
        localStorage.setItem(WiresState.competitiveWinsKey, n + '');
    }
    static get elapsedCompetitiveWinsHighScore() {
        const result = localStorage.getItem(WiresState.competitiveHSKey);
        if (!result)
            return 0;
        else
            return parseInt(result);
    }
    static set elapsedCompetitiveWinsHighScore(n) {
        localStorage.setItem(WiresState.competitiveHSKey, n + '');
    }
}
WiresState.now = Date.now();
WiresState.minW = 3;
WiresState.minH = 3;
WiresState.maxW = 0;
WiresState.maxH = 0;
WiresState.tileWidth = 64;
WiresState.isCompetitive = false;
WiresState.score = 0;
WiresState.remainingAttempts = 3;
WiresState.lastSolutionTime = 0;
WiresState.stopTime = -1;
WiresState.deadline = -1;
WiresState.isWon = WiresWinStateEnum.ongoing;
WiresState.showRed = false;
WiresState.showAns = false;
WiresState.winsKey = 'wiresScore';
WiresState.competitiveWinsKey = 'wiresCompScore';
WiresState.competitiveHSKey = 'wiresCompHS';
//# sourceMappingURL=state.js.map