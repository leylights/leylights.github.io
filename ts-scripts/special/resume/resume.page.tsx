import { SpotlightHeader } from "../showcase/components/spotlight-header.component";
import { CoreDataService } from "../../services/core-data.service";
import { ResumeExperienceItemComponent } from "./components/experience-item.component";
import { ResumeLanguageComponent } from "./components/language-item.component";
import { ResumeOccupationItemComponent } from "./components/occupation-item.component";
import { ResumeSkillComponent } from "./components/skill.component";
import { ResumeSmallExperienceItem } from "./components/small-experience-item.component";
import { Molasses } from "../../molasses";
import { createRoot } from "react-dom/client";
import React, { useEffect, useState } from "react";

const Language: React.FC<{
  children: React.ReactNode;
  term?: string;
}> = ({ term, children }) => {
  return (
    <Term term={term} className="language">
      {children}
    </Term>
  );
};

const Term: React.FC<{
  children: React.ReactNode;
  term?: string;
  className?: string;
}> = ({ term, className, children }) => {
  const [isActive, setIsActive] = useState<boolean>(false);

  const classNames = ["resume-highlight"];
  if (!term) classNames.push("nolink");
  if (className) classNames.push(className);
  if (isActive) classNames.push("active");

  useEffect(() => {
    if (term) {
      const skillsToMatch = term.split(" ");

      ResumePage.matchSkillListToSkills(skillsToMatch, setIsActive);
    }
  }, []);

  return (
    <span className={classNames.join(" ")} data-term={term}>
      {children}
    </span>
  );
};

class SkillData {
  names: string[];
  strict: boolean;
  toggleListeners: ((isActive: boolean) => void)[] = [];

  constructor(names: string[], strict: boolean) {
    this.names = names;
    this.strict = strict;
  }
}

export class ResumePage {
  static skillMap: Record<string, SkillData> = {};
  static languages: ResumeLanguageComponent[] = [];

  static fadeInElements: HTMLElement[] = [];

  static init() {
    new SpotlightHeader(document.getElementById("showcase"));
    ResumePage.setContactInfo();

    document.getElementById("name").innerText = CoreDataService.personalName;

    this.loadSkills();

    this.loadExperience();
    this.loadProjects();
    this.loadLanguages();

    this.loadContact();
  }

  private static loadExperience(): void {
    const root = createRoot(document.getElementById("experience-container"));

    // use <Term> to highlight anything, <Language> to highlight languages and tools

    root.render(
      <>
        <ResumeOccupationItemComponent
          workplaceName="Faire"
          jobTitle="Frontend Engineer"
          dates={["Winter 2023"]}
          mainImageUrl="/siteimages/resume/faire.svg"
          darkImageUrl="/siteimages/resume/faire.svg"
          invertDarkImg
          layout="compact"
        >
          <ul>
            <li>
              <Term term="leadership">Managed the implementation</Term> of
              experimental features, coordinating engineers and designers to
              achieve goals
            </li>
            <li>
              <Term term="independence leadership">
                Independently scoped and implemented
              </Term>{" "}
              <Term term="accessibility">WCAG 2.1 accessibility</Term> features,
              drawing praise from external teams{" "}
            </li>
            <li>
              <Term term="independence leadership">
                Outlined and implemented
              </Term>{" "}
              incident{" "}
              <Term term="independence leadership quality">
                post-mortem recommendations
              </Term>{" "}
              , improving engineering <Term term="quality">quality</Term>{" "}
              practices to{" "}
              <Term term="quality">prevent production failures</Term>
            </li>
            <li>
              Contributed to overhauling a mature React-based web app to use
              modern{" "}
              <Language term="React typescript javascript">React</Language>{" "}
              state management patterns
            </li>
          </ul>
        </ResumeOccupationItemComponent>
        <ResumeOccupationItemComponent
          workplaceName="Vidyard"
          jobTitle="Software Developer (Web Team)"
          dates={["Winter 2022"]}
          mainImageUrl="/siteimages/resume/vidyard.svg"
          darkImageUrl="/siteimages/resume/vidyard_dark.svg"
          layout="compact"
          flipped
        >
          <ul>
            <li>
              Led integration of{" "}
              <Language term="quality javascript typescript">Jest</Language>,{" "}
              <Language term="quality javascript">ESLint</Language>, and{" "}
              <Language term="typescript">TypeScript</Language> with a mature
              codebase, starting the team's use of{" "}
              <Term term="quality">test-driven development</Term> with{" "}
              <Term term="quality">28% code coverage</Term> in two months to
              reduce and prevent user-facing errors.
            </li>
            <li>
              Performed and improved on a{" "}
              <Term term="accessibility design html css">
                WCAG2.1 accessibility audit
              </Term>{" "}
              to <Term term="accessibility design">decrease UX friction</Term>{" "}
              and <Term term="accessibility design">increase conversion</Term>.
            </li>
            <li>
              Overhauled a <Language term="php">PHP</Language> component library
              to implement <Term>object-oriented programming</Term> principles,
              decreasing ticket cycle time.
            </li>
            <li>
              <Term term="communication">Collaborated with external teams</Term>{" "}
              to clarify requirements and deliver progress updates.
            </li>
          </ul>
        </ResumeOccupationItemComponent>
        <ResumeOccupationItemComponent
          workplaceName="Uptake Canada"
          jobTitle="Full-stack Software Developer"
          dates={["Summer 2021"]}
          mainImageUrl="/siteimages/resume/uptake.png"
          darkImageUrl="/siteimages/resume/uptake_dark.png"
          layout="compact"
        >
          <ul>
            <li>
              Independently developed{" "}
              <Language term="javascript typescript api">NestJS</Language>{" "}
              <Term term="api">RESTful API</Term> endpoints and complex{" "}
              <Language term="api sql">SQL</Language> stored procedures to
              support frontend specifications`
            </li>
            <li>
              Developed <Term>new frontend interfaces</Term> using{" "}
              <Language term="javascript">ExtJS</Language> to support design
              specifications and display API data.
            </li>
            <li>
              `Contributed to the development process, including{" "}
              <Language term="git">git</Language> workflows,
              <Term term="quality communication">code reviews</Term>,{" "}
              <Term term="quality">test-driven development</Term>, and
              consultation with design teams to{" "}
              <Term term="quality">maximize code confidence</Term> and
              acceptability
            </li>
          </ul>
        </ResumeOccupationItemComponent>
        <ResumeOccupationItemComponent
          workplaceName="Salus Global"
          jobTitle="Software Designer/Developer"
          dates={["Summer 2019", "Summer 2020"]}
          mainImageUrl="/siteimages/resume/salus.png"
          darkImageUrl="/siteimages/resume/salus_dark.png"
          layout="compact"
          flipped
        >
          <ul>
            <li>
              Designed and developed a{" "}
              <Term term="independence html css">
                mobile-friendly online eLearning platform
              </Term>{" "}
              for an international client with 2300+ total users, using{" "}
              <Language>HTML</Language>, <Language>CSS</Language>,{" "}
              <Language>JavaScript</Language>, and an internal language.
              Entrusted with implementing <Language>CSS</Language> with minimal
              HTML changes to render an existing platform with 2500+ users{" "}
              <Term term="css">mobile-aware</Term>
            </li>
            <li>
              Developed and implemented <Language>JavaScript</Language> web
              components to <Term>promote user engagement</Term> with
              educational materials
            </li>
            <li>
              <Term term="design">Led the visual design work</Term> for a mobile
              eLearning app deployed to 10 000+ users
            </li>
            <li>
              Edited supervisors' external communications to ensure greater
              professionalism and impact in dealings with clients.
            </li>
          </ul>
        </ResumeOccupationItemComponent>
        <ResumeOccupationItemComponent
          workplaceName="Western University &#8211; Bit by Bit Computer Camp"
          jobTitle="Youth Leader"
          dates={["Summer 2018", "Summer 2019"]}
          mainImageUrl="/siteimages/resume/western.png"
          darkImageUrl="/siteimages/resume/western_dark.png"
          flipped
          layout="side"
        >
          <ul>
            <li>
              <Term term="team">Worked with a team</Term> to organize and run a
              highly-successful educational summer camp for ~80 local youth per
              week
            </li>
            <li>
              <Term term="communication">Taught engaging lessons</Term> on basic
              fundamentals in <Language>Scratch</Language>,{" "}
              <Language>Photoshop</Language>, <Language>Python</Language>, and{" "}
              <Language term="html css">HTML/CSS</Language>
            </li>
            <li>
              Commended by supervisors for exceptional{" "}
              <Term term="initiative leadership">initiative</Term> and{" "}
              <Term term="initiative leadership">leadership</Term>
            </li>
          </ul>
        </ResumeOccupationItemComponent>
        <ResumeOccupationItemComponent
          workplaceName="Arcane &#8211; Arcane Code Camp"
          jobTitle="Instructional Assistant"
          dates={["Fall 2017, Winter 2018"]}
          mainImageUrl="/siteimages/resume/arcane.png"
          darkImageUrl="/siteimages/resume/arcane_dark.png"
          layout="side"
        >
          <ul>
            <li>
              <Term term="team">Worked with a team</Term> to teach{" "}
              <Language>JavaScript</Language> fundamentals to local youth
            </li>
            <li>
              Led 1-1 lessons with struggling students to reduce drop-out rates
            </li>
          </ul>
        </ResumeOccupationItemComponent>
      </>
    );
  }

  private static loadLanguages(): void {
    const parentElement = document.getElementById("languages-list");

    ResumePage.languages.push(
      new ResumeLanguageComponent(parentElement, "English", "Native")
    );
    ResumePage.languages.push(
      new ResumeLanguageComponent(parentElement, "French", "Conversational")
    );
    ResumePage.languages.push(
      new ResumeLanguageComponent(parentElement, "Spanish", "Fundamental")
    );
  }

  private static loadProjects(): void {
    const container = createRoot(document.getElementById("projects-container"));

    container.render(
      <>
        <ResumeExperienceItemComponent
          title={CoreDataService.siteName}
          dates={["Spring 2017 \u2013 Present"]}
          mainImageUrl={CoreDataService.siteLogoSrc}
          darkImageUrl={CoreDataService.siteLogoSrc}
          imageAlt=""
          flipped
          invertDarkImg
          layout="side"
        >
          <ul>
            <li>
              Developed and maintained a{" "}
              <Term term="html css javascript typescript">
                mobile-aware portfolio website
              </Term>
              , upgrading it as my development and <Term>design</Term>{" "}
              capabilities grew
            </li>
            <li>
              Used centralized data with a custom{" "}
              <Term term="javascript typescript">JavaScript web component</Term>{" "}
              framework
            </li>
            <li>
              <span className="project-title">
                <Term term="javascript typescript api html css">
                  COVID-19 data dashboard:
                </Term>
              </span>
              Leverages an <Term term="API">external API</Term> to display
              health data to contextualize health measures.
            </li>
            <li>
              <span className="project-title">
                <Term term="javascript typescript">Algebra calculator:</Term>
              </span>
              Uses a custom algorithm to find a solution to many types of
              algebraic equations.
            </li>
            <li>
              <span className="project-title">
                <Term term="javascript typescript">Infection model:</Term>
              </span>
              Simulates viral community transmission with a geometric
              simulation.
            </li>
          </ul>
        </ResumeExperienceItemComponent>
        <ResumeSmallExperienceItem title="Wordlebot" dates={["Summer 2022"]}>
          <span>
            Developed a <Language term="javascript typescript">NodeJS</Language>{" "}
            application with <Language term="typescript">TypeScript</Language>
            and Google's{" "}
            <Language term="javascript typescript">
              Puppeteer library
            </Language>{" "}
            to algorithmically solve the daily New York Times Wordle.
          </span>
        </ResumeSmallExperienceItem>
        <ResumeSmallExperienceItem title="Goose" dates={["Summer 2022"]}>
          <span>
            Developed an <Language term="html css">HTML/CSS</Language>-only
            framework using
            <Language term="javascript typescript">TypeScript</Language> for
            development and implementation of web components,{" "}
            <Term term="quality">enabling newcomers to write better code</Term>.
          </span>
        </ResumeSmallExperienceItem>
        <ResumeSmallExperienceItem title="CC3K" dates={["Winter 2021"]}>
          <span>
            Developed a roguelike game in <Language>C++</Language> using{" "}
            <Term>object-oriented principles</Term>
            for CS 246 at the University of Waterloo.
          </span>
        </ResumeSmallExperienceItem>
      </>
    );
  }

  private static loadSkills(): void {
    const skillsRoot = createRoot(document.getElementById("skills-list")),
      skillInfo: [string, boolean, string[]?, boolean?][] = [
        ["TypeScript", true, ["API"]],
        ["JavaScript", true],
        ["HTML", true],
        ["CSS", true],
        ["PHP", false],
        ["Jest", true, ["quality"]],
        ["Cypress", true, ["quality"]],
        ["C++", false],
        ["NodeJS", false],
        ["RESTful APIs", true, ["API"]],
        ["Git", true],
        ["GitHub", false, ["git"]],
        ["PHPUnit", false, ["PHP", "quality"]],
        ["Test-driven development", true, ["quality"]],
        ["R", false, [], true],
        ["SQL", true],
        ["C", false, [], true],
        ["Java", false, ["Java"], true],
        ["Communication", true, ["team", "taught"]],
        ["Web design", false, ["design"]],
        ["French", true],
        ["NestJS", false, ["API"]],
        ["TypeORM", false, ["API"]],
      ];

    const components: React.ReactNode[] = [];

    skillInfo.forEach(([name, , aliases = [], searchForStrictWord]) => {
      this.skillMap[name] = {
        names: [name.toLowerCase(), ...aliases.map((a) => a.toLowerCase())],
        strict: searchForStrictWord,
        toggleListeners: [],
        // skillComponentId: null,
      };
    });

    skillInfo.forEach(([skillName, isEmphasized]) => {
      components.push(
        <ResumeSkillComponent name={skillName} isHighlighted={isEmphasized} />
      );
    });

    skillsRoot.render(<>{components}</>);

    console.log(this.skillMap);
  }

  private static loadContact(): void {
    if (!CoreDataService.shouldRiverify) {
      document.getElementById("connect-links").appendChild(
        Molasses.createElement({
          type: "li",
          children: [
            Molasses.createElement({
              type: "a",
              innerText: "in/colestantinople",
              otherNodes: {
                target: "_blank",
                href: "www.linkedin.com/in/colestantinople/",
              },
            }),
          ],
        })
      );
    } else {
      document.getElementById("connect-links").appendChild(
        Molasses.createElement({
          type: "li",
          children: [
            Molasses.createElement({
              type: "a",
              innerText: "some-molasses",
              otherNodes: {
                target: "_blank",
                href: "https://github.com/some-molasses",
              },
            }),
          ],
        })
      );
    }
  }

  static matchSkillListToSkills(
    skillsToMatch: string[],
    toggleListener: (isActive: boolean) => void
  ) {
    for (const skillData of Object.values(this.skillMap)) {
      const anySkillsMatch = skillData.names.reduce(
        (prev, skillInMasterList) => {
          if (prev) {
            return prev;
          }

          if (skillData.strict) {
            return skillsToMatch.includes(skillInMasterList);
          } else {
            return skillsToMatch.reduce((prev: boolean, skillToMatch) => {
              return (
                prev ||
                skillToMatch.includes(skillInMasterList) ||
                skillInMasterList.includes(skillToMatch)
              );
            }, false);
          }
        },
        false
      );

      if (anySkillsMatch) {
        skillData.toggleListeners.push(toggleListener);
      }
    }
  }

  private static setContactInfo(): void {
    const connect: HTMLElement = document.querySelector("#connect-links"),
      email: HTMLAnchorElement = connect.querySelector("#email");

    email.innerHTML = CoreDataService.email;
    email.href = `mailto:${CoreDataService.email}`;
  }
}

ResumePage.init();
