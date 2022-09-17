import { InputComponent } from "../../components/input.component.js";
import { Molasses } from "../../molasses.js";
export class CalculatorView {
    static get LOG_DELAY() {
        let step = this.stepsPreview.querySelector('.step');
        if (!step) {
            step = Molasses.createElement({ type: 'div', classList: 'step', style: 'display: none' });
            this.stepsPreview.appendChild(step);
        }
        return parseFloat(window.getComputedStyle(step).animationDuration) * 1000;
    }
    static registerInputEventListener(listener) {
        CalculatorView.inputField.addEventListener('change', () => {
            CalculatorView.reset();
            listener(this.inputField.value);
            this.activateLogs();
        });
    }
    static reset() {
        this.stepsPreview.innerHTML = '';
        this.stepsFull.innerHTML = '';
        this.clearError();
        this.waitingLogs = [];
        for (const t of this.logTimeouts)
            clearInterval(t);
        this.logTimeouts = [];
    }
    static clearError() {
        this.outputFields.error.classList.remove('active');
    }
    static emitError(error) {
        this.outputFields.error.querySelector('.error-msg').innerHTML = error.message;
        this.outputFields.error.classList.add('active');
        this.outputFields.error.setAttribute('data-last-error', Date.now() + '');
    }
    static emitOutput(output) {
        // reset font
        this.outputFields.main.style.fontSize = '';
        this.outputFields.main.value = output;
        // set font to correct size, min 8px
        let fontSize = parseFloat(window.getComputedStyle(this.outputFields.main).fontSize);
        while (fontSize > 8 && this.outputFields.main.scrollWidth > this.outputFields.main.clientWidth)
            this.outputFields.main.style.fontSize = `${--fontSize}px`;
    }
    static logStep(value, type, title) {
        this.waitingLogs.push({ value: value, type: Molasses.toTitleCase(type), title: Molasses.toTitleCase(title) });
    }
    static activateLogs() {
        for (let i = 0; i < 30; i++) {
            this.logTimeouts.push(setTimeout(() => {
                if (this.waitingLogs[0]) {
                    this.logStepToPreview(this.waitingLogs[0].value, this.waitingLogs[0].type, this.waitingLogs[0].title);
                    this.logStepToFullOutput(this.waitingLogs[0].value, this.waitingLogs[0].type, this.waitingLogs[0].title);
                    this.waitingLogs.splice(0, 1);
                }
            }, i * (this.LOG_DELAY / 2)));
        }
    }
    static logStepToPreview(value, type, title) {
        const idRoot = type.replace(/\s/g, '-').toLowerCase();
        const step = Molasses.createElement({
            type: 'div',
            classList: 'step step-preview',
            id: idRoot + '-preview',
            innerHTML: `${title ? `${title} ` : ''}${type}: ${value}`,
        });
        this.stepsPreview.appendChild(step);
        setTimeout(() => step.remove(), this.LOG_DELAY);
    }
    static logStepToFullOutput(value, type, title) {
        const idRoot = type.replace(/\s/g, '-').toLowerCase();
        const elements = [
            Molasses.createElement({ type: 'div', classList: 'step step-title', id: idRoot + '-title', innerHTML: `${title ? `${title} ` : ''}${type}:` }),
            Molasses.createElement({ type: 'div', classList: 'step step-value', id: idRoot + '-value', innerHTML: value })
        ];
        for (const el of elements) {
            this.stepsFull.appendChild(el);
        }
    }
}
CalculatorView.inputField = new InputComponent({ element: document.getElementById('formula-input') });
CalculatorView.stepsPreview = document.getElementById('preview-steps');
CalculatorView.stepsFull = document.getElementById('steps-full');
CalculatorView.stepsFullToggle = document.getElementById('steps-toggle');
CalculatorView.outputFields = {
    main: document.getElementById('formula-output'),
    error: document.getElementById('calc-error-modal'),
};
CalculatorView.waitingLogs = [];
CalculatorView.logTimeouts = [];
//# sourceMappingURL=view.js.map