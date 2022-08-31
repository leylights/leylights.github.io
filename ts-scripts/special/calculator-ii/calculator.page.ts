import { CalculatorCore } from "./calculator-core.js";
import { CalculatorParser } from "./parser.js";
import { CalculatorView } from "./view.js";
import { CalculatorCollector } from "./statement/collector.js";
import { CalculatorCommuter } from "./statement/commuter.js";
import { CalculatorDistributor } from "./statement/distributor.js";

const PRINT_DEBUG_LOGS: boolean = true;

class CalculatorPage {
  static init() {
    CalculatorView.registerInputEventListener((inputValue: string) => {
      try {
        CalculatorView.outputFields.main.value = CalculatorCore.calculate(inputValue, PRINT_DEBUG_LOGS);
      } catch (e) {
        CalculatorView.inputField.reject();
        throw e;
      }
    });
  }
}

CalculatorPage.init();

CalculatorParser.test();
CalculatorDistributor.test();
CalculatorCommuter.test();
CalculatorCollector.test();
