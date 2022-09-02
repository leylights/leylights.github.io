export class CalculatorTester<T> {
  testedClassName: string;
  testedFunction: (input: any, debug?: boolean, clearPrint?: boolean) => T;
  comparator: (actual: T, expected: T) => boolean;
  logger: (value: T) => string;

  constructor(
    name: string,
    testedFunction: (input: string, debug?: boolean, clearPrint?: boolean) => T,
    comparator: (actual: T, expected: T) => boolean = (actual: T, expected: T) => actual === expected,
    logger: (value: T) => string = (value: T) => value as unknown as string
  ) {
    this.testedClassName = name;
    this.testedFunction = testedFunction;
    this.comparator = comparator;
    this.logger = logger;
  }

  test(input: string, expected: T, message?: string) {
    try {
      const actual = this.testedFunction(input, false, false);

      if (!this.comparator(actual, expected)) {
        const printedActual = this.testedFunction(input, false, true);

        this.testedFunction(input, true, true); // run with debug logs

        throw new TestError(`\n${this.testedClassName} error: \nInput: ${input}\nExpected: ${this.logger(expected)}\nActual:   ${this.logger(printedActual)}${message ? `\n${message}` : ''}`);
      }
    } catch (e) {
      if (e instanceof TestError) throw e; // actual != expected

      // other errors
      console.error(`\nInput: ${input}\nProduced error`);
      this.testedFunction(input, true); // this should throw the error
      throw new Error('Error not thrown in rerun'); // otherwise, emit a message that it didn't throw on repeat
    }
  }
}

class TestError extends Error {
  constructor(message: string) {
    super(message);
  }
}
