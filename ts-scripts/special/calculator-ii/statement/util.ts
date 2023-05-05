import { CalculatorFunction, CalculatorOperator } from "../models/function";
import { CalculatorSingular } from "../models/singular";
import { CalculatorTerm } from "../models/term";
import { CalculatorUnaryFunction } from "../models/unary-function";

export class CalculatorUtil {
  static disjunctiveTermsCache = {};

  static getDisjunctiveTerms(
    input: CalculatorTerm,
    debug: boolean,
    conjunctionProcessor?: (input: CalculatorTerm, debug?: boolean) => CalculatorTerm
  ): { positives: CalculatorTerm[], negatives: CalculatorTerm[] } {
    if (this.disjunctiveTermsCache[input.print()]) return this.disjunctiveTermsCache[input.print()];

    const result = this.getDisjunctiveTermsRecurse(input, debug, conjunctionProcessor);
    this.disjunctiveTermsCache[input.print()] = result;
    return result;
  }

  private static getDisjunctiveTermsRecurse(input: CalculatorTerm, debug: boolean, conjunctionProcessor?: (input: CalculatorTerm, debug?: boolean) => CalculatorTerm): { positives: CalculatorTerm[], negatives: CalculatorTerm[] } {
    function exit(pos: CalculatorTerm[], neg: CalculatorTerm[]) {
      return { positives: pos, negatives: neg };
    }

    if (input instanceof CalculatorSingular || input instanceof CalculatorUnaryFunction)
      return exit([input], []);
    else if (input instanceof CalculatorFunction) {
      switch (input.operator) {
        case CalculatorOperator.add: {
          const leftTerms = this.getDisjunctiveTermsRecurse(input.leftTerm, debug, conjunctionProcessor);
          const rightTerms = this.getDisjunctiveTermsRecurse(input.rightTerm, debug, conjunctionProcessor);

          return exit(
            leftTerms.positives.concat(rightTerms.positives),
            leftTerms.negatives.concat(rightTerms.negatives),
          );
        }
        case CalculatorOperator.subtract: {
          const leftTerms = this.getDisjunctiveTermsRecurse(input.leftTerm, debug, conjunctionProcessor);
          const rightTerms = this.getDisjunctiveTermsRecurse(input.rightTerm, debug, conjunctionProcessor);

          return exit(
            leftTerms.positives.concat(rightTerms.negatives),
            leftTerms.negatives.concat(rightTerms.positives),
          );
        }
        case CalculatorOperator.multiply:
        case CalculatorOperator.divide:
        case CalculatorOperator.exponent:
        default:
          if (conjunctionProcessor) {
            input.leftTerm = conjunctionProcessor(input.leftTerm, debug);
            input.rightTerm = conjunctionProcessor(input.rightTerm, debug);
          }

          return exit([input], []); // multiplied terms are disjunct clauses
      }
    }
    throw new Error(`Bad input: ${input.print()}`);
  }

  /**
   * Applies the Extended Euclidean Algorithm to Numbers a, b to find their Certificate of Correctness and corresponding GCD
   * @param {Number} a 
   * @param {Number} b 
   * @returns {}
   */

  static EEA(a: number, b: number, stepEmitter?: (s: string) => void): { x: number, y: number, gcd: number } {
    let large: number, small: number;
    (a > b) ? large = a : large = b;
    (a <= b) ? small = a : small = b;

    const rows: EEARow[] = [];

    // EEA setup

    rows[0] = new EEARow(1, 0, large, null);
    rows[1] = new EEARow(0, 1, small, null);
    
    if (stepEmitter) stepEmitter(`Applying the Extended Euclidean Algorithm...`);
    if (stepEmitter) stepEmitter(`1, 0, ${large}, -`);
    if (stepEmitter) stepEmitter(`0, 1, ${small}, -`);

    // get the last row of the EEA

    const max = 25;

    function generateNextRow(last: EEARow, secondLast: EEARow): EEARow {
      const q = Math.floor(secondLast.r / last.r);
      const r = secondLast.r - q * last.r;
      const x = secondLast.x - q * last.x;
      const y = secondLast.y - q * last.y;

      return new EEARow(x, y, r, q);
    }

    for (let i = 0; i < max; i++) {
      const nextRow = generateNextRow(rows[rows.length - 1], rows[rows.length - 2]);

      if (nextRow.r === 0)
        break;
      else
        rows[rows.length] = nextRow;

      if (stepEmitter) stepEmitter(`${nextRow.x}, ${nextRow.y}, ${nextRow.r}, ${nextRow.q}`);

      if (i === max - 1) {
        console.error("EEA(" + a + ", " + b + ") exceeded maximum iterations");
        return;
      }
    }

    // output last row

    if (a > b)
      return { x: rows[rows.length - 1].x, y: rows[rows.length - 1].y, gcd: rows[rows.length - 1].r };
    else
      return { x: rows[rows.length - 1].y, y: rows[rows.length - 1].x, gcd: rows[rows.length - 1].r };
  }
}

class EEARow {
  x: number;
  y: number;
  r: number;
  q: number;

  constructor(x: number, y: number, remainder: number, q: number) {
    this.x = x;
    this.y = y;
    this.r = remainder;
    this.q = q;
  }
}
