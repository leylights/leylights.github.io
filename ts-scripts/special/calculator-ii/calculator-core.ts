import { CalculatorCollector } from "./statement/collector.js";
import { CalculatorTerm } from "./models/term.js";
import { CalculatorParser } from "./parser.js";
import { CalculatorView } from "./view.js";
import { CalculatorCommuter } from "./statement/commuter.js";
import { CalculatorDistributor } from "./statement/distributor.js";
import { CalculatorEvaluator } from "./statement/evaluator.js";
import { CalculatorFunction, CalculatorOperator } from "./models/function.js";

export class CalculatorCore {
  static calculate(input: string, debug?: boolean): string {
    const parser: CalculatorParser = new CalculatorParser(input, {
      debug: debug,
    });

    if (parser.isEquation)
      return this.calculateEquality(parser.leftOutput, parser.rightOutput);
    else
      return this.calculateStatement(parser.output).print();
  }

  private static calculateEquality(leftSide: CalculatorTerm, rightSide: CalculatorTerm) {
    if (!leftSide || !rightSide) throw new Error(`Bad equality: ${leftSide?.print()} = ${rightSide?.print()}`);
    let standardizedLeft: CalculatorTerm = new CalculatorFunction(leftSide, rightSide, CalculatorOperator.subtract);

    CalculatorView.logStep(standardizedLeft.print(), 'parsing', 'left - right');
    standardizedLeft = this.reformatStatement(standardizedLeft, true, 'left - right');
    
    return null;
  }

  private static calculateStatement(input: CalculatorTerm): CalculatorTerm {
    CalculatorView.logStep(input.print(), 'parsing');

    return this.reformatStatement(input, true);
  }

  /**
   * Reformats a statement or side of equality
   */
  private static reformatStatement(input: CalculatorTerm, log?: boolean, title?: string): CalculatorTerm {
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
