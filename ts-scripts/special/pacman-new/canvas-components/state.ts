import { PacmanStateEnum } from "../helper";
import { PacmanPowerPellet } from "./entities/power-pellet";
import { PacmanNormalPellet } from "./entities/normal-pellet";
import { PacmanFruit } from "./entities/fruit";
import { PacmanConstants } from "./constants";

export class PacmanState {
  static gameState: PacmanStateEnum = PacmanStateEnum.WAITING_FOR_PLAYER;
  static score: number = 0;

  static now: number = Date.now();

  static lifeStartTime: number = PacmanState.now;
  static levelStartTime: number = PacmanState.now;
  static levelCompletionTime: number = null;
  static playerDeathTime: number = null;
  static animationFreezeTime: number = null;

  static next1UpScore: number = 10000;

  static chaseStartTime: number = -1;
  static ghostsKilledInChase: number = 0;

  static pellets: (PacmanNormalPellet | PacmanPowerPellet)[] = [];
  static fruits: PacmanFruit[] = [];

  static hasFruitSpawned: boolean = false;

  static collectedFruitCount: number = 10;

  static get animationNow(): number {
    return PacmanState.animationFreezeTime ?? PacmanState.now;
  }

  static freezeAnimation(): void {
    PacmanState.animationFreezeTime = PacmanState.now;
  }

  static isLevelEndFlashing(): boolean {
    return PacmanState.levelCompletionTime && PacmanState.levelCompletionTime + PacmanConstants.LEVEL_END_FLASH_DELAY < PacmanState.now;
  }

  static unfreezeAnimation(): void {
    PacmanState.animationFreezeTime = null;
  }
}
