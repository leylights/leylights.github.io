import { CalculatorTerm } from "./term.js"

export class CalculatorUnaryFunction implements CalculatorTerm {
  parameter: CalculatorTerm;
  functionName: string;
  private _id: number;

  constructor(parameter: CalculatorTerm, functionName: string) {
    this.parameter = parameter;
    this.functionName = functionName;
    this._id = ++CalculatorTerm.next_id;

    if (!this.parameter) throw new Error(`Bad parameter given: ${parameter}`);
  }

  get id() { return this._id; }

  clone(): CalculatorTerm {
    return undefined;
  }

  // above functions must be overwritten by extending classes

  containsVariable(variable?: string): boolean {
    return this.parameter.containsVariable(variable);
  }

  getVariables(): string[] {
    return this.parameter.getVariables();
  }

  equals(other: CalculatorTerm): boolean {
    if (other instanceof CalculatorUnaryFunction) {
      return this.parameter.equals(other.parameter) && this.functionName === other.functionName;
    } else return false;
  }

  print(useClearerBraces?: boolean, depth: number = 0): string {
    let brackets: { l: string, r: string };
    if (useClearerBraces)
      switch (depth % 3) {
        case 0: brackets = { l: '(', r: ')' }; break;
        case 1: brackets = { l: '[', r: ']' }; break;
        case 2: brackets = { l: '{', r: '}' }; break;
      }
    else brackets = { l: '(', r: ')' };

    return `${this.functionName}${brackets.l}${this.parameter.print(useClearerBraces, depth + 1)}${brackets.r}`;
  }

  printHTML(depth: number = 0): string {
    const depthIndex = depth % 5;

    let output = `<span class="unary-function ${this.functionName}">${this.functionName}`
    output += `<span class="function depth-${depthIndex}">`;
    output += `<span class="parens d-${depthIndex}">(</span>`;
    output += this.parameter.printHTML(depth + 1);
    output += `<span class="parens d-${depthIndex}">)</span></span></span>`;

    return output;
  }

  printSimple(depth: number = 0): string {
    return `${this.functionName}(${this.parameter.printSimple(depth + 1)})`;
  }
}
