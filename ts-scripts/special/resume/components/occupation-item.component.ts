import { ResumeExperienceItemComponent } from "./experience-item.component";

interface ResumeOccupationItemComponentCreationData {
  parentElement: HTMLElement;
  jobTitle: string;
  workplaceName: string;
  dates: string[];
  experiencePoints: string[];
  mainImageUrl: string;
  darkImageUrl: string;
  flipped?: boolean;
  layout: 'side' | 'compact';
}

export class ResumeOccupationItemComponent extends ResumeExperienceItemComponent {
  container: HTMLElement;
  dates: string[];

  constructor(data: ResumeOccupationItemComponentCreationData) {
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

  get jobTitle(): string {
    return this.title;
  }

  get workplaceName(): string {
    return this.subtitle;
  }
}
