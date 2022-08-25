import { CalculatorTerm } from "./term.js";

export class CalculatorSingular implements CalculatorTerm {
  displayName: string;

  constructor(name: string) {
    this.displayName = name;
  }

  print(): string {
    return this.displayName;
  }
}
