import { InputComponent } from "../../components/input.component";
import { Molasses } from "../../molasses";
import { CalculatorUserError } from "./models/user-facing-error";

export class CalculatorView {
  static readonly inputField: InputComponent = new InputComponent({ element: document.getElementById('formula-input') as HTMLInputElement });

  static readonly stepsPreview = document.getElementById('preview-steps');
  static readonly stepsFull = document.getElementById('steps-full');
  static readonly stepsFullToggle = document.getElementById('steps-toggle');
  static readonly outputFields = {
    main: document.getElementById('formula-output') as HTMLTextAreaElement,
    error: document.getElementById('calc-error-modal') as HTMLDivElement,
  }

  private static waitingLogs: { value: string, type: string, title: string }[] = [];
  private static logTimeouts: ReturnType<typeof setTimeout>[] = [];

  private static get LOG_DELAY(): number {
    let step: HTMLElement = this.stepsPreview.querySelector('.step');
    if (!step) {
      step = Molasses.createElement({ type: 'div', classList: 'step', style: 'display: none' });
      this.stepsPreview.appendChild(step);
    }

    return parseFloat(
      window.getComputedStyle(step).animationDuration
    ) * 1000;
  }

  static registerInputEventListener(listener: (inputValue: string) => void) {
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
    for (const t of this.logTimeouts) clearInterval(t);
    this.logTimeouts = [];
  }

  static clearError() {
    this.outputFields.error.classList.remove('active');
  }

  static emitError(error: CalculatorUserError) {
    this.outputFields.error.querySelector('.error-msg').innerHTML = error.message;
    this.outputFields.error.classList.add('active');
    this.outputFields.error.setAttribute('data-last-error', Date.now() + '');
  }

  static emitOutput(output: string): void {
    // reset font
    this.outputFields.main.style.fontSize = '';

    this.outputFields.main.value = output;

    // set font to correct size, min 8px
    let fontSize: number = parseFloat(window.getComputedStyle(this.outputFields.main).fontSize);
    while (fontSize > 8 && this.outputFields.main.scrollWidth > this.outputFields.main.clientWidth)
      this.outputFields.main.style.fontSize = `${--fontSize}px`;
  }

  static logStep(value: string, type: string, title?: string) {
    this.waitingLogs.push({ value: value, type: Molasses.toTitleCase(type), title: Molasses.toTitleCase(title) });
  }

  private static activateLogs() {
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

  private static logStepToPreview(value: string, type: string, title?: string) {
    const idRoot = type.replace(/\s/g, '-').toLowerCase();

    const step: HTMLDivElement = Molasses.createElement({
      type: 'div',
      classList: 'step step-preview',
      id: idRoot + '-preview',
      innerHTML: `${title ? `${title} ` : ''}${type}: ${value}`,
    });

    this.stepsPreview.appendChild(step);
    setTimeout(() => step.remove(), this.LOG_DELAY);
  }

  private static logStepToFullOutput(value: string, type: string, title?: string) {
    const idRoot = type.replace(/\s/g, '-').toLowerCase();

    const elements: HTMLDivElement[] = [
      Molasses.createElement({ type: 'div', classList: 'step step-title', id: idRoot + '-title', innerHTML: `${title ? `${title} ` : ''}${type}:` }),
      Molasses.createElement({ type: 'div', classList: 'step step-value', id: idRoot + '-value', innerHTML: value })
    ];

    for (const el of elements) {
      this.stepsFull.appendChild(el);
    }
  }
}
