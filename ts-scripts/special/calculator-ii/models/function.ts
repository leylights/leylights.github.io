import { CalculatorTerm } from "./term.js";

export enum CalculatorOperator {
  add = '+',
  subtract = '-',
  multiply = '*',
  divide = '/',
  exponent = '^',
}

export class CalculatorFunction implements CalculatorTerm {
  leftTerm: CalculatorTerm;
  rightTerm: CalculatorTerm;
  operator: CalculatorOperator;

  static operators: CalculatorOperator[] = [
    CalculatorOperator.add,
    CalculatorOperator.subtract,
    CalculatorOperator.multiply,
    CalculatorOperator.divide,
    CalculatorOperator.exponent
  ];

  constructor(lhs: CalculatorTerm, rhs: CalculatorTerm, operator: CalculatorOperator) {
    this.leftTerm = lhs;
    this.rightTerm = rhs;
    this.operator = operator;

    if (!this.leftTerm && !this.rightTerm) throw new Error(`Bad terms given: lhs ${lhs} and rhs: ${rhs} with operator ${operator}`);
    if (!this.leftTerm) throw new Error(`Bad left term given: ${lhs}, with rhs ${rhs.print()} and operator ${operator}`);
    if (!this.rightTerm) throw new Error(`Bad right term given: ${rhs}, with lhs ${lhs.print()} and operator ${operator}`);
  }

  clone(): CalculatorTerm {
    return new CalculatorFunction(this.leftTerm.clone(), this.rightTerm.clone(), this.operator);
  }

  containsVariable(variable?: string): boolean {
    return this.leftTerm.containsVariable(variable) || this.rightTerm.containsVariable(variable);
  }

  equals(other: CalculatorTerm): boolean {
    if (other instanceof CalculatorFunction) {
      return this.operator === other.operator && this.leftTerm.equals(other.leftTerm) && this.rightTerm.equals(other.rightTerm);
    } else return false;
  }

  print(useClearerBraces?: boolean, depth: number = 0): string {
    let brackets: { l: string, r: string };
    if (useClearerBraces)
      switch (depth % 3) {
        case 0: brackets = { l: '(', r: ')' }; break;
        case 1: brackets = { l: '[', r: ']' }; break;
        case 2: brackets = { l: '{', r: '}' }; break;
      }
    else brackets = { l: '(', r: ')' };

    return `${brackets.l}${this.leftTerm.print(useClearerBraces, depth + 1)} ${this.operator} ${this.rightTerm.print(useClearerBraces, depth + 1)}${brackets.r}`;
  }
}
