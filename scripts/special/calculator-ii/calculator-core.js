import { CalculatorParser } from "./parser.js";
import { CalculatorView } from "./view.js";
import { CalculatorFunction, CalculatorOperator } from "./models/function.js";
import { CalculatorSolver } from "./equation/solver.js";
import { CalculatorTester } from "./tester.js";
import { CalculatorStatementReformatter } from "./statement/statement-reformatter.js";
export class CalculatorCore {
    static calculate(input, config) {
        const parser = new CalculatorParser(input, config);
        if (parser.isEquation)
            return this.calculateEquality(parser.leftOutput, parser.rightOutput, config);
        else {
            const result = this.calculateStatement(parser.output, config);
            return {
                result: result.print(),
                HTMLResult: result.printHTML(),
                simpleResult: result.printSimple(),
            };
        }
    }
    static calculateEquality(leftSide, rightSide, config) {
        if (!leftSide || !rightSide)
            throw new Error(`Bad equality: ${leftSide === null || leftSide === void 0 ? void 0 : leftSide.print()} = ${rightSide === null || rightSide === void 0 ? void 0 : rightSide.print()}`);
        let standardizedLeft = new CalculatorFunction(leftSide, rightSide, CalculatorOperator.subtract);
        CalculatorView.logStep(standardizedLeft.printHTML(), 'parsing');
        standardizedLeft = CalculatorStatementReformatter.reformatStatement(standardizedLeft, { debug: config.debug, log: config.showSteps });
        const solution = CalculatorSolver.solve(standardizedLeft, { debug: config.debug, emitSteps: config.showSteps });
        return solution;
    }
    static calculateStatement(input, config) {
        CalculatorView.logStep(input.printHTML(), 'parsing');
        return CalculatorStatementReformatter.simplifyAndReformat(input, { debug: config.debug, log: config.showSteps });
    }
    static test() {
        const tester = new CalculatorTester('Core', (input, debug) => {
            return CalculatorCore.calculate(input, { debug: debug }).simpleResult;
        });
        tester.test('3/2*x+y=0', 'x = (-2/3)y');
        tester.test('5^x+5^y=1', 'x = 1.43068 * log(1 - 5^y)');
        tester.test('34=d^3', 'd = 3.23961');
        tester.test('4^a=4^y*3', 'a = y + 0.79248');
        tester.test('x=log(4)', 'x = 0.60206');
        tester.test('x+3/19', 'x + 3/19');
        tester.test('(1+x^2)^3', '3x^2 + 3x^4 + x^6 + 1');
        tester.test('3/(x+4)', '3/(x + 4)');
        tester.test('x+3/19(x+4)*(2+3)^2', 'x + 75/(19x + 76)');
    }
}
//# sourceMappingURL=calculator-core.js.map