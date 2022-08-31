export class CalculatorTester<T> {
  testedClassName: string;
  testedFunction: (input: any, debug?: boolean) => T;

  constructor(name: string, testedFunction: (input: string, debug?: boolean) => T) {
    this.testedClassName = name;
    this.testedFunction = testedFunction;
  }

  test(input: string, expected: T, message?: string) {
    try {
      const actual = this.testedFunction(input, false);

      if (actual !== expected) {
        this.testedFunction(input, true); // run with debug logs

        throw new TestError(`\n${this.testedClassName} error: \nInput: ${input}\nExpected: ${expected}\nActual:   ${actual}${message ? `\n${message}` : ''}`);
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
