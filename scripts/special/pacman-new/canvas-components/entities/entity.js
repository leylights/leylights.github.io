import { cws } from "../../../../cws.js";
import { MathVector } from "../../../../tools/math/vector.js";
import { PacmanHelper } from "../../helper.js";
import { PacmanConstants } from "../constants.js";
export class PacmanEntity {
    /**
     * @param {Number} x The top-left x coordinate
     * @param {Number} y The top-left y coordinate
     */
    constructor(x, y, w, h, colour, name) {
        /**
         * Returns the straight-line distance to another entity
         * @param {Number} ent the other entity
         * @returns {Number}
         */
        this.distanceTo = function (ent) {
            return Math.sqrt(Math.pow(this.x - ent.x, 2) + Math.pow(this.y - ent.y, 2));
        };
        /**
         * Returns the compass direction to another entity
         * @param {PacmanEntity} otherEntity
         */
        this.directionTo = function (otherEntity) {
            return PacmanHelper.angleToCompassDirection(this.exactDirectionTo(otherEntity));
        };
        /**
         * Returns the angle to the given entity
         * @param {PacmanEntity} entity
         * @returns {Number}
         */
        this.exactDirectionTo = function (otherEntity) {
            return new MathVector(otherEntity.x - this.x, -(otherEntity.y - this.y)).direction;
        };
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.colour = colour;
        this.name = name;
        this.EntityID = PacmanEntity.nextID;
        PacmanEntity.nextID++;
    }
    get width() {
        return this.w;
    }
    get height() {
        return this.h;
    }
    isCollidingWithCircle(otherEntity) {
        const thisCenter = getCenter(this), thatCenter = getCenter(otherEntity);
        return cws.pythagorean(thisCenter.x - thatCenter.x, thisCenter.y - thatCenter.y, null) < (((this.width + otherEntity.width) / 2) * PacmanConstants.HITBOX_MULTIPLIER);
        function getCenter(entity) {
            return {
                x: entity.x + entity.width / 2,
                y: entity.y + entity.height / 2,
            };
        }
    }
}
PacmanEntity.nextID = 1;
//# sourceMappingURL=entity.js.map