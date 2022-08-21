import { CalculatorTerm } from "./term.js";

export class CalculatorValue implements CalculatorTerm {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  print(): string {
    return this.value + '';
  }
}
