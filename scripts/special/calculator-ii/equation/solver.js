import { cws } from "../../../cws.js";
import { MathNum } from "../../../tools/math/number.js";
import { CalculatorComponent } from "../calculator-component.js";
import { CalculatorEquationType } from "../models/equation-type.js";
import { CalculatorFunction, CalculatorOperator } from "../models/function.js";
import { CalculatorUserError } from "../models/user-facing-error.js";
import { CalculatorValue } from "../models/value.js";
import { CalculatorVariable } from "../models/variable.js";
import { CalculatorParser } from "../parser.js";
import { CalculatorEvaluator } from "../statement/evaluator.js";
import { CalculatorUtil } from "../statement/util.js";
import { CalculatorTester } from "../tester.js";
import { CalculatorView } from "../view.js";
import { CalculatorIdentifier } from "./identifier.js";
/**
 * Invariants:
 *  - RHS is 0
 *  - Term is fully parsed, collected, commuted, distributed
 */
export class CalculatorSolver extends CalculatorComponent {
    static solve(input, config) {
        // get terms, identification
        const disjunctiveTerms = CalculatorUtil.getDisjunctiveTerms(input, config === null || config === void 0 ? void 0 : config.debug);
        const allTerms = disjunctiveTerms.positives.concat(disjunctiveTerms.negatives);
        const identification = CalculatorIdentifier.identify(input, allTerms, config === null || config === void 0 ? void 0 : config.debug);
        const result = this.solveSwitch(input, identification, config);
        this.emitStep(`Result: ${result}`, config);
        return result;
    }
    static solveSwitch(input, identification, config) {
        this.log(config.debug, `type: ${identification.type}`);
        switch (identification.type) {
            case CalculatorEquationType.no_variable:
                return this.solveNoVariable(input);
            case CalculatorEquationType.single_linear_variable:
                return this.isolateVariable(input, identification.isolatedVariable, config);
            case CalculatorEquationType.single_variable_to_number_exponent:
                return this.isolateVariable(input, identification.isolatedVariable, config);
            case CalculatorEquationType.single_number_to_variable_exponent:
                return this.isolateVariable(input, identification.isolatedVariable, config);
            case CalculatorEquationType.linear_diophantine_equation:
                this.log(config === null || config === void 0 ? void 0 : config.debug, `Linear diophantine equation: ${input.print()} = 0`);
                return this.solveLinearDiophantineEquation(input, config);
            case CalculatorEquationType.quadratic:
                this.log(config === null || config === void 0 ? void 0 : config.debug, `Quadratic: ${input.print()} = 0`);
                return this.solveQuadratic(input, config);
            case CalculatorEquationType.multi_variate:
                return this.isolateVariable(input, identification.isolatedVariable.split(',')[0], config);
            case CalculatorEquationType.miscellaneous:
                return this.isolateVariable(input, identification.isolatedVariable, config);
            case CalculatorEquationType.single_variable_polynomial:
                this.log(config === null || config === void 0 ? void 0 : config.debug, `Single variable polynomial: ${input.print()} = 0`);
            case CalculatorEquationType.single_variable_to_variable_exponent:
            case CalculatorEquationType.reject:
            default:
                return `${input.print()} = 0`;
        }
    }
    static solveNoVariable(input) {
        return `${input.print()} = 0`; // if there's no variables, the number term should already be fully evaluated.
    }
    static isolateVariable(input, isolatedVariable, config) {
        this.emitStep(`${input ? input.printHTML() : 0} = 0`, config);
        const isolationResult = this.isolateVariableRecurse(input, new CalculatorValue(0), isolatedVariable, config);
        const output = `${CalculatorEvaluator.evaluate(isolationResult.left).print()} = ${CalculatorEvaluator.evaluate(isolationResult.right).print()}`;
        const HTMLOutput = `${CalculatorEvaluator.evaluate(isolationResult.left).printHTML()} = ${CalculatorEvaluator.evaluate(isolationResult.right).printHTML()}`;
        this.emitStep(HTMLOutput, config);
        return output;
    }
    static isolateVariableRecurse(left, right, isolatedVariable, config) {
        const exitBase = (left, right) => {
            return { left: left ? CalculatorEvaluator.simplify(left) : left, right: right ? CalculatorEvaluator.evaluate(right) : right };
        }, exitRecurse = (left, right) => {
            this.emitStep(`${left ? left.printHTML() : 0} = ${right.printHTML()}`, config);
            this.log(config.debug, `${left ? left.print(true) : 0} = ${right.print(true)}`);
            return this.isolateVariableRecurse(left, right, isolatedVariable, config);
        };
        if (!left)
            return exitBase(left, right);
        if (left instanceof CalculatorVariable) {
            return exitBase(left, right);
        }
        else if (left instanceof CalculatorValue) { // n = r => 0 = r - n
            return exitBase(null, new CalculatorFunction(right, left, CalculatorOperator.subtract));
        }
        else if (left instanceof CalculatorFunction) {
            if (!left.containsVariable(isolatedVariable))
                return exitRecurse(null, new CalculatorFunction(right, left, CalculatorOperator.subtract));
            // f(x) = r (known from containsVariable check above)
            const handleAddSubtractMultiply = (inverseOperation) => {
                if (!left.rightTerm.containsVariable(isolatedVariable)) { // f(x) [+,-,*] g(y) = r => f(x) = r [-,+,/] g(y)
                    return exitRecurse(left.leftTerm, new CalculatorFunction(right, left.rightTerm, inverseOperation));
                }
                else if (!left.leftTerm.containsVariable(isolatedVariable)) { // f(y) [+,-,*] g(x) = r => g(x) = r [-,+,/] f(y)
                    return exitRecurse(left.rightTerm, new CalculatorFunction(right, left.leftTerm, inverseOperation));
                }
                else {
                    return exitBase(left, right); // both sides contain x; cannot isolate
                }
            };
            switch (left.operator) {
                case CalculatorOperator.add:
                    return handleAddSubtractMultiply(CalculatorOperator.subtract);
                case CalculatorOperator.subtract:
                    return handleAddSubtractMultiply(CalculatorOperator.add);
                case CalculatorOperator.multiply:
                    return handleAddSubtractMultiply(CalculatorOperator.divide);
                case CalculatorOperator.divide:
                    if (!left.rightTerm.containsVariable(isolatedVariable)) { // f(x) / g(y) = r => f(x) = r * g(y)
                        return exitRecurse(left.leftTerm, new CalculatorFunction(right, left.rightTerm, CalculatorOperator.multiply));
                    }
                    else if (!left.leftTerm.containsVariable(isolatedVariable)) { // f(y) / g(x) = r => g(x) = f(y) / r
                        return exitRecurse(left.rightTerm, new CalculatorFunction(left.leftTerm, right, CalculatorOperator.divide));
                    }
                    else {
                        throw new Error(`Both sides of ${left.print()} contain ${isolatedVariable}`);
                    }
                case CalculatorOperator.exponent:
                    if (!left.rightTerm.containsVariable(isolatedVariable)) { // f(x) ^ g(y) = r => f(x) = r^(1/g(y))
                        return exitRecurse(left.leftTerm, new CalculatorFunction(right, new CalculatorFunction(new CalculatorValue(1), left.rightTerm, CalculatorOperator.divide), CalculatorOperator.exponent));
                    }
                    else if (!left.leftTerm.containsVariable(isolatedVariable)) { // f(y) ^ g(x) = r => g(x) = f(y) / r
                        throw new CalculatorUserError(`Logarithms currently unhandled in step ${left.printHTML()} = ${right.printHTML()}`);
                    }
                    else {
                        throw new Error(`Both sides of ${left.print()} contain ${isolatedVariable}`);
                    }
                default: throw new Error('Bad operator');
            } // end switch
        }
        else {
            throw new Error(`Bad left: ${left.print()}`);
        }
    }
    static solveLinearDiophantineEquation(input, config) {
        // sort disjuncts
        const terms = this.sortDisjunctiveVariablesAndValues(CalculatorUtil.getDisjunctiveTerms(input, config === null || config === void 0 ? void 0 : config.debug));
        if (terms.variables.length !== 2)
            throw new Error(`Too many variable terms for LDE ${input.print()}`);
        function getLDECoefficient(term, termIsPositive) {
            if (term instanceof CalculatorFunction &&
                term.leftTerm &&
                term.leftTerm instanceof CalculatorValue &&
                term.rightTerm instanceof CalculatorVariable) {
                return {
                    value: term.leftTerm.integerValue * (termIsPositive ? 1 : -1),
                    variable: term.rightTerm,
                };
            }
            else
                throw new Error(`${term.print()} not in LDE term format`);
        }
        const a = getLDECoefficient(terms.variables[0].term, terms.variables[0].pos), b = getLDECoefficient(terms.variables[1].term, terms.variables[1].pos), c = terms.value ? terms.value.term.value.toRealNumber().nearestInteger * (terms.value.pos ? -1 : 1) : 0;
        this.log(config === null || config === void 0 ? void 0 : config.debug, `LDE values: a: ${a.value}, b: ${b.value}, c: ${c}`);
        this.emitStep(`Linear diophantine equation values: a: ${a.value}, b: ${b.value}, c: ${c}`, config);
        if (terms.value && !(new MathNum(Math.abs(c), 0)).isEqualTo(terms.value.term.value)) {
            this.log(config === null || config === void 0 ? void 0 : config.debug, `c(${c}) non - integer: ${new MathNum(Math.abs(c), 0).prettyPrint()} not equal to ${terms.value.term.value.prettyPrint()}`);
            return `${input.print()} = 0`; // non-integer c
        }
        const gcd = cws.gcd(a.value, b.value);
        this.log(config === null || config === void 0 ? void 0 : config.debug, `Greatest common denominator of ${a.value} and ${b.value}: ${gcd}`);
        if (c % gcd === 0) {
            const EEAResult = CalculatorUtil.EEA(a.value, b.value, (s) => { this.emitStep(s, config); });
            this.log(config === null || config === void 0 ? void 0 : config.debug, `EEA results: x: ${EEAResult.x}, y: ${EEAResult.y}, gcd: ${EEAResult.gcd}`);
            this.emitStep(`EEA results: ${EEAResult.x} * ${a.value} + ${EEAResult.y} * ${b.value} = ${EEAResult.gcd}`, config);
            const multiplier = c / EEAResult.gcd;
            this.emitStep(`EEA multiplier: ${multiplier}`, config);
            return `${a.variable.displayName} = ${EEAResult.x * multiplier}, ${b.variable.displayName} = ${EEAResult.y * multiplier}`;
        }
        else {
            this.log(config === null || config === void 0 ? void 0 : config.debug, `${c} not an integer multiple of the GCD of ${a.value} and ${b.value}`);
            return `${input.print()} = 0`;
        }
    }
    static solveQuadratic(input, config) {
        const terms = this.sortDisjunctiveVariablesAndValues(CalculatorUtil.getDisjunctiveTerms(input, config.debug));
        const variable = input.getVariables()[0];
        let a, b;
        if (terms.variables[0].term instanceof CalculatorFunction &&
            terms.variables[0].term.leftTerm instanceof CalculatorValue &&
            terms.variables[1].term instanceof CalculatorFunction &&
            terms.variables[1].term.leftTerm instanceof CalculatorValue) {
            if (CalculatorIdentifier.isTermLinear(terms.variables[0].term)) {
                a = terms.variables[1].term.leftTerm.integerValue * (terms.variables[1].pos ? 1 : -1);
                b = terms.variables[0].term.leftTerm.integerValue * (terms.variables[0].pos ? 1 : -1);
            }
            else {
                a = terms.variables[0].term.leftTerm.integerValue * (terms.variables[0].pos ? 1 : -1);
                b = terms.variables[1].term.leftTerm.integerValue * (terms.variables[1].pos ? 1 : -1);
            }
        }
        const c = terms.value.term.integerValue * (terms.value.pos ? 1 : -1);
        const radicand = `${b} ^ 2 - 4 * ${a} * ${c}`;
        this.log(config.debug, `radicand: ${radicand}`);
        if (CalculatorEvaluator.evaluate(new CalculatorParser(radicand).output).value.toRealNumber().decimalValue < 0) {
            this.emitStep(`negative radicand: ${new CalculatorParser(radicand).output.printHTML()}`, config);
            return `${variable} does not exist`; // -ve square root
        }
        const equations = ['+', '-'].map((operator) => `(-1 * ${b} ${operator}(${radicand}) ^ (1 / 2)) / (2 * ${a})`);
        for (const e of equations)
            this.log(config.debug, e);
        const parsedEquations = equations
            .map((eq) => new CalculatorParser(eq).output);
        for (const p of parsedEquations) {
            this.log(config.debug, p.print());
            this.emitStep(`x = ${p.printHTML()}>`, config);
        }
        const results = parsedEquations
            .map((p) => CalculatorEvaluator.evaluate((p)))
            .map((value) => { return { exact: value.value.Re, decimal: value.value.Re.decimalValue }; })
            .sort((a, b) => a.decimal - b.decimal);
        const exactResults = results.map((n) => n.exact.prettyPrint());
        if (exactResults[0].length < 20)
            return `${variable} = ${exactResults.join(', ')}`;
        else
            return `${variable} = ${results.map((n) => cws.roundToNthDigit(n.decimal, -5)).join(', ')}`;
    }
    static sortDisjunctiveVariablesAndValues(disjuctiveTerms) {
        const variableTerms = [];
        let valueTerm = null;
        disjuctiveTerms.positives.forEach((term) => {
            if (term.containsVariable())
                variableTerms.push({ term: term, pos: true });
            else if (term instanceof CalculatorValue)
                valueTerm = { term: term, pos: true };
            else
                throw new Error(`Lost positive term: ${term.print()}`);
        });
        disjuctiveTerms.negatives.forEach((term) => {
            if (term.containsVariable())
                variableTerms.push({ term: term, pos: false });
            else if (term instanceof CalculatorValue)
                valueTerm = { term: term, pos: false };
            else
                throw new Error(`Lost negative term: ${term.print()}`);
        });
        return {
            variables: variableTerms,
            value: valueTerm
        };
    }
    static emitStep(output, config) {
        if (config === null || config === void 0 ? void 0 : config.emitSteps)
            CalculatorView.logStep(output, 'solving');
    }
    static test() {
        const tester = new CalculatorTester('Solver', (input, debug) => {
            return CalculatorSolver.solve(new CalculatorParser(input, { debug: false }).leftOutput, { debug: debug });
        });
        tester.test('0=0', '0 = 0');
        tester.test('1*x=0', 'x = 0');
        tester.test('2*x - 7*y - 1 = 0', 'x = -3, y = -1');
        tester.test('2*x - 7*y + 1 = 0', 'x = 3, y = 1');
        tester.test('([1 * 3*x] - 4) = 0', 'x = 4/3');
        tester.test('(1 * (x ^ 2)) - (5 * x) + 6 = 0', 'x = 2, 3');
        tester.test('([{1 * (x ^ 2)} + {2 * x}] - 8) = 0', 'x = -4, 2');
        tester.test('((1 * (x ^ 4)) - (2 * (x ^ 3))) = 0', '((x ^ 4) - (2 * (x ^ 3))) = 0');
        tester.test('3*s-5*r=0', 's = 0, r = 0');
        tester.test('(((24 * (x ^ 2)) - (-24 * x)) + 288) = 0', 'x does not exist');
        tester.test('(((24 * (x ^ 2)) - (168 * x)) + 288) = 0', 'x = 3, 4');
        tester.test('1*x^3-4*y=0', 'x = ((4 * y) ^ 1/3)');
        tester.test('3/2*x+y=0', 'x = ((0 - y) / 3/2)');
    }
}
//# sourceMappingURL=solver.js.map