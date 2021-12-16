import { cws } from "../../../cws.js";

export class ResumeSkillComponent {
  skill: string;
  isHighlighted: boolean;

  useWholeWordSearch: boolean = false;
  private _searchTerms: string[] = null;

  element: HTMLElement;

  constructor(parentElement: HTMLElement, skill: string, isHighlighted?: boolean, searchTerms?: string[], useWholeWordSearch?: boolean) {
    this.skill = skill;
    this.isHighlighted = isHighlighted;

    this._searchTerms = searchTerms;
    this.useWholeWordSearch = useWholeWordSearch;

    this.rebuildElement();

    parentElement.appendChild(this.element);
  }

  get searchTerms(): string[] {
    return [this.skill].concat(this._searchTerms ?? []);
  }

  rebuildElement(): HTMLElement {
    const me = this,
      resumeSkill = 'resume-skill',
      element = cws.createElement({
        type: 'li',
        innerText: this.skill,
        classList: [resumeSkill].concat(this.isHighlighted ? ['skill-emph'] : [])
      });

    element.addEventListener('click', () => {
      const skillToHighlight = 'skill-to-highlight',
        userHighlightedSkill = 'user-highlighted-skill',
        noResults = 'no-results';

      Array.from(document.getElementsByClassName('resume-skill')).forEach((skill: HTMLLIElement) => {
        skill.classList.remove(skillToHighlight);
        skill.classList.remove(noResults);
      })

      this.element.classList.add(skillToHighlight);

      const spans = Array.from(document.getElementsByClassName('resume-highlight')).concat(Array.from(document.getElementsByClassName('resume-highlight-no-css')));

      spans.forEach((span: HTMLSpanElement) => {
        span.classList.remove(userHighlightedSkill);
      });

      const searchTerms = this.searchTerms.map((term: string) => {
        let tempTerm = term.trim().toLowerCase();
        if (this.useWholeWordSearch)
          tempTerm = ` ${tempTerm} `;

        return tempTerm
      });

      let matchCount: number = 0;
      searchTerms.forEach((searchTerm: string) => {
        spans.filter((span: HTMLSpanElement) => {
          return span.innerText.trim().toLowerCase().includes(searchTerm) || span.classList.contains('highlight-as-' + searchTerm.trim());
        }).forEach((selectedSpan: HTMLSpanElement) => {
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