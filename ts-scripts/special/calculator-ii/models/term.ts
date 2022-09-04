export class CalculatorTerm {
  static next_id = 0;

  get id(): number { return undefined; }

  clone(): CalculatorTerm {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  containsVariable(variable?: string): boolean {
    return undefined;
  }

  getVariables(): string[] {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  equals(other: CalculatorTerm): boolean {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  print(useClearerBraces?: boolean, depth: number = 0): string {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  printHTML(depth: number = 0): string {
    return undefined;
  }
}
