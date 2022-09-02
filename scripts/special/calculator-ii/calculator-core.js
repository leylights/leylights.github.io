import { CalculatorCollector } from "./statement/collector.js";
import { CalculatorParser } from "./parser.js";
import { CalculatorView } from "./view.js";
import { CalculatorCommuter } from "./statement/commuter.js";
import { CalculatorDistributor } from "./statement/distributor.js";
import { CalculatorEvaluator } from "./statement/evaluator.js";
import { CalculatorFunction, CalculatorOperator } from "./models/function.js";
import { CalculatorExponentExpander } from "./statement/exponent-expansion.js";
import { CalculatorSolver } from "./equation/solver.js";
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
        CalculatorView.logStep(standardizedLeft.print(config.clearPrint), 'parsing', 'left - right');
        standardizedLeft = this.reformatStatement(standardizedLeft, config, true, 'left - right');
        const solution = CalculatorSolver.solve(standardizedLeft, { debug: config.debug, emitSteps: config.showSteps });
        return solution;
    }
    static calculateStatement(input, config) {
        CalculatorView.logStep(input.print(config.clearPrint), 'parsing');
        return this.reformatStatement(input, config, true);
    }
    /**
     * Reformats a statement or side of equality
     */
    static reformatStatement(input, config, log, title) {
        const exponentExpansion = CalculatorExponentExpander.expand(input);
        if (log)
            CalculatorView.logStep(exponentExpansion.print(config.clearPrint), 'exponent expansion', title);
        const distribution = CalculatorDistributor.distribute(exponentExpansion);
        if (log)
            CalculatorView.logStep(distribution.print(config.clearPrint), 'distribution', title);
        const commutation = CalculatorCommuter.commute(distribution);
        if (log)
            CalculatorView.logStep(commutation.print(config.clearPrint), 'commutation', title);
        const collection = CalculatorCollector.collect(commutation);
        if (log)
            CalculatorView.logStep(collection.print(config.clearPrint), 'collection', title);
        const evaluation = CalculatorEvaluator.evaluate(collection);
        if (log)
            CalculatorView.logStep(evaluation.print(config.clearPrint), 'evaluation', title);
        return evaluation;
    }
}
//# sourceMappingURL=calculator-core.js.map