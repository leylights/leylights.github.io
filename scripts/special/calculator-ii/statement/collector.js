import { MathNum } from "../../../tools/math/number.js";
import { CalculatorComponent } from "../calculator-component.js";
import { CalculatorFunction, CalculatorOperator } from "../models/function.js";
import { CalculatorSingular } from "../models/singular.js";
import { CalculatorValue } from "../models/value.js";
import { CalculatorVariable } from "../models/variable.js";
import { CalculatorParser } from "../parser.js";
import { CalculatorTester } from "../tester.js";
export class CalculatorCollector extends CalculatorComponent {
    /**
     * Invariant: input has been commuted
     */
    static collect(input, debug) {
        this.log(debug, `original input: ${input.print()}`);
        return this.collectRecurse(input, debug);
    }
    static collectRecurse(input, debug) {
        var _a;
        this.log(debug, `collecting recurse: ${input.print()}`);
        const terms = this.getDisjunctiveTerms(input, debug, (input, debug) => { return this.collectAnyDisjunctions(input, debug); });
        this.log(debug, `
    input: ${input.print()},
    + terms: ${terms.positives.map((t) => t.print()).join(', ')};
    - terms: ${terms.negatives.map((t) => t.print()).join(', ')} `);
        const filteredTerms = {
            _values: {
                positives: [],
                negatives: [],
                coefficient: new CalculatorValue(1),
                result: null
            }
        };
        const filter = (type) => {
            terms[type].forEach((t) => {
                if (t instanceof CalculatorValue)
                    filteredTerms._values[type].push(t);
                else if (t instanceof CalculatorVariable) { // just 'x'
                    if (!filteredTerms[t.print()])
                        filteredTerms[t.print()] = { positives: [], negatives: [], coefficient: t, result: null };
                    filteredTerms[t.print()][type].push(new CalculatorValue(1));
                }
                else if (t instanceof CalculatorFunction) {
                    if (t.containsVariable()) {
                        if (t.operator === CalculatorOperator.exponent) {
                            if (!filteredTerms[t.print()]) // create entry for newly-encountered variable
                                filteredTerms[t.print()] = { positives: [], negatives: [], coefficient: t, result: null };
                            filteredTerms[t.print()][type].push(new CalculatorValue(MathNum.ONE));
                        }
                        else {
                            if (!filteredTerms[t.rightTerm.print()]) // create entry for newly-encountered variable
                                filteredTerms[t.rightTerm.print()] = { positives: [], negatives: [], coefficient: t.rightTerm, result: null };
                            filteredTerms[t.rightTerm.print()][type].push(t.leftTerm);
                        }
                    }
                    else {
                        filteredTerms._values[type].push(t);
                    }
                }
            });
        };
        this.log(debug, `filtered terms:`);
        this.log(debug, filteredTerms);
        filter('positives');
        filter('negatives');
        let output = null;
        const keys = Object.keys(filteredTerms);
        const values = keys.map((key) => filteredTerms[key]);
        values.push(values.splice(keys.indexOf('_values'), 1)[0]); // move values to the back
        for (const value of values) {
            let evaluatorTerm = null;
            for (const p of value.positives)
                evaluatorTerm = evaluatorTerm ? new CalculatorFunction(evaluatorTerm, p, CalculatorOperator.add) : p;
            for (const n of value.negatives)
                evaluatorTerm = evaluatorTerm ? new CalculatorFunction(evaluatorTerm, n, CalculatorOperator.subtract) : n;
            if (!evaluatorTerm)
                continue; // no data for this coefficient (e.g. (x * y) has no data for numerical values)
            let result;
            if (value.coefficient instanceof CalculatorValue) // values coefficient of 1
                result = evaluatorTerm;
            else
                result = new CalculatorFunction(evaluatorTerm, value.coefficient, CalculatorOperator.multiply);
            this.log(debug, `${value.coefficient.print()}: ${result.print()}`);
            if (!output)
                output = result;
            else
                output = new CalculatorFunction(output, result, value.positives.length > 0 ? CalculatorOperator.add : CalculatorOperator.subtract);
        }
        this.log(debug, `output: ${(_a = output === null || output === void 0 ? void 0 : output.print()) !== null && _a !== void 0 ? _a : 'none'}`);
        return output;
    }
    /**
     * Runs collectRecurse on any + or - functions
     */
    static collectAnyDisjunctions(input, debug) {
        if (input instanceof CalculatorFunction) {
            if (input.operator === CalculatorOperator.add || input.operator === CalculatorOperator.subtract)
                return this.collectRecurse(input, debug);
            else {
                input.leftTerm = this.collectAnyDisjunctions(input.leftTerm, debug);
                input.rightTerm = this.collectAnyDisjunctions(input.rightTerm, debug);
                return input;
            }
        }
        else
            return input;
    }
    /**
     * Abstracted for reuse by CalculatorIdentifier
     */
    static getDisjunctiveTerms(input, debug, conjunctionProcessor) {
        function exit(pos, neg) {
            return { positives: pos, negatives: neg };
        }
        if (input instanceof CalculatorSingular)
            return exit([input], []);
        else if (input instanceof CalculatorFunction) {
            switch (input.operator) {
                case CalculatorOperator.add: {
                    const leftTerms = this.getDisjunctiveTerms(input.leftTerm, debug, conjunctionProcessor);
                    const rightTerms = this.getDisjunctiveTerms(input.rightTerm, debug, conjunctionProcessor);
                    return exit(leftTerms.positives.concat(rightTerms.positives), leftTerms.negatives.concat(rightTerms.negatives));
                }
                case CalculatorOperator.subtract: {
                    const leftTerms = this.getDisjunctiveTerms(input.leftTerm, debug, conjunctionProcessor);
                    const rightTerms = this.getDisjunctiveTerms(input.rightTerm, debug, conjunctionProcessor);
                    return exit(leftTerms.positives.concat(rightTerms.negatives), leftTerms.negatives.concat(rightTerms.positives));
                }
                case CalculatorOperator.multiply:
                case CalculatorOperator.divide:
                case CalculatorOperator.exponent:
                default:
                    input.leftTerm = conjunctionProcessor(input.leftTerm, debug);
                    input.rightTerm = conjunctionProcessor(input.rightTerm, debug);
                    return exit([input], []); // multiplied terms are disjunct clauses
            }
        }
        throw new Error(`Bad input: ${input.print()}`);
    }
    static test() {
        const tester = new CalculatorTester('Collector', (input, debug) => {
            var _a, _b;
            return (_b = (_a = CalculatorCollector.collect(new CalculatorParser(input).output, debug)) === null || _a === void 0 ? void 0 : _a.print()) !== null && _b !== void 0 ? _b : 'no output';
        });
        tester.test('(3 * x)', '(3 * x)');
        tester.test('((3 * x) + (4 * x))', '((3 + 4) * x)');
        tester.test('((1 * x) + (1 * x))', '((1 + 1) * x)');
        tester.test('(x + x)', '((1 + 1) * x)');
        tester.test('(2 + 2)', '(2 + 2)');
        tester.test('(((3 * x) + (4 * x)) + (5 * x))', '(((3 + 4) + 5) * x)');
        tester.test('(((3 * x) - (4 * x)) + (5 * x))', '(((3 + 5) - 4) * x)');
        tester.test('(1 * x)', '(1 * x)');
        tester.test('(((3 * x) + (4 * y)) + (5 * x))', '(((3 + 5) * x) + (4 * y))');
        tester.test('(((3 * x) - (4 * y)) + (5 * x))', '(((3 + 5) * x) - (4 * y))');
        tester.test('((3 * 4) * x)', '((3 * 4) * x)');
        tester.test('(1 * (x ^ y))', '(1 * (x ^ y))');
        tester.test('(x ^ y)', '(1 * (x ^ y))');
        tester.test('(((3 * (x ^ y)) - (5 * (y ^ x))) + (4 * (x ^ y)))', '(((3 + 4) * (x ^ y)) - (5 * (y ^ x)))');
        tester.test('5 + 3*a - 3', '((3 * a) + (5 - 3))');
        tester.test('5 + 3*x - 3', '((3 * x) + (5 - 3))');
        tester.test('x - x', '((1 - 1) * x)');
        tester.test('(x - x)^2', '(1 * (((1 - 1) * x) ^ 2))');
        tester.test('3*(x - x)^2', '(3 * (((1 - 1) * x) ^ 2))');
    }
}
//# sourceMappingURL=collector.js.map