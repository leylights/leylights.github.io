import { CalculatorTerm } from "./term.js";

export class CalculatorLogarithmFunction implements CalculatorTerm {
  parameter: CalculatorTerm;
  
  
  constructor(parameter: CalculatorTerm) {
    this.parameter = parameter;
   
    if (!this.parameter) throw new Error(`Bad parameter given: ${parameter}`);
  }

  clone(): CalculatorTerm {
    return new CalculatorLogarithmFunction(this.parameter.clone());
  }

  containsVariable(variable?: string): boolean {
    return this.parameter.containsVariable(variable);
  }

  getVariables(): string[] {
    return this.parameter.getVariables();
  }

  equals(other: CalculatorTerm): boolean {
    if (other instanceof CalculatorLogarithmFunction) {
      return this.parameter.equals(other.parameter);
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

    return `log${brackets.l}${this.parameter.print(useClearerBraces, depth + 1)}${brackets.r}`;
  }

  printHTML(depth: number = 0): string {
    const depthIndex = depth % 5;

    let output = `<span class="logarithm">ln`
    output += `<span class="function depth-${depthIndex}">`;
    output += `<span class="parens d-${depthIndex}">(</span>`;
    output += this.parameter.printHTML(depth + 1);
    output += `<span class="parens d-${depthIndex}">)</span></span></span>`;

    return output;
  }
}
