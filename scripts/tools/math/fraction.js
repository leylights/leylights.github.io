import { cws } from "../../cws.js";
/**
 * A class to handle real fractions
 */
export class MathFrac {
    constructor(num, denom, type) {
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
     * Determines if this is negative.
     * SAFE?: yes
     * IDEMPOTENT?: yes
     */
    isNegative() {
        return this.numerator < 0;
    }
    /**
     * Increments this by frac
     * SAFE?: NO
     * IDEMPOTENT?: NO
     */
    add(frac) {
        let localClone = frac.clone();
        localClone.scale(this.denominator);
        this.scale(frac.denominator);
        this.numerator += localClone.numerator;
        this.condense();
        localClone = null;
        return this;
    }
    /**
     * Decrements this by frac
     * SAFE?: NO
     * IDEMPOTENT?: NO
     */
    subtract(frac) {
        let additiveInverse = new MathFrac(-frac.clone().numerator, frac.clone().denominator);
        this.add(additiveInverse);
        additiveInverse = null;
        return this;
    }
    /**
     * Multiplies this by frac, but does not simplify the fraction
     * SAFE?: NO
     * IDEMPOTENT?: NO
     */
    multiplyNoCondense(frac) {
        this.numerator *= frac.numerator;
        this.denominator *= frac.denominator;
        return this;
    }
    /**
     * Multiplies this by frac
     * SAFE?: NO
     * IDEMPOTENT?: NO
     */
    multiplyBy(frac) {
        this.multiplyNoCondense(frac);
        this.condense();
        return this;
    }
    /**
     * Divides this by frac
     * SAFE?: NO
     * IDEMPOTENT?: NO
     */
    divideBy(frac) {
        this.assertDefined();
        frac.assertDefined();
        let multiplicativeInverse = new MathFrac(frac.denominator, frac.numerator, "multiplicative inverse");
        this.multiplyBy(multiplicativeInverse);
        multiplicativeInverse = null;
        return this;
    }
    /**
     * Multiplies the numerator and denominator of this by n.
     * Can be reverted by this.condense()
     * SAFE?: NO
     * IDEMPOTENT?: NO
     */
    scale(n) {
        this.numerator *= n;
        this.denominator *= n;
    }
    /**
     * Throws an error if the numerator or denominator are (non-zero) falsy
     * SAFE: yes
     * IDEMPOTENT: yes
     */
    assertDefined() {
        if (!this.numerator && this.numerator !== 0) {
            console.error("numerator falsy");
            throw new Error("numerator falsy");
        }
        else if (!this.denominator) {
            console.error("denominator falsy");
            throw new Error("denominator falsy");
        }
    }
    /**
     * Produces a deep copy of this
     * SAFE?: yes
     * IDEMPOTENT?: yes
     */
    clone() {
        return new MathFrac(this.numerator, this.denominator);
    }
    /**
     * Simplifies the fraction (e.g. 2/4 => 1/2)
     * SAFE?: NO
     * IDEMPOTENT?: yes
     *
     * Returns the fraction for chaining
     */
    condense() {
        const divisionFactor = Math.abs(cws.gcd(this.numerator, this.denominator));
        this.numerator /= divisionFactor;
        this.denominator /= divisionFactor;
        if (this.denominator < 0) {
            this.denominator *= -1;
            this.numerator *= -1;
        }
        return this;
    }
    /**
     * Determines if this and another MathFrac are equal
     */
    isEqualTo(other) {
        if (this.numerator == other.numerator && this.denominator == other.denominator) {
            return true;
        }
    }
    /**
     * Prints this as a string
     * SAFE?: yes
     * IDEMPOTENT?: yes
     */
    prettyPrint() {
        if (this.denominator == 1) {
            return this.numerator + "";
        }
        else {
            return this.numerator + "/" + this.denominator;
        }
    }
    /**
     * Returns the sum of two MathFracs
     * SAFE?: yes
     * IDEMPOTENT?: yes
     */
    static add(a, b) {
        const ac = a.clone();
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
        const ac = a.clone();
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
        const ac = a.clone();
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
        const ac = a.clone();
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
        const searchIndex = s.search("/");
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