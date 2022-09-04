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
    clone() {
        return new CalculatorFunction(this.leftTerm.clone(), this.rightTerm.clone(), this.operator);
    }
    containsVariable(variable) {
        return this.leftTerm.containsVariable(variable) || this.rightTerm.containsVariable(variable);
    }
    getVariables() {
        return this.leftTerm.getVariables().concat(this.rightTerm.getVariables());
    }
    equals(other) {
        if (other instanceof CalculatorFunction) {
            return this.operator === other.operator && this.leftTerm.equals(other.leftTerm) && this.rightTerm.equals(other.rightTerm);
        }
        else
            return false;
    }
    print(useClearerBraces, depth = 0) {
        let brackets;
        if (useClearerBraces)
            switch (depth % 3) {
                case 0:
                    brackets = { l: '(', r: ')' };
                    break;
                case 1:
                    brackets = { l: '[', r: ']' };
                    break;
                case 2:
                    brackets = { l: '{', r: '}' };
                    break;
            }
        else
            brackets = { l: '(', r: ')' };
        return `${brackets.l}${this.leftTerm.print(useClearerBraces, depth + 1)} ${this.operator} ${this.rightTerm.print(useClearerBraces, depth + 1)}${brackets.r}`;
    }
    printHTML(depth = 0) {
        const depthIndex = depth % 5;
        let output = `<span class="function depth-${depthIndex}">`;
        output += `<span class="parens d-${depthIndex}">(</span>`;
        output += this.leftTerm.printHTML(depth + 1);
        output += `<span class="operator d-${depthIndex}"> ${this.operator} </span>`;
        output += this.rightTerm.printHTML(depth + 1);
        output += `<span class="parens d-${depthIndex}">)</span></span>`;
        return output;
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