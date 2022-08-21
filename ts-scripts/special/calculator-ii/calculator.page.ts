import { InputComponent } from "../_components/input.component.js";
import { CalculatorParser } from "./parser.js";

const PRINT_DEBUG_LOGS: boolean = true;

class CalculatorPage {
  private static inputField: InputComponent = new InputComponent({ element: document.getElementById('formula-input') as HTMLInputElement });
  private static output: HTMLTextAreaElement = document.getElementById('formula-output') as HTMLTextAreaElement;

  static init() {
    CalculatorPage.inputField.addEventListener('change', e => {
      try {
        const output: string = new CalculatorParser(CalculatorPage.inputField.value, {
          debug: PRINT_DEBUG_LOGS,
        }).output.print();
        CalculatorPage.output.value = output;
      } catch (e) {
        this.inputField.reject();
        throw e;
      }
    });
   
    CalculatorParser.test();
  }
}

CalculatorPage.init();
