import { CalculatorTerm } from "./term.js";
export class CalculatorSingular {
    constructor(name) {
        this.displayName = name;
        this._id = ++CalculatorTerm.next_id;
    }
    get id() { return this._id; }
    clone() {
        return undefined;
    }
    containsVariable() {
        return undefined;
    }
    getVariables() {
        return undefined;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    equals(other) {
        return undefined;
    }
    print() {
        return this.displayName;
    }
    printHTML() {
        return undefined;
    }
}
//# sourceMappingURL=singular.js.map