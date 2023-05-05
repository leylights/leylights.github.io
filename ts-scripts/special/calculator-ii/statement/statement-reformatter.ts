import { CalculatorComponent } from "../calculator-component";
import { CalculatorTerm } from "../models/term";
import { CalculatorView } from "../view";
import { CalculatorCollector } from "./collector";
import { CalculatorCommuter } from "./commuter";
import { CalculatorDistributor } from "./distributor";
import { CalculatorEvaluator } from "./evaluator";
import { CalculatorExponentExpander } from "./exponent-expansion";

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
