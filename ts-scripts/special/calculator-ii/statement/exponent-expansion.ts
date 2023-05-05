import { CalculatorComponent } from "../calculator-component";
import { CalculatorFunction, CalculatorOperator } from "../models/function";
import { CalculatorSingular } from "../models/singular";
import { CalculatorTerm } from "../models/term";
import { CalculatorUnaryFunction } from "../models/unary-function";
import { CalculatorValue } from "../models/value";
import { CalculatorParser } from "../parser";
import { CalculatorTester } from "../tester";

export class CalculatorExponentExpander extends CalculatorComponent {
  static expand(input: CalculatorTerm, debug?: boolean): CalculatorTerm {
    this.log(debug, `----- EXPONENT EXPANSION -----`);
    return this.expandRecurse(input, debug);
  }

  private static expandRecurse(input: CalculatorTerm, debug: boolean): CalculatorTerm {
    this.log(debug, `Expanding: ${input.print()}`);
    if (input instanceof CalculatorSingular) return input;
    else if (input instanceof CalculatorUnaryFunction) {
      input.parameter = this.expandRecurse(input.parameter, debug);
      return input;
    } else if (input instanceof CalculatorFunction) {
      switch (input.operator) {
        case CalculatorOperator.add:
        case CalculatorOperator.subtract:
        case CalculatorOperator.multiply:
        case CalculatorOperator.divide:
          input.leftTerm = this.expandRecurse(input.leftTerm, debug);
          input.rightTerm = this.expandRecurse(input.rightTerm, debug);
          return input;
        case CalculatorOperator.exponent:
          this.log(debug, `Exponent found in ${input.print()}`);
          if (input.rightTerm instanceof CalculatorValue) {
            if (input.rightTerm.value.isRealInteger()) {
              this.log(debug, `Integer exponent found in ${input.print()}`);
              const exponent: number = input.rightTerm.value.toRealNumber().nearestInteger;

              if (exponent === 0) return new CalculatorValue(0);

              const expandedLeftTerm: CalculatorTerm = this.expandRecurse(input.leftTerm, debug);

              let current: CalculatorTerm = expandedLeftTerm.clone();
              for (let i = 1; i < Math.abs(exponent); i++)
                current = new CalculatorFunction(current, expandedLeftTerm.clone(), CalculatorOperator.multiply);

              if (exponent > 0) return current;
              else return new CalculatorFunction(new CalculatorValue(1), current, CalculatorOperator.divide);
            } else {
              this.log(debug, `No expansion, exponent value is not real integer`);
              return input;
            }
          } else {
            input.leftTerm = this.expandRecurse(input.leftTerm, debug);
            input.rightTerm = this.expandRecurse(input.rightTerm, debug);
            return input;
          }
        default:
          throw new Error(`Bad operator ${input.operator} in: ${input.print()}`);
      }
    }

    throw new Error('Bad input given: ' + input.print());
  }

  static test() {
    const tester = new CalculatorTester<string>('Exponent Expander', (input: string, debug?: boolean) => {
      return CalculatorExponentExpander.expand(new CalculatorParser(input).output, debug).printSimple();
    });

    tester.test('x ^ 2', 'xx');
    tester.test('x ^ (3 / 2)', 'x^(3/2)');
    tester.test('(x - 2) ^ 2', '(x - 2)(x - 2)');
    // tester.test('(x * y) ^ (3 / 2)', ''); // handled by distributor

    tester.test('x ^ -2', '1/(xx)');
    tester.test('(1 + x) ^ 3', '(1 + x)(1 + x)(1 + x)');
  }
}
