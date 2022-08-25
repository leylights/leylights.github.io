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
    static logNewDistribution(value) {
        this.outputsToStandardForm.appendChild(this.generateNewTextArea(value, 'Distribution'));
    }
    static logNewEvaluation(value) {
        this.outputsToStandardForm.appendChild(this.generateNewTextArea(value, 'Evaluation'));
    }
    static logNewCommutation(value) {
        this.outputsToStandardForm.appendChild(this.generateNewTextArea(value, 'Commutation'));
    }
    static generateNewTextArea(value, type) {
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
        });
    }
}
CalculatorView.inputField = new InputComponent({ element: document.getElementById('formula-input') });
CalculatorView.outputFields = {
    main: document.getElementById('formula-output'),
    parsing: document.getElementById('parser-output'),
    collect: document.getElementById('collect-output'),
};
CalculatorView.outputsToStandardForm = document.getElementById('outputs-to-standard-form');
//# sourceMappingURL=view.js.map