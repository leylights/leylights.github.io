import { MathFrac } from "../../../tools/math/fraction.js";
import { MathNum } from "../../../tools/math/number.js";
import { CalculatorSingular } from "./singular.js";
export class CalculatorValue extends CalculatorSingular {
    constructor(value) {
        super(value + '');
        this.value = value instanceof MathNum ? value : new MathNum(MathFrac.createFromInt(value), MathFrac.ZERO);
    }
    equals(other) {
        return other instanceof CalculatorValue && this.value.isEqualTo(other.value);
    }
    print() {
        return this.value.prettyPrint() + '';
    }
}
//# sourceMappingURL=value.js.map