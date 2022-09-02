import { CalculatorCollector } from "./statement/collector.js";
import { CalculatorTerm } from "./models/term.js";
import { CalculatorParser } from "./parser.js";
import { CalculatorView } from "./view.js";
import { CalculatorCommuter } from "./statement/commuter.js";
import { CalculatorDistributor } from "./statement/distributor.js";
import { CalculatorEvaluator } from "./statement/evaluator.js";
import { CalculatorFunction, CalculatorOperator } from "./models/function.js";
import { CalculatorExponentExpander } from "./statement/exponent-expansion.js";

interface Config {
  debug: boolean,
  clearPrint: boolean
}

export class CalculatorCore {
  static calculate(input: string, config: Config): string {
    const parser: CalculatorParser = new CalculatorParser(input, config);

    if (parser.isEquation)
      return this.calculateEquality(parser.leftOutput, parser.rightOutput, config);
    else
      return this.calculateStatement(parser.output, config).print();
  }

  private static calculateEquality(leftSide: CalculatorTerm, rightSide: CalculatorTerm, config: Config) {
    if (!leftSide || !rightSide) throw new Error(`Bad equality: ${leftSide?.print()} = ${rightSide?.print()}`);
    let standardizedLeft: CalculatorTerm = new CalculatorFunction(leftSide, rightSide, CalculatorOperator.subtract);

    CalculatorView.logStep(standardizedLeft.print(config.clearPrint), 'parsing', 'left - right');
    standardizedLeft = this.reformatStatement(standardizedLeft, config, true, 'left - right');

    return null;
  }

  private static calculateStatement(input: CalculatorTerm, config: Config): CalculatorTerm {
    CalculatorView.logStep(input.print(config.clearPrint), 'parsing');

    return this.reformatStatement(input, config, true);
  }

  /**
   * Reformats a statement or side of equality
   */
  private static reformatStatement(input: CalculatorTerm, config: Config, log?: boolean, title?: string): CalculatorTerm {
    const exponentExpansion = CalculatorExponentExpander.expand(input);
    if (log) CalculatorView.logStep(exponentExpansion.print(config.clearPrint), 'exponent expansion', title);

    const distribution = CalculatorDistributor.distribute(exponentExpansion);
    if (log) CalculatorView.logStep(distribution.print(config.clearPrint), 'distribution', title);

    const commutation = CalculatorCommuter.commute(distribution);
    if (log) CalculatorView.logStep(commutation.print(config.clearPrint), 'commutation', title);

    const collection = CalculatorCollector.collect(commutation);
    if (log) CalculatorView.logStep(collection.print(config.clearPrint), 'collection', title);

    const evaluation = CalculatorEvaluator.evaluate(collection);
    if (log) CalculatorView.logStep(evaluation.print(config.clearPrint), 'evaluation', title);

    return evaluation;
  }
}
