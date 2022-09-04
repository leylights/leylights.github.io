import { MathNum } from "../../../tools/math/number.js";
import { CalculatorComponent } from "../calculator-component.js";
import { CalculatorFunction, CalculatorOperator } from "../models/function.js";
import { CalculatorLogarithmFunction } from "../models/logarithm.js";
import { CalculatorTerm } from "../models/term.js";
import { CalculatorValue } from "../models/value.js";
import { CalculatorVariable } from "../models/variable.js";
import { CalculatorParser } from "../parser.js";
import { CalculatorTester } from "../tester.js";

export class CalculatorEvaluator extends CalculatorComponent {
  static evaluate(input: CalculatorTerm): CalculatorTerm {
    if (input instanceof CalculatorVariable) return input;
    else if (input instanceof CalculatorValue) return input;
    else if (input instanceof CalculatorLogarithmFunction) {
      input.parameter = this.evaluate(input.parameter);
      if (input.parameter instanceof CalculatorValue) {
        if (input.parameter.value.isRealNumber()) {
          const logResult: number = Math.log10(input.parameter.value.toRealNumber().decimalValue);
          if (isNaN(logResult)) return input;
          else return new CalculatorValue(logResult);
        }
        else return input; // imaginary number
      } else return input; // can't be evaluated
    } else if (input instanceof CalculatorFunction) { // is a function
      const lhs = this.evaluate(input.leftTerm);
      const rhs = this.evaluate(input.rightTerm);
      if (lhs instanceof CalculatorValue && rhs instanceof CalculatorValue) {
        switch (input.operator) {
          case CalculatorOperator.add: {
            return new CalculatorValue(MathNum.add(lhs.value, rhs.value));
          }
          case CalculatorOperator.subtract: {
            return new CalculatorValue(MathNum.subtract(lhs.value, rhs.value));
          }
          case CalculatorOperator.multiply: {
            return new CalculatorValue(MathNum.multiply(lhs.value, rhs.value));
          }
          case CalculatorOperator.divide: {
            if (rhs.value.isEqualTo(MathNum.ZERO)) return new CalculatorFunction(lhs, rhs, CalculatorOperator.divide);
            return new CalculatorValue(MathNum.divide(lhs.value, rhs.value));
          }
          case CalculatorOperator.exponent: {
            if (lhs.value.isRealNumber() && lhs.value.Re.decimalValue < 0 && !rhs.value.isRealInteger())
              return new CalculatorFunction(lhs, rhs, CalculatorOperator.exponent); // JS cannot handle negative nth roots
            return new CalculatorValue(MathNum.pow(lhs.value, rhs.value));
          }
          default:
            throw new Error(`Bad operator: ${input.operator}`);
        }
      } else {
        // special cases:
        switch (input.operator) {
          case CalculatorOperator.add:
            if (lhs instanceof CalculatorValue && lhs.value.isEqualTo(MathNum.ZERO))
              return rhs;
            if (rhs instanceof CalculatorValue && rhs.value.isEqualTo(MathNum.ZERO))
              return lhs;
            break;
          case CalculatorOperator.subtract:
            if (rhs instanceof CalculatorValue && rhs.value.isEqualTo(MathNum.ZERO))
              return lhs;
            break;
          case CalculatorOperator.multiply:
            if ((lhs instanceof CalculatorValue && lhs.value.isEqualTo(MathNum.ZERO))
              || (rhs instanceof CalculatorValue && rhs.value.isEqualTo(MathNum.ZERO)))
              return new CalculatorValue(0);
            break;
          case CalculatorOperator.divide:
            if (lhs instanceof CalculatorValue && lhs.value.isEqualTo(MathNum.ZERO))
              return new CalculatorValue(0);
            else if (rhs instanceof CalculatorValue && rhs.value.isEqualTo(MathNum.ONE))
              return lhs;

            if (
              lhs instanceof CalculatorFunction &&
              lhs.operator === CalculatorOperator.multiply
            ) { // (x * b) / b
              if (lhs.rightTerm.equals(rhs))
                return this.evaluate(lhs.leftTerm);
              if (lhs.leftTerm.equals(rhs))
                return this.evaluate(lhs.rightTerm);
            }
            break;
          case CalculatorOperator.exponent:
            if (lhs instanceof CalculatorValue && lhs.value.isEqualTo(MathNum.ZERO))
              return new CalculatorValue(0);
            else if (rhs instanceof CalculatorValue) {
              if (rhs.value.isEqualTo(MathNum.ZERO))
                return new CalculatorValue(1);
              else if (rhs.value.isEqualTo(MathNum.ONE))
                return lhs;
            }
            break;
          default:
            throw new Error(`Bad operator: ${input.operator}`);
        }

        return new CalculatorFunction(lhs, rhs, input.operator);
      }
    }

    throw new Error('Bad input given: ' + input.print());
  }

  /**
   * Presents the input in its most human-readable format
   */
  static simplify(input: CalculatorTerm, debug?: boolean): CalculatorTerm {
    this.log(debug, `Simplifying: ${input.print()}`);

    if (input instanceof CalculatorVariable) return input;
    else if (input instanceof CalculatorValue) return input;
    else if (input instanceof CalculatorLogarithmFunction) {
      input.parameter = this.simplify(input.parameter);
      return input;
    } else if (input instanceof CalculatorFunction) { // is a function
      const lhs = this.simplify(input.leftTerm);
      const rhs = this.simplify(input.rightTerm);
      // special cases:
      switch (input.operator) {
        case CalculatorOperator.add:
          if (lhs instanceof CalculatorValue && lhs.value.isEqualTo(MathNum.ZERO))
            return rhs;
          if (rhs instanceof CalculatorValue && rhs.value.isEqualTo(MathNum.ZERO))
            return lhs;
          break;
        case CalculatorOperator.subtract:
          if (rhs instanceof CalculatorValue && rhs.value.isEqualTo(MathNum.ZERO))
            return lhs;
          break;
        case CalculatorOperator.multiply:
          // x * 0
          if ((lhs instanceof CalculatorValue && lhs.value.isEqualTo(MathNum.ZERO))
            || (rhs instanceof CalculatorValue && rhs.value.isEqualTo(MathNum.ZERO)))
            return new CalculatorValue(0);

          // x * 1
          if (lhs instanceof CalculatorValue && lhs.value.isEqualTo(MathNum.ONE))
            return rhs;
          if (rhs instanceof CalculatorValue && rhs.value.isEqualTo(MathNum.ONE))
            return lhs;
          break;
        case CalculatorOperator.divide:
          // 0 / x
          if (lhs instanceof CalculatorValue && lhs.value.isEqualTo(MathNum.ZERO))
            return new CalculatorValue(0);

          // x / 1
          else if (rhs instanceof CalculatorValue && rhs.value.isEqualTo(MathNum.ONE))
            return lhs;
          break;
        case CalculatorOperator.exponent:
          if (lhs instanceof CalculatorValue && lhs.value.isEqualTo(MathNum.ZERO))
            return new CalculatorValue(0);
          else if (rhs instanceof CalculatorValue) {
            if (rhs.value.isEqualTo(MathNum.ZERO))
              return new CalculatorValue(1);
            else if (rhs.value.isEqualTo(MathNum.ONE))
              return lhs;
          }
          break;
        default:
          throw new Error(`Bad operator: ${input.operator}`);
      }

      return new CalculatorFunction(lhs, rhs, input.operator);
    }

    throw new Error('Bad input given: ' + input.print());
  }

  static test() {
    const evaluateTester = new CalculatorTester<string>('Evaluator.evaluate', (input: string) => {
      return CalculatorEvaluator.evaluate(new CalculatorParser(input).output).print();
    });
    const simplifyTester = new CalculatorTester<string>('Evaluator.simplify', (input: string, debug?: boolean) => {
      return CalculatorEvaluator.simplify(new CalculatorParser(input).output, debug).print();
    });
    const simplifyLogTester = new CalculatorTester<string>('Evaluator.simplify (logarithm)', (input: string, debug?: boolean) => {
      return CalculatorEvaluator.simplify(new CalculatorLogarithmFunction(new CalculatorParser(input).output), debug).print();
    });

    evaluateTester.test('3+4', '7');

    simplifyTester.test('(1 * (5 ^ y))', '(5 ^ y)')
    simplifyLogTester.test('(1 - (1 * (5 ^ y)))', 'log((1 - (5 ^ y)))')
  }
}
