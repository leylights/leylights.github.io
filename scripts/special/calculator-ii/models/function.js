import { CalculatorTerm } from "./term.js";
import { CalculatorUnaryFunction } from "./unary-function.js";
import { CalculatorValue } from "./value.js";
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
        this._leftTerm = typeof lhs === 'number' ? new CalculatorValue(lhs) : lhs;
        this._rightTerm = typeof rhs === 'number' ? new CalculatorValue(rhs) : rhs;
        this.operator = operator;
        this._id = ++CalculatorTerm.next_id;
        if (!this._leftTerm && !this._rightTerm)
            throw new Error(`Bad terms given: lhs ${lhs} and rhs: ${rhs} with operator ${operator}`);
        if (!this._leftTerm)
            throw new Error(`Bad left term given: ${lhs}, with rhs ${this._leftTerm.print()} and operator ${operator}`);
        if (!this._rightTerm)
            throw new Error(`Bad right term given: ${rhs}, with lhs ${this._rightTerm.print()} and operator ${operator}`);
    }
    get id() { return this._id; }
    get leftTerm() {
        return this._leftTerm;
    }
    set leftTerm(term) {
        if (term.id === this.id)
            throw new Error(`Cannot set term as its own child`);
        else
            this._leftTerm = term;
    }
    get rightTerm() {
        return this._rightTerm;
    }
    set rightTerm(term) {
        if (term.id === this.id)
            throw new Error(`Cannot set term as its own child`);
        else
            this._rightTerm = term;
    }
    clone() {
        return new CalculatorFunction(this._leftTerm.clone(), this._rightTerm.clone(), this.operator);
    }
    containsVariable(variable) {
        return this._leftTerm.containsVariable(variable) || this._rightTerm.containsVariable(variable);
    }
    getVariables() {
        return this._leftTerm.getVariables().concat(this._rightTerm.getVariables());
    }
    equals(other) {
        if (other instanceof CalculatorFunction) {
            return this.operator === other.operator && this._leftTerm.equals(other._leftTerm) && this._rightTerm.equals(other._rightTerm);
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
        return `${brackets.l}${this._leftTerm.print(useClearerBraces, depth + 1)} ${this.operator} ${this._rightTerm.print(useClearerBraces, depth + 1)}${brackets.r}`;
    }
    printHTML(depth = 0) {
        const depthIndex = depth % 5;
        let output = `<span class="function depth-${depthIndex}">`;
        output += `<span class="parens d-${depthIndex}">(</span>`;
        output += this._leftTerm.printHTML(depth + 1);
        output += `<span class="operator d-${depthIndex}"> ${this.operator} </span>`;
        output += this._rightTerm.printHTML(depth + 1);
        output += `<span class="parens d-${depthIndex}">)</span></span>`;
        return output;
    }
    printSimple(depth = 0) {
        let left = '';
        let right = '';
        let operator = this.operator;
        let space = '';
        switch (this.operator) {
            case CalculatorOperator.add:
                space = ' ';
                if (this._leftTerm instanceof CalculatorFunction) {
                    switch (this._leftTerm.operator) {
                        case CalculatorOperator.subtract:
                            left = `(${this._leftTerm.printSimple(depth + 1)})`;
                        case CalculatorOperator.add:
                        case CalculatorOperator.multiply:
                        case CalculatorOperator.divide:
                        case CalculatorOperator.exponent:
                            left = this._leftTerm.printSimple(depth + 1);
                    }
                }
                else {
                    left = this._leftTerm.printSimple(depth + 1);
                }
                right = this._rightTerm.printSimple(depth + 1);
                break;
            case CalculatorOperator.subtract:
                space = ' ';
                left = this._leftTerm.printSimple(depth + 1);
                if (this._rightTerm instanceof CalculatorFunction) {
                    switch (this._rightTerm.operator) {
                        case CalculatorOperator.add:
                        case CalculatorOperator.subtract:
                            right = `(${this._rightTerm.printSimple(depth + 1)})`;
                        case CalculatorOperator.multiply:
                        case CalculatorOperator.divide:
                        case CalculatorOperator.exponent:
                            right = this._rightTerm.printSimple(depth + 1);
                    }
                }
                else {
                    right = this._rightTerm.printSimple(depth + 1);
                }
                break;
            case CalculatorOperator.multiply:
                left = this._leftTerm.printSimple(depth + 1);
                right = this._rightTerm.printSimple(depth + 1);
                operator = '';
                if (this._leftTerm instanceof CalculatorValue) {
                    if (this._rightTerm instanceof CalculatorValue) // both values, keep *
                        operator = this.operator;
                    if (this._leftTerm.print().includes('/')) // left value fractional, need ()
                        left = `(${this._leftTerm.printSimple(depth + 1)})`;
                }
                else if (this._leftTerm instanceof CalculatorFunction && !`*^`.includes(this._leftTerm.operator)) {
                    left = `(${left})`;
                }
                if (this._rightTerm instanceof CalculatorFunction && !(`*^`.includes(this._rightTerm.operator))) {
                    right = `(${right})`;
                }
                else if (this._rightTerm instanceof CalculatorUnaryFunction) {
                    operator = this.operator;
                }
                if (operator === this.operator)
                    space = ' ';
                break;
            case CalculatorOperator.divide:
            case CalculatorOperator.exponent:
                left = this._leftTerm.printSimple(depth + 1);
                right = this._rightTerm.printSimple(depth + 1);
                if (this._leftTerm instanceof CalculatorFunction)
                    left = `(${left})`;
                if (this._rightTerm instanceof CalculatorFunction)
                    right = `(${right})`;
                break;
        }
        return `${left}${space}${operator}${space}${right}`;
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