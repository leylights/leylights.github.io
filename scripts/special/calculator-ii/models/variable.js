import { CalculatorSingular } from "./singular.js";
export class CalculatorVariable extends CalculatorSingular {
    constructor(name) {
        super(name);
    }
    clone() {
        return new CalculatorVariable(this.displayName);
    }
    containsVariable(variable) {
        if (variable)
            return variable === this.displayName;
        else
            return true;
    }
    getVariables() {
        return [this.displayName];
    }
    equals(other) {
        return other instanceof CalculatorVariable && this.displayName === other.displayName;
    }
    printHTML() {
        return `<span class="variable">${this.displayName}</span>`;
    }
    printSimple() {
        return this.print();
    }
}
//# sourceMappingURL=variable.js.map