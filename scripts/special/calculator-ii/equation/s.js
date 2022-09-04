import { CalculatorComponent } from "../calculator-component.js";
import { CalculatorFunction, CalculatorOperator } from "../models/function.js";
import { CalculatorValue } from "../models/value.js";
import { CalculatorVariable } from "../models/variable.js";
import { CalculatorParser } from "../parser.js";
import { CalculatorUtil } from "../statement/util.js";
import { CalculatorTester } from "../tester.js";
var CalculatorEquationType;
(function (CalculatorEquationType) {
    CalculatorEquationType[CalculatorEquationType["no_variable"] = 0] = "no_variable";
    CalculatorEquationType["single_linear_variable"] = "slv";
    CalculatorEquationType["single_variable_to_number_exponent"] = "x^n";
    CalculatorEquationType["single_number_to_variable_exponent"] = "b^x";
    CalculatorEquationType["single_variable_to_variable_exponent"] = "x^x";
    CalculatorEquationType["linear_diophantine_equation"] = "lde";
    CalculatorEquationType["quadratic"] = "quad";
    CalculatorEquationType["multi_variate"] = "mul";
    CalculatorEquationType["miscellaneous"] = "mis";
    CalculatorEquationType["reject"] = "rej";
})(CalculatorEquationType || (CalculatorEquationType = {}));
export class CalculatorIdentifier extends CalculatorComponent {
    static identify(input, terms, debug) {
        this.log(debug, '-- Identify --');
        this.log(debug, `Input: ${input.print()}`);
        this.log(debug, `Terms: ${terms.map((t) => t.print(true)).join(', ')}`);
        if (terms.length === 0)
            throw new Error(`No terms given from input ${input.print()}`);
        const variableCounts = this.getVariableCounts(input, debug);
        const exit = (type, isolatedVariable, message) => { return { type: type, isolatedVariable: isolatedVariable, message: message }; };
        const variables = [];
        let totalDistinctVariables = 0;
        let totalVariables = 0;
        for (const key of Object.keys(variableCounts)) {
            totalDistinctVariables++;
            totalVariables += variableCounts[key];
            variables.push(key);
        }
        this.log(debug, 'Variables found: ' + variables.join(', '));
        if (totalDistinctVariables === 0)
            return exit(CalculatorEquationType.no_variable, null);
        else if (totalDistinctVariables === 1) {
            const checkSingleVariableTerm = (term) => {
                if (this.isTermVarBaseToValueExponent(term))
                    return exit(CalculatorEquationType.single_variable_to_number_exponent, variables[0]);
                else if (this.isTermValueBaseToVarExponent(term))
                    return exit(CalculatorEquationType.single_number_to_variable_exponent, variables[0]);
                else if (this.isTermVarBaseToVarExponent(term, debug))
                    return exit(CalculatorEquationType.single_variable_to_variable_exponent, variables[0]);
                else if (this.isTermLinear(term))
                    return exit(CalculatorEquationType.single_linear_variable, variables[0]);
                else
                    return exit(CalculatorEquationType.miscellaneous, variables[0]);
            };
            if (terms.length === 1) {
                if (terms[0] instanceof CalculatorFunction) {
                    const variableTerm = terms[0].rightTerm;
                    if (variableTerm instanceof CalculatorVariable)
                        return exit(CalculatorEquationType.single_linear_variable, variables[0]);
                    else if (variableTerm instanceof CalculatorFunction) {
                        switch (variableTerm.operator) {
                            case CalculatorOperator.add:
                            case CalculatorOperator.subtract:
                                throw new Error(`Lost disjunct: ${variableTerm.print()}`);
                            case CalculatorOperator.multiply:
                            case CalculatorOperator.divide:
                                throw new Error(`Bad term expected to have at most ${totalDistinctVariables} distinct variables: ${variableTerm.print()}`);
                            case CalculatorOperator.exponent:
                                this.log(debug, `Evaluating 0th term of ${terms.length} terms: ${terms[0].print()}`);
                                return checkSingleVariableTerm(terms[0]);
                        }
                    }
                    else
                        throw new Error(`Number as variable term?: ${variableTerm.print()} in ${terms[0].print()}`);
                }
                else
                    throw new Error(`Bad collection: ${terms[0].print()}`);
            }
            else if (terms.length === 2) { // x^2 + x, x^3 + 1, 5^x + 1, x + 1, 9 - x^x
                if (terms[0].containsVariable() && terms[1].containsVariable()) { // x^2 + x, 5^x + x^x, x + x^1/2
                    this.log(debug, `two variable terms found: ${terms.map((t) => t.print(true)).join(', ')}`);
                    // quadratics     
                    if (this.isTermXSquared(terms[0]) && this.isTermLinear(terms[1]))
                        return exit(CalculatorEquationType.quadratic, variables[0]);
                    else if (this.isTermLinear(terms[0]) && this.isTermXSquared(terms[1]))
                        return exit(CalculatorEquationType.quadratic, variables[0]);
                    else
                        return exit(CalculatorEquationType.miscellaneous, variables[0]);
                }
                else if (terms[0].containsVariable()) { // x^3 + 4, x^x + 5
                    this.log(debug, `variable term found at 0: ${terms[0].print(true)}`);
                    return checkSingleVariableTerm(terms[0]);
                }
                else if (terms[1].containsVariable()) { // x^3 + 4, x^x + 5
                    this.log(debug, `variable term found at 1: ${terms[1].print(true)}`);
                    return checkSingleVariableTerm(terms[1]);
                }
                else {
                    throw new Error('One variable detected but no variables in either disjunctive term?');
                }
            }
            else
                throw new Error(`Too many terms given - collector error?: ${input.print()}`);
        }
        else if (totalDistinctVariables === 2) {
            if (terms.length === 1) // x^y=0, x/y=0, x*y=0
                return exit(CalculatorEquationType.multi_variate, variables[0]);
            else if (terms.length === 2) {
                if ((terms[0].containsVariable(variables[0]) &&
                    terms[1].containsVariable(variables[1])) || (terms[0].containsVariable(variables[1]) &&
                    terms[1].containsVariable(variables[0]))) {
                    if (this.isTermLinear(terms[0]) && this.isTermLinear(terms[1]))
                        return exit(CalculatorEquationType.linear_diophantine_equation, variables.join(','));
                    else
                        return exit(CalculatorEquationType.multi_variate, variables.join(','));
                }
            }
            else if (terms.length === 3) { // f(x,y) + g(x,y) + n = 0, f(x,y) + g(x,y) + h(x,y) = 0
                const variableTerms = terms.filter((term) => term.containsVariable());
                if (variableTerms.length === 2) { // f(x,y) + g(x,y) + n = 0
                    if (this.isTermLinear(variableTerms[0]) &&
                        this.isTermLinear(variableTerms[1]) &&
                        ((variableTerms[0].containsVariable(variables[0]) &&
                            variableTerms[1].containsVariable(variables[1])) || (variableTerms[0].containsVariable(variables[1]) &&
                            variableTerms[1].containsVariable(variables[0]))))
                        return exit(CalculatorEquationType.linear_diophantine_equation, variables.join(','));
                }
                else
                    return exit(CalculatorEquationType.multi_variate, variables[0]);
            }
            else { // f(x,y) + g(x,y) + h(x,y) + ... + n = 0
                return exit(CalculatorEquationType.multi_variate, variables[0]);
            }
        }
        else if (totalDistinctVariables > 2)
            return exit(CalculatorEquationType.multi_variate, variables[0]);
    }
    // returns whether the term follows the pattern (a * x)
    static isTermLinear(term) {
        return (term instanceof CalculatorFunction
            && term.leftTerm instanceof CalculatorValue
            && term.rightTerm instanceof CalculatorVariable);
    }
    // returns whether the term follows the pattern (a * (x ^ 2))
    static isTermXSquared(term) {
        return (this.isTermVarBaseToValueExponent(term)
            && term.rightTerm.rightTerm.equals(new CalculatorValue(2)));
    }
    // returns whether the term follows the pattern (a * (x ^ p))
    static isTermVarBaseToValueExponent(term) {
        return (term instanceof CalculatorFunction
            && term.leftTerm instanceof CalculatorValue
            && term.rightTerm instanceof CalculatorFunction
            && term.rightTerm.operator === CalculatorOperator.exponent
            && term.rightTerm.rightTerm instanceof CalculatorValue);
    }
    // returns whether the term follows the pattern (a * (b ^ x))
    static isTermValueBaseToVarExponent(term) {
        return (term instanceof CalculatorFunction
            && term.leftTerm instanceof CalculatorValue
            && term.rightTerm instanceof CalculatorFunction
            && term.rightTerm.leftTerm instanceof CalculatorValue
            && term.rightTerm.operator === CalculatorOperator.exponent
            && term.rightTerm.rightTerm.containsVariable());
    }
    // returns whether the term follows the pattern (a * (b ^ x))
    static isTermVarBaseToVarExponent(term, debug) {
        this.log(debug, `Evaluating if term is x^x: ${term.print(true)}`);
        return (term instanceof CalculatorFunction
            && term.leftTerm instanceof CalculatorValue
            && term.rightTerm instanceof CalculatorFunction
            && term.rightTerm.leftTerm.containsVariable()
            && term.rightTerm.operator === CalculatorOperator.exponent
            && term.rightTerm.rightTerm.containsVariable());
    }
    static getVariableCounts(input, debug) {
        if (input instanceof CalculatorValue)
            return {};
        else if (input instanceof CalculatorVariable) {
            const result = {};
            result[input.print()] = 1;
            return result;
        }
        else if (input instanceof CalculatorFunction) {
            const left = this.getVariableCounts(input.leftTerm, debug), right = this.getVariableCounts(input.rightTerm, debug);
            for (const key of Object.keys(right)) {
                if (left[key] !== undefined)
                    left[key] += right[key];
                else
                    left[key] = right[key];
            }
            return left;
        }
    }
    static test() {
        // identification
        const identifyTester = new CalculatorTester('Identifier', (input, debug) => {
            const parse = new CalculatorParser(input, { debug: false }).leftOutput;
            const disjunctiveTerms = CalculatorUtil.getDisjunctiveTerms(parse, debug);
            this.log(debug, disjunctiveTerms);
            return this.identify(parse, disjunctiveTerms.positives.concat(disjunctiveTerms.negatives), debug);
        }, (actual, expected) => {
            return actual.type === expected.type && actual.isolatedVariable === expected.isolatedVariable;
        }, (value) => {
            return `type: ${value.type}, isolatedVariable: ${value.isolatedVariable}`;
        });
        function test(input, type, variable) {
            identifyTester.test(input, { type: type, isolatedVariable: variable });
        }
        test('0=0', CalculatorEquationType.no_variable, null);
        test('3=0', CalculatorEquationType.no_variable, null);
        test('(1 * x)=0', CalculatorEquationType.single_linear_variable, 'x');
        test('(1 * x^x)=0', CalculatorEquationType.single_variable_to_variable_exponent, 'x');
        test('(1 * x^x)+4=0', CalculatorEquationType.single_variable_to_variable_exponent, 'x');
        test('(1* x^2)=0', CalculatorEquationType.single_variable_to_number_exponent, 'x');
        test('(1*x^2)-3=0', CalculatorEquationType.single_variable_to_number_exponent, 'x');
        test('(1*2^x)=0', CalculatorEquationType.single_number_to_variable_exponent, 'x');
        test('(1*2^x)+4=0', CalculatorEquationType.single_number_to_variable_exponent, 'x');
        test('(1*2^x)+4=0', CalculatorEquationType.single_number_to_variable_exponent, 'x');
        test('(2*x)+(4*y)=0', CalculatorEquationType.linear_diophantine_equation, 'x,y');
        test('(2*x)-(-4*y)+3=0', CalculatorEquationType.linear_diophantine_equation, 'x,y');
    }
}
//# sourceMappingURL=s.js.map