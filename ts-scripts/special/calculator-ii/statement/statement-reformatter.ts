import { CalculatorComponent } from "../calculator-component.js";
import { CalculatorTerm } from "../models/term.js";
import { CalculatorView } from "../view.js";
import { CalculatorCollector } from "./collector.js";
import { CalculatorCommuter } from "./commuter.js";
import { CalculatorDistributor } from "./distributor.js";
import { CalculatorEvaluator } from "./evaluator.js";
import { CalculatorExponentExpander } from "./exponent-expansion.js";

interface Config {
  log?: boolean,
  debug?: boolean,
}

export class CalculatorStatementReformatter extends CalculatorComponent {
  static readonly DEBUGS = {
    exponents: true,
    distribution: false,
    commutation: false,
    collection: false,
  }

  /**
   * Reformats a statement or side of equality
   */
  static reformatStatement(input: CalculatorTerm, config?: Config, title?: string): CalculatorTerm {
    const doStep = (name: string, previousStep: CalculatorTerm, step: (input: CalculatorTerm) => CalculatorTerm) => {
      const stepResult = step(previousStep);
      if (config?.log) CalculatorView.logStep(stepResult.printHTML(), name, title);
      if (config?.debug) this.log(config.debug, `${name.toUpperCase()}: ${stepResult.print()}`);
      return stepResult;
    }

    const exponentExpansion = doStep('Exponent expansion', input, (prev) => CalculatorExponentExpander.expand(prev, config?.debug && this.DEBUGS.exponents));
    const distribution = doStep('Distribution', exponentExpansion, (prev) => CalculatorDistributor.distribute(prev, config?.debug && this.DEBUGS.distribution));
    const commutation = doStep('Commutation', distribution, (prev) => CalculatorCommuter.commute(prev, config?.debug && this.DEBUGS.commutation));
    const collection = doStep('Collection', commutation, (prev) => CalculatorCollector.collect(prev, config?.debug && this.DEBUGS.collection));
    const evaluation = doStep('Evaluation', collection, (prev) => CalculatorEvaluator.evaluate(prev));

    return evaluation;
  }

  static simplifyAndReformat(input: CalculatorTerm, config?: Config, title?: string): CalculatorTerm {
    const output = this.reformatStatement(input, config, title);
    this.log(config?.debug, `Simplifying ${output.print()}`);

    return CalculatorEvaluator.simplify(output);
  }
}
