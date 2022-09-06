import { CalculatorComponent } from "../calculator-component.js";
import { CalculatorFunction, CalculatorOperator } from "../models/function.js";
import { CalculatorSingular } from "../models/singular.js";
import { CalculatorUnaryFunction } from "../models/unary-function.js";
import { CalculatorValue } from "../models/value.js";
import { CalculatorParser } from "../parser.js";
import { CalculatorTester } from "../tester.js";
export class CalculatorExponentExpander extends CalculatorComponent {
    static expand(input, debug) {
        return this.expandRecurse(input, debug);
    }
    static expandRecurse(input, debug) {
        this.log(debug, `Expanding: ${input.print()}`);
        if (input instanceof CalculatorSingular)
            return input;
        else if (input instanceof CalculatorUnaryFunction) {
            input.parameter = this.expandRecurse(input.parameter, debug);
            return input;
        }
        else if (input instanceof CalculatorFunction) {
            switch (input.operator) {
                case CalculatorOperator.add:
                case CalculatorOperator.subtract:
                case CalculatorOperator.multiply:
                case CalculatorOperator.divide:
                    input.leftTerm = this.expandRecurse(input.leftTerm, debug);
                    input.rightTerm = this.expandRecurse(input.rightTerm, debug);
                    return input;
                case CalculatorOperator.exponent:
                    this.log(debug, `Exponent found in ${input.print()}`);
                    if (input.rightTerm instanceof CalculatorValue) {
                        if (input.rightTerm.value.isRealInteger()) {
                            this.log(debug, `Integer exponent found in ${input.print()}`);
                            const exponent = input.rightTerm.value.toRealNumber().nearestInteger;
                            if (exponent === 0)
                                return new CalculatorValue(0);
                            let current = input.leftTerm.clone();
                            for (let i = 1; i < Math.abs(exponent); i++)
                                current = new CalculatorFunction(current, input.leftTerm.clone(), CalculatorOperator.multiply);
                            if (exponent > 0)
                                return current;
                            else
                                return new CalculatorFunction(new CalculatorValue(1), current, CalculatorOperator.divide);
                        }
                        else {
                            this.log(debug, `No expansion, exponent value is not real integer`);
                            return input;
                        }
                    }
                    else {
                        input.leftTerm = this.expandRecurse(input.leftTerm, debug);
                        input.rightTerm = this.expandRecurse(input.rightTerm, debug);
                        return input;
                    }
                default:
                    throw new Error(`Bad operator ${input.operator} in: ${input.print()}`);
            }
        }
        throw new Error('Bad input given: ' + input.print());
    }
    static test() {
        const tester = new CalculatorTester('Exponent Expander', (input, debug) => {
            return CalculatorExponentExpander.expand(new CalculatorParser(input).output, debug).print();
        });
        tester.test('x ^ 2', '(x * x)');
        tester.test('x ^ (3 / 2)', '(x ^ (3 / 2))');
        tester.test('(x - 2) ^ 2', '((x - 2) * (x - 2))');
        // tester.test('(x * y) ^ (3 / 2)', ''); // handled by distributor
        tester.test('x ^ -2', '(1 / (x * x))');
    }
}
//# sourceMappingURL=exponent-expansion.js.map