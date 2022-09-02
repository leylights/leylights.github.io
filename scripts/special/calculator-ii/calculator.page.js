import { CalculatorCore } from "./calculator-core.js";
import { CalculatorParser } from "./parser.js";
import { CalculatorView } from "./view.js";
import { CalculatorCollector } from "./statement/collector.js";
import { CalculatorCommuter } from "./statement/commuter.js";
import { CalculatorDistributor } from "./statement/distributor.js";
import { CalculatorExponentExpander } from "./statement/exponent-expansion.js";
import { CoreDataService } from "../../services/core-data.service.js";
import { CalculatorIdentifier } from "./equation/identifier.js";
const PRINT_DEBUG_LOGS = false;
class CalculatorPage {
    static init() {
        CalculatorView.registerInputEventListener((inputValue) => {
            try {
                CalculatorView.outputFields.main.value = CalculatorCore.calculate(inputValue, { debug: PRINT_DEBUG_LOGS, clearPrint: true });
            }
            catch (e) {
                CalculatorView.inputField.reject();
                throw e;
            }
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
    CalculatorIdentifier.test();
}
//# sourceMappingURL=calculator.page.js.map