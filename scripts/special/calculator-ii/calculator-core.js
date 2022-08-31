import { CalculatorCollector } from "./statement/collector.js";
import { CalculatorParser } from "./parser.js";
import { CalculatorView } from "./view.js";
import { CalculatorCommuter } from "./statement/commuter.js";
import { CalculatorDistributor } from "./statement/distributor.js";
import { CalculatorEvaluator } from "./statement/evaluator.js";
import { CalculatorFunction, CalculatorOperator } from "./models/function.js";
export class CalculatorCore {
    static calculate(input, debug) {
        const parser = new CalculatorParser(input, {
            debug: debug,
        });
        if (parser.isEquation)
            return this.calculateEquality(parser.leftOutput, parser.rightOutput);
        else
            return this.calculateStatement(parser.output).print();
    }
    static calculateEquality(leftSide, rightSide) {
        if (!leftSide || !rightSide)
            throw new Error(`Bad equality: ${leftSide === null || leftSide === void 0 ? void 0 : leftSide.print()} = ${rightSide === null || rightSide === void 0 ? void 0 : rightSide.print()}`);
        let standardizedLeft = new CalculatorFunction(leftSide, rightSide, CalculatorOperator.subtract);
        CalculatorView.logStep(standardizedLeft.print(), 'parsing', 'left - right');
        standardizedLeft = this.reformatStatement(standardizedLeft, true, 'left - right');
        return null;
    }
    static calculateStatement(input) {
        CalculatorView.logStep(input.print(), 'parsing');
        return this.reformatStatement(input, true);
    }
    /**
     * Reformats a statement or side of equality
     */
    static reformatStatement(input, log, title) {
        const distribution = CalculatorDistributor.distribute(input);
        const commutation = CalculatorCommuter.commute(distribution);
        const collection = CalculatorCollector.collect(commutation);
        const evaluation = CalculatorEvaluator.evaluate(collection);
        if (log) {
            CalculatorView.logStep(distribution.print(), 'distribution', title);
            CalculatorView.logStep(commutation.print(), 'commutation', title);
            CalculatorView.logStep(collection.print(), 'collection', title);
            CalculatorView.logStep(evaluation.print(), 'evaluation', title);
        }
        return evaluation;
    }
}
//# sourceMappingURL=calculator-core.js.map