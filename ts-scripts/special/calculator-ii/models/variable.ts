import { CalculatorSingular } from "./singular.js";
import { CalculatorTerm } from "./term.js";

export class CalculatorVariable extends CalculatorSingular {
  constructor(name: string) {
    super(name);
  }

  clone(): CalculatorTerm {
    return new CalculatorVariable(this.displayName);
  }

  containsVariable(variable?: string): boolean {
    if (variable) return variable === this.displayName;
    else return true;
  }

  equals(other: CalculatorTerm): boolean {
    return other instanceof CalculatorVariable && this.displayName === other.displayName;
  }
}
