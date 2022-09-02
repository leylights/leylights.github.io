import { CalculatorComponent } from "../calculator-component.js";
import { CalculatorEquationType } from "../models/equation-type.js";
import { CalculatorTerm } from "../models/term.js";
import { CalculatorUtil } from "../statement/util.js";
import { CalculatorIdentifier } from "./identifier.js";

/**
 * Invariants: 
 *  - RHS is 0
 *  - Term is fully parsed, collected, commuted, distributed
 */
export class CalculatorSolver extends CalculatorComponent {
  static solve(input: CalculatorTerm, debug?: boolean): string {
    // get terms, identification
    const disjunctiveTerms = CalculatorUtil.getDisjunctiveTerms(
      input, debug,
    );
    const allTerms = disjunctiveTerms.positives.concat(disjunctiveTerms.negatives);
    const identification: { type: CalculatorEquationType, isolatedVariable: string } = CalculatorIdentifier.identify(input, allTerms, debug);

    switch (identification.type) {
      case CalculatorEquationType.no_variable:
        return this.solveNoVariable(input);
      case CalculatorEquationType.single_linear_variable:
        return this.isolateVariable(input, identification.isolatedVariable, debug);
      case CalculatorEquationType.single_variable_to_number_exponent:
        return this.isolateVariable(input, identification.isolatedVariable, debug);
      case CalculatorEquationType.single_number_to_variable_exponent:
        return this.isolateVariable(input, identification.isolatedVariable, debug);
      case CalculatorEquationType.linear_diophantine_equation:
        return this.solveLinearDiophantineEquation(input, debug);
      case CalculatorEquationType.quadratic:
        return this.solveQuadratic(input, debug);
      case CalculatorEquationType.multi_variate:
        return this.isolateVariable(input, identification.isolatedVariable, debug);
      case CalculatorEquationType.miscellaneous:
        return this.isolateVariable(input, identification.isolatedVariable, debug)
      case CalculatorEquationType.single_variable_to_variable_exponent:
      case CalculatorEquationType.reject:
      default:
        return `${input.print()}=0`;
    }
  }

  static solveNoVariable(input: CalculatorTerm): string {
    return `${input.print()}=0`; // if there's no variables, the number term should already be fully evaluated.
  }

  static isolateVariable(input: CalculatorTerm, isolatedVariable: string, debug: boolean): string {
    //
  }

  static solveLinearDiophantineEquation(input: CalculatorTerm, debug: boolean): string {
    //
  }

  static solveQuadratic(input: CalculatorTerm, debug: boolean): string {
    //
  }
}
