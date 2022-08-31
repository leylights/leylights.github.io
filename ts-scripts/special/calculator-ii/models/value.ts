import { MathFrac } from "../../../tools/math/fraction.js";
import { MathNum } from "../../../tools/math/number.js";
import { CalculatorSingular } from "./singular.js";
import { CalculatorTerm } from "./term.js";

export class CalculatorValue extends CalculatorSingular {
  value: MathNum;

  constructor(value: number | MathNum) {
    super(value + '');
    this.value = value instanceof MathNum ? value : new MathNum(MathFrac.createFromInt(value), MathFrac.ZERO);
  }

  equals(other: CalculatorTerm): boolean {
    return other instanceof CalculatorValue && this.value.isEqualTo(other.value);
  }
  
  print(): string {
    return this.value.prettyPrint() + '';
  }
}
