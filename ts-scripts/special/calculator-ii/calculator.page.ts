import { CalculatorCore } from "./calculator-core";
import { CalculatorParser } from "./parser";
import { CalculatorView } from "./view";
import { CalculatorCollector } from "./statement/collector";
import { CalculatorCommuter } from "./statement/commuter";
import { CalculatorDistributor } from "./statement/distributor";
import { CalculatorExponentExpander } from "./statement/exponent-expansion";
import { CoreDataService } from "../../services/core-data.service";
import { CalculatorIdentifier } from "./equation/identifier";
import { CalculatorSolver } from "./equation/solver";
import { CalculatorUserError } from "./models/user-facing-error";
import { CalculatorLogarithmDistributor } from "./statement/logarithm-distributor";
import { CalculatorEvaluator } from "./statement/evaluator";

const PRINT_DEBUG_LOGS: boolean = false;

class CalculatorPage {
  static init() {
    CalculatorView.registerInputEventListener((inputValue: string) => {
      try {
        const output = CalculatorCore.calculate(inputValue, { debug: PRINT_DEBUG_LOGS, clearPrint: true, showSteps: true }).simpleResult;
        if (typeof output !== 'string') throw new Error(`Bad output: ${output}`);

        CalculatorView.emitOutput(output);
      } catch (e) {
        if (e instanceof CalculatorUserError)
          CalculatorView.emitError(e);

        CalculatorView.inputField.reject();
        throw e;
      }
    });

    CalculatorView.stepsFullToggle.addEventListener('click', () => {
      CalculatorView.stepsFullToggle.classList.toggle('active');
      CalculatorView.stepsFull.classList.toggle('active');

      if (CalculatorView.stepsFullToggle.classList.contains('active'))
        CalculatorView.stepsFullToggle.innerText = 'Hide';
      else
        CalculatorView.stepsFullToggle.innerText = 'Show';
    });
  }
}

CalculatorPage.init();

if (CoreDataService.isDev) {
  console.log('Tests running');
  CalculatorParser.test();
  CalculatorExponentExpander.test();
  CalculatorDistributor.test();
  CalculatorCommuter.test();
  CalculatorCollector.test();
  CalculatorEvaluator.test();

  CalculatorLogarithmDistributor.test();

  CalculatorIdentifier.test();
  CalculatorSolver.test();
  CalculatorCore.test();
}
