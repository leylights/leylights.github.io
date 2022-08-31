import { CalculatorSingular } from "./singular.js";
import { CalculatorTerm } from "./term.js";

export class CalculatorVariable extends CalculatorSingular {
  constructor(name: string) {
    super(name);
  }

  equals(other: CalculatorTerm): boolean {
    return other instanceof CalculatorVariable && this.displayName === other.displayName;
  }
}
