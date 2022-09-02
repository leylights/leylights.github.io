export class CalculatorTester {
    constructor(name, testedFunction, comparator = (actual, expected) => actual === expected, logger = (value) => value) {
        this.testedClassName = name;
        this.testedFunction = testedFunction;
        this.comparator = comparator;
        this.logger = logger;
    }
    test(input, expected, message) {
        try {
            const actual = this.testedFunction(input, false, false);
            if (!this.comparator(actual, expected)) {
                const printedActual = this.testedFunction(input, false, true);
                this.testedFunction(input, true, true); // run with debug logs
                throw new TestError(`\n${this.testedClassName} error: \nInput: ${input}\nExpected: ${this.logger(expected)}\nActual:   ${this.logger(printedActual)}${message ? `\n${message}` : ''}`);
            }
        }
        catch (e) {
            if (e instanceof TestError)
                throw e; // actual != expected
            // other errors
            console.error(`\nInput: ${input}\nProduced error`);
            this.testedFunction(input, true); // this should throw the error
            throw new Error('Error not thrown in rerun'); // otherwise, emit a message that it didn't throw on repeat
        }
    }
}
class TestError extends Error {
    constructor(message) {
        super(message);
    }
}
//# sourceMappingURL=tester.js.map