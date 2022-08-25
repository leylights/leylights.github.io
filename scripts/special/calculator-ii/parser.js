import { cws } from "../../cws.js";
import { CalculatorFunction, CalculatorOperator } from "./models/function.js";
import { CalculatorValue } from "./models/value.js";
import { CalculatorVariable } from "./models/variable.js";
import { CalculatorTester } from "./tester.js";
export class CalculatorParser {
    constructor(input, config) {
        this.firstInput = input;
        this.config = {
            debug: config === null || config === void 0 ? void 0 : config.debug
        };
        this.output = this.parse();
        this.log('------------------');
    }
    parse() {
        const input = this.firstInput.trim()
            .replace(/[[{]/g, '(')
            .replace(/[\]}]/g, ')')
            .replace(/\s/g, '');
        if (!CalculatorParser.areBracketsBalanced(this.firstInput))
            throw new Error('Brackets unbalanced');
        return this.parseRecurse(input);
    }
    parseRecurse(input) {
        if (this.config.debug)
            console.log(input);
        // add in brackets
        if (!CalculatorParser.areBracketsSurrounding(input))
            return this.parseRecurse('(' + input + ')');
        // find the leftmost operator not nested in brackets; split addition/subtraction before splitting multiply/divide before splitting exponents
        const nextOperatorIndex = this.getIndexOfNextOperator(input);
        if (nextOperatorIndex !== -1) { // term includes an operator
            const operator = input[nextOperatorIndex];
            const lhs = input.substring(1, nextOperatorIndex);
            let rhs = input.substring(nextOperatorIndex + 1);
            rhs = rhs.substring(0, rhs.length - 1);
            this.log(`LHS: ${lhs}, RHS: ${rhs}, operator: ${operator}`);
            return new CalculatorFunction(this.parseRecurse(lhs), this.parseRecurse(rhs), operator);
        }
        else {
            // if only a value, return a value
            const isOnlyValue = !input.match(/[^0-9()-]/g);
            const sanitizedValue = input.split('').filter((c) => !('()'.includes(c))).join('');
            if (isOnlyValue) {
                this.log('Value found: ' + sanitizedValue);
                return new CalculatorValue(parseFloat(sanitizedValue));
            }
            else {
                this.log('Variable found: ' + sanitizedValue);
                return new CalculatorVariable(sanitizedValue);
            }
        }
    }
    static areBracketsBalanced(input) {
        let openParenthesisCount = 0;
        input.split('').forEach((char) => {
            if (char === '(')
                openParenthesisCount++;
            else if (char === ')')
                openParenthesisCount--;
        });
        return openParenthesisCount === 0;
    }
    static areBracketsSurrounding(input) {
        let openParenthesisCount = 0;
        for (const c of input) {
            if (c === '(')
                openParenthesisCount++;
            else if (c === ')')
                openParenthesisCount--;
            else if (openParenthesisCount === 0)
                return false; // any non-bracket character not surrounded by brackets
        }
        return true;
    }
    /**
     * @returns the index of the next operator to split, -1 if none exists
     */
    getIndexOfNextOperator(input) {
        let nextOperatorIndex = this.getIndexOfLeftmostOperator(input, [
            CalculatorOperator.add,
            CalculatorOperator.subtract
        ]);
        if (nextOperatorIndex === -1)
            nextOperatorIndex = this.getIndexOfLeftmostOperator(input, [
                CalculatorOperator.multiply,
                CalculatorOperator.divide
            ]);
        if (nextOperatorIndex === -1)
            nextOperatorIndex = this.getIndexOfLeftmostOperator(input, [
                CalculatorOperator.exponent,
            ]);
        return nextOperatorIndex;
    }
    /**
     * @returns the index of the leftmost operator not contained within any sub-terms
     */
    getIndexOfLeftmostOperator(input, operators) {
        if (input[0] !== '(')
            throw new Error(`Bad input to getIndexOfLeftmostOperator: ${input} has no initial '('`);
        let openParenthesisCount = 0;
        const chars = input.split('');
        let isLHSNegative = false;
        // for (let i = 1; i < chars.length; i++) {
        //   if (chars[i] === '(') openParenthesisCount++;
        //   else if (chars[i] === ')') openParenthesisCount--;
        //   else if (openParenthesisCount === 0) {
        //     // negation handling: test against all operators
        //     if (cws.Array.contains(CalculatorFunction.operators, chars[i]) && chars[i] !== CalculatorOperator.subtract) {
        //       isLHSNegative = false;
        //     }
        //     // test against searched-for operators
        //     if (cws.Array.contains(operators, chars[i])) {
        //       if (chars[i] === CalculatorOperator.subtract) {
        //         // '-' is only subtract if its left character is a number or variable or ')'.  Otherwise treat it as negation, UNLESS the LHS is already negated
        //         if (
        //           (chars[i - 1] === ')'
        //             || chars[i - 1].match(/[0-9]/) !== null
        //             || chars[i - 1].match(CalculatorParser.acceptedVariables) !== null
        //             || isLHSNegative)
        //           && (chars[i - 1] !== CalculatorOperator.exponent)) {
        //           this.log(`Found subtraction symbol ${chars[i]} at ${i} with left char ${chars[i - 1]} and LHS ${isLHSNegative ? 'negative' : 'positive'}`);
        //           return i;
        //         }
        //         else {
        //           isLHSNegative = true;
        //         }
        //       } else return i;
        //     }
        //   }
        // }
        for (let i = chars.length - 2; i > 0; i--) {
            this.log(chars[i]);
            if (chars[i] === ')')
                openParenthesisCount++;
            else if (chars[i] === '(')
                openParenthesisCount--;
            else if (openParenthesisCount === 0) {
                // negation handling: test against all operators
                if (cws.Array.contains(CalculatorFunction.operators, chars[i]) && chars[i] !== CalculatorOperator.subtract) {
                    isLHSNegative = false;
                }
                // test against searched-for operators
                if (cws.Array.contains(operators, chars[i])) {
                    if (chars[i] === CalculatorOperator.subtract) {
                        // '-' is only subtract if its left character is a number or variable or ')'.  Otherwise treat it as negation, UNLESS the LHS is already negated
                        if ((chars[i - 1] === ')'
                            || chars[i - 1].match(/[0-9]/) !== null
                            || chars[i - 1].match(CalculatorParser.acceptedVariables) !== null
                            || isLHSNegative)
                            && (chars[i - 1] !== CalculatorOperator.exponent)) {
                            this.log(`Found subtraction symbol ${chars[i]} at ${i} with left char ${chars[i - 1]} and LHS ${isLHSNegative ? 'negative' : 'positive'}`);
                            return i;
                        }
                        else {
                            isLHSNegative = true;
                        }
                    }
                    else
                        return i;
                }
            }
        }
        return -1;
    }
    log(message) {
        if (this.config.debug)
            console.log(message);
    }
    static test() {
        const tester = new CalculatorTester('Parser', (input, debug) => {
            return new CalculatorParser(input, { debug: debug }).output.print();
        });
        tester.test('((1))', '1');
        tester.test('2*4', '(2 * 4)');
        tester.test('-2*4', '(-2 * 4)');
        tester.test('2*-4', '(2 * -4)');
        tester.test('-2*-4', '(-2 * -4)');
        tester.test('-2-4-3', '((-2 - 4) - 3)');
        tester.test('-2-4/3', '(-2 - (4 / 3))');
        tester.test('5 - -3', '(5 - -3)');
        tester.test('5--3', '(5 - -3)');
        tester.test('5 - -x', '(5 - -x)');
        tester.test('x--x', '(x - -x)');
        tester.test('y*(-x+3/(y+-2))', '(y * (-x + (3 / (y + -2))))');
        tester.test('2^3', '(2 ^ 3)');
        tester.test('3/2^4+5', '((3 / (2 ^ 4)) + 5)');
        tester.test('(3/2)^4+5', '(((3 / 2) ^ 4) + 5)');
        tester.test('(3/2)^4+5/3', '(((3 / 2) ^ 4) + (5 / 3))');
        tester.test('2^-3', '(2 ^ -3)');
        tester.test('(2)^(-3)', '(2 ^ -3)');
        tester.test('3^4^5', '((3 ^ 4) ^ 5)');
        tester.test('3^(4*5)^6', '((3 ^ (4 * 5)) ^ 6)');
        tester.test('1+2+3', '((1 + 2) + 3)');
        tester.test('1-2-3', '((1 - 2) - 3)');
        tester.test('1-2--3', '((1 - 2) - -3)');
        tester.test('1/2/2', '((1 / 2) / 2)');
    }
}
CalculatorParser.acceptedVariables = new RegExp(/[a-zA-z]/g);
//# sourceMappingURL=parser.js.map