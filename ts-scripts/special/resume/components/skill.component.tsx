import { useRef } from "react";

export const ResumeSkillComponent: React.FC<{
  name: string;
  isEmphasized?: boolean;
  onClick?: () => void;
  id?: string;
}> = ({ name, id, isEmphasized, onClick }) => {
  const self = useRef<HTMLLIElement>();
  const classList = ["resume-skill"].concat(isEmphasized ? ["skill-emph"] : []);

  const handleClick = () => {
    if (self.current.classList.contains("no-matches")) {
      return;
    }

    onClick();
  };

  return (
    <li
      className={classList.join(" ")}
      onClick={handleClick}
      id={id}
      ref={self}
    >
      {name}
    </li>
  );
};
