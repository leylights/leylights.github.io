import { CalculatorTerm } from "./term.js";

export class CalculatorVariable implements CalculatorTerm {
  variableName: string;

  constructor(name: string) {
    this.variableName = name;
  }

  print(): string {
    return this.variableName;
  }
}
