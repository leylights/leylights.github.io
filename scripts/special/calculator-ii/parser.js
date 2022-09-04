import { Leylights } from "../../leylights.js";
import { CalculatorComponent } from "./calculator-component.js";
import { CalculatorFunction, CalculatorOperator } from "./models/function.js";
import { CalculatorUserError } from "./models/user-facing-error.js";
import { CalculatorValue } from "./models/value.js";
import { CalculatorVariable } from "./models/variable.js";
import { CalculatorTester } from "./tester.js";
export class CalculatorParser extends CalculatorComponent {
    constructor(input, config) {
        super(config === null || config === void 0 ? void 0 : config.debug);
        this.iterations = 0;
        this.log('-- Parsing --');
        this.firstInput = input;
        const parts = this.firstInput.split('=');
        if (parts.length >= 3)
            throw new CalculatorUserError('Too many equals signs');
        else if (parts.length === 2) {
            if (parts[0].trim().length === 0)
                throw new CalculatorUserError('Missing left side of equation');
            if (parts[1].trim().length === 0)
                throw new CalculatorUserError('Missing right side of equation');
            this._leftOutput = this.parse(parts[0]);
            this._rightOutput = this.parse(parts[1]);
        }
        else
            this._leftOutput = this.parse(this.firstInput);
        this.log('-----------');
    }
    get fullOutput() {
        if (this._rightOutput)
            return this._leftOutput.print() + '=' + this._rightOutput.print();
        else
            return this._leftOutput.print();
    }
    get isEquation() {
        return !!this._rightOutput;
    }
    get leftOutput() {
        if (!this.isEquation)
            throw new Error('Not an equation');
        else
            return this._leftOutput;
    }
    get output() {
        if (this.isEquation)
            throw new Error('Not a statement');
        else
            return this._leftOutput;
    }
    get rightOutput() {
        if (!this.isEquation)
            throw new Error('Not an equation');
        else
            return this._rightOutput;
    }
    parse(input) {
        const formattedInput = input.trim()
            .replace(/[[{]/g, '(')
            .replace(/[\]}]/g, ')')
            .replace(/\s/g, '');
        if (!CalculatorParser.areBracketsBalanced(formattedInput))
            throw new CalculatorUserError('Brackets unbalanced');
        return this.parseRecurse(formattedInput);
    }
    parseRecurse(input) {
        this.log(`parsing: ${input}`);
        this.iterations++;
        if (this.iterations > 50)
            throw new Error(`Parser loop`);
        // add in brackets
        if (!CalculatorParser.areBracketsBalanced(input))
            throw new Error('Recursive brackets unbalanced');
        if (!this.areBracketsSurrounding(input))
            return this.parseRecurse('(' + input + ')');
        this.log(`brackets are surrounding: ${input}`);
        // find the leftmost operator not nested in brackets; split addition/subtraction before splitting multiply/divide before splitting exponents
        const nextOperatorIndex = this.getIndexOfNextOperator(input);
        if (nextOperatorIndex > -1) { // term includes an operator
            return this.parseTermWithOperator(input, nextOperatorIndex);
        }
        else {
            this.log(`No operators in ${input}`);
            if (input.substring(1, input.length - 1).match(/\(/)) // brackets still exist in term, implicit multiplication (e.g. 5(x+2) ) likely
                return this.parseTermWithoutOperatorWithBrackets(input);
            else
                return this.parseTermWithoutOperatorNorBrackets(input);
        }
    }
    parseTermWithOperator(input, operatorIndex) {
        this.log(`operator ${input[operatorIndex]} found in ${input} at ${operatorIndex}`);
        const operator = input[operatorIndex];
        const lhs = input.substring(1, operatorIndex);
        let rhs = input.substring(operatorIndex + 1);
        rhs = rhs.substring(0, rhs.length - 1);
        this.log(`LHS: ${lhs}, RHS: ${rhs}, operator: ${operator}`);
        return new CalculatorFunction(this.parseRecurse(lhs), this.parseRecurse(rhs), operator);
    }
    parseTermWithoutOperatorWithBrackets(input) {
        const originalInput = input;
        this.log(`parsing term with brackets, no operator: ${input}`);
        const firstBracketedTerm = this.getFirstBracketedTerm(input.substring(1, input.length - 1));
        const indexOfTerm = input.indexOf(firstBracketedTerm);
        this.log(`indexOfTerm: ${indexOfTerm}, firstBracketedTerm: ${firstBracketedTerm}, firstBracketedTermLen: ${firstBracketedTerm.length}`);
        let termWithMultiplication = '(';
        if (indexOfTerm > 1)
            termWithMultiplication = input.substring(0, indexOfTerm) + '*';
        termWithMultiplication += firstBracketedTerm;
        if (indexOfTerm + firstBracketedTerm.length < input.length - 1) // subtract 1 to ignore ending ) 
            termWithMultiplication += '*' + input.substring(indexOfTerm + firstBracketedTerm.length);
        else
            termWithMultiplication += input.substring(indexOfTerm + firstBracketedTerm.length);
        this.log(`reformatted term: ${termWithMultiplication}`);
        if (originalInput === termWithMultiplication)
            return this.parseTermWithoutOperatorNorBrackets(originalInput);
        else
            return this.parseRecurse(termWithMultiplication);
    }
    parseTermWithoutOperatorNorBrackets(input) {
        this.log(`parsing term no brackets or operator: ${input}`);
        const valueMatches = input.match(/-?([0-9])+/g);
        const values = [];
        this.log(`value matches: ${valueMatches ? valueMatches.join(', ') : 'none'}`);
        if (valueMatches) {
            for (const v of valueMatches)
                if (v.match(/[0-9]/)) // not just a negative sign
                    values.push(new CalculatorValue(parseFloat(v)));
        }
        const variableMatches = input.match(/-?[a-zA-Z]/g);
        const variables = [];
        if (variableMatches) {
            for (const v of variableMatches)
                variables.push(new CalculatorVariable(v));
        }
        this.log('Values found: ' + values.map((v) => v.value.prettyPrint()).join(', '));
        this.log('Variables found: ' + variables.map((v) => v.displayName).join(', '));
        let current = null;
        const terms = [].concat(values).concat(variables);
        for (const t of terms) {
            if (!current)
                current = t;
            else
                current = new CalculatorFunction(current, t, CalculatorOperator.multiply);
        }
        return current;
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
    areBracketsSurrounding(input) {
        let openParenthesisCount = 0;
        if (input[0] !== '(')
            return false;
        if (input[input.length - 1] !== ')')
            return false;
        for (let i = 0; i < input.length; i++) {
            const c = input[i];
            if (openParenthesisCount === 0 && i !== 0)
                return false; // any non-bracket character not surrounded by brackets
            else if (c === '(')
                openParenthesisCount++;
            else if (c === ')')
                openParenthesisCount--;
        }
        return openParenthesisCount === 0;
    }
    /**
     * Invariant: all brackets are parentheses
     */
    getFirstBracketedTerm(input) {
        if (input.match(/[[{]/))
            throw new Error('Non-parenthesis brackets given');
        let openParenthesisCount = 0;
        let openIndex;
        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            if (char === '(') {
                if (openParenthesisCount === 0)
                    openIndex = i;
                openParenthesisCount++;
            }
            else if (char === ')') {
                openParenthesisCount--;
                if (openParenthesisCount === 0)
                    return input.substring(openIndex, i + 1);
            }
        }
        throw new Error(`No bracketed term found in ${input}`);
    }
    hasOperator(input) {
        if (input.match(/[+*/^]/g))
            return true; // easy, unmistakeable, hearteyesemoji operators
        else if (input.match(/-/g)) {
            for (let i = 0; i < input.length; i++) {
                if (input[i] === '-') {
                    if ('(+-*/^'.includes(input[i - 1])) // negative found
                        continue;
                    else {
                        this.log(`subtraction found in ${input} at ${i}`);
                        return true; // else must be substraction
                    }
                }
            }
        }
        else
            return false;
    }
    /**
     * @returns the index of the next operator to split, -1 if none exists
     */
    getIndexOfNextOperator(input) {
        let nextOperatorIndex = this.getIndexOfRightmostOperator(input, [
            CalculatorOperator.add,
            CalculatorOperator.subtract
        ]);
        if (nextOperatorIndex === -1)
            nextOperatorIndex = this.getIndexOfRightmostOperator(input, [
                CalculatorOperator.multiply,
                CalculatorOperator.divide
            ]);
        if (nextOperatorIndex === -1)
            nextOperatorIndex = this.getIndexOfRightmostOperator(input, [
                CalculatorOperator.exponent,
            ]);
        return nextOperatorIndex;
    }
    /**
     * @returns the index of the rightmost operator not contained within any sub-terms
     */
    getIndexOfRightmostOperator(input, operators) {
        if (input[0] !== '(')
            throw new Error(`Bad input to getIndexOfRightmostOperator: ${input} has no initial '('`);
        let openParenthesisCount = 0;
        const chars = input.split('');
        let isLHSNegative = false;
        for (let i = chars.length - 2; i > 0; i--) {
            if (chars[i] === ')')
                openParenthesisCount++;
            else if (chars[i] === '(')
                openParenthesisCount--;
            else if (openParenthesisCount === 0) {
                // negation handling: test against all operators
                if (Leylights.Array.contains(CalculatorFunction.operators, chars[i]) && chars[i] !== CalculatorOperator.subtract) {
                    isLHSNegative = false;
                }
                // test against searched-for operators
                if (Leylights.Array.contains(operators, chars[i])) {
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
    static test() {
        const tester = new CalculatorTester('Parser', (input, debug) => {
            return new CalculatorParser(input, { debug: debug }).fullOutput;
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
        tester.test('5x', '(5 * x)');
        tester.test('(x+2)(x+3)', '((x + 2) * (x + 3))');
        tester.test('5(x+2)', '(5 * (x + 2))');
    }
}
CalculatorParser.acceptedVariables = new RegExp(/[a-zA-z]/g);
//# sourceMappingURL=parser.js.map