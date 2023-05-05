import { CalculatorTerm } from "./term";
import { CalculatorUnaryFunction } from "./unary-function";

export class CalculatorLogarithmFunction extends CalculatorUnaryFunction {
  constructor(parameter: CalculatorTerm) {
    super(parameter, 'log');
    if (!this.parameter) throw new Error(`Bad parameter given: ${parameter}`);
  }

  clone(): CalculatorTerm {
    return new CalculatorLogarithmFunction(this.parameter.clone());
  }
}
