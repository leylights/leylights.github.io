import { Molasses } from "../../../molasses.js";
import { ResumePage } from "../resume.page.js";
import { ResumeSkillComponent } from "./skill.component.js";

interface ResumeExperienceItemComponentCreationData {
  parentElement: HTMLElement;
  title: string;
  subtitle?: string;
  dates: string[];
  experiencePoints: string[];
  mainImageUrl: string;
  darkImageUrl: string;
  imageAlt: string;
  flipped?: boolean;
  invertDarkImg?: boolean;
  layout: 'side' | 'compact';
}

export class ResumeExperienceItemComponent {
  container: HTMLElement;
  title: string;
  subtitle: string;
  dates: string[];

  isFlipped: boolean;
  layout: 'side' | 'compact';

  private _experiencePoints: string[];
  private _mainImageSrc: string;
  private _darkImageSrc: string;
  private _imageAlt: string;
  private _invertDarkImg: boolean;

  constructor(data: ResumeExperienceItemComponentCreationData) {
    this.title = data.title;
    this.subtitle = data.subtitle || null;
    this.dates = data.dates;
    this._experiencePoints = data.experiencePoints;
    this.isFlipped = data.flipped || false;
    this.layout = data.layout || 'compact';

    this._mainImageSrc = validateUrl(data.mainImageUrl);
    this._darkImageSrc = validateUrl(data.darkImageUrl);
    this._imageAlt = data.imageAlt;
    this._invertDarkImg = data.invertDarkImg || false;

    this.rebuild();

    data.parentElement.appendChild(this.container);

    function validateUrl(url: string): string {
      if (url.includes('./'))
        throw new Error('URLs should have the siteimages folder as root.');

      return url;
    }
  }

  get images(): HTMLImageElement[] {
    return Array.from(this.container.querySelectorAll('img')) as HTMLImageElement[];
  }

  get experiencePoints(): string[] {
    return this._experiencePoints;
  }

  set experiencePoints(newPoints: string[]) {
    this._experiencePoints = newPoints;
    this.rebuild();
  }


  get experiencePointElements(): HTMLLIElement[] {
    return Array.from(this.container.querySelectorAll('li'));
  }

  /**
   * Rebuilds this.container
   */
  private rebuild(): void {
    const me = this,
      grid = Molasses.createElement({
        type: 'div',
        classList: ['horizontal-grid', 'experience-grid'],
        children: getGridBody(),
      }),
      container = Molasses.createElement({
        type: 'div',
        classList: `experience-item ${me.layout}-layout ${me.isFlipped ? 'flipped' : ''}`,
        children: [grid],
      });

    if (this.container) {
      this.container.replaceWith(container);
    }

    ResumePage.setFadeListener(container);
    ResumeExperienceItemComponent.setHighlightEventListeners(container);
    this.container = container;

    function getGridBody(): HTMLElement[] {
      const els = [Molasses.createElement({
        type: 'div',
        classList: 'experience-grid-body-cell',
        children: [
          Molasses.createElement({
            type: 'div',
            children: [
              Molasses.createElement({
                type: 'h3',
                classList: 'job-title',
                innerText: me.title,
              }),
              Molasses.createElement({
                type: 'h3',
                classList: 'experience-date',
                innerText: me.dates.join(', '),
              })
            ]
          }),
          Molasses.createElement({
            type: 'h4',
            classList: 'workplace-name',
            innerText: me.subtitle,
          }),
          Molasses.createElement({
            type: 'div',
            classList: 'body',
            children: [
              Molasses.createElement({
                type: 'div',
                classList: ['experience-image-container', 'compact-image'],
                children: me.getImages(),
              }),
              Molasses.createElement({
                type: 'ul',
                children: me._experiencePoints.map((point: string) => {
                  return Molasses.createElement({
                    type: 'li',
                    innerHTML: ResumeExperienceItemComponent.formatPoint(point)
                  });
                }),
              }),
            ]
          })
        ]
      }), Molasses.createElement({
        type: 'div',
        classList: ['experience-grid-image-cell', 'side-image'],
        children: me.getImages()
      })];

      if (me.isFlipped)
        return els.reverse();
      else return els;
    }
  }

  static formatPoint(point: string): string {
    // match the tag and all contents, but no contents can contain the closing </C> or </L>
    return point.replace(/<([CL])(?:(?!<\/\1>).)*<\/\1>/g, (match, tagName) => {
      const innerText = match.match(/>(.*)</)[1];
      // match inner contents

      let output = `<span class="resume-highlight`;
      if (tagName === 'L') output += ' language';
      if (match.match('nolink')) output += ' nolink';
      output += `" data-term="`;

      // match contents of term='js'
      const definedTerms = match.match(/term=['"]([^<]*)['"]/);
      if (definedTerms) output += definedTerms[1].toLowerCase();
      else output += innerText.toLowerCase();
      output += `">`;

      // if opening <C, <L exists, format innertext
      if (innerText.match(/<[CL]/)) output += this.formatPoint(innerText);
      else output += innerText;

      output += '</span>';

      return output;
    });
  }

  static setHighlightEventListeners(container: HTMLElement): void {
    container.querySelectorAll('.resume-highlight:not(.nolink)').forEach((highlight: Element) => {
      highlight.addEventListener(('click'), () => {
        const terms: string[] = highlight.getAttribute('data-term')
          ? highlight.getAttribute('data-term').split(' ')
          : [highlight.innerHTML.trim()];

        ResumeSkillComponent.highlightSkill(terms, {
          searchForStrictWord: Molasses.Array.includes(terms, 'java'),
        });
      });
    });
  }

  private getImages(): HTMLImageElement[] {
    const me = this,
      classList = ['experience-image'].concat(me._invertDarkImg ? ['dark-invert-filter'] : []);

    return [Molasses.createElement({
      type: 'img',
      classList: classList.concat(['dark-none']),
      otherNodes: [{
        type: 'src',
        value: me._mainImageSrc
      }, {
        type: 'alt',
        value: me._imageAlt
      }]
    }), Molasses.createElement({
      type: 'img',
      classList: classList.concat(['dark-only']),
      otherNodes: [{
        type: 'src',
        value: me._darkImageSrc
      }, {
        type: 'alt',
        value: me._imageAlt
      }]
    })];
  }
}
