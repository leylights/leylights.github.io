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