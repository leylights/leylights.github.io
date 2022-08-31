import { CalculatorSingular } from "./singular.js";
export class CalculatorVariable extends CalculatorSingular {
    constructor(name) {
        super(name);
    }
    equals(other) {
        return other instanceof CalculatorVariable && this.displayName === other.displayName;
    }
}
//# sourceMappingURL=variable.js.map