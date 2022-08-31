import { CalculatorTerm } from "./term.js";

export class CalculatorSingular implements CalculatorTerm {
  displayName: string;

  constructor(name: string) {
    this.displayName = name;
  }

  equals(other: CalculatorTerm): boolean {
    return undefined;
  }

  print(): string {
    return this.displayName;
  }
}
