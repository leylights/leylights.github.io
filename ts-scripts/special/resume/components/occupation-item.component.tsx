import { ResumeExperienceItemComponent } from "./experience-item.component";

interface Props {
  jobTitle: string;
  workplaceName: string;
  dates: string[];
  mainImageUrl: string;
  darkImageUrl: string;
  flipped?: boolean;
  layout: "side" | "compact";
  invertDarkImg?: boolean;
  children: JSX.Element;
}

export const ResumeOccupationItemComponent: React.FC<Props> = ({
  jobTitle,
  workplaceName,
  dates,
  mainImageUrl,
  darkImageUrl,
  flipped,
  layout,
  invertDarkImg,
  children,
}) => (
  <ResumeExperienceItemComponent
    title={jobTitle}
    subtitle={workplaceName}
    dates={dates}
    mainImageUrl={mainImageUrl}
    darkImageUrl={darkImageUrl}
    flipped={flipped}
    layout={layout}
    invertDarkImg={invertDarkImg}
    imageAlt=""
  >
    {children}
  </ResumeExperienceItemComponent>
);
