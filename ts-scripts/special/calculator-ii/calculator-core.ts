import { CalculatorCollector } from "./statement/collector.js";
import { CalculatorTerm } from "./models/term.js";
import { CalculatorParser } from "./parser.js";
import { CalculatorView } from "./view.js";
import { CalculatorCommuter } from "./statement/commuter.js";
import { CalculatorDistributor } from "./statement/distributor.js";
import { CalculatorEvaluator } from "./statement/evaluator.js";
import { CalculatorFunction, CalculatorOperator } from "./models/function.js";
import { CalculatorExponentExpander } from "./statement/exponent-expansion.js";
import { CalculatorSolver } from "./equation/solver.js";
import { CalculatorTester } from "./tester.js";

interface Config {
  debug: boolean,
  showSteps?: boolean,
  clearPrint?: boolean
}

interface Result {
  result: string,
  HTMLResult: string
}

export class CalculatorCore {
  static calculate(input: string, config: Config): Result {
    const parser: CalculatorParser = new CalculatorParser(input, config);

    if (parser.isEquation)
      return this.calculateEquality(parser.leftOutput, parser.rightOutput, config);
    else {
      const result = this.calculateStatement(parser.output, config);
      return {
        result: result.print(),
        HTMLResult: result.printHTML(),
      }
    }
  }

  private static calculateEquality(leftSide: CalculatorTerm, rightSide: CalculatorTerm, config: Config) {
    if (!leftSide || !rightSide) throw new Error(`Bad equality: ${leftSide?.print()} = ${rightSide?.print()}`);
    let standardizedLeft: CalculatorTerm = new CalculatorFunction(leftSide, rightSide, CalculatorOperator.subtract);

    CalculatorView.logStep(standardizedLeft.printHTML(), 'parsing');
    standardizedLeft = this.reformatStatement(standardizedLeft, config, true);

    const solution = CalculatorSolver.solve(standardizedLeft, { debug: config.debug, emitSteps: config.showSteps });

    return solution;
  }

  private static calculateStatement(input: CalculatorTerm, config: Config): CalculatorTerm {
    CalculatorView.logStep(input.printHTML(), 'parsing');

    return this.reformatStatement(input, config, true);
  }

  /**
   * Reformats a statement or side of equality
   */
  private static reformatStatement(input: CalculatorTerm, config: Config, log?: boolean, title?: string): CalculatorTerm {
    const exponentExpansion = CalculatorExponentExpander.expand(input);
    if (log) CalculatorView.logStep(exponentExpansion.printHTML(), 'exponent expansion', title);

    const distribution = CalculatorDistributor.distribute(exponentExpansion);
    if (log) CalculatorView.logStep(distribution.printHTML(), 'distribution', title);

    const commutation = CalculatorCommuter.commute(distribution);
    if (log) CalculatorView.logStep(commutation.printHTML(), 'commutation', title);

    const collection = CalculatorCollector.collect(commutation);
    if (log) CalculatorView.logStep(collection.printHTML(), 'collection', title);

    const evaluation = CalculatorEvaluator.evaluate(collection);
    if (log) CalculatorView.logStep(evaluation.printHTML(), 'evaluation', title);

    return evaluation;
  }

  static test() {
    const tester = new CalculatorTester<string>('Core', (input: string, debug?: boolean) => {
      return CalculatorCore.calculate(input, { debug: debug }).result;
    });

    tester.test('3/2*x+y=0', 'x = ((0 - y) / 3/2)');
    tester.test('5^x+5^y=1', 'x = (log((1 - (5 ^ y))) / 0.69897)');

    tester.test('34=d^3', 'd = 3.23961');
  }
}
