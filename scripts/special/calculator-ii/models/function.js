import { CalculatorVariable } from "./variable.js";
export var CalculatorOperator;
(function (CalculatorOperator) {
    CalculatorOperator["add"] = "+";
    CalculatorOperator["subtract"] = "-";
    CalculatorOperator["multiply"] = "*";
    CalculatorOperator["divide"] = "/";
    CalculatorOperator["exponent"] = "^";
})(CalculatorOperator || (CalculatorOperator = {}));
export class CalculatorFunction {
    constructor(lhs, rhs, operator) {
        this.leftTerm = lhs;
        this.rightTerm = rhs;
        this.operator = operator;
        if (!this.leftTerm && !this.rightTerm)
            throw new Error(`Bad terms given: lhs ${lhs} and rhs: ${rhs} with operator ${operator}`);
        if (!this.leftTerm)
            throw new Error(`Bad left term given: ${lhs}, with rhs ${rhs.print()} and operator ${operator}`);
        if (!this.rightTerm)
            throw new Error(`Bad right term given: ${rhs}, with lhs ${lhs.print()} and operator ${operator}`);
    }
    containsVariable() {
        let left, right;
        if (this.leftTerm instanceof CalculatorFunction)
            left = this.leftTerm.containsVariable();
        else
            left = this.leftTerm instanceof CalculatorVariable;
        if (this.rightTerm instanceof CalculatorFunction)
            right = this.rightTerm.containsVariable();
        else
            right = this.rightTerm instanceof CalculatorVariable;
        return left || right;
    }
    equals(other) {
        if (other instanceof CalculatorFunction) {
            return this.operator === other.operator && this.leftTerm.equals(other.leftTerm) && this.rightTerm.equals(other.rightTerm);
        }
        else
            return false;
    }
    print() {
        return `(${this.leftTerm.print()} ${this.operator} ${this.rightTerm.print()})`;
    }
}
CalculatorFunction.operators = [
    CalculatorOperator.add,
    CalculatorOperator.subtract,
    CalculatorOperator.multiply,
    CalculatorOperator.divide,
    CalculatorOperator.exponent
];
//# sourceMappingURL=function.js.map