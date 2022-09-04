import { CalculatorCollector } from "./statement/collector.js";
import { CalculatorParser } from "./parser.js";
import { CalculatorView } from "./view.js";
import { CalculatorCommuter } from "./statement/commuter.js";
import { CalculatorDistributor } from "./statement/distributor.js";
import { CalculatorEvaluator } from "./statement/evaluator.js";
import { CalculatorFunction, CalculatorOperator } from "./models/function.js";
import { CalculatorExponentExpander } from "./statement/exponent-expansion.js";
import { CalculatorSolver } from "./equation/solver.js";
import { CalculatorTester } from "./tester.js";
export class CalculatorCore {
    static calculate(input, config) {
        const parser = new CalculatorParser(input, config);
        if (parser.isEquation)
            return this.calculateEquality(parser.leftOutput, parser.rightOutput, config);
        else
            return this.calculateStatement(parser.output, config).print();
    }
    static calculateEquality(leftSide, rightSide, config) {
        if (!leftSide || !rightSide)
            throw new Error(`Bad equality: ${leftSide === null || leftSide === void 0 ? void 0 : leftSide.print()} = ${rightSide === null || rightSide === void 0 ? void 0 : rightSide.print()}`);
        let standardizedLeft = new CalculatorFunction(leftSide, rightSide, CalculatorOperator.subtract);
        CalculatorView.logStep(standardizedLeft.printHTML(), 'parsing');
        standardizedLeft = this.reformatStatement(standardizedLeft, config, true);
        const solution = CalculatorSolver.solve(standardizedLeft, { debug: config.debug, emitSteps: config.showSteps });
        return solution;
    }
    static calculateStatement(input, config) {
        CalculatorView.logStep(input.printHTML(), 'parsing');
        return this.reformatStatement(input, config, true);
    }
    /**
     * Reformats a statement or side of equality
     */
    static reformatStatement(input, config, log, title) {
        const exponentExpansion = CalculatorExponentExpander.expand(input);
        if (log)
            CalculatorView.logStep(exponentExpansion.printHTML(), 'exponent expansion', title);
        const distribution = CalculatorDistributor.distribute(exponentExpansion);
        if (log)
            CalculatorView.logStep(distribution.printHTML(), 'distribution', title);
        const commutation = CalculatorCommuter.commute(distribution);
        if (log)
            CalculatorView.logStep(commutation.printHTML(), 'commutation', title);
        const collection = CalculatorCollector.collect(commutation);
        if (log)
            CalculatorView.logStep(collection.printHTML(), 'collection', title);
        const evaluation = CalculatorEvaluator.evaluate(collection);
        if (log)
            CalculatorView.logStep(evaluation.printHTML(), 'evaluation', title);
        return evaluation;
    }
    static test() {
        const tester = new CalculatorTester('Core', (input, debug) => {
            return CalculatorCore.calculate(input, { debug: debug });
        });
        tester.test('3/2*x+y=0', 'x = ((0 - (1 * y)) / 3/2)');
    }
}
//# sourceMappingURL=calculator-core.js.map