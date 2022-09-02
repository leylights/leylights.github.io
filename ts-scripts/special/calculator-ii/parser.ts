import { cws } from "../../cws.js";
import { CalculatorComponent } from "./calculator-component.js";
import { CalculatorFunction, CalculatorOperator } from "./models/function.js";
import { CalculatorTerm } from "./models/term.js";
import { CalculatorValue } from "./models/value.js";
import { CalculatorVariable } from "./models/variable.js";
import { CalculatorTester } from "./tester.js";

export class CalculatorParser extends CalculatorComponent {
  readonly firstInput: string;

  private readonly _leftOutput: CalculatorTerm;
  private readonly _rightOutput: CalculatorTerm;

  static readonly acceptedVariables = new RegExp(/[a-zA-z]/g);

  constructor(input: string, config?: {
    debug?: boolean
  }) {
    super(config?.debug);
    this.log('-- Parsing --');

    this.firstInput = input;
    
    const parts = this.firstInput.split('=');
    if (parts.length >= 3) throw new Error('Too many equals signs');
    else if (parts.length === 2) {
      this._leftOutput = this.parse(parts[0]);
      this._rightOutput = this.parse(parts[1]);
    } else this._leftOutput = this.parse(this.firstInput);

    this.log('-----------');
  }

  get fullOutput(): string {
    if (this._rightOutput) return this._leftOutput.print() + '=' + this._rightOutput.print();
    else return this._leftOutput.print();
  }

  get isEquation(): boolean {
    return !!this._rightOutput;
  }

  get leftOutput(): CalculatorTerm {
    if (!this.isEquation) throw new Error('Not an equation');
    else return this._leftOutput;
  }

  get output(): CalculatorTerm {
    if (this.isEquation) throw new Error('Not a statement');
    else return this._leftOutput;
  }

  get rightOutput(): CalculatorTerm {
    if (!this.isEquation) throw new Error('Not an equation');
    else return this._rightOutput;
  }

  private parse(input: string): CalculatorTerm {
    const formattedInput = input.trim()
      .replace(/[[{]/g, '(')
      .replace(/[\]}]/g, ')')
      .replace(/\s/g, '');

    if (!CalculatorParser.areBracketsBalanced(formattedInput)) throw new Error('Brackets unbalanced');

    return this.parseRecurse(formattedInput);
  }

  private parseRecurse(input: string): CalculatorTerm {
    this.log(input);

    // add in brackets
    if (!CalculatorParser.areBracketsSurrounding(input))
      return this.parseRecurse('(' + input + ')');

    // find the leftmost operator not nested in brackets; split addition/subtraction before splitting multiply/divide before splitting exponents
    const nextOperatorIndex = this.getIndexOfNextOperator(input);

    if (nextOperatorIndex !== -1) { // term includes an operator
      const operator: CalculatorOperator = input[nextOperatorIndex] as CalculatorOperator;
      const lhs = input.substring(1, nextOperatorIndex);
      let rhs = input.substring(nextOperatorIndex + 1);
      rhs = rhs.substring(0, rhs.length - 1);

      this.log(`LHS: ${lhs}, RHS: ${rhs}, operator: ${operator}`);
      return new CalculatorFunction(this.parseRecurse(lhs), this.parseRecurse(rhs), operator);
    } else {
      // if only a value, return a value
      const isOnlyValue: boolean = !input.match(/[^0-9()-]/g);

      const sanitizedValue: string = input.split('').filter((c: string) => !('()'.includes(c))).join('');
      if (isOnlyValue) {
        this.log('Value found: ' + sanitizedValue);
        return new CalculatorValue(parseFloat(sanitizedValue));
      } else {
        this.log('Variable found: ' + sanitizedValue);
        return new CalculatorVariable(sanitizedValue);
      }
    }
  }

  private static areBracketsBalanced(input: string): boolean {
    let openParenthesisCount: number = 0;

    input.split('').forEach((char: string) => {
      if (char === '(') openParenthesisCount++;
      else if (char === ')') openParenthesisCount--;
    });

    return openParenthesisCount === 0;
  }

  private static areBracketsSurrounding(input: string): boolean {
    let openParenthesisCount: number = 0;

    for (const c of input) {
      if (c === '(') openParenthesisCount++;
      else if (c === ')') openParenthesisCount--;
      else if (openParenthesisCount === 0) return false; // any non-bracket character not surrounded by brackets
    }

    return true;
  }

  /**
   * @returns the index of the next operator to split, -1 if none exists 
   */
  private getIndexOfNextOperator(input: string) {
    let nextOperatorIndex: number = this.getIndexOfLeftmostOperator(input, [
      CalculatorOperator.add,
      CalculatorOperator.subtract
    ]);
    if (nextOperatorIndex === -1) nextOperatorIndex = this.getIndexOfLeftmostOperator(input, [
      CalculatorOperator.multiply,
      CalculatorOperator.divide
    ]);
    if (nextOperatorIndex === -1) nextOperatorIndex = this.getIndexOfLeftmostOperator(input, [
      CalculatorOperator.exponent,
    ]);

    return nextOperatorIndex;
  }

  /**
   * @returns the index of the leftmost operator not contained within any sub-terms
   */
  private getIndexOfLeftmostOperator(input: string, operators: CalculatorOperator[]): number {
    if (input[0] !== '(') throw new Error(`Bad input to getIndexOfLeftmostOperator: ${input} has no initial '('`);

    let openParenthesisCount: number = 0;
    const chars: string[] = input.split('');
    let isLHSNegative: boolean = false;

    for (let i = chars.length - 2; i > 0; i--) {
      this.log(chars[i]);
      if (chars[i] === ')') openParenthesisCount++;
      else if (chars[i] === '(') openParenthesisCount--;
      else if (openParenthesisCount === 0) {
        // negation handling: test against all operators
        if (cws.Array.contains(CalculatorFunction.operators, chars[i]) && chars[i] !== CalculatorOperator.subtract) {
          isLHSNegative = false;
        }

        // test against searched-for operators
        if (cws.Array.contains(operators, chars[i])) {
          if (chars[i] === CalculatorOperator.subtract) {
            // '-' is only subtract if its left character is a number or variable or ')'.  Otherwise treat it as negation, UNLESS the LHS is already negated
            if (
              (chars[i - 1] === ')'
                || chars[i - 1].match(/[0-9]/) !== null
                || chars[i - 1].match(CalculatorParser.acceptedVariables) !== null
                || isLHSNegative)
              && (chars[i - 1] !== CalculatorOperator.exponent)) {
              this.log(`Found subtraction symbol ${chars[i]} at ${i} with left char ${chars[i - 1]} and LHS ${isLHSNegative ? 'negative' : 'positive'}`);

              return i;
            }
            else {
              isLHSNegative = true;
            }
          } else return i;
        }
      }
    }


    return -1;
  }

  static test() {
    const tester = new CalculatorTester<string>('Parser', (input: string, debug?: boolean) => {
      return new CalculatorParser(input, { debug: debug }).fullOutput;
    });

    tester.test('((1))', '1');

    tester.test('2*4', '(2 * 4)');
    tester.test('-2*4', '(-2 * 4)');
    tester.test('2*-4', '(2 * -4)');
    tester.test('-2*-4', '(-2 * -4)');

    tester.test('-2-4-3', '((-2 - 4) - 3)');
    tester.test('-2-4/3', '(-2 - (4 / 3))');
    tester.test('5 - -3', '(5 - -3)');
    tester.test('5--3', '(5 - -3)');

    tester.test('5 - -x', '(5 - -x)');
    tester.test('x--x', '(x - -x)');
    tester.test('y*(-x+3/(y+-2))', '(y * (-x + (3 / (y + -2))))');
    tester.test('2^3', '(2 ^ 3)');

    tester.test('3/2^4+5', '((3 / (2 ^ 4)) + 5)');
    tester.test('(3/2)^4+5', '(((3 / 2) ^ 4) + 5)');
    tester.test('(3/2)^4+5/3', '(((3 / 2) ^ 4) + (5 / 3))');
    tester.test('2^-3', '(2 ^ -3)');

    tester.test('(2)^(-3)', '(2 ^ -3)');
    tester.test('3^4^5', '((3 ^ 4) ^ 5)');
    tester.test('3^(4*5)^6', '((3 ^ (4 * 5)) ^ 6)');

    tester.test('1+2+3', '((1 + 2) + 3)');
    tester.test('1-2-3', '((1 - 2) - 3)');
    tester.test('1-2--3', '((1 - 2) - -3)');
    tester.test('1/2/2', '((1 / 2) / 2)');
  }
}
