interface Props {
  title: string;
  subtitle?: string;
  dates: string[];
  mainImageUrl: string;
  darkImageUrl: string;
  imageAlt: string;
  flipped?: boolean;
  invertDarkImg?: boolean;
  layout: "side" | "compact";
  children: JSX.Element;
}

export const ResumeExperienceItemComponent: React.FC<Props> = ({
  title,
  subtitle,
  dates,
  children,
  layout,
  flipped,
  mainImageUrl,
  darkImageUrl,
  imageAlt,
  invertDarkImg,
}) => {
  const containerClass = `experience-item${
    layout === "side" ? " side-layout" : " compact-layout"
  }${flipped ? " flipped" : ""}`;

  return (
    <div className={containerClass}>
      <div className="horizontal-grid experience-grid">
        <div className="experience-grid-body-cell">
          <div>
            <h3 className="job-title">{title}</h3>
            <h3 className="experience-date">{dates.join(", ")}</h3>
          </div>
          <h4 className="workplace-name">{subtitle}</h4>
          <div className="body">
            <div className="experience-image-container compact-image">
              <Images
                mainSrc={mainImageUrl}
                darkSrc={darkImageUrl}
                invertDark={invertDarkImg}
                alt={imageAlt}
              />
            </div>
            {children}
          </div>
        </div>
        <div className="experience-grid-image-cell side-image">
          <Images
            mainSrc={mainImageUrl}
            darkSrc={darkImageUrl}
            invertDark={invertDarkImg}
            alt={imageAlt}
          />
        </div>
      </div>
    </div>
  );
};

const Images: React.FC<{
  mainSrc: string;
  darkSrc: string;
  alt: string;
  invertDark?: boolean;
}> = ({ mainSrc, darkSrc, alt, invertDark }) => {
  return (
    <>
      <img className="experience-image dark-none" alt={alt} src={mainSrc} />
      <img
        className={`experience-image dark-only ${
          invertDark ? "dark-invert-filter" : ""
        }`}
        alt={alt}
        src={darkSrc}
      />
    </>
  );
};
