import { ResumeExperienceItemComponent } from "./experience-item.component.js";
export class ResumeOccupationItemComponent extends ResumeExperienceItemComponent {
    constructor(data) {
        super({
            title: data.jobTitle,
            subtitle: data.workplaceName,
            parentElement: data.parentElement,
            dates: data.dates,
            mainImageUrl: data.mainImageUrl,
            darkImageUrl: data.darkImageUrl,
            imageAlt: data.workplaceName,
            experiencePoints: data.experiencePoints,
            layout: data.layout,
            flipped: data.flipped,
        });
    }
    get jobTitle() {
        return this.title;
    }
    get workplaceName() {
        return this.subtitle;
    }
}
//# sourceMappingURL=occupation-item.component.js.map