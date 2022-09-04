export var CalculatorErrorType;
(function (CalculatorErrorType) {
    CalculatorErrorType[CalculatorErrorType["divisionByZero"] = 0] = "divisionByZero";
})(CalculatorErrorType || (CalculatorErrorType = {}));
export class CalculatorError extends Error {
    constructor(type, additionalMessage) {
        super(CalculatorError.getMessage(type, additionalMessage));
    }
    static getMessage(type, additionalMessage) {
        switch (type) {
            case CalculatorErrorType.divisionByZero:
                return `Division by zero${additionalMessage ? `: ${additionalMessage}` : ''}`;
        }
    }
}
//# sourceMappingURL=error.js.map