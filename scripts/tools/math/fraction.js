import { cws } from "../../cws.js";
/**
 * A class to handle real fractions
 */
export class MathFrac {
    constructor(num, denom, type) {
        /**
         * Determines if this is negative.
         * SAFE?: yes
         * IDEMPOTENT?: yes
         */
        this.isNegative = function () {
            return this.numerator < 0;
        };
        /**
         * Increments this by frac
         * SAFE?: NO
         * IDEMPOTENT?: NO
         */
        this.add = function (frac) {
            let localClone = frac.clone();
            localClone.scale(this.denominator);
            this.scale(frac.denominator);
            this.numerator += localClone.numerator;
            this.condense();
            localClone = null;
            return this;
        };
        /**
         * Decrements this by frac
         * SAFE?: NO
         * IDEMPOTENT?: NO
         */
        this.subtract = function (frac) {
            let additiveInverse = new MathFrac(-frac.clone().numerator, frac.clone().denominator);
            this.add(additiveInverse);
            additiveInverse = null;
            return this;
        };
        /**
         * Multiplies this by frac, but does not simplify the fraction
         * SAFE?: NO
         * IDEMPOTENT?: NO
         */
        this.multiplyNoCondense = function (frac) {
            this.numerator *= frac.numerator;
            this.denominator *= frac.denominator;
            return this;
        };
        /**
         * Multiplies this by frac
         * SAFE?: NO
         * IDEMPOTENT?: NO
         */
        this.multiplyBy = function (frac) {
            this.multiplyNoCondense(frac);
            this.condense();
            return this;
        };
        /**
         * Divides this by frac
         * SAFE?: NO
         * IDEMPOTENT?: NO
         */
        this.divideBy = function (frac) {
            this.assertDefined();
            frac.assertDefined();
            let multiplicativeInverse = new MathFrac(frac.denominator, frac.numerator, "multiplicative inverse");
            this.multiplyBy(multiplicativeInverse);
            multiplicativeInverse = null;
            return this;
        };
        /**
         * Multiplies the numerator and denominator of this by n.
         * Can be reverted by this.condense()
         * SAFE?: NO
         * IDEMPOTENT?: NO
         */
        this.scale = function (n) {
            this.numerator *= n;
            this.denominator *= n;
        };
        /**
         * Throws an error if the numerator or denominator are (non-zero) falsy
         * SAFE: yes
         * IDEMPOTENT: yes
         */
        this.assertDefined = function () {
            if (!this.numerator && this.numerator !== 0) {
                console.error("numerator falsy");
                throw new Error("numerator falsy");
            }
            else if (!this.denominator) {
                console.error("denominator falsy");
                throw new Error("denominator falsy");
            }
        };
        /**
         * Produces a deep copy of this
         * SAFE?: yes
         * IDEMPOTENT?: yes
         */
        this.clone = function () {
            return new MathFrac(this.numerator, this.denominator);
        };
        /**
         * Simplifies the fraction (e.g. 2/4 => 1/2)
         * SAFE?: NO
         * IDEMPOTENT?: yes
         */
        this.condense = function () {
            let divisionFactor = Math.abs(cws.gcd(this.numerator, this.denominator));
            this.numerator /= divisionFactor;
            this.denominator /= divisionFactor;
            if (this.denominator < 0) {
                this.denominator *= -1;
                this.numerator *= -1;
            }
        };
        /**
         * Determines if this and another MathFrac are equal
         */
        this.isEqualTo = function (other) {
            if (this.numerator == other.numerator && this.denominator == other.denominator) {
                return true;
            }
        };
        /**
         * Prints this as a string
         * SAFE?: yes
         * IDEMPOTENT?: yes
         */
        this.prettyPrint = function () {
            if (this.denominator == 1) {
                return this.numerator + "";
            }
            else {
                return this.numerator + "/" + this.denominator;
            }
        };
        this.numerator = num;
        this.denominator = denom;
        this.type = type;
        this.condense();
    }
    /**
     * Returns the decimal expression of the number.
     * @property SAFE?: yes
     * @property IDEMPOTENT?: yes
     */
    get decimalValue() {
        return this.numerator / this.denominator;
    }
    /**
     * Returns the sum of two MathFracs
     * SAFE?: yes
     * IDEMPOTENT?: yes
     */
    static add(a, b) {
        let ac = a.clone();
        let bc = b.clone();
        ac.add(bc);
        bc = null;
        return ac;
    }
    /**
     * Returns the difference two MathFracs
     * SAFE?: yes
     * IDEMPOTENT?: yes
     */
    static subtract(a, b) {
        let ac = a.clone();
        let bc = b.clone();
        ac.subtract(bc);
        bc = null;
        return ac;
    }
    /**
     * Returns the product of two MathFracs
     * SAFE?: yes
     * IDEMPOTENT?: yes
     */
    static multiply(a, b) {
        let ac = a.clone();
        let bc = b.clone();
        ac.multiplyBy(bc);
        bc = null;
        return ac;
    }
    /**
     * Returns the quotient of two MathFracs
     * SAFE?: yes
     * IDEMPOTENT?: yes
     */
    static divide(a, b) {
        let ac = a.clone();
        let bc = b.clone();
        ac.divideBy(bc);
        bc = null;
        return ac;
    }
    static createFromInt(n) {
        return new MathFrac(n, 1);
    }
    static createFromStr(s) {
        if (isNaN(parseInt(s))) {
            throw new Error("Bad string");
        }
        let searchIndex = s.search("/");
        if (searchIndex == -1) {
            return MathFrac.createFromInt(parseInt(s));
        }
        else {
            return new MathFrac(parseInt(s), parseInt(s.substring(searchIndex + 1)));
        }
    }
}
MathFrac.ZERO = MathFrac.createFromInt(0);
//# sourceMappingURL=fraction.js.map