import { Molasses } from "../../../molasses.js";

type LanguageProficicencyLevel = 'Native' | 'Fluent' | 'Conversational' | 'Fundamental';

export class ResumeLanguageComponent {
  languageName: string;
  proficiencyLevel: LanguageProficicencyLevel;

  element: HTMLElement;

  constructor(parentElement: HTMLElement, languageName: string, proficiencyLevel: LanguageProficicencyLevel) {
    this.languageName = languageName;
    this.proficiencyLevel = proficiencyLevel;

    this.rebuildElement();

    parentElement.appendChild(this.element);
  }

  get fullText(): string {
    return `${this.languageName} \u2014 ${this.proficiencyLevel}`;
  }

  rebuildElement(): HTMLElement {
    const element = Molasses.createElement({
      type: 'li',
      classList: ['resume-language', 'resume-highlight-no-css'],
      innerText: this.fullText,
    });

    if (this.element)
      this.element.replaceWith(element);

    delete this.element;
    this.element = element;

    return element;
  }
}
