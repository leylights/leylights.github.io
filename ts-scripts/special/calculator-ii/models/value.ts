import { Molasses } from "../../../molasses";
import { MathFrac } from "../../../tools/math/fraction";
import { MathNum } from "../../../tools/math/number";
import { CalculatorSingular } from "./singular";
import { CalculatorTerm } from "./term";

export class CalculatorValue extends CalculatorSingular {
  value: MathNum;

  constructor(value: number | MathNum) {
    super('value');
    if (!value && value !== 0) throw new Error(`Bad value: ${value}`);

    this.value = value instanceof MathNum
      ? value
      : typeof value === 'number'
        ? new MathNum(MathFrac.createFromInt(value), MathFrac.ZERO)
        : null;
    if (this.value === null) {
      console.error(value);
      throw new Error(`Bad value: ${value}`);
    }
  }

  get integerValue() {
    if (!this.value.isRealInteger()) throw new Error(`Not an integer: ${this.value.prettyPrint()}`);

    return this.value.toRealNumber().nearestInteger;
  }

  clone(): CalculatorTerm {
    return new CalculatorValue(this.value.clone());
  }

  containsVariable(): boolean {
    return false;
  }

  getVariables(): string[] {
    return [];
  }

  equals(other: CalculatorTerm): boolean {
    return other instanceof CalculatorValue && this.value.isEqualTo(other.value);
  }

  print(): string {
    if (this.value.prettyPrint().length > 15 && this.value.Im.isEqualTo(MathFrac.ZERO))
      return Molasses.roundToNthDigit(this.value.Re.decimalValue, -5) + '';
    else
      return this.value.prettyPrint() + '';
  }

  printHTML(): string {
    return `<span class="value">${this.print()}</span>`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  printSimple(depth: number = 0): string {
    return this.print();
  }
}
