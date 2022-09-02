import { InputComponent } from "../../components/input.component.js";
import { cws } from "../../cws.js";

export class CalculatorView {
  static readonly inputField: InputComponent = new InputComponent({ element: document.getElementById('formula-input') as HTMLInputElement });

  static readonly outputsToStandardForm = document.getElementById('outputs-to-standard-form') as HTMLTextAreaElement;
  static readonly outputFields = {
    main: document.getElementById('formula-output') as HTMLTextAreaElement,
  }


  static registerInputEventListener(listener: (inputValue: string) => void) {
    CalculatorView.inputField.addEventListener('change', () => {
      CalculatorView.reset();
      listener(this.inputField.value);
    });
  }

  static reset() {
    this.outputsToStandardForm.innerHTML = '';
  }

  static logStep(value: string, type: 'commutation' | 'distribution' | 'evaluation' | 'parsing' | 'collection' | 'exponent expansion', title?: string) {
    const idRoot = type.replace(/\s/g, '-').toLowerCase();
    this.outputsToStandardForm.appendChild(cws.createElement({ type: 'div', id: idRoot + '-title', innerText: `${title ? `${title} ` : ''}${type}:` }));
    this.outputsToStandardForm.appendChild(cws.createElement({ type: 'div', id: idRoot + '-value', innerText: value }))

  }
}
