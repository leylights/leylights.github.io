import { Molasses } from "../../../molasses.js";

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

    this.aliases = [skill].concat(config?.aliases ?? []);
    this.isHighlighted = config?.isHighlighted;
    this.searchForStrictWord = config?.searchForStrictWord;

    this.rebuildElement();

    parentElement.appendChild(this.element);
  }

  rebuildElement(): HTMLElement {
    const resumeSkill = 'resume-skill',
      element = Molasses.createElement({
        type: 'li',
        innerText: this.skill,
        classList: [resumeSkill].concat(this.isHighlighted ? ['skill-emph'] : []),
        otherNodes: {
          'data-aliases': this.aliases.join(' ').toLowerCase(),
        }
      });

    element.addEventListener('click', () => {
      if (element.classList.contains('no-matches')) return;

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

  public findSkillMatches(): HTMLSpanElement[] {
    return ResumeSkillComponent.findSkillMatches(this.aliases, this.searchForStrictWord);
  }

  public static findSkillMatches(aliases: string[], searchForStrictWord: boolean): HTMLSpanElement[] {
    const skillToHighlight = 'skill-to-highlight',
      userHighlightedSkill = 'user-highlighted-skill';

    console.log('searching for ' + aliases.join(','));

    Array.from(document.getElementsByClassName('resume-skill')).forEach((skill: HTMLLIElement) => {
      skill.classList.remove(skillToHighlight);
      skill.classList.remove('no-results');
    });

    const spans = Array.from(document.getElementsByClassName('resume-highlight'))
      .concat(Array.from(document.getElementsByClassName('resume-highlight-no-css')));

    spans.forEach((span: HTMLSpanElement) => {
      span.classList.remove(userHighlightedSkill);
    });

    const mappedSearchTerms = aliases.map((term: string) => {
      let tempTerm = term.trim().toLowerCase();
      if (searchForStrictWord)
        tempTerm = ` ${tempTerm} `;

      return tempTerm;
    });

    const searchResults: HTMLElement[][] = mappedSearchTerms.map((searchTerm: string) => {
      return spans.filter((span: HTMLSpanElement) => {
        return span.innerText.trim().toLowerCase().includes(searchTerm)
          || (span.getAttribute('data-term')
            && (` ${<string>span.getAttribute('data-term').toLowerCase()} `).includes(searchTerm));
      }) as HTMLElement[];
    });

    let flattenedSpans: HTMLElement[] = [];
    for (const s of searchResults) flattenedSpans = flattenedSpans.concat(s);

    return flattenedSpans;
  }

  public highlightSkill(): number {
    const skillToHighlight = 'skill-to-highlight',
      userHighlightedSkill = 'user-highlighted-skill';

    const matches: HTMLElement[] = this.findSkillMatches();
    for (const match of matches) {
      match.classList.add(userHighlightedSkill);
    }

    if (this.element) this.element.classList.add(skillToHighlight);
    else {
      document.querySelectorAll('#skills-list .resume-skill').forEach((skill: HTMLElement) => {
        // find any matches between searchTerms and skill alias array
        const leftMatches = skill.getAttribute('data-aliases').split(' ').filter((alias) => {
          return Molasses.Array.includes(this.aliases, alias);
        });

        if (leftMatches.length > 0) skill.classList.add(skillToHighlight);
      });
    }

    return matches.length;
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
          return Molasses.Array.includes(searchTerms, alias);
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

    let matchCount: number = 0;
    mappedSearchTerms.forEach((searchTerm: string) => {
      spans.filter((span: HTMLSpanElement) => {
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
