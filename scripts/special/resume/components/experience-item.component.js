import { Leylights } from "../../../leylights.js";
import { ResumePage } from "../resume.page.js";
import { ResumeSkillComponent } from "./skill.component.js";
export class ResumeExperienceItemComponent {
    constructor(data) {
        this.title = data.title;
        this.subtitle = data.subtitle || null;
        this.dates = data.dates;
        this._experiencePoints = data.experiencePoints;
        this.isFlipped = data.flipped || false;
        if (data.type === 'grid')
            this.rebuildFn = this.rebuildGrid;
        else
            this.rebuildFn = this.rebuildTable;
        this._mainImageSrc = validateUrl(data.mainImageUrl);
        this._darkImageSrc = validateUrl(data.darkImageUrl);
        this._imageAlt = data.imageAlt;
        this._invertDarkImg = data.invertDarkImg || false;
        this.rebuildFn();
        data.parentElement.appendChild(this.container);
        function validateUrl(url) {
            if (url.includes('./'))
                throw new Error('URLs should have the siteimages folder as root.');
            return url;
        }
    }
    get images() {
        return Array.from(this.container.querySelectorAll('img'));
    }
    get experiencePoints() {
        return this._experiencePoints;
    }
    set experiencePoints(newPoints) {
        this._experiencePoints = newPoints;
        this.rebuildFn();
    }
    get experiencePointElements() {
        return Array.from(this.container.querySelectorAll('li'));
    }
    /**
     * Rebuilds this.container
     */
    rebuildTable() {
        const me = this, table = Leylights.createTable({
            head: [
                [
                    Leylights.createElement({
                        type: 'h3',
                        classList: 'job-title',
                        innerText: me.title,
                    }),
                    Leylights.createElement({
                        type: 'h3',
                        classList: 'experience-date',
                        innerText: me.dates.join(', '),
                    })
                ],
                this.subtitle ? [
                    Leylights.createElement({
                        type: 'h4',
                        classList: 'workplace-name',
                        innerText: me.subtitle,
                    }),
                    null
                ] : null,
            ],
            body: [
                getTableBody()
            ],
            classList: ['experience-table']
        }), container = Leylights.createElement({
            type: 'div',
            classList: 'experience-item',
            children: [table],
        });
        ResumePage.setFadeListener(container);
        container.querySelectorAll('.resume-highlight:not(.nolink)').forEach((highlight) => {
            highlight.addEventListener(('click'), () => {
                const terms = highlight.getAttribute('data-term')
                    ? highlight.getAttribute('data-term').split(' ')
                    : [highlight.innerHTML.trim()];
                ResumeSkillComponent.highlightSkill(terms, {
                    searchForStrictWord: Leylights.Array.includes(terms, 'Java'),
                });
            });
        });
        if (this.container) {
            this.container.replaceWith(container);
        }
        this.container = container;
        function getTableBody() {
            const elements = [Leylights.createElement({
                    type: 'div',
                    children: [
                        Leylights.createElement({
                            type: 'div',
                            classList: ['experience-image-container', 'mobile-only'],
                            children: me.getImages()
                        }),
                        Leylights.createElement({
                            type: 'ul',
                            children: me._experiencePoints.map((point) => {
                                return Leylights.createElement({
                                    type: 'li',
                                    innerHTML: me.formatPoint(point)
                                });
                            }),
                        }),
                    ]
                }),
                Leylights.createElement({
                    type: 'div',
                    classList: ['experience-image-container', 'desktop-only'],
                    children: me.getImages()
                })];
            if (me.isFlipped)
                return elements.reverse();
            else
                return elements;
        }
    }
    /**
     * Rebuilds this.container
     */
    rebuildGrid() {
        const me = this, grid = Leylights.createElement({
            type: 'div',
            classList: ['horizontal-grid', 'experience-grid'].concat(me.isFlipped ? ['reversed'] : []),
            children: getGridBody(),
        }), container = Leylights.createElement({
            type: 'div',
            classList: 'experience-item',
            children: [grid],
        });
        if (this.container) {
            this.container.replaceWith(container);
        }
        ResumePage.setFadeListener(container);
        container.querySelectorAll('.resume-highlight:not(.nolink)').forEach((highlight) => {
            highlight.addEventListener(('click'), () => {
                const terms = highlight.getAttribute('data-term')
                    ? highlight.getAttribute('data-term').split(' ')
                    : [highlight.innerHTML.trim()];
                ResumeSkillComponent.highlightSkill(terms, {
                    searchForStrictWord: Leylights.Array.includes(terms, 'java'),
                });
            });
        });
        this.container = container;
        function getGridBody() {
            const els = [Leylights.createElement({
                    type: 'div',
                    classList: 'experience-grid-body-cell',
                    children: [
                        Leylights.createElement({
                            type: 'div',
                            children: [
                                Leylights.createElement({
                                    type: 'h3',
                                    classList: 'job-title',
                                    innerText: me.title,
                                    style: 'float: left'
                                }),
                                Leylights.createElement({
                                    type: 'h3',
                                    classList: 'experience-date',
                                    innerText: me.dates.join(', '),
                                    style: 'float: right'
                                })
                            ]
                        }),
                        Leylights.createElement({
                            type: 'h4',
                            classList: 'workplace-name',
                            innerText: me.subtitle,
                            style: 'clear: both'
                        }),
                        Leylights.createElement({
                            type: 'div',
                            classList: ['experience-image-container', 'mobile-only'],
                            children: me.getImages(),
                        }),
                        Leylights.createElement({
                            type: 'ul',
                            children: me._experiencePoints.map((point) => {
                                return Leylights.createElement({
                                    type: 'li',
                                    innerHTML: me.formatPoint(point)
                                });
                            }),
                        }),
                    ]
                }), Leylights.createElement({
                    type: 'div',
                    classList: ['experience-grid-image-cell', 'desktop-only'],
                    children: me.getImages()
                })];
            if (me.isFlipped)
                return els.reverse();
            else
                return els;
        }
    }
    formatPoint(point) {
        // match the tag and all contents, but no contents can contain the closing </C> or </L>
        return point.replace(/<([CL])(?:(?!<\/\1>).)*<\/\1>/g, (match, tagName) => {
            const innerText = match.match(/>(.*)</)[1];
            // match inner contents
            let output = `<span class="resume-highlight`;
            if (tagName === 'L')
                output += ' language';
            if (match.match('nolink'))
                output += ' nolink';
            output += `" data-term="`;
            // match contents of term='js'
            const definedTerms = match.match(/term=['"]([^<]*)['"]/);
            if (definedTerms)
                output += definedTerms[1].toLowerCase();
            else
                output += innerText.toLowerCase();
            output += `">`;
            // if opening <C, <L exists, format innertext
            if (innerText.match(/<[CL]/))
                output += this.formatPoint(innerText);
            else
                output += innerText;
            output += '</span>';
            return output;
        });
    }
    getImages() {
        const me = this, classList = ['experience-image'].concat(me.isFlipped ? ['reversed'] : []).concat(me._invertDarkImg ? ['dark-invert-filter'] : []);
        return [Leylights.createElement({
                type: 'img',
                classList: classList.concat(['dark-none']),
                otherNodes: [{
                        type: 'src',
                        value: me._mainImageSrc
                    }, {
                        type: 'alt',
                        value: me._imageAlt
                    }]
            }), Leylights.createElement({
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
//# sourceMappingURL=experience-item.component.js.map