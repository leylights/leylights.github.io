import { Molasses } from "../../../molasses.js";
export class ResumeLanguageComponent {
    constructor(parentElement, languageName, proficiencyLevel) {
        this.languageName = languageName;
        this.proficiencyLevel = proficiencyLevel;
        this.rebuildElement();
        parentElement.appendChild(this.element);
    }
    get fullText() {
        return `${this.languageName} \u2014 ${this.proficiencyLevel}`;
    }
    rebuildElement() {
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
//# sourceMappingURL=language-item.component.js.map