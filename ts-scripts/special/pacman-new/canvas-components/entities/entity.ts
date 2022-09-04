import { Leylights } from "../../../../leylights.js";
import { MathVector } from "../../../../tools/math/vector.js";
import { PacmanEntityEnum, PacmanHelper } from "../../helper.js";
import { PacmanConstants } from "../constants.js";

export class PacmanEntity {
  x: number;
  y: number;
  w: number;
  h: number;
  colour: string;
  EntityID: number;

  name: PacmanEntityEnum;

  /**
   * @param {Number} x The top-left x coordinate
   * @param {Number} y The top-left y coordinate
   */
  constructor(x: number, y: number, w: number, h: number, colour: string, name: PacmanEntityEnum) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.colour = colour;
    this.name = name;

    this.EntityID = PacmanEntity.nextID;
    PacmanEntity.nextID++;
  }

  get width(): number {
    return this.w;
  }

  get height(): number {
    return this.h;
  }

  /**
   * Returns the straight-line distance to another entity
   * @param {Number} ent the other entity
   * @returns {Number} 
   */
  distanceTo = function (this: PacmanEntity, ent: PacmanEntity): number {
    return Math.sqrt(Math.pow(this.x - ent.x, 2) + Math.pow(this.y - ent.y, 2));
  }

  /**
   * Returns the compass direction to another entity
   * @param {PacmanEntity} otherEntity 
   */
  directionTo = function (this: PacmanEntity, otherEntity: PacmanEntity): string {
    return PacmanHelper.angleToCompassDirection(this.exactDirectionTo(otherEntity));
  }

  /**
   * Returns the angle to the given entity
   * @param {PacmanEntity} entity 
   * @returns {Number}
   */
  exactDirectionTo = function (this: PacmanEntity, otherEntity: PacmanEntity): number {
    return new MathVector(otherEntity.x - this.x, -(otherEntity.y - this.y)).direction;
  }

  isCollidingWithCircle(this: PacmanEntity, otherEntity: PacmanEntity): boolean {
    const thisCenter = getCenter(this),
      thatCenter = getCenter(otherEntity);
    return Leylights.pythagorean(thisCenter.x - thatCenter.x, thisCenter.y - thatCenter.y, null) < (((this.width + otherEntity.width) / 2) * PacmanConstants.HITBOX_MULTIPLIER);

    function getCenter(entity: PacmanEntity) {
      return {
        x: entity.x + entity.width / 2,
        y: entity.y + entity.height / 2,
      }
    }
  }

  static nextID: number = 1;
}
