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
  }

  print(): string {
    return `(${this.leftTerm.print()} ${this.operator} ${this.rightTerm.print()})`;
  }
}
