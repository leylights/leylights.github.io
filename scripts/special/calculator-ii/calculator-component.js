export class CalculatorComponent {
    constructor(debug) {
        this.debug = debug;
    }
    log(messages) {
        if (this.debug)
            console.log(messages);
    }
    static log(debug, messages) {
        if (debug)
            console.log(messages);
    }
}
//# sourceMappingURL=calculator-component.js.map