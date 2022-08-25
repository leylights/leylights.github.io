import { cws } from "../../cws.js";
import { MathNum } from "../../tools/math/number.js";
import { CalculatorFunction, CalculatorOperator } from "./models/function.js";
import { CalculatorSingular } from "./models/singular.js";
import { CalculatorTerm } from "./models/term.js";
import { CalculatorValue } from "./models/value.js";
import { CalculatorVariable } from "./models/variable.js";
import { CalculatorParser } from "./parser.js";
import { CalculatorTester } from "./tester.js";

export class CalculatorCollector {
  /**
   * Invariant: input has been commuted
   */
  static collect(input: CalculatorTerm, debug?: boolean): CalculatorTerm {
    this.log(debug, `original input: ${input.print()}`);
    return this.collectRecurse(input, debug);
  }

  private static collectRecurse(input: CalculatorTerm, debug: boolean): CalculatorTerm {
    const terms = this.getDisjunctiveTerms(input, debug);
    this.log(debug, `
    input: ${input.print()},
    + terms: ${terms.positives.map((t) => t.print()).join(', ')};
    - terms: ${terms.negatives.map((t) => t.print()).join(', ')} `);

    const filteredTerms = {
      values: {
        positives: [],
        negatives: [],
        coefficient: new CalculatorValue(1),
        result: null
      }
    };

    const filter = (type: 'positives' | 'negatives') => {
      terms[type].forEach((t: CalculatorTerm) => {
        if (t instanceof CalculatorValue)
          filteredTerms.values[type].push(t);
        else if (t instanceof CalculatorVariable) { // just 'x'
          if (!filteredTerms[t.print()])
            filteredTerms[t.print()] = { positives: [], negatives: [], coefficient: t, result: null };

          filteredTerms[t.print()][type].push(new CalculatorValue(1));
        } else if (t instanceof CalculatorFunction) {
          if (!filteredTerms[t.rightTerm.print()])
            filteredTerms[t.rightTerm.print()] = { positives: [], negatives: [], coefficient: t.rightTerm, result: null };

          filteredTerms[t.rightTerm.print()][type].push(t.leftTerm);
        }
      });
    }

    this.log(debug, `filtered terms:`);
    this.log(debug, filteredTerms);

    filter('positives');
    filter('negatives');

    let output: CalculatorTerm = null;

    for (const entry of cws.Object.entries(filteredTerms)) {
      const positives: CalculatorTerm[] = entry[1].positives;
      const negatives: CalculatorTerm[] = entry[1].negatives;
      const coefficient: CalculatorTerm = entry[1].coefficient;

      let evaluatorTerm: CalculatorTerm = null;
      for (const p of positives) evaluatorTerm = evaluatorTerm ? new CalculatorFunction(evaluatorTerm, p, CalculatorOperator.add) : p;
      for (const n of negatives) evaluatorTerm = evaluatorTerm ? new CalculatorFunction(evaluatorTerm, n, CalculatorOperator.subtract) : n;

      if (!evaluatorTerm) continue; // no data for this coefficient (e.g. (x * y) has no data for numerical values)

      let result: CalculatorTerm;
      if (coefficient instanceof CalculatorValue) // values coefficient of 1
        result = evaluatorTerm;
      else if (evaluatorTerm instanceof CalculatorValue && evaluatorTerm.value.isEqualTo(MathNum.ONE))
        result = coefficient;
      else
        result = new CalculatorFunction(evaluatorTerm, coefficient, CalculatorOperator.multiply);

      this.log(debug, `${coefficient.print()}: ${result.print()}`);

      if (!output) output = result;
      else output = new CalculatorFunction(output, result, positives.length > 0 ? CalculatorOperator.add : CalculatorOperator.subtract);
    }

    this.log(debug, `output: ${output.print()}`);

    return output;
  }

  private static getDisjunctiveTerms(input: CalculatorTerm, debug: boolean): { positives: CalculatorTerm[], negatives: CalculatorTerm[] } {
    function exit(pos: CalculatorTerm[], neg: CalculatorTerm[]) {
      return { positives: pos, negatives: neg };
    }

    if (input instanceof CalculatorSingular)
      return exit([input], []);
    else if (input instanceof CalculatorFunction) {
      switch (input.operator) {
        case CalculatorOperator.add: {
          const leftTerms = this.getDisjunctiveTerms(input.leftTerm, debug);
          const rightTerms = this.getDisjunctiveTerms(input.rightTerm, debug);

          return exit(
            leftTerms.positives.concat(rightTerms.positives),
            leftTerms.negatives.concat(rightTerms.negatives),
          );
        }
        case CalculatorOperator.subtract: {
          const leftTerms = this.getDisjunctiveTerms(input.leftTerm, debug);
          const rightTerms = this.getDisjunctiveTerms(input.rightTerm, debug);

          return exit(
            leftTerms.positives.concat(rightTerms.negatives),
            leftTerms.negatives.concat(rightTerms.positives),
          );
        }
        case CalculatorOperator.multiply:
        case CalculatorOperator.divide:
        case CalculatorOperator.exponent:
        default:
          input.leftTerm = this.collectRecurse(input.leftTerm, debug);
          input.rightTerm = this.collectRecurse(input.rightTerm, debug);

          return exit([input], []); // multiplied terms are disjunct clauses
      }
    }
    throw new Error(`Bad input: ${input.print()}`);
  }

  static log(debug: boolean, message: any) {
    if (debug) console.log(message);
  }

  static test() {
    const tester = new CalculatorTester('Collector', (input: string, debug?: boolean) => {
      return CalculatorCollector.collect(new CalculatorParser(input).output, debug).print();
    });

    tester.test('(3 * x)', '(3 * x)');
    tester.test('((3 * x) + (4 * x))', '((3 + 4) * x)');
    tester.test('((1 * x) + (1 * x))', '((1 + 1) * x)');
    tester.test('(x + x)', '((1 + 1) * x)');
    tester.test('(2 + 2)', '(2 + 2)');
    tester.test('(((3 * x) + (4 * x)) + (5 * x))', '(((3 + 4) + 5) * x)');
    tester.test('(((3 * x) - (4 * x)) + (5 * x))', '(((3 + 5) - 4) * x)');

    tester.test('(((3 * x) + (4 * y)) + (5 * x))', '(((3 + 5) * x) + (4 * y))');
    tester.test('(((3 * x) - (4 * y)) + (5 * x))', '(((3 + 5) * x) - (4 * y))');

    tester.test('((3 * 4) * x)', '((3 * 4) * x)');
    tester.test('(1 * (x ^ y))', '(1 * (x ^ y))');
    
    tester.test('(((3 * (x ^ y)) - (5 * (y ^ x))) + (4 * (x ^ y)))', '(((3 + 4) * (x ^ y)) + (5 * (y ^ x)))');

    tester.test('5 + 3*x - 3', '((3 * x) - 2)');
  }
}
