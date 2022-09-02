import { CalculatorFunction, CalculatorOperator } from "../models/function.js";
import { CalculatorSingular } from "../models/singular.js";
export class CalculatorUtil {
    static getDisjunctiveTerms(input, debug, conjunctionProcessor) {
        function exit(pos, neg) {
            return { positives: pos, negatives: neg };
        }
        if (input instanceof CalculatorSingular)
            return exit([input], []);
        else if (input instanceof CalculatorFunction) {
            switch (input.operator) {
                case CalculatorOperator.add: {
                    const leftTerms = this.getDisjunctiveTerms(input.leftTerm, debug, conjunctionProcessor);
                    const rightTerms = this.getDisjunctiveTerms(input.rightTerm, debug, conjunctionProcessor);
                    return exit(leftTerms.positives.concat(rightTerms.positives), leftTerms.negatives.concat(rightTerms.negatives));
                }
                case CalculatorOperator.subtract: {
                    const leftTerms = this.getDisjunctiveTerms(input.leftTerm, debug, conjunctionProcessor);
                    const rightTerms = this.getDisjunctiveTerms(input.rightTerm, debug, conjunctionProcessor);
                    return exit(leftTerms.positives.concat(rightTerms.negatives), leftTerms.negatives.concat(rightTerms.positives));
                }
                case CalculatorOperator.multiply:
                case CalculatorOperator.divide:
                case CalculatorOperator.exponent:
                default:
                    if (conjunctionProcessor) {
                        input.leftTerm = conjunctionProcessor(input.leftTerm, debug);
                        input.rightTerm = conjunctionProcessor(input.rightTerm, debug);
                    }
                    return exit([input], []); // multiplied terms are disjunct clauses
            }
        }
        throw new Error(`Bad input: ${input.print()}`);
    }
}
//# sourceMappingURL=util.js.map