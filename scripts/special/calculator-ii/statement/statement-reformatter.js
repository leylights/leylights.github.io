import { CalculatorComponent } from "../calculator-component.js";
import { CalculatorView } from "../view.js";
import { CalculatorCollector } from "./collector.js";
import { CalculatorCommuter } from "./commuter.js";
import { CalculatorDistributor } from "./distributor.js";
import { CalculatorEvaluator } from "./evaluator.js";
import { CalculatorExponentExpander } from "./exponent-expansion.js";
export class CalculatorStatementReformatter extends CalculatorComponent {
    /**
     * Reformats a statement or side of equality
     */
    static reformatStatement(input, config, title) {
        const doStep = (name, previousStep, step) => {
            const stepResult = step(previousStep);
            if (config === null || config === void 0 ? void 0 : config.log)
                CalculatorView.logStep(stepResult.printHTML(), name, title);
            if (config === null || config === void 0 ? void 0 : config.debug)
                this.log(config.debug, `${name.toUpperCase()}: ${stepResult.print()}`);
            return stepResult;
        };
        const exponentExpansion = doStep('Exponent expansion', input, (prev) => CalculatorExponentExpander.expand(prev));
        const distribution = doStep('Distribution', exponentExpansion, (prev) => CalculatorDistributor.distribute(prev, config === null || config === void 0 ? void 0 : config.debug));
        const commutation = doStep('Commutation', distribution, (prev) => CalculatorCommuter.commute(prev, config === null || config === void 0 ? void 0 : config.debug));
        const collection = doStep('Collection', commutation, (prev) => CalculatorCollector.collect(prev, config === null || config === void 0 ? void 0 : config.debug));
        const evaluation = doStep('Evaluation', collection, (prev) => CalculatorEvaluator.evaluate(prev));
        return evaluation;
    }
    static simplifyAndReformat(input, config, title) {
        const output = this.reformatStatement(input, config, title);
        this.log(config === null || config === void 0 ? void 0 : config.debug, `Simplifying ${output.print()}`);
        return CalculatorEvaluator.simplify(output);
    }
}
//# sourceMappingURL=statement-reformatter.js.map