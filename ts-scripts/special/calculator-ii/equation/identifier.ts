import { CalculatorComponent } from "../calculator-component.js"
import { CalculatorTerm } from "../models/term.js";
import { CalculatorCollector } from "../statement/collector.js";
import { CalculatorTester } from "../tester.js";

export enum CalculatorEquationType {
  no_variable,
  one_linear_variable,
  quadratic,
  linear_diophantine_equation,
}

export class CalculatorIdentifier extends CalculatorComponent {
  static identify(input: CalculatorTerm, debug?: boolean) {
    const disjunctiveTerms = CalculatorCollector.getDisjunctiveTerms(
      input, debug,
      (input: CalculatorTerm) => input // function does nothing; just ends when getDisjunctiveTerms finds a *, /, or ^
    );


  }

  static test() {
    const tester = new CalculatorTester<CalculatorEquationType>('Identifier', (input: string, debug?: boolean) => {
      return CalculatorEquationType.no_variable;
    });

    tester.test('3=4', CalculatorEquationType.no_variable);
  }
}
