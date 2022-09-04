import { CalculatorTerm } from "./term.js";
export class CalculatorLogarithmFunction {
    constructor(parameter) {
        this.parameter = parameter;
        this._id = ++CalculatorTerm.next_id;
        if (!this.parameter)
            throw new Error(`Bad parameter given: ${parameter}`);
    }
    get id() { return this._id; }
    clone() {
        return new CalculatorLogarithmFunction(this.parameter.clone());
    }
    containsVariable(variable) {
        return this.parameter.containsVariable(variable);
    }
    getVariables() {
        return this.parameter.getVariables();
    }
    equals(other) {
        if (other instanceof CalculatorLogarithmFunction) {
            return this.parameter.equals(other.parameter);
        }
        else
            return false;
    }
    print(useClearerBraces, depth = 0) {
        let brackets;
        if (useClearerBraces)
            switch (depth % 3) {
                case 0:
                    brackets = { l: '(', r: ')' };
                    break;
                case 1:
                    brackets = { l: '[', r: ']' };
                    break;
                case 2:
                    brackets = { l: '{', r: '}' };
                    break;
            }
        else
            brackets = { l: '(', r: ')' };
        return `log${brackets.l}${this.parameter.print(useClearerBraces, depth + 1)}${brackets.r}`;
    }
    printHTML(depth = 0) {
        const depthIndex = depth % 5;
        let output = `<span class="logarithm">ln`;
        output += `<span class="function depth-${depthIndex}">`;
        output += `<span class="parens d-${depthIndex}">(</span>`;
        output += this.parameter.printHTML(depth + 1);
        output += `<span class="parens d-${depthIndex}">)</span></span></span>`;
        return output;
    }
}
//# sourceMappingURL=logarithm.js.map