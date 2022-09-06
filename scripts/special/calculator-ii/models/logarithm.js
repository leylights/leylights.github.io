import { CalculatorUnaryFunction } from "./unary-function.js";
export class CalculatorLogarithmFunction extends CalculatorUnaryFunction {
    constructor(parameter) {
        super(parameter, 'log');
        if (!this.parameter)
            throw new Error(`Bad parameter given: ${parameter}`);
    }
    clone() {
        return new CalculatorLogarithmFunction(this.parameter.clone());
    }
}
//# sourceMappingURL=logarithm.js.map