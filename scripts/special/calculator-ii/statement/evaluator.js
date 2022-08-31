import { MathNum } from "../../../tools/math/number.js";
import { CalculatorComponent } from "../calculator-component.js";
import { CalculatorError, CalculatorErrorType } from "../models/error.js";
import { CalculatorFunction, CalculatorOperator } from "../models/function.js";
import { CalculatorValue } from "../models/value.js";
import { CalculatorVariable } from "../models/variable.js";
export class CalculatorEvaluator extends CalculatorComponent {
    static evaluate(input) {
        if (input instanceof CalculatorVariable)
            return input;
        else if (input instanceof CalculatorValue)
            return input;
        else if (input instanceof CalculatorFunction) { // is a function
            const lhs = this.evaluate(input.leftTerm);
            const rhs = this.evaluate(input.rightTerm);
            if (lhs instanceof CalculatorValue && rhs instanceof CalculatorValue) {
                switch (input.operator) {
                    case CalculatorOperator.add: {
                        return new CalculatorValue(MathNum.add(lhs.value, rhs.value));
                    }
                    case CalculatorOperator.subtract: {
                        return new CalculatorValue(MathNum.subtract(lhs.value, rhs.value));
                    }
                    case CalculatorOperator.multiply: {
                        return new CalculatorValue(MathNum.multiply(lhs.value, rhs.value));
                    }
                    case CalculatorOperator.divide: {
                        if (rhs.value.isEqualTo(MathNum.ZERO))
                            throw new CalculatorError(CalculatorErrorType.divisionByZero, `${lhs.value} / ${rhs.value}`);
                        return new CalculatorValue(MathNum.divide(lhs.value, rhs.value));
                    }
                    case CalculatorOperator.exponent: {
                        return new CalculatorValue(MathNum.pow(lhs.value, rhs.value));
                    }
                    default:
                        throw new Error(`Bad operator: ${input.operator}`);
                }
            }
            else {
                // special cases:
                switch (input.operator) {
                    case CalculatorOperator.add:
                        if (lhs instanceof CalculatorValue && lhs.value.isEqualTo(MathNum.ZERO))
                            return rhs;
                        if (rhs instanceof CalculatorValue && rhs.value.isEqualTo(MathNum.ZERO))
                            return lhs;
                        break;
                    case CalculatorOperator.subtract:
                        if (rhs instanceof CalculatorValue && rhs.value.isEqualTo(MathNum.ZERO))
                            return lhs;
                        break;
                    case CalculatorOperator.multiply:
                        if ((lhs instanceof CalculatorValue && lhs.value.isEqualTo(MathNum.ZERO))
                            || (rhs instanceof CalculatorValue && rhs.value.isEqualTo(MathNum.ZERO)))
                            return new CalculatorValue(0);
                        break;
                    case CalculatorOperator.divide:
                        if (lhs instanceof CalculatorValue && lhs.value.isEqualTo(MathNum.ZERO))
                            return new CalculatorValue(0);
                        else if (rhs instanceof CalculatorValue && rhs.value.isEqualTo(MathNum.ONE))
                            return lhs;
                        break;
                    case CalculatorOperator.exponent:
                        if (lhs instanceof CalculatorValue && lhs.value.isEqualTo(MathNum.ZERO))
                            return new CalculatorValue(0);
                        else if (rhs instanceof CalculatorValue) {
                            if (rhs.value.isEqualTo(MathNum.ZERO))
                                return new CalculatorValue(1);
                            else if (rhs.value.isEqualTo(MathNum.ONE))
                                return lhs;
                        }
                        break;
                    default:
                        throw new Error(`Bad operator: ${input.operator}`);
                }
                return new CalculatorFunction(lhs, rhs, input.operator);
            }
        }
        throw new Error('Bad input given: ' + input.print());
    }
}
//# sourceMappingURL=evaluator.js.map