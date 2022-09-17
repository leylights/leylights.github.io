import { Molasses } from "../../../molasses.js";
import { ResumeExperienceItemComponent } from "./experience-item.component.js";
export class ResumeSmallExperienceItem {
    constructor(config) {
        this.rebuild(config);
    }
    rebuild(config) {
        const container = Molasses.createElement({
            type: 'div',
            classList: 'small-experience-item',
            innerHTML: `
      <h3 class="title">${config.title}</h3>
      <span class="date">${config.dates.join(', ')}</span>
      <div><p class="body">${ResumeExperienceItemComponent.formatPoint(config.body)}</p></div>
      `,
        });
        ResumeExperienceItemComponent.setHighlightEventListeners(container);
        if (this.container)
            this.container.replaceWith(container);
        else
            ResumeSmallExperienceItem.container.appendChild(container);
        this.container = container;
    }
}
ResumeSmallExperienceItem.container = document.getElementById('small-projects');
//# sourceMappingURL=small-experience-item.component.js.map