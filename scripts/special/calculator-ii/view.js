import { InputComponent } from "../../components/input.component.js";
import { cws } from "../../cws.js";
export class CalculatorView {
    static registerInputEventListener(listener) {
        CalculatorView.inputField.addEventListener('change', () => {
            CalculatorView.reset();
            listener(this.inputField.value);
        });
    }
    static reset() {
        this.outputsToStandardForm.innerHTML = '';
    }
    static logStep(value, type, title) {
        const idRoot = type.replace(/\s/g, '-').toLowerCase();
        this.outputsToStandardForm.appendChild(cws.createElement({ type: 'div', id: idRoot + '-title', innerText: `${title ? `${title} ` : ''}${type}:` }));
        this.outputsToStandardForm.appendChild(cws.createElement({ type: 'div', id: idRoot + '-value', innerText: value }));
    }
}
CalculatorView.inputField = new InputComponent({ element: document.getElementById('formula-input') });
CalculatorView.outputsToStandardForm = document.getElementById('outputs-to-standard-form');
CalculatorView.outputFields = {
    main: document.getElementById('formula-output'),
};
//# sourceMappingURL=view.js.map