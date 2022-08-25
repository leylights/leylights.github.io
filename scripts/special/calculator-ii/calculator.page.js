import { CalculatorCommuter } from "./commuter.js";
import { CalculatorCore } from "./calculator-core.js";
import { CalculatorDistributor } from "./distributor.js";
import { CalculatorParser } from "./parser.js";
import { CalculatorView } from "./view.js";
import { CalculatorCollector } from "./collector.js";
const PRINT_DEBUG_LOGS = true;
class CalculatorPage {
    static init() {
        CalculatorView.registerInputEventListener((inputValue) => {
            try {
                CalculatorView.outputFields.main.value = CalculatorCore.calculate(inputValue, PRINT_DEBUG_LOGS);
            }
            catch (e) {
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
//# sourceMappingURL=calculator.page.js.map