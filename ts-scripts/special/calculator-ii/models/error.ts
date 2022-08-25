export enum CalculatorErrorType {
  divisionByZero
}

export class CalculatorError extends Error {
  constructor(type: CalculatorErrorType, additionalMessage?: string) {
    super(CalculatorError.getMessage(type, additionalMessage));
  }

  static getMessage(type: CalculatorErrorType, additionalMessage?: string) {
    switch (type) {
      case CalculatorErrorType.divisionByZero:
        return `Division by zero${additionalMessage ? `: ${additionalMessage}` : ''}`;
    }
  }
}
