import { MathNum } from "../../../tools/math/number";
import { CalculatorComponent } from "../calculator-component";
import { CalculatorFunction, CalculatorOperator } from "../models/function";
import { CalculatorLogarithmFunction } from "../models/logarithm";
import { CalculatorSingular } from "../models/singular";
import { CalculatorTerm } from "../models/term";
import { CalculatorValue } from "../models/value";
import { CalculatorVariable } from "../models/variable";
import { CalculatorParser } from "../parser";
import { CalculatorTester } from "../tester";
import { CalculatorEvaluator } from "./evaluator";

export class CalculatorLogarithmDistributor extends CalculatorComponent {
  static distribute(input: CalculatorTerm): CalculatorTerm {
    if (input instanceof CalculatorVariable) return input;
    else if (input instanceof CalculatorValue) return input;
    else if (input instanceof CalculatorLogarithmFunction) {
      if (input.parameter instanceof CalculatorSingular) return input;
      else if (input.parameter instanceof CalculatorLogarithmFunction) return input;
      else if (input.parameter instanceof CalculatorFunction) {
        switch (input.parameter.operator) {
          case CalculatorOperator.add: // ln(x +- y)
            if (
              input.parameter.leftTerm instanceof CalculatorValue
              && input.parameter.leftTerm.value.isEqualTo(MathNum.ZERO)
            ) { // ln(0 + x) = ln(x)
              return this.distribute(new CalculatorLogarithmFunction(input.parameter.rightTerm));
            } else if (
              input.parameter.rightTerm instanceof CalculatorValue
              && input.parameter.rightTerm.value.isEqualTo(MathNum.ZERO)
            ) { // ln(x + 0) = ln(x)
              return this.distribute(new CalculatorLogarithmFunction(input.parameter.leftTerm));
            } else return input;
          case CalculatorOperator.subtract:
            if (
              input.parameter.leftTerm instanceof CalculatorValue
              && input.parameter.leftTerm.value.isEqualTo(MathNum.ZERO)
            ) { // ln(0 - x) = ln(-1*x)
              const invertedParameter = this.invertTermSign(input.parameter.rightTerm);
              if (invertedParameter)
                return this.distribute(new CalculatorLogarithmFunction(invertedParameter));
              else {
                input.parameter = this.distribute(new CalculatorFunction(
                  new CalculatorValue(-1),
                  input.parameter.rightTerm,
                  CalculatorOperator.multiply
                ));
                return input;
              }
            } else if (
              input.parameter.rightTerm instanceof CalculatorValue
              && input.parameter.rightTerm.value.isEqualTo(MathNum.ZERO)
            ) { // ln(x - 0) = ln(x)
              return this.distribute(new CalculatorLogarithmFunction(input.parameter.leftTerm));
            } else return input;
          case CalculatorOperator.multiply: // ln(xy) = ln(x) + ln(y)
            return new CalculatorFunction(
              this.distribute(new CalculatorLogarithmFunction(input.parameter.leftTerm)),
              this.distribute(new CalculatorLogarithmFunction(input.parameter.rightTerm)),
              CalculatorOperator.add
            );
          case CalculatorOperator.divide:// ln(x/y) = ln(x) - ln(y)
            return new CalculatorFunction(
              this.distribute(new CalculatorLogarithmFunction(input.parameter.leftTerm)),
              this.distribute(new CalculatorLogarithmFunction(input.parameter.rightTerm)),
              CalculatorOperator.subtract
            );
          case CalculatorOperator.exponent: // ln(x^y) = y * ln(x)
            return new CalculatorFunction(
              this.distribute(input.parameter.rightTerm),
              this.distribute(new CalculatorLogarithmFunction(input.parameter.leftTerm)),
              CalculatorOperator.multiply
            );
        }
      } else throw new Error(`Bad input: ${input.print()}`);
    } else if (input instanceof CalculatorFunction) { // is a function
      input.leftTerm = this.distribute(input.leftTerm);
      input.rightTerm = this.distribute(input.rightTerm);
      return input;
    }

    throw new Error('Bad input: ' + input.print());
  }

  /**
   * Makes a term from positive -> negative or negative -> positive by flipping the sign of one of its values
   * Returns null if impossible
   * 
   * Without flipping the sign like this, the distributor would work as
   *  ln(0 - x) => ln(-1 * x) => ln(-1) * ln(x) => undefined
   */
  private static invertTermSign(term: CalculatorTerm): CalculatorTerm {
    if (term instanceof CalculatorValue) return new CalculatorValue(term.value.multiplyBy(MathNum.NEG_ONE));
    else if (term instanceof CalculatorVariable) return null;
    else if (term instanceof CalculatorLogarithmFunction) {
      const invertedParameter = this.invertTermSign(term.parameter);

      if (invertedParameter) return new CalculatorLogarithmFunction(invertedParameter);
      else return null;
    } else if (term instanceof CalculatorFunction) {
      switch (term.operator) {
        case CalculatorOperator.add:
        case CalculatorOperator.subtract: { // -(x [+-] y) = (-x [+-] -y)
          const invertedLeft = this.invertTermSign(term.leftTerm);
          const invertedRight = this.invertTermSign(term.rightTerm);

          if (invertedLeft && invertedRight)
            return new CalculatorFunction(invertedLeft, invertedRight, term.operator);
          else return null;
        }
        case CalculatorOperator.multiply:
        case CalculatorOperator.divide: { // -(x [*/] y) = (-x [*/] y) = (x [*/] -y)
          const invertedLeft = this.invertTermSign(term.leftTerm);
          if (invertedLeft) return new CalculatorFunction(invertedLeft, term.rightTerm, term.operator);
          else {
            const invertedRight = this.invertTermSign(term.rightTerm);
            if (invertedLeft) return new CalculatorFunction(term.leftTerm, invertedRight, term.operator);
            else return null;
          }
        }
        case CalculatorOperator.exponent: { // -(x ^ y)
          const evaluatedExponent = CalculatorEvaluator.evaluate(term.rightTerm.clone());
          if (
            evaluatedExponent instanceof CalculatorValue &&
            evaluatedExponent.value.isRealInteger() &&
            evaluatedExponent.integerValue % 2 === 1
          ) { // odd exponents can flip sign, even exponents cannot
            return new CalculatorFunction(
              term.leftTerm,
              new CalculatorFunction(new CalculatorValue(-1), term.rightTerm, CalculatorOperator.multiply),
              CalculatorOperator.exponent
            );
          } else return null;
        }
      }
    } else throw new Error(`Bad input: ${term.print()}`);
  }

  static test() {
    const tester = new CalculatorTester<string>('Logarithm Distributor', (input: string) => {
      return CalculatorLogarithmDistributor.distribute(new CalculatorParser(input).output).print();
    });

    tester.test('log(x ^ 2)', '(2 * log(x))');
    tester.test('log(x ^ -2)', '(-2 * log(x))');
    tester.test('log(0 - x)', 'log((-1 * x))');
    tester.test('log(((0 + 1) - (1 * (5 ^ y))))', 'log(((0 + 1) - (1 * (5 ^ y))))');

    tester.test('(log((((0 + 1) - (1 * (5 ^ y))) / 1)) / log(5))', '((log(((0 + 1) - (1 * (5 ^ y)))) - log(1)) / log(5))');
  }
}
