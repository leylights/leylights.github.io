import { cws } from "../../../cws.js";
import { MathFrac } from "../../../tools/math/fraction.js";
import { MathNum } from "../../../tools/math/number.js";
import { CalculatorSingular } from "./singular.js";
export class CalculatorValue extends CalculatorSingular {
    constructor(value) {
        super(value + '');
        if (!value && value !== 0)
            throw new Error(`Bad value: ${value}`);
        this.value = value instanceof MathNum ? value : new MathNum(MathFrac.createFromInt(value), MathFrac.ZERO);
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
        if (this.value.prettyPrint().length > 25 && this.value.Im.isEqualTo(MathFrac.ZERO))
            return cws.roundToNthDigit(this.value.Re.decimalValue, -5) + '';
        else
            return this.value.prettyPrint() + '';
    }
    printHTML() {
        return `<span class="value">${this.value.prettyPrint()}</span>`;
    }
}
//# sourceMappingURL=value.js.map