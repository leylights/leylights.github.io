import { Leylights } from "../../../leylights.js";

export class ResumeSkillComponent {
  skill: string;

  readonly aliases: string[];

  readonly isHighlighted: boolean;
  readonly searchForStrictWord: boolean = false;

  element: HTMLElement;

  constructor(parentElement: HTMLElement, skill: string, config?: {
    aliases?: string[],
    isHighlighted?: boolean,
    searchForStrictWord?: boolean,
  }) {
    this.skill = skill;

    this.aliases = [skill].concat(config?.aliases ?? [])
    this.isHighlighted = config?.isHighlighted;
    this.searchForStrictWord = config?.searchForStrictWord;

    this.rebuildElement();

    parentElement.appendChild(this.element);
  }

  rebuildElement(): HTMLElement {
    const resumeSkill = 'resume-skill',
      element = Leylights.createElement({
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
  public static highlightSkill(searchTerms: string[], config?: {
    skillElement?: HTMLElement,
    searchForStrictWord?: boolean
  }): number {
    const skillToHighlight = 'skill-to-highlight',
      userHighlightedSkill = 'user-highlighted-skill';

    console.log('searching for ' + searchTerms.join(','));

    Array.from(document.getElementsByClassName('resume-skill')).forEach((skill: HTMLLIElement) => {
      skill.classList.remove(skillToHighlight);
      skill.classList.remove('no-results');
    });

    if (config?.skillElement) config.skillElement.classList.add(skillToHighlight);
    else {
      document.querySelectorAll('#skills-list .resume-skill').forEach((skill: HTMLElement) => {
        // find any matches between searchTerms and skill alias array
        const leftMatches = skill.getAttribute('data-aliases').split(' ').filter((alias) => {
          return Leylights.Array.includes(searchTerms, alias);
        });

        if (leftMatches.length > 0) skill.classList.add(skillToHighlight);
      });
    }

    const spans = Array.from(document.getElementsByClassName('resume-highlight'))
      .concat(Array.from(document.getElementsByClassName('resume-highlight-no-css')));

    spans.forEach((span: HTMLSpanElement) => {
      span.classList.remove(userHighlightedSkill);
    });

    const mappedSearchTerms = searchTerms.map((term: string) => {
      let tempTerm = term.trim().toLowerCase();
      if (config?.searchForStrictWord)
        tempTerm = ` ${tempTerm} `;

      return tempTerm;
    });

    console.log(mappedSearchTerms);

    let matchCount: number = 0;
    mappedSearchTerms.forEach((searchTerm: string) => {
      spans.filter((span: HTMLSpanElement) => {
        if (span.innerText.trim().toLowerCase().includes(searchTerm))
          console.log(`match1: ${searchTerm} ${span.innerText.trim().toLowerCase()}`);
        if ((` ${<string>span.getAttribute('data-term')?.toLowerCase()} `).includes(searchTerm))
          console.log(`match2: ${searchTerm} ${span.getAttribute('data-term')}`);

        return span.innerText.trim().toLowerCase().includes(searchTerm)
          || (span.getAttribute('data-term')
            && (` ${<string>span.getAttribute('data-term').toLowerCase()} `).includes(searchTerm));
      }).forEach((selectedSpan: HTMLSpanElement) => {
        selectedSpan.classList.add(userHighlightedSkill);
        matchCount++;
      });
    });

    return matchCount;
  }
}
