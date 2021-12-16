import { MathVector } from "../../tools/math/vector.js";

export enum PacmanDirectionEnum {
  STILL = "s",
  UP = "u",
  RIGHT = "r",
  DOWN = "d",
  LEFT = "l"
};

export enum PacmanEntityEnum {
  PLAYER = "pacman",
  RED = "red",
  PINK = "pink",
  CYAN = "cyan",
  ORANGE = "orange",
  NORMAL_PELLET = "pellet",
  POWER_PELLET = "chasePellet",
  FRUIT = 'fruit'
}

export enum PacmanStateEnum {
  START,
  PAUSE_BEFORE_WAITING_FOR_PLAYER,
  WAITING_FOR_PLAYER,
  NORMAL,
  CHASE,
  GHOST_DEATH_PAUSE,
  PLAYER_DEATH_PAUSE,
  PLAYER_DEATH_ANIMATING,
  PLAYER_DEATH_END,
  LEVEL_END,
}

export class PacmanHelper {
  /**
   * Returns the nearest compass direction (NESW) to theta
   * 
   * @requires theta is in radians
   */

  static angleToCompassDirection(theta: number): PacmanDirectionEnum {
    theta = MathVector.mod2PI(theta);

    if (theta <= Math.PI / 4) { // 0-45*
      return PacmanDirectionEnum.UP;
    } else if (theta <= (3 * Math.PI) / 4) { // 45-135*
      return PacmanDirectionEnum.RIGHT;
    } else if (theta <= (5 * Math.PI) / 4) { // 135-215*
      return PacmanDirectionEnum.DOWN;
    } else if (theta <= (7 * Math.PI) / 4) { // 215-305*
      return PacmanDirectionEnum.LEFT;
    } else { // 305-360*
      return PacmanDirectionEnum.UP;
    }
  }

  /**
   * Determines if a and b are opposite compass direction
   * @param {Number} a 
   * @param {Number} b 
   */
  static areOppositeDirection(a: PacmanDirectionEnum, b: PacmanDirectionEnum) {
    return (a == PacmanHelper.getOppositeDirection(b));
  }

  /**
   * Returns the opposite compass direction to d
   */
  static getOppositeDirection(d: PacmanDirectionEnum): PacmanDirectionEnum {
    switch (d) {
      case PacmanDirectionEnum.UP:
        return PacmanDirectionEnum.DOWN;
      case PacmanDirectionEnum.LEFT:
        return PacmanDirectionEnum.RIGHT;
      case PacmanDirectionEnum.DOWN:
        return PacmanDirectionEnum.UP;
      case PacmanDirectionEnum.RIGHT:
        return PacmanDirectionEnum.LEFT;
    }
  }
}