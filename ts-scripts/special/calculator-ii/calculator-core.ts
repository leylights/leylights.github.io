import { CalculatorCommuter } from "./commuter.js";
import { CalculatorDistributor } from "./distributor.js";
import { CalculatorEvaluator } from "./evaluator.js";
import { CalculatorTerm } from "./models/term.js";
import { CalculatorParser } from "./parser.js";
import { CalculatorView } from "./view.js";

export class CalculatorCore {
  static calculate(input: string, debug?: boolean): string {
    const parsedValue: CalculatorTerm = new CalculatorParser(input, {
      debug: debug,
    }).output;
    CalculatorView.outputFields.parsing.value = parsedValue.print();

    let previous = { evaluation: null, distribution: null, commutation: null, final: parsedValue };
    const current = { evaluation: null, distribution: null, commutation: null,final: null };

    function logEvalDistributeStep() {
      previous = { evaluation: current.evaluation, distribution: current.distribution, commutation: current.commutation, final: current.final };
      CalculatorView.logNewDistribution(previous.distribution.print());
      CalculatorView.logNewCommutation(previous.commutation.print());
      CalculatorView.logNewEvaluation(previous.evaluation.print());
    }

    // evaluate-distribute loop
    do {
      if (current.final) {
        logEvalDistributeStep();
        // console.log('current final', previous.final.print());
      }

      console.log('previous final', previous.final.print());
      current.distribution = CalculatorDistributor.distribute(previous.final, true);
      current.commutation = CalculatorCommuter.commute(current.distribution);
      current.evaluation = CalculatorEvaluator.evaluate(current.commutation);

      current.final = current.evaluation;
      // if (previous.final) logEvalDistributeStep();
    }
    while (previous.final.print() !== current.final.print());

    return current.final.print();
  }
}
