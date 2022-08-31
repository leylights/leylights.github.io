import { CalculatorComponent } from "../calculator-component.js";
import { CalculatorCollector } from "../statement/collector.js";
import { CalculatorTester } from "../tester.js";
export var CalculatorEquationType;
(function (CalculatorEquationType) {
    CalculatorEquationType[CalculatorEquationType["no_variable"] = 0] = "no_variable";
    CalculatorEquationType[CalculatorEquationType["one_linear_variable"] = 1] = "one_linear_variable";
    CalculatorEquationType[CalculatorEquationType["quadratic"] = 2] = "quadratic";
    CalculatorEquationType[CalculatorEquationType["linear_diophantine_equation"] = 3] = "linear_diophantine_equation";
})(CalculatorEquationType || (CalculatorEquationType = {}));
export class CalculatorIdentifier extends CalculatorComponent {
    static identify(input, debug) {
        const disjunctiveTerms = CalculatorCollector.getDisjunctiveTerms(input, debug, (input) => input // function does nothing; just ends when getDisjunctiveTerms finds a *, /, or ^
        );
    }
    static test() {
        const tester = new CalculatorTester('Identifier', (input, debug) => {
            return CalculatorEquationType.no_variable;
        });
        tester.test('3=4', CalculatorEquationType.no_variable);
    }
}
//# sourceMappingURL=identifier.js.map