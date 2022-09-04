import { CalculatorFunction, CalculatorOperator } from "./models/function.js";
import { CalculatorValue } from "./models/value.js";
import { CalculatorVariable } from "./models/variable.js";
import { CalculatorParser } from "./parser.js";
import { CalculatorTester } from "./tester.js";
export class CalculatorDistributor {
    static distribute(input, debug) {
        this.totalCalls++;
        if (debug && this.totalCalls > 100)
            throw new Error('too many calls');
        this.recursiveCalls = 0;
        this.log(debug, '-------- DISTRIBUTE ---------');
        return this.distributeRecurse(input, debug);
    }
    static distributeRecurse(input, debug) {
        this.recursiveCalls++;
        if (this.recursiveCalls > 60)
            throw new Error('LOOP.');
        this.log(debug, `Distribute calls: ${this.recursiveCalls}`);
        this.log(debug, input.print());
        if (input instanceof CalculatorValue)
            return input;
        else if (input instanceof CalculatorVariable)
            return input;
        else if (input instanceof CalculatorFunction) {
            const exitWithoutDistributing = () => {
                return new CalculatorFunction(this.distributeRecurse(input.leftTerm, debug), this.distributeRecurse(input.rightTerm, debug), input.operator);
            };
            switch (input.operator) {
                case CalculatorOperator.add:
                case CalculatorOperator.subtract:
                    return exitWithoutDistributing();
                case CalculatorOperator.multiply:
                case CalculatorOperator.divide: {
                    if (input.rightTerm instanceof CalculatorFunction && input.leftTerm instanceof CalculatorFunction) { // (w [+-*/^] x) [*/] (y [+-*/^] z)
                        if (input.operator === CalculatorOperator.multiply) { // (w [+-*/^] x) * (y [+-*/^] z)
                            switch (input.leftTerm.operator) {
                                case CalculatorOperator.add:
                                case CalculatorOperator.subtract: // (w [+-] x) * (y [+-*/^] z)
                                    switch (input.rightTerm.operator) {
                                        case CalculatorOperator.add:
                                        case CalculatorOperator.subtract: // (w [+-] x) * (y [+-] z)
                                            return new CalculatorFunction(this.distributeRecurse(new CalculatorFunction(input.leftTerm, input.rightTerm.leftTerm, CalculatorOperator.multiply), debug), this.distributeRecurse(new CalculatorFunction(input.leftTerm, input.rightTerm.rightTerm, CalculatorOperator.multiply), debug), input.rightTerm.operator);
                                        case CalculatorOperator.multiply:
                                        case CalculatorOperator.divide: // (w [+-] x) * (y [*/] z)
                                            return new CalculatorFunction(this.distributeRecurse(new CalculatorFunction(input.leftTerm.leftTerm, input.rightTerm, CalculatorOperator.multiply), debug), this.distributeRecurse(new CalculatorFunction(input.leftTerm.rightTerm, input.rightTerm, CalculatorOperator.multiply), debug), input.leftTerm.operator);
                                        case CalculatorOperator.exponent: // (w [+-] x) * (y ^ z)
                                            return new CalculatorFunction(this.distributeRecurse(new CalculatorFunction(input.leftTerm.leftTerm, input.rightTerm, CalculatorOperator.multiply), debug), this.distributeRecurse(new CalculatorFunction(input.leftTerm.rightTerm, input.rightTerm, CalculatorOperator.multiply), debug), input.leftTerm.operator);
                                    }
                                case CalculatorOperator.multiply:
                                case CalculatorOperator.divide: // (w [*/] x) * (y [+-*/^] z)
                                    switch (input.rightTerm.operator) {
                                        case CalculatorOperator.add:
                                        case CalculatorOperator.subtract: // (w [*/] x) * (y [+-] z)
                                            return new CalculatorFunction(this.distributeRecurse(new CalculatorFunction(input.leftTerm, input.rightTerm.leftTerm, CalculatorOperator.multiply), debug), this.distributeRecurse(new CalculatorFunction(input.leftTerm, input.rightTerm.rightTerm, CalculatorOperator.multiply), debug), input.rightTerm.operator);
                                        case CalculatorOperator.multiply:
                                        case CalculatorOperator.divide: // (w [*/] x) * (y [*/] z)
                                            return exitWithoutDistributing(); // no need to distribute
                                        case CalculatorOperator.exponent: // (w [*/] x) * (y ^ z)
                                            return exitWithoutDistributing(); // no need to distribute
                                    }
                                case CalculatorOperator.exponent:
                            }
                        }
                        else { // (w [+-*/^] x) / (y [+-*/^] z)
                            switch (input.leftTerm.operator) {
                                case CalculatorOperator.add:
                                case CalculatorOperator.subtract: // (w [+-] x) / (y [+-*/^] z)
                                    return new CalculatorFunction(this.distributeRecurse(new CalculatorFunction(input.leftTerm.leftTerm, input.rightTerm, CalculatorOperator.divide), debug), this.distributeRecurse(new CalculatorFunction(input.leftTerm.rightTerm, input.rightTerm, CalculatorOperator.divide), debug), input.leftTerm.operator);
                                case CalculatorOperator.multiply:
                                case CalculatorOperator.divide: // (w [*/] x) / (y [+-*/^] z)
                                    return exitWithoutDistributing(); // no need to distribute
                                case CalculatorOperator.exponent: // w^x / (y [+-*/^] z)
                                    return exitWithoutDistributing(); // no need to distribute
                            }
                        }
                    }
                    else if (input.rightTerm instanceof CalculatorFunction) { // [3x] [*/] (4 [+-*/^] 5)
                        switch (input.rightTerm.operator) {
                            case CalculatorOperator.add:
                            case CalculatorOperator.subtract:
                                if (input.operator === CalculatorOperator.multiply) // x(y [+-] z) = xy [+-] xz
                                    return new CalculatorFunction(this.distributeRecurse(new CalculatorFunction(input.leftTerm, input.rightTerm.leftTerm, CalculatorOperator.multiply), debug), this.distributeRecurse(new CalculatorFunction(input.leftTerm, input.rightTerm.rightTerm, CalculatorOperator.multiply), debug), input.rightTerm.operator);
                                else if (input.operator === CalculatorOperator.divide) // x/(y [+-] z) != x/y [+-] x/z
                                    return exitWithoutDistributing();
                            case CalculatorOperator.multiply:
                            case CalculatorOperator.divide:
                            case CalculatorOperator.exponent:
                                return exitWithoutDistributing();
                        }
                    }
                    else if (input.leftTerm instanceof CalculatorFunction) { // (4 [+-*/^] 5) [*/] [3x] 
                        switch (input.leftTerm.operator) {
                            case CalculatorOperator.add:
                            case CalculatorOperator.subtract:
                                return new CalculatorFunction(this.distributeRecurse(new CalculatorFunction(input.leftTerm.leftTerm, input.rightTerm, input.operator), debug), this.distributeRecurse(new CalculatorFunction(input.leftTerm.rightTerm, input.rightTerm, input.operator), debug), input.leftTerm.operator);
                            case CalculatorOperator.multiply: // (2*3) * 4 != (2*3)*(3*4)
                            case CalculatorOperator.divide: // (1/2) / 3 != (1/2)/(1/3)
                            case CalculatorOperator.exponent: // can't distribute into exponents
                                return exitWithoutDistributing();
                            default: throw new Error(`Bad operator: ${input.leftTerm.operator}`);
                        }
                    }
                }
                case CalculatorOperator.exponent:
                    if (input.leftTerm instanceof CalculatorFunction) {
                        if (input.leftTerm.operator === CalculatorOperator.multiply || input.leftTerm.operator === CalculatorOperator.divide) {
                            return new CalculatorFunction(this.distributeRecurse(new CalculatorFunction(input.leftTerm.leftTerm, input.rightTerm, input.operator), debug), this.distributeRecurse(new CalculatorFunction(input.leftTerm.rightTerm, input.rightTerm, input.operator), debug), input.leftTerm.operator);
                        }
                        else if (input.leftTerm.operator === CalculatorOperator.exponent) { // ((x ^ y) ^ z) -> (x ^ (y * z))
                            return new CalculatorFunction(this.distributeRecurse(input.leftTerm.leftTerm, debug), this.distributeRecurse(new CalculatorFunction(input.leftTerm.rightTerm, input.rightTerm, CalculatorOperator.multiply), debug), CalculatorOperator.exponent);
                        }
                        else
                            return exitWithoutDistributing();
                    }
                    else {
                        // can ONLY distribute exponents when the left side is a function
                        return exitWithoutDistributing();
                    }
            }
            return input;
        }
    }
    static log(debug, messages) {
        if (debug)
            console.log(messages);
    }
    static test() {
        const tester = new CalculatorTester('Distributor', (input, debug) => {
            return CalculatorDistributor.distribute(new CalculatorParser(input).leftOutput, debug).print();
        });
        tester.test('5 * (3 + 4)', '((5 * 3) + (5 * 4))');
        tester.test('5 / (3 + 4)', '(5 / (3 + 4))');
        tester.test('(3 + 4) * 5', '((3 * 5) + (4 * 5))');
        tester.test('(3 + 4) / 5', '((3 / 5) + (4 / 5))');
        tester.test('(3 + 4)^3', '((3 + 4) ^ 3)');
        tester.test('(3 * 4)^3', '((3 ^ 3) * (4 ^ 3))');
        tester.test('3^(3 + 4)', '(3 ^ (3 + 4))');
        tester.test('3^(3 * 4)', '(3 ^ (3 * 4))');
        tester.test('(3 * 4)^x', '((3 ^ x) * (4 ^ x))');
        tester.test('(3 * 4)^(5+6)', '((3 ^ (5 + 6)) * (4 ^ (5 + 6)))');
        tester.test('(3 / 4)^x', '((3 ^ x) / (4 ^ x))');
        tester.test('(3 / 4)^(5+6)', '((3 ^ (5 + 6)) / (4 ^ (5 + 6)))');
        tester.test('3 * (3 * x)', '(3 * (3 * x))');
        tester.test('(3 ^ 4) ^ 5', '(3 ^ (4 * 5))');
        tester.test('3 ^ (4 ^ 5)', '(3 ^ (4 ^ 5))');
        tester.test('x * (3 - 4)', '((x * 3) - (x * 4))');
        // tester.test('3 / (1 / 2)', '((3 * 2) / 1)');
        tester.test('3 / (1 / 2)', '(3 / (1 / 2))');
        tester.test('(x+ 2) * (y - 4)', '(((x * y) + (2 * y)) - ((x * 4) + (2 * 4)))');
        tester.test('(x+ 2) * (y - 4)', '(((x * y) + (2 * y)) - ((x * 4) + (2 * 4)))');
        tester.test('3*(x*y)', '(3 * (x * y))');
    }
}
CalculatorDistributor.recursiveCalls = 0;
CalculatorDistributor.totalCalls = 0;
//# sourceMappingURL=distributor.js.map