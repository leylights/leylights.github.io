import { InputComponent } from "../../components/input.component.js";
import { cws } from "../../cws.js";

export class CalculatorView {
  static readonly inputField: InputComponent = new InputComponent({ element: document.getElementById('formula-input') as HTMLInputElement });

  static readonly outputFields = {
    main: document.getElementById('formula-output') as HTMLTextAreaElement,
    parsing: document.getElementById('parser-output') as HTMLTextAreaElement,
    collect: document.getElementById('collect-output') as HTMLTextAreaElement,
  }

  static readonly outputsToStandardForm = document.getElementById('outputs-to-standard-form') as HTMLDivElement;

  static registerInputEventListener(listener: (inputValue: string) => void) {
    CalculatorView.inputField.addEventListener('change', () => {
      CalculatorView.reset();
      listener(this.inputField.value);
    });
  }

  static reset() {
    this.outputsToStandardForm.innerHTML = '';
  }

  static logNewDistribution(value: string) {
    this.outputsToStandardForm.appendChild(this.generateNewTextArea(value, 'Distribution'));
  }

  static logNewEvaluation(value: string) {
    this.outputsToStandardForm.appendChild(this.generateNewTextArea(value, 'Evaluation'));
  }

  static logNewCommutation(value: string) {
    this.outputsToStandardForm.appendChild(this.generateNewTextArea(value, 'Commutation'));
  }

  private static generateNewTextArea(value: string, type: string): HTMLDivElement {
    return cws.createElement({
      type: 'div',
      classList: `${type.toLowerCase()}-step`,
      children: [cws.createElement({
        type: 'h3',
        innerText: type,
      }), cws.createElement({
        type: 'textarea',
        otherNodes: {
          disabled: 'true',
        },
        innerText: value,
      })],
    })
  }
}
