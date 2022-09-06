import { Leylights } from "../../../leylights.js";
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
        const resumeSkill = 'resume-skill', element = Leylights.createElement({
            type: 'li',
            innerText: this.skill,
            classList: [resumeSkill].concat(this.isHighlighted ? ['skill-emph'] : []),
            otherNodes: {
                'data-aliases': this.aliases.join(' ').toLowerCase(),
            }
        });
        element.addEventListener('click', () => {
            if (element.classList.contains('no-matches'))
                return;
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
    findSkillMatches() {
        return ResumeSkillComponent.findSkillMatches(this.aliases, this.searchForStrictWord);
    }
    static findSkillMatches(aliases, searchForStrictWord) {
        const skillToHighlight = 'skill-to-highlight', userHighlightedSkill = 'user-highlighted-skill';
        console.log('searching for ' + aliases.join(','));
        Array.from(document.getElementsByClassName('resume-skill')).forEach((skill) => {
            skill.classList.remove(skillToHighlight);
            skill.classList.remove('no-results');
        });
        const spans = Array.from(document.getElementsByClassName('resume-highlight'))
            .concat(Array.from(document.getElementsByClassName('resume-highlight-no-css')));
        spans.forEach((span) => {
            span.classList.remove(userHighlightedSkill);
        });
        const mappedSearchTerms = aliases.map((term) => {
            let tempTerm = term.trim().toLowerCase();
            if (searchForStrictWord)
                tempTerm = ` ${tempTerm} `;
            return tempTerm;
        });
        const searchResults = mappedSearchTerms.map((searchTerm) => {
            return spans.filter((span) => {
                return span.innerText.trim().toLowerCase().includes(searchTerm)
                    || (span.getAttribute('data-term')
                        && (` ${span.getAttribute('data-term').toLowerCase()} `).includes(searchTerm));
            });
        });
        let flattenedSpans = [];
        for (const s of searchResults)
            flattenedSpans = flattenedSpans.concat(s);
        return flattenedSpans;
    }
    highlightSkill() {
        const skillToHighlight = 'skill-to-highlight', userHighlightedSkill = 'user-highlighted-skill';
        const matches = this.findSkillMatches();
        for (const match of matches) {
            match.classList.add(userHighlightedSkill);
        }
        if (this.element)
            this.element.classList.add(skillToHighlight);
        else {
            document.querySelectorAll('#skills-list .resume-skill').forEach((skill) => {
                // find any matches between searchTerms and skill alias array
                const leftMatches = skill.getAttribute('data-aliases').split(' ').filter((alias) => {
                    return Leylights.Array.includes(this.aliases, alias);
                });
                if (leftMatches.length > 0)
                    skill.classList.add(skillToHighlight);
            });
        }
        return matches.length;
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
                    return Leylights.Array.includes(searchTerms, alias);
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
        let matchCount = 0;
        mappedSearchTerms.forEach((searchTerm) => {
            spans.filter((span) => {
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