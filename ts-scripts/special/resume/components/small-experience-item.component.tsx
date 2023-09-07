interface Props {
  title: string;
  dates: string[];
  children: JSX.Element;
}

export const ResumeSmallExperienceItem: React.FC<Props> = ({
  title,
  dates,
  children,
}) => {
  return (
    <div className="small-experience-item">
      <h3 className="title">{title}</h3>
      <span className="date">{dates.join(", ")}</span>
      <div>
        <p className="body">{children}</p>
      </div>
    </div>
  );
};
