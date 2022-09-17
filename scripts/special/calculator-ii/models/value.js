import { Molasses } from "../../../molasses.js";
import { MathFrac } from "../../../tools/math/fraction.js";
import { MathNum } from "../../../tools/math/number.js";
import { CalculatorSingular } from "./singular.js";
export class CalculatorValue extends CalculatorSingular {
    constructor(value) {
        super('value');
        if (!value && value !== 0)
            throw new Error(`Bad value: ${value}`);
        this.value = value instanceof MathNum
            ? value
            : typeof value === 'number'
                ? new MathNum(MathFrac.createFromInt(value), MathFrac.ZERO)
                : null;
        if (this.value === null) {
            console.error(value);
            throw new Error(`Bad value: ${value}`);
        }
    }
    get integerValue() {
        if (!this.value.isRealInteger())
            throw new Error(`Not an integer: ${this.value.prettyPrint()}`);
        return this.value.toRealNumber().nearestInteger;
    }
    clone() {
        return new CalculatorValue(this.value.clone());
    }
    containsVariable() {
        return false;
    }
    getVariables() {
        return [];
    }
    equals(other) {
        return other instanceof CalculatorValue && this.value.isEqualTo(other.value);
    }
    print() {
        if (this.value.prettyPrint().length > 15 && this.value.Im.isEqualTo(MathFrac.ZERO))
            return Molasses.roundToNthDigit(this.value.Re.decimalValue, -5) + '';
        else
            return this.value.prettyPrint() + '';
    }
    printHTML() {
        return `<span class="value">${this.print()}</span>`;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    printSimple(depth = 0) {
        return this.print();
    }
}
//# sourceMappingURL=value.js.map