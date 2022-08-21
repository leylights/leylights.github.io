import { InputComponent } from "../_components/input.component.js";
import { CalculatorParser } from "./parser.js";
const PRINT_DEBUG_LOGS = true;
class CalculatorPage {
    static init() {
        CalculatorPage.inputField.addEventListener('change', e => {
            try {
                const output = new CalculatorParser(CalculatorPage.inputField.value, {
                    debug: PRINT_DEBUG_LOGS,
                }).output.print();
                CalculatorPage.output.value = output;
            }
            catch (e) {
                this.inputField.reject();
                throw e;
            }
        });
        CalculatorParser.test();
    }
}
CalculatorPage.inputField = new InputComponent({ element: document.getElementById('formula-input') });
CalculatorPage.output = document.getElementById('formula-output');
CalculatorPage.init();
//# sourceMappingURL=calculator.page.js.map