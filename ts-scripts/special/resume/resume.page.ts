import { SpotlightHeader } from "../showcase/components/spotlight-header.component.js";
import { CoreDataService } from "../../services/core-data.service.js";
import { PageBuilder } from "../../services/page-builder.service.js";
import { ResumeExperienceItemComponent } from "./components/experience-item.component.js";
import { ResumeLanguageComponent } from "./components/language-item.component.js";
import { ResumeOccupationItemComponent } from "./components/occupation-item.component.js";
import { ResumeSkillComponent } from "./components/skill.component.js";
import { ResumeSmallExperienceItem } from "./components/small-experience-item.component.js";
import { Molasses } from "../../molasses.js";

export class ResumePage {
  static experienceItems: ResumeOccupationItemComponent[] = [];
  static skills: ResumeSkillComponent[] = [];
  static projects: ResumeExperienceItemComponent[] = [];
  static smallProjects: ResumeSmallExperienceItem[] = [];
  static languages: ResumeLanguageComponent[] = [];

  static fadeInElements: HTMLElement[] = [];

  static init() {
    new SpotlightHeader(document.getElementById('showcase'));
    ResumePage.setContactInfo();

    document.getElementById('name').innerText = CoreDataService.personalName;

    this.loadExperience();
    this.loadProjects();
    this.loadLanguages();

    this.loadSkills();
    this.disableSkills();

    this.loadContact();

    ResumePage.setFadeListeners();
  }

  private static loadExperience(): void {
    const experienceParent = document.getElementById('experience-container');

    // use <C> to highlight anything, <L> to highlight languages and tools

    ResumePage.experienceItems.push(new ResumeOccupationItemComponent({
      parentElement: experienceParent,
      workplaceName: 'Vidyard',
      jobTitle: 'Software Developer (Web Team)',
      dates: ['Winter 2022'],
      mainImageUrl: '/siteimages/resume/vidyard.svg',
      darkImageUrl: '/siteimages/resume/vidyard_dark.svg',
      experiencePoints: [
        `Led integration of <L term='quality javascript typescript'>Jest</L>, 
        <L term='quality javascript'>ESLint</L>, and <L term='typescript'>TypeScript</L>
         with a mature codebase, starting the team's use of <C term="quality">test-driven development</C> with <C term="quality">28% code coverage</C>
         in two months to reduce and prevent user-facing errors.`,
        `Performed and improved on a <C term="accessibility design html css">WCAG2.1 accessibility audit</C> to <C term="accessibility design">
        decrease UX friction</C> and <C term="accessibility design">increase conversion</C>.`,
        `Overhauled a <L>PHP</L> component library to implement <C nolink>object-oriented programming</C> principles, decreasing ticket cycle time.`,
        `<C term='communication'>Collaborated with external teams</C> to clarify requirements and deliver progress updates.`
      ],
      layout: 'compact',
    }));

    ResumePage.experienceItems.push(new ResumeOccupationItemComponent({
      parentElement: experienceParent,
      workplaceName: 'Uptake Canada',
      jobTitle: 'Full-stack Software Developer',
      dates: ['Summer 2021'],
      mainImageUrl: '/siteimages/resume/uptake.png',
      darkImageUrl: '/siteimages/resume/uptake_dark.png',
      experiencePoints: [
        `Independently developed <L term='javascript typescript api'>NestJS</L> <C term='api'>RESTful API</C> endpoints
         and complex <L term='api sql'>SQL</L> stored procedures to support frontend specifications`,
        `Developed <C nolink>new frontend interfaces</C> using <L term="javascript">ExtJS</L> to support design specifications and display API data.`,
        `Contributed to the development process, including <L>git</L> workflows, 
         <C term='quality communication'>code reviews</C>, <C term='quality'>test-driven development</C>, and consultation with
         design teams to <C term='quality'>maximize code confidence</C> and acceptability`,
      ],
      flipped: true,
      layout: 'compact',
    }));

    ResumePage.experienceItems.push(new ResumeOccupationItemComponent({
      parentElement: experienceParent,
      workplaceName: 'Salus Global',
      jobTitle: 'Software Designer/Developer',
      dates: ['Summer 2019', 'Summer 2020'],
      mainImageUrl: '/siteimages/resume/salus.png',
      darkImageUrl: '/siteimages/resume/salus_dark.png',
      experiencePoints: [
        `Designed and developed a <C term='independence html css'>mobile-friendly online eLearning platform</C> for an international client with 2300+ total users, using <L>HTML</L>, <L>CSS</L>, 
      <L>JavaScript</L>, and an internal language.`,
        `Entrusted with implementing <L>CSS</L> with minimal HTML changes to render an existing platform with 2500+ users <C term='css'>mobile-aware</C>`,
        `Developed and implemented <L>JavaScript</L> web components to <C nolink>promote user engagement</C> with educational materials`,
        `<C term='design'>Led the visual design work</C> for a mobile eLearning app deployed to 10 000+ users`,
        `Edited supervisors' external communications to ensure greater professionalism and impact in dealings with clients.`
      ],
      layout: 'compact',
    }));

    ResumePage.experienceItems.push(new ResumeOccupationItemComponent({
      parentElement: experienceParent,
      workplaceName: 'Western University \u2013 Bit by Bit Computer Camp',
      jobTitle: 'Youth Leader',
      dates: ['Summer 2018', 'Summer 2019'],
      mainImageUrl: '/siteimages/resume/western.png',
      darkImageUrl: '/siteimages/resume/western_dark.png',
      experiencePoints: [
        `<C term='team'>Worked with a team</C> to organize and run a highly-successful educational summer camp for ~80 local youth per week`,
        `<C term='communication'>Taught engaging lessons</C> on basic fundamentals in <L nolink>Scratch</L>, <L nolink>Photoshop</L>, <L nolink>Python</L>, and <L term='html css'>HTML/CSS</L>`,
        `Commended by supervisors for exceptional <C nolink>initiative</C> and <C nolink>leadership</C>`
      ],
      flipped: true,
      layout: 'side',
    }));

    ResumePage.experienceItems.push(new ResumeOccupationItemComponent({
      parentElement: experienceParent,
      workplaceName: 'Arcane \u2013 Arcane Code Camp',
      jobTitle: 'Instructional Assistant',
      dates: ['Fall 2017, Winter 2018'],
      mainImageUrl: '/siteimages/resume/arcane.png',
      darkImageUrl: '/siteimages/resume/arcane_dark.png',
      experiencePoints: [
        `<C term='team'>Worked with a team</C> to teach <L>JavaScript</L> fundamentals to local youth`,
        `Led 1-1 lessons with struggling students to reduce drop-out rates`
      ],
      layout: 'side',
    }));
  }

  private static loadLanguages(): void {
    const parentElement = document.getElementById('languages-list');

    ResumePage.languages.push(new ResumeLanguageComponent(parentElement, 'English', 'Native'));
    ResumePage.languages.push(new ResumeLanguageComponent(parentElement, 'French', 'Conversational'));
    ResumePage.languages.push(new ResumeLanguageComponent(parentElement, 'Spanish', 'Fundamental'));
  }

  private static loadProjects(): void {
    const container = document.getElementById('projects-container');

    ResumePage.projects.push(new ResumeExperienceItemComponent({
      parentElement: container,
      title: CoreDataService.siteName,
      dates: ['Spring 2017 \u2013 Present'],
      mainImageUrl: CoreDataService.siteLogoSrc,
      darkImageUrl: CoreDataService.siteLogoSrc,
      imageAlt: CoreDataService.siteName,
      experiencePoints: [
        `Developed and maintained a <C term="html css javascript typescript">mobile-aware portfolio website</C>, 
        upgrading it as my development and <C>design</C> capabilities grew`,
        `Used centralized data with a custom <C term="javascript typescript">JavaScript web component</C> framework`,
        `<span class="project-title"><C term='javascript typescript api html css'>COVID-19 data dashboard:</C></span> 
        Leverages an <C term='API'>external API</C> to display health data to contextualize health measures.`,
        `<span class="project-title"><C term='javascript typescript'>Algebra calculator:</C></span> 
        Uses a custom algorithm to find a solution to many types of algebraic equations.`,
        `<span class="project-title"><C term='javascript typescript'>Infection model:</C></span> 
        Simulates viral community transmission with a geometric simulation.`,
      ],
      flipped: true,
      invertDarkImg: true,
      layout: 'side',
    }));

    ResumePage.smallProjects.push(new ResumeSmallExperienceItem({
      title: 'Wordlebot',
      dates: ['Summer 2022'],
      body: `Developed a <L term="javascript typescript">NodeJS</L> application with <L term="typescript">TypeScript</L> 
        and Google's <L term="javascript typescript">Puppeteer library</L> to algorithmically solve the daily New York Times Wordle.`,
    }));

    ResumePage.smallProjects.push(new ResumeSmallExperienceItem({
      title: 'Goose',
      dates: ['Summer 2022'],
      body: `Developed an <L term="html css">HTML/CSS</L>-only framework using 
      <L term="javascript typescript">TypeScript</L> for development and implementation 
      of web components, <C term="quality">enabling newcomers to write better code</C>.`,
    }));

    ResumePage.smallProjects.push(new ResumeSmallExperienceItem({
      title: 'CC3K',
      dates: ['Winter 2021'],
      body: `Developed a roguelike game in <L>C++</L> using <C nolink>object-oriented principles</C> 
      for CS 246 at the University of Waterloo.`,
    }));
  }

  private static loadSkills(): void {
    const skillParent = document.getElementById('skills-list'),
      skillInfo: [string, boolean, string[]?, boolean?][] = [
        ['TypeScript', true, ['API']],
        ['JavaScript', true],
        ['HTML', true],
        ['CSS', true],
        ['PHP', false],
        ['Jest', true, ['quality']],
        ['Cypress', true, ['quality']],
        ['C++', false],
        ['NodeJS', false],
        ['RESTful APIs', true, ['API']],
        ['Git', true],
        ['GitHub', false, ['git']],
        ['PHPUnit', false, ['PHP', 'quality']],
        ['Test-driven development', true, ['quality']],
        ['R', false, [], true],
        ['SQL', true],
        ['C', false, [], true],
        ['Java', false, ['Java'], true],
        ['Communication', true, ['team', 'taught']],
        ['Web design', false, ['design']],
        ['French', true],
        ['NestJS', false, ['API']],
        ['TypeORM', false, ['API']],
      ];

    skillInfo.forEach((info) => {
      ResumePage.skills.push(new ResumeSkillComponent(skillParent, info[0], {
        isHighlighted: info[1],
        aliases: info[2],
        searchForStrictWord: info[3],
      }));
    });
  }

  private static loadContact(): void {
    if (!CoreDataService.shouldRiverify) {
      document.getElementById('connect-links').appendChild(Molasses.createElement({
        type: 'li',
        children: [Molasses.createElement({
          type: 'a',
          innerText: 'in/colestantinople',
          otherNodes: {
            target: '_blank',
            href: 'www.linkedin.com/in/colestantinople/',
          },
        })]
      }));
    } else {
      document.getElementById('connect-links').appendChild(Molasses.createElement({
        type: 'li',
        children: [Molasses.createElement({
          type: 'a',
          innerText: 'some-molasses',
          otherNodes: {
            target: '_blank',
            href: 'https://github.com/some-molasses',
          },
        })]
      }));
    }
  }

  private static disableSkills() {
    for (const skill of this.skills) {
      console.log(skill.findSkillMatches());
      if (skill.findSkillMatches().length === 0) {
        skill.element.classList.add('no-matches');
      }
    }
  }

  private static setContactInfo(): void {
    const connect: HTMLElement = document.querySelector('#connect-links'),
      email: HTMLAnchorElement = connect.querySelector('#email');

    email.innerHTML = CoreDataService.email;
    email.href = `mailto:${CoreDataService.email}`;
  }

  private static setFadeListeners(): void {
    return; // disable

    for (const degree of document.querySelectorAll('#education-degrees>div'))
      ResumePage.setFadeListener(degree as HTMLElement);

    const fadeListener = () => {
      ResumePage.fadeInElements.forEach((element: HTMLElement, index: number) => {
        const elementRect = element.getBoundingClientRect();
        if (elementRect.y + elementRect.height / 2 <= window.innerHeight) {
          element.classList.remove('fade-up-pending');
          element.classList.add('fade-up-playing');

          // remove playing class upon completion
          const animationTime = parseFloat(window.getComputedStyle(element).animationDuration) * 1000;
          setTimeout(() => {
            element.classList.remove('fade-up-playing');
          }, animationTime);

          // remove element
          ResumePage.fadeInElements.splice(index, 1);
        }
      });
    };

    PageBuilder.registerLoadListener(() => {
      fadeListener();
      setTimeout(fadeListener, 32);
      window.addEventListener('scroll', fadeListener);
    });
  }

  public static setFadeListener(element: HTMLElement): HTMLElement {
    return element; // disable

    element.classList.add('fade-up-pending');
    ResumePage.fadeInElements.push(element);

    return element;
  }
}

ResumePage.init();
