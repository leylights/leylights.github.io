import { cws } from "../../../cws.js";
export class ResumeSkillComponent {
    constructor(parentElement, skill, config) {
        var _a;
        this.searchForStrictWord = false;
        this.skill = skill;
        this.aliases = [skill].concat((_a = config === null || config === void 0 ? void 0 : config.aliases) !== null && _a !== void 0 ? _a : []);
        this.isHighlighted = config === null || config === void 0 ? void 0 : config.isHighlighted;
        this.searchForStrictWord = config === null || config === void 0 ? void 0 : config.searchForStrictWord;
        this.rebuildElement();
        parentElement.appendChild(this.element);
    }
    rebuildElement() {
        const resumeSkill = 'resume-skill', element = cws.createElement({
            type: 'li',
            innerText: this.skill,
            classList: [resumeSkill].concat(this.isHighlighted ? ['skill-emph'] : []),
            otherNodes: {
                'data-aliases': this.aliases.join(' ').toLowerCase(),
            }
        });
        element.addEventListener('click', () => {
            const matchCount = ResumeSkillComponent.highlightSkill(this.aliases, {
                skillElement: this.element,
                searchForStrictWord: this.searchForStrictWord,
            });
            if (matchCount === 0)
                this.element.classList.add('no-results');
        });
        if (this.element)
            this.element.replaceWith(element);
        delete this.element;
        this.element = element;
        return element;
    }
    /**
     * @returns the number of matches found
     */
    static highlightSkill(searchTerms, config) {
        const skillToHighlight = 'skill-to-highlight', userHighlightedSkill = 'user-highlighted-skill';
        console.log('searching for ' + searchTerms.join(','));
        Array.from(document.getElementsByClassName('resume-skill')).forEach((skill) => {
            skill.classList.remove(skillToHighlight);
            skill.classList.remove('no-results');
        });
        if (config === null || config === void 0 ? void 0 : config.skillElement)
            config.skillElement.classList.add(skillToHighlight);
        else {
            document.querySelectorAll('#skills-list .resume-skill').forEach((skill) => {
                // find any matches between searchTerms and skill alias array
                const leftMatches = skill.getAttribute('data-aliases').split(' ').filter((alias) => {
                    return cws.Array.includes(searchTerms, alias);
                });
                if (leftMatches.length > 0)
                    skill.classList.add(skillToHighlight);
            });
        }
        const spans = Array.from(document.getElementsByClassName('resume-highlight'))
            .concat(Array.from(document.getElementsByClassName('resume-highlight-no-css')));
        spans.forEach((span) => {
            span.classList.remove(userHighlightedSkill);
        });
        const mappedSearchTerms = searchTerms.map((term) => {
            let tempTerm = term.trim().toLowerCase();
            if (config === null || config === void 0 ? void 0 : config.searchForStrictWord)
                tempTerm = ` ${tempTerm} `;
            return tempTerm;
        });
        console.log(mappedSearchTerms);
        let matchCount = 0;
        mappedSearchTerms.forEach((searchTerm) => {
            spans.filter((span) => {
                var _a;
                if (span.innerText.trim().toLowerCase().includes(searchTerm))
                    console.log(`match1: ${searchTerm} ${span.innerText.trim().toLowerCase()}`);
                if ((` ${(_a = span.getAttribute('data-term')) === null || _a === void 0 ? void 0 : _a.toLowerCase()} `).includes(searchTerm))
                    console.log(`match2: ${searchTerm} ${span.getAttribute('data-term')}`);
                return span.innerText.trim().toLowerCase().includes(searchTerm)
                    || (span.getAttribute('data-term')
                        && (` ${span.getAttribute('data-term').toLowerCase()} `).includes(searchTerm));
            }).forEach((selectedSpan) => {
                selectedSpan.classList.add(userHighlightedSkill);
                matchCount++;
            });
        });
        return matchCount;
    }
}
//# sourceMappingURL=skill.component.js.map