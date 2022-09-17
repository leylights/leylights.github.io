import { CalculatorCore } from "./calculator-core.js";
import { CalculatorParser } from "./parser.js";
import { CalculatorView } from "./view.js";
import { CalculatorCollector } from "./statement/collector.js";
import { CalculatorCommuter } from "./statement/commuter.js";
import { CalculatorDistributor } from "./statement/distributor.js";
import { CalculatorExponentExpander } from "./statement/exponent-expansion.js";
import { CoreDataService } from "../../services/core-data.service.js";
import { CalculatorIdentifier } from "./equation/identifier.js";
import { CalculatorSolver } from "./equation/solver.js";
import { CalculatorUserError } from "./models/user-facing-error.js";
import { CalculatorLogarithmDistributor } from "./statement/logarithm-distributor.js";
import { CalculatorEvaluator } from "./statement/evaluator.js";

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
