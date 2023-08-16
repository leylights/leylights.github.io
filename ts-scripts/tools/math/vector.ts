/**
 * A class to handle two-dimensional Euclidean vectors
 * @author River Stanley
 */

export class MathVector {
  x: number;
  y: number;

  /**
   *
   * @param {Number} ix
   * @param {Number} iy NOTE: MathVector coordinate system is based on the bottom-left being (0,0), where y values increase as one moves upwards.
   */
  constructor(ix: number, iy: number) {
    this.x = ix;
    this.y = iy;
  }

  /**
   * Adds another vector to this vector.  Changes the value of this vector.
   */
  add(addend: MathVector): MathVector {
    this.x += addend.x;
    this.y += addend.y;
    return this;
  }

  /**
   * Clones this vector
   */
  clone() {
    return new MathVector(this.x, this.y);
  }

  /**
   * Multiplies this vector by some scalar multiple n
   */
  scalarMultiply(n: number): MathVector {
    this.x *= n;
    this.y *= n;
    return this;
  }

  /**
   * Changes the coordinates of the vector to align with the new magnitude
   * @param {Number} newMag the new magnitude
   */

  setMagnitude(newMag: number): MathVector {
    const direction: number = this.direction;
    this.x = newMag * Math.sin(direction);
    this.y = newMag * Math.cos(direction);
    return this;
  }

  get magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Returns the direction of the vector, as rotated CW from North, in Radians.
   * For a zero vector, returns 0.
   */

  get direction(): number {
    if (this.x > 0) {
      if (this.y > 0) {
        return Math.atan(Math.abs(this.x / this.y));
      } else if (this.y < 0) {
        return Math.PI / 2 + Math.atan(Math.abs(this.y / this.x));
      } else {
        return Math.PI / 2;
      }
    } else if (this.x < 0) {
      if (this.y > 0) {
        return (3 * Math.PI) / 2 + Math.atan(Math.abs(this.y / this.x));
      } else if (this.y < 0) {
        return Math.PI + Math.atan(Math.abs(this.x / this.y));
      } else {
        return (3 * Math.PI) / 2;
      }
    } else {
      if (this.y < 0) {
        return Math.PI;
      } else {
        return 0;
      }
    }
  }

  /**
   * Adds two vectors
   */
  static add(a: MathVector, b: MathVector): MathVector {
    return new MathVector(a.x + b.x, a.y + b.y);
  }

  /**
   * Returns the mathematical result of (direction mod 2pi)
   * @param {Number} direction
   */
  static mod2PI = function (direction: number): number {
    if (direction < 0) {
      direction = (direction % (2 * Math.PI)) + 2 * Math.PI;
    } else if (direction >= 2 * Math.PI) {
      direction = direction % (2 * Math.PI);
    }

    return direction;
  };

  /**
   * Returns the mathematical result of (direction mod pi)
   * @param {Number} direction
   */
  static modPI = function (direction: number): number {
    if (direction < 0) {
      direction = (direction % Math.PI) + Math.PI;
    } else if (direction >= Math.PI) {
      direction = direction % Math.PI;
    }

    return direction;
  };

  /**
   * Resets the vector to a unit vector, in the given direction
   * @param {Number} direction the new direction in RADIANS
   */
  resetToUnit = function (direction: number): void {
    // reset direction such that 0 <= dir'n <= 2pi
    direction = MathVector.mod2PI(direction);

    // update x, y
    this.x = Math.sin(direction);
    this.y = Math.cos(direction);
  };

  /**
   * Shaves off any 0.00000000000001s from the vector components
   */
  roundNegligible = function (): void {
    const placesOfNegligibility = 10;
    this.x = Math.round(this.x * placesOfNegligibility) / placesOfNegligibility;
    this.y = Math.round(this.y * placesOfNegligibility) / placesOfNegligibility;
  };

  /**
   * Rotates the direction of the vector
   * @param {Number} direction the new direction
   */
  setDirection = function (direction: number): void {
    // reset direction such that 0 <= dir'n <= 2pi
    direction = MathVector.mod2PI(direction);

    const mag = this.magnitude;
    this.x = mag * Math.sin(direction);
    this.y = mag * Math.cos(direction);

    this.roundNegligible();
  };

  /**
   * Returns a new MathVector, developed from a magnitude and direction instead of x and y
   * @param {Number} mag the magnitude of the new MathVector
   * @param {Number} dirn the direction of the new MathVector
   */
  static newFromDirection = function (mag: number, dirn: number): MathVector {
    const newVector = new MathVector(1, 1);
    newVector.resetToUnit(dirn);
    newVector.setMagnitude(mag);
    return newVector;
  };
}
