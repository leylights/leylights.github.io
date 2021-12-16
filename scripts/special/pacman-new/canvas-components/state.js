import { PacmanStateEnum } from "../helper.js";
import { PacmanConstants } from "./constants.js";
export class PacmanState {
    static get animationNow() {
        var _a;
        return (_a = PacmanState.animationFreezeTime) !== null && _a !== void 0 ? _a : PacmanState.now;
    }
    static freezeAnimation() {
        PacmanState.animationFreezeTime = PacmanState.now;
    }
    static isLevelEndFlashing() {
        return PacmanState.levelCompletionTime && PacmanState.levelCompletionTime + PacmanConstants.LEVEL_END_FLASH_DELAY < PacmanState.now;
    }
    static unfreezeAnimation() {
        PacmanState.animationFreezeTime = null;
    }
}
PacmanState.gameState = PacmanStateEnum.WAITING_FOR_PLAYER;
PacmanState.score = 0;
PacmanState.now = Date.now();
PacmanState.lifeStartTime = PacmanState.now;
PacmanState.levelStartTime = PacmanState.now;
PacmanState.levelCompletionTime = null;
PacmanState.playerDeathTime = null;
PacmanState.animationFreezeTime = null;
PacmanState.next1UpScore = 10000;
PacmanState.chaseStartTime = -1;
PacmanState.ghostsKilledInChase = 0;
PacmanState.pellets = [];
PacmanState.fruits = [];
PacmanState.hasFruitSpawned = false;
PacmanState.collectedFruitCount = 10;
//# sourceMappingURL=state.js.map