import { SpotlightHeader } from "../showcase/components/spotlight-header.component.js";
import { CoreDataService } from "../../services/core-data.service.js";
import { PageBuilder } from "../../services/page-builder.service.js";
import { ResumeExperienceItemComponent } from "./components/experience-item.component.js";
import { ResumeLanguageComponent } from "./components/language-item.component.js";
import { ResumeOccupationItemComponent } from "./components/occupation-item.component.js";
import { ResumeSkillComponent } from "./components/skill.component.js";
export class ResumePage {
    static init() {
        new SpotlightHeader(document.getElementById('showcase'));
        ResumePage.setContactInfo();
        document.getElementById('name').innerText = CoreDataService.personalName;
        this.loadExperience();
        this.loadProjects();
        this.loadLanguages();
        this.loadSkills();
        ResumePage.setFadeListeners();
    }
    static loadExperience() {
        const experienceParent = document.getElementById('experience-container');
        // use <C> to highlight anything, <L> to highlight languages and tools
        ResumePage.experienceItems.push(new ResumeOccupationItemComponent({
            parentElement: experienceParent,
            workplaceName: 'Uptake Canada',
            jobTitle: 'Full-stack Software Developer',
            dates: ['Summer 2021'],
            mainImageUrl: '/siteimages/resume/uptake.png',
            darkImageUrl: '/siteimages/resume/uptake_dark.png',
            experiencePoints: [
                `Independently developed <C term='api'><L term='javascript typescript'>NestJS</L> RESTful API</C> endpoints and complex <C><L>SQL</L></C> stored procedures to support frontend requirements`,
                `<C term='team'>Worked with a team</C> to deploy new features to <C term='git'>production environments</C> using the <L term='javascript'>Ext JS</L> component framework to meet design specifications`,
                `Contributed to the development process, including <L>git</L> workflows, <C term='quality'>code reviews</C>, <C term='tdd'>test-driven development</C>, and consultation with design teams to maximize code confidence and acceptability`,
            ]
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
                `Entrusted with implementing <L>CSS</L> with minimal HTML changes to render an existing platform with 2500+ users <C nolink>mobile-aware</C>`,
                `Developed and implemented numerous <L>JavaScript</L> programs to <C nolink>promote user engagement</C> with educational materials`,
                `<C term='design'>Led the visual design work</C> for a mobile eLearning app deployed to 10 000+ users`,
                `Edited supervisors' external communications to ensure greater professionalism and impact in dealings with clients.`
            ]
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
                `Commended by supervisors for exceptional <C>initiative</C> and <C>leadership</C>`
            ],
            flipped: true,
            asGrid: true,
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
            asGrid: true,
        }));
    }
    static loadLanguages() {
        const parentElement = document.getElementById('languages-list');
        ResumePage.languages.push(new ResumeLanguageComponent(parentElement, 'English', 'Native'));
        ResumePage.languages.push(new ResumeLanguageComponent(parentElement, 'French', 'Conversational'));
        ResumePage.languages.push(new ResumeLanguageComponent(parentElement, 'Spanish', 'Fundamental'));
    }
    static loadProjects() {
        const container = document.getElementById('projects-container');
        ResumePage.projects.push(new ResumeExperienceItemComponent({
            parentElement: container,
            title: CoreDataService.siteName,
            dates: ['Spring 2017 \u2013 Present'],
            mainImageUrl: CoreDataService.siteLogoSrc,
            darkImageUrl: CoreDataService.siteLogoSrc,
            imageAlt: CoreDataService.siteName,
            experiencePoints: [
                `Developed and maintained a <C term="html css javascript typescript">mobile-aware portfolio website</C>, upgrading it as my development and <C>design</C> capabilities grew`,
                `Updated site regularly with new projects, including a <L term='javascript typescript'>COVID-19 infection model</L>, <L term='java'>a machine-learning AI</L>,
         and <L term='javascript typescript'>3D‑graphing projects</L>`
            ],
            flipped: true,
            type: 'grid',
            invertDarkImg: true,
        }));
        ResumePage.projects.push(new ResumeExperienceItemComponent({
            parentElement: container,
            title: 'Wordlebot',
            dates: ['June 2022'],
            mainImageUrl: CoreDataService.siteLogoSrc,
            darkImageUrl: CoreDataService.siteLogoSrc,
            imageAlt: 'Wordlebot',
            experiencePoints: [
                `Developed an algorithm and program to solve the daily wordle, written in <L term='javascript typescript nodejs'>NodeJS</L>`,
                `Leveraged the <L nolink>puppeteer</L> library to interact with an external webpage`
            ],
            flipped: true,
            type: 'grid',
            invertDarkImg: true,
        }));
    }
    static loadSkills() {
        const skillParent = document.getElementById('skills-list'), skillInfo = [
            ['JavaScript', true],
            ['HTML', true],
            ['CSS', true],
            ['Java', false, ['Java'], true],
            ['Communication', true, ['team', 'taught']],
            ['Web design', false, ['design', 'mobile-aware']],
            ['French', true],
            ['SQL', true],
            ['Git', true, ['production']],
            ['TypeScript', true, ['API']],
            ['TypeORM', false, ['API']],
            ['NestJS', false, ['API']],
        ];
        skillInfo.forEach((info) => {
            ResumePage.skills.push(new ResumeSkillComponent(skillParent, info[0], {
                isHighlighted: info[1],
                aliases: info[2],
                searchForStrictWord: info[3],
            }));
        });
    }
    static setContactInfo() {
        const connect = document.querySelector('#connect-links'), email = connect.querySelector('#email');
        email.innerHTML = CoreDataService.email;
        email.href = `mailto:${CoreDataService.email}`;
    }
    static setFadeListeners() {
        for (const degree of document.querySelectorAll('#education-degrees>div'))
            ResumePage.setFadeListener(degree);
        const fadeListener = () => {
            ResumePage.fadeInElements.forEach((element, index) => {
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
    static setFadeListener(element) {
        element.classList.add('fade-up-pending');
        ResumePage.fadeInElements.push(element);
        return element;
    }
}
ResumePage.experienceItems = [];
ResumePage.skills = [];
ResumePage.projects = [];
ResumePage.languages = [];
ResumePage.fadeInElements = [];
ResumePage.init();
//# sourceMappingURL=resume.page.js.map