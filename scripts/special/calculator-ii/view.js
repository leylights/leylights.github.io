var _a;
import { InputComponent } from "../../components/input.component.js";
export class CalculatorView {
    static registerInputEventListener(listener) {
        CalculatorView.inputField.addEventListener('change', () => {
            CalculatorView.reset();
            listener(this.inputField.value);
        });
    }
    static reset() {
        this.outputFields.titles.innerHTML = '';
        this.outputFields.values.innerHTML = '';
    }
    static logStep(value, type, title) {
        if (this.outputFields.titles.innerText.trim() !== '') {
            this.outputFields.titles.innerText += '\n';
            this.outputFields.values.innerText += '\n';
        }
        this.outputFields.titles.innerText += `${title ? `${title} ` : ''}${type}:`;
        this.outputFields.values.innerText += value;
    }
}
_a = CalculatorView;
CalculatorView.inputField = new InputComponent({ element: document.getElementById('formula-input') });
CalculatorView.outputsToStandardForm = document.getElementById('outputs-to-standard-form');
CalculatorView.outputFields = {
    main: document.getElementById('formula-output'),
    titles: _a.outputsToStandardForm.querySelector('.titles'),
    values: _a.outputsToStandardForm.querySelector('.values'),
};
//# sourceMappingURL=view.js.map