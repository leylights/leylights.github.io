export const ResumeSkillComponent: React.FC<{
  name: string;
  isHighlighted?: boolean;
  onClick?: () => void;
}> = ({ name, isHighlighted, onClick }) => {
  const classList = ["resume-skill"].concat(
    isHighlighted ? ["skill-emph"] : []
  );
  return (
    <li className={classList.join(" ")} onClick={onClick}>
      {name}
    </li>
  );
};
