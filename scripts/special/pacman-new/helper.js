import { MathVector } from "../../tools/math/vector.js";
export var PacmanDirectionEnum;
(function (PacmanDirectionEnum) {
    PacmanDirectionEnum["STILL"] = "s";
    PacmanDirectionEnum["UP"] = "u";
    PacmanDirectionEnum["RIGHT"] = "r";
    PacmanDirectionEnum["DOWN"] = "d";
    PacmanDirectionEnum["LEFT"] = "l";
})(PacmanDirectionEnum || (PacmanDirectionEnum = {}));
;
export var PacmanEntityEnum;
(function (PacmanEntityEnum) {
    PacmanEntityEnum["PLAYER"] = "pacman";
    PacmanEntityEnum["RED"] = "red";
    PacmanEntityEnum["PINK"] = "pink";
    PacmanEntityEnum["CYAN"] = "cyan";
    PacmanEntityEnum["ORANGE"] = "orange";
    PacmanEntityEnum["NORMAL_PELLET"] = "pellet";
    PacmanEntityEnum["POWER_PELLET"] = "chasePellet";
    PacmanEntityEnum["FRUIT"] = "fruit";
})(PacmanEntityEnum || (PacmanEntityEnum = {}));
export var PacmanStateEnum;
(function (PacmanStateEnum) {
    PacmanStateEnum[PacmanStateEnum["START"] = 0] = "START";
    PacmanStateEnum[PacmanStateEnum["PAUSE_BEFORE_WAITING_FOR_PLAYER"] = 1] = "PAUSE_BEFORE_WAITING_FOR_PLAYER";
    PacmanStateEnum[PacmanStateEnum["WAITING_FOR_PLAYER"] = 2] = "WAITING_FOR_PLAYER";
    PacmanStateEnum[PacmanStateEnum["NORMAL"] = 3] = "NORMAL";
    PacmanStateEnum[PacmanStateEnum["CHASE"] = 4] = "CHASE";
    PacmanStateEnum[PacmanStateEnum["GHOST_DEATH_PAUSE"] = 5] = "GHOST_DEATH_PAUSE";
    PacmanStateEnum[PacmanStateEnum["PLAYER_DEATH_PAUSE"] = 6] = "PLAYER_DEATH_PAUSE";
    PacmanStateEnum[PacmanStateEnum["PLAYER_DEATH_ANIMATING"] = 7] = "PLAYER_DEATH_ANIMATING";
    PacmanStateEnum[PacmanStateEnum["PLAYER_DEATH_END"] = 8] = "PLAYER_DEATH_END";
    PacmanStateEnum[PacmanStateEnum["LEVEL_END"] = 9] = "LEVEL_END";
})(PacmanStateEnum || (PacmanStateEnum = {}));
export class PacmanHelper {
    /**
     * Returns the nearest compass direction (NESW) to theta
     *
     * @requires theta is in radians
     */
    static angleToCompassDirection(theta) {
        theta = MathVector.mod2PI(theta);
        if (theta <= Math.PI / 4) { // 0-45*
            return PacmanDirectionEnum.UP;
        }
        else if (theta <= (3 * Math.PI) / 4) { // 45-135*
            return PacmanDirectionEnum.RIGHT;
        }
        else if (theta <= (5 * Math.PI) / 4) { // 135-215*
            return PacmanDirectionEnum.DOWN;
        }
        else if (theta <= (7 * Math.PI) / 4) { // 215-305*
            return PacmanDirectionEnum.LEFT;
        }
        else { // 305-360*
            return PacmanDirectionEnum.UP;
        }
    }
    /**
     * Determines if a and b are opposite compass direction
     * @param {Number} a
     * @param {Number} b
     */
    static areOppositeDirection(a, b) {
        return (a == PacmanHelper.getOppositeDirection(b));
    }
    /**
     * Returns the opposite compass direction to d
     */
    static getOppositeDirection(d) {
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
//# sourceMappingURL=helper.js.map