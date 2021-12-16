import { cws } from "../../../cws.js";
export class ResumeSkillComponent {
    constructor(parentElement, skill, isHighlighted, searchTerms, useWholeWordSearch) {
        this.useWholeWordSearch = false;
        this._searchTerms = null;
        this.skill = skill;
        this.isHighlighted = isHighlighted;
        this._searchTerms = searchTerms;
        this.useWholeWordSearch = useWholeWordSearch;
        this.rebuildElement();
        parentElement.appendChild(this.element);
    }
    get searchTerms() {
        var _a;
        return [this.skill].concat((_a = this._searchTerms) !== null && _a !== void 0 ? _a : []);
    }
    rebuildElement() {
        const me = this, resumeSkill = 'resume-skill', element = cws.createElement({
            type: 'li',
            innerText: this.skill,
            classList: [resumeSkill].concat(this.isHighlighted ? ['skill-emph'] : [])
        });
        element.addEventListener('click', () => {
            const skillToHighlight = 'skill-to-highlight', userHighlightedSkill = 'user-highlighted-skill', noResults = 'no-results';
            Array.from(document.getElementsByClassName('resume-skill')).forEach((skill) => {
                skill.classList.remove(skillToHighlight);
                skill.classList.remove(noResults);
            });
            this.element.classList.add(skillToHighlight);
            const spans = Array.from(document.getElementsByClassName('resume-highlight')).concat(Array.from(document.getElementsByClassName('resume-highlight-no-css')));
            spans.forEach((span) => {
                span.classList.remove(userHighlightedSkill);
            });
            const searchTerms = this.searchTerms.map((term) => {
                let tempTerm = term.trim().toLowerCase();
                if (this.useWholeWordSearch)
                    tempTerm = ` ${tempTerm} `;
                return tempTerm;
            });
            let matchCount = 0;
            searchTerms.forEach((searchTerm) => {
                spans.filter((span) => {
                    return span.innerText.trim().toLowerCase().includes(searchTerm) || span.classList.contains('highlight-as-' + searchTerm.trim());
                }).forEach((selectedSpan) => {
                    selectedSpan.classList.add(userHighlightedSkill);
                    matchCount++;
                });
            });
            if (matchCount === 0)
                this.element.classList.add(noResults);
        });
        if (this.element)
            this.element.replaceWith(element);
        delete this.element;
        this.element = element;
        return element;
    }
}
//# sourceMappingURL=skill.component.js.map