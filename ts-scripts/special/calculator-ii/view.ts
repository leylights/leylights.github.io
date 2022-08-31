import { InputComponent } from "../../components/input.component.js";
import { cws } from "../../cws.js";

export class CalculatorView {
  static readonly inputField: InputComponent = new InputComponent({ element: document.getElementById('formula-input') as HTMLInputElement });

  static readonly outputsToStandardForm = document.getElementById('outputs-to-standard-form') as HTMLTextAreaElement;
  static readonly outputFields = {
    main: document.getElementById('formula-output') as HTMLTextAreaElement,
    titles: this.outputsToStandardForm.querySelector('.titles') as HTMLDivElement,
    values: this.outputsToStandardForm.querySelector('.values') as HTMLDivElement,
  }


  static registerInputEventListener(listener: (inputValue: string) => void) {
    CalculatorView.inputField.addEventListener('change', () => {
      CalculatorView.reset();
      listener(this.inputField.value);
    });
  }

  static reset() {
    this.outputFields.titles.innerHTML = '';
    this.outputFields.values.innerHTML = '';
  }

  static logStep(value: string, type: 'commutation' | 'distribution' | 'evaluation' | 'parsing' | 'collection', title?: string) {
    if (this.outputFields.titles.innerText.trim() !== '') {
      this.outputFields.titles.innerText += '\n';
      this.outputFields.values.innerText += '\n';
    }

    this.outputFields.titles.innerText += `${title ? `${title} ` : ''}${type}:`;
    this.outputFields.values.innerText += value;
  }
}
