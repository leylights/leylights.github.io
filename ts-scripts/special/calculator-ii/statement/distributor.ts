import { CalculatorComponent } from "../calculator-component.js";
import { CalculatorFunction, CalculatorOperator } from "../models/function.js";
import { CalculatorTerm } from "../models/term.js";
import { CalculatorValue } from "../models/value.js";
import { CalculatorVariable } from "../models/variable.js";
import { CalculatorParser } from "../parser.js";
import { CalculatorTester } from "../tester.js";

export class CalculatorDistributor extends CalculatorComponent {
  static recursiveCalls: number = 0;
  static totalCalls: number = 0;

  static distribute(input: CalculatorTerm, debug?: boolean): CalculatorTerm {
    this.totalCalls++;
    if (debug && this.totalCalls > 100) throw new Error('too many calls');
    this.recursiveCalls = 0;
    this.log(debug, '-------- DISTRIBUTE ---------')
    return this.distributeRecurse(input, debug, 0);
  }

  private static distributeRecurse(input: CalculatorTerm, debug: boolean, depth: number): CalculatorTerm {
    this.recursiveCalls++;
    if (this.recursiveCalls > 4000) throw new Error('LOOP.');

    let space = '';
    for (let i = 0; i < depth; i++) space += ' ';

    // this.log(debug, `Distribute calls: ${this.recursiveCalls}`);
    if (input instanceof CalculatorFunction) this.log(debug, `Distribute start: ${space}${input.print(true, depth)}`);

    if (input instanceof CalculatorValue) return input;
    else if (input instanceof CalculatorVariable) return input;
    else if (input instanceof CalculatorFunction) {
      // distribute at innermost segment first
      input.leftTerm = this.distributeRecurse(input.leftTerm, debug, depth + 1);
      input.rightTerm = this.distributeRecurse(input.rightTerm, debug, depth + 1);

      const exitWithoutDistributing = (reason?: string) => {
        this.log(debug, `No distribution : ${space}${input.print(true, depth)}`);
        if (reason) this.log(debug, ` Reason: ${reason}`);

        return input;
      }

      const exitRecurse = (left: CalculatorTerm, right: CalculatorTerm, operator: CalculatorOperator) => {
        this.log(debug, `Distributed from: ${space}${input.print()}`);

        const output = new CalculatorFunction(
          left, right, operator
        );

        this.log(debug, `Distributed to  : ${space}${output.print(true, depth)}`);

        return this.distributeRecurse(output, debug, depth + 5);
      }

      switch (input.operator) {
        case CalculatorOperator.add:
        case CalculatorOperator.subtract:
          return exitWithoutDistributing('+- operator');
        case CalculatorOperator.multiply:
        case CalculatorOperator.divide: {
          if (input.rightTerm instanceof CalculatorFunction && input.leftTerm instanceof CalculatorFunction) { // (w [+-*/^] x) [*/] (y [+-*/^] z)
            if (input.operator === CalculatorOperator.multiply) { // (w [+-*/^] x) * (y [+-*/^] z)
              switch (input.leftTerm.operator) {
                case CalculatorOperator.add:
                case CalculatorOperator.subtract: // (w [+-] x) * (y [+-*/^] z)
                  switch (input.rightTerm.operator) {
                    case CalculatorOperator.add:
                    case CalculatorOperator.subtract: // (w [+-] x) * (y [+-] z)
                      return exitRecurse(
                        new CalculatorFunction(input.leftTerm, input.rightTerm.leftTerm, CalculatorOperator.multiply),
                        new CalculatorFunction(input.leftTerm, input.rightTerm.rightTerm, CalculatorOperator.multiply),
                        input.rightTerm.operator
                      );
                    case CalculatorOperator.multiply:
                    case CalculatorOperator.divide: // (w [+-] x) * (y [*/] z)
                      return exitRecurse(
                        new CalculatorFunction(input.leftTerm.leftTerm, input.rightTerm, CalculatorOperator.multiply),
                        new CalculatorFunction(input.leftTerm.rightTerm, input.rightTerm, CalculatorOperator.multiply),
                        input.leftTerm.operator
                      );
                    case CalculatorOperator.exponent: // (w [+-] x) * (y ^ z)
                      return exitRecurse(
                        new CalculatorFunction(input.leftTerm.leftTerm, input.rightTerm, CalculatorOperator.multiply),
                        new CalculatorFunction(input.leftTerm.rightTerm, input.rightTerm, CalculatorOperator.multiply),
                        input.leftTerm.operator
                      );
                  }
                case CalculatorOperator.multiply:
                case CalculatorOperator.divide: // (w [*/] x) * (y [+-*/^] z)
                  switch (input.rightTerm.operator) {
                    case CalculatorOperator.add:
                    case CalculatorOperator.subtract: // (w [*/] x) * (y [+-] z)
                      return exitRecurse(
                        new CalculatorFunction(input.leftTerm, input.rightTerm.leftTerm, CalculatorOperator.multiply),
                        new CalculatorFunction(input.leftTerm, input.rightTerm.rightTerm, CalculatorOperator.multiply),
                        input.rightTerm.operator
                      );
                    case CalculatorOperator.multiply:
                    case CalculatorOperator.divide: // (w [*/] x) * (y [*/] z)
                      return exitWithoutDistributing('(w [*/] x) * (y [*/] z)'); // no need to distribute
                    case CalculatorOperator.exponent: // (w [*/] x) * (y ^ z)
                      return exitWithoutDistributing('(w [*/] x) * (y ^ z)'); // no need to distribute
                  }
                case CalculatorOperator.exponent:
                  switch (input.rightTerm.operator) {
                    case CalculatorOperator.add:
                    case CalculatorOperator.subtract: // (w ^ x) * (y [+-] z)
                      return exitRecurse(
                        new CalculatorFunction(input.leftTerm, input.rightTerm.leftTerm, CalculatorOperator.multiply),
                        new CalculatorFunction(input.leftTerm, input.rightTerm.rightTerm, CalculatorOperator.multiply),
                        input.rightTerm.operator
                      );
                    case CalculatorOperator.multiply:
                    case CalculatorOperator.divide: // (w ^ x) * (y [*/] z)
                      return exitWithoutDistributing('(w ^ x) * (y [*/] z)');
                    case CalculatorOperator.exponent: // (w ^ x) * (y ^ z)
                      if (input.leftTerm.leftTerm.equals(input.rightTerm.leftTerm)) // same base: (w ^ x) * (w ^ z)
                        return exitRecurse(
                          input.leftTerm.leftTerm,
                          new CalculatorFunction(
                            input.leftTerm.rightTerm,
                            input.rightTerm.rightTerm,
                            CalculatorOperator.add,
                          ),
                          CalculatorOperator.exponent
                        );
                      else exitWithoutDistributing('(w ^ x) * (y ^ z) where w != y');
                  }
                  return exitWithoutDistributing('(w ^ x) * (y [+-*/^] z)'); // can't distribute
              }
            } else { // (w [+-*/^] x) / (y [+-*/^] z)
              switch (input.leftTerm.operator) {
                case CalculatorOperator.add:
                case CalculatorOperator.subtract: // (w [+-] x) / (y [+-*/^] z)
                  return exitRecurse(
                    new CalculatorFunction(input.leftTerm.leftTerm, input.rightTerm, CalculatorOperator.divide),
                    new CalculatorFunction(input.leftTerm.rightTerm, input.rightTerm, CalculatorOperator.divide),
                    input.leftTerm.operator
                  );
                case CalculatorOperator.multiply:
                case CalculatorOperator.divide: // 
                  return exitWithoutDistributing('(w [*/] x) / (y [+-*/^] z)'); // no need to distribute
                case CalculatorOperator.exponent: // w^x / (y [+-*/^] z)
                  if (input.rightTerm.operator === CalculatorOperator.exponent && input.leftTerm.leftTerm.equals(input.rightTerm.leftTerm)) {
                    return exitRecurse( // (w ^ x) / (w ^ z)
                      input.leftTerm.leftTerm,
                      new CalculatorFunction(
                        input.leftTerm.rightTerm,
                        input.rightTerm.rightTerm,
                        CalculatorOperator.subtract
                      ),
                      CalculatorOperator.exponent
                    )
                  } else return exitWithoutDistributing('(w ^ x) / (y [+-*/] z)'); // no need to distribute
              }
            }
          } else if (input.rightTerm instanceof CalculatorFunction) { // [3x] [*/] (4 [+-*/^] 5)
            switch (input.rightTerm.operator) {
              case CalculatorOperator.add:
              case CalculatorOperator.subtract:
                if (input.operator === CalculatorOperator.multiply) // x(y [+-] z) = xy [+-] xz
                  return exitRecurse(
                    new CalculatorFunction(input.leftTerm, input.rightTerm.leftTerm, CalculatorOperator.multiply),
                    new CalculatorFunction(input.leftTerm, input.rightTerm.rightTerm, CalculatorOperator.multiply),
                    input.rightTerm.operator
                  );
                else if (input.operator === CalculatorOperator.divide)
                  return exitWithoutDistributing('s/(y [+-] z) != s/y [+-] x/z');
              case CalculatorOperator.multiply:
              case CalculatorOperator.divide:
              case CalculatorOperator.exponent:
                return exitWithoutDistributing('s / (y [*/^] z)');
            }
          } else if (input.leftTerm instanceof CalculatorFunction) { // (x [+-*/^] y) [*/] [3x] 
            switch (input.leftTerm.operator) {
              case CalculatorOperator.add:
              case CalculatorOperator.subtract: // (x [+-] y) [*/] [3x] 
                this.log(debug, `exited: lhs +-, rhs non-function`);
                return exitRecurse(
                  new CalculatorFunction(input.leftTerm.leftTerm, input.rightTerm, input.operator),
                  new CalculatorFunction(input.leftTerm.rightTerm, input.rightTerm, input.operator),
                  input.leftTerm.operator
                );
              case CalculatorOperator.multiply:// (2*3) * 4 != (2*3)*(3*4)
              case CalculatorOperator.divide:// (1/2) / 3 != (1/2)/(1/3)
              case CalculatorOperator.exponent:// can't distribute into exponents
                return exitWithoutDistributing(`(x [${input.leftTerm.operator} in */^] y) [*/] [3x]: input is ${input.print()}`);
              default: throw new Error(`Bad operator: ${input.leftTerm.operator}`)
            }
          }
        }
        case CalculatorOperator.exponent:
          if (input.leftTerm instanceof CalculatorFunction) {
            if (input.leftTerm.operator === CalculatorOperator.multiply || input.leftTerm.operator === CalculatorOperator.divide) {
              return exitRecurse(
                new CalculatorFunction(input.leftTerm.leftTerm, input.rightTerm, input.operator),
                new CalculatorFunction(input.leftTerm.rightTerm, input.rightTerm, input.operator),
                input.leftTerm.operator
              );
            } else if (input.leftTerm.operator === CalculatorOperator.exponent) { // ((x ^ y) ^ z) -> (x ^ (y * z))
              return exitRecurse(
                input.leftTerm.leftTerm,
                new CalculatorFunction(input.leftTerm.rightTerm, input.rightTerm, CalculatorOperator.multiply),
                CalculatorOperator.exponent
              );
            } else return exitWithoutDistributing('(j [+-] k) ^ (l +-*/^ m)');
          } else {
            // can ONLY distribute exponents when the left side is a function
            return exitWithoutDistributing('s ^ (l +-*/^ m)');
          }
      }
    }
  }

  static test() {
    const tester = new CalculatorTester<string>('Distributor', (input: string, debug?: boolean, clearPrint?: boolean) => {
      return CalculatorDistributor.distribute(new CalculatorParser(input).output, debug).print(clearPrint);
    });

    tester.test('5 * (3 + 4)', '((5 * 3) + (5 * 4))');
    tester.test('5 / (3 + 4)', '(5 / (3 + 4))');
    tester.test('(3 + 4) * 5', '((3 * 5) + (4 * 5))');
    tester.test('(3 + 4) / 5', '((3 / 5) + (4 / 5))');

    tester.test('((3 ^ 3) * (4 ^ 3))', '((3 ^ 3) * (4 ^ 3))');
    tester.test('((3 ^ 3) / (4 ^ 3))', '((3 ^ 3) / (4 ^ 3))');

    tester.test('(3 + 4)^3', '((3 + 4) ^ 3)');
    tester.test('(3 * 4)^3', '((3 ^ 3) * (4 ^ 3))');
    tester.test('3^(3 + 4)', '(3 ^ (3 + 4))');
    tester.test('3^(3 * 4)', '(3 ^ (3 * 4))');

    tester.test('(3 * 4)^x', '((3 ^ x) * (4 ^ x))');
    tester.test('(3 * 4)^(5+6)', '((3 ^ (5 + 6)) * (4 ^ (5 + 6)))');
    tester.test('(3 / 4)^x', '((3 ^ x) / (4 ^ x))');
    tester.test('(3 / 4)^(5+6)', '((3 ^ (5 + 6)) / (4 ^ (5 + 6)))');

    tester.test('3 * (3 * x)', '(3 * (3 * x))');

    tester.test('(3 ^ 4) ^ 5', '(3 ^ (4 * 5))');
    tester.test('3 ^ (4 ^ 5)', '(3 ^ (4 ^ 5))');

    tester.test('x * (3 - 4)', '((x * 3) - (x * 4))');

    // tester.test('3 / (1 / 2)', '((3 * 2) / 1)');
    tester.test('3 / (1 / 2)', '(3 / (1 / 2))');

    tester.test('(x+ 2) * (y - 4)', '(((x * y) + (2 * y)) - ((x * 4) + (2 * 4)))');
    tester.test('(x+ 2) * (y - 4)', '(((x * y) + (2 * y)) - ((x * 4) + (2 * 4)))');

    tester.test('3*(x*y)', '(3 * (x * y))');

    tester.test('5^x*(3+4)', '(((5 ^ x) * 3) + ((5 ^ x) * 4))');
    tester.test('5^x*5^y', '(5 ^ (x + y))');
    tester.test('5^x/5^y', '(5 ^ (x - y))');

    // tester.test('((x-2)*(x-3))*(x-4)', '((((x ^ 3) - (9 * (x ^ 2))) + (26 * x)) - 24)');
    tester.test('(x+2)*(x+3)', '(((x * x) + (2 * x)) + ((x * 3) + (2 * 3)))');
    tester.test(
      '(((x * x) + (2 * x)) + ((3 * x) + (2 * 3)))*(x+4)',
      '(((((x * x) * x) + ((2 * x) * x)) + (((3 * x) * x) + ((2 * 3) * x))) + ((((x * x) * 4) + ((2 * x) * 4)) + (((3 * x) * 4) + ((2 * 3) * 4))))'
    );
    tester.test(
      '((x+2)*(x+3))*(x+4)',
      '(((((x * x) * x) + ((2 * x) * x)) + (((x * 3) * x) + ((2 * 3) * x))) + ((((x * x) * 4) + ((2 * x) * 4)) + (((x * 3) * 4) + ((2 * 3) * 4))))'
    );
  }
}
