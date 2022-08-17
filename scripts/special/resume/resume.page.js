import { SpotlightHeader } from "../showcase/components/spotlight-header.component.js";
import { CoreDataService } from "../_services/core-data.service.js";
import { PageBuilder } from "../_services/page-builder.service.js";
import { ResumeExperienceItemComponent } from "./components/experience-item.component.js";
import { ResumeLanguageComponent } from "./components/language-item.component.js";
import { ResumeOccupationItemComponent } from "./components/occupation-item.component.js";
import { ResumeSkillComponent } from "./components/skill.component.js";
export class ResumePage {
    constructor() {
        this.experienceItems = [];
        this.skills = [];
        this.projects = [];
        this.languages = [];
        const me = this;
        new SpotlightHeader(document.getElementById('showcase'));
        PageBuilder.riverify();
        document.getElementById('name').innerText = CoreDataService.personalName;
        loadExperience();
        loadProjects();
        loadLanguages();
        loadSkills();
        function loadExperience() {
            const experienceParent = document.getElementById('experience-container');
            // use <C> to highlight anything, <L> to highlight languages and tools
            me.experienceItems.push(new ResumeOccupationItemComponent({
                parentElement: experienceParent,
                workplaceName: 'Uptake Canada',
                jobTitle: 'Full-stack Software Developer',
                dates: ['Summer 2021'],
                mainImageUrl: '/siteimages/resume/uptake.png',
                darkImageUrl: '/siteimages/resume/uptake_dark.png',
                experiencePoints: [
                    `Independently developed <C><L term=javascript>NestJS</L> RESTful API</C> endpoints and complex <C><L>SQL</L></C> stored procedures to support frontend requirements`,
                    `<C>Worked with a team</C> to deploy new features to <C>production environments</C> using the <L term=javascript>Ext JS</L> component framework to meet design specifications`,
                    `Contributed to the development process, including <C><L>git</L></C> workflows, code reviews, <C>test-driven development</C>, and consultation with design teams to maximize code confidence and acceptability`,
                ]
            }));
            me.experienceItems.push(new ResumeOccupationItemComponent({
                parentElement: experienceParent,
                workplaceName: 'Salus Global',
                jobTitle: 'Software Designer/Developer',
                dates: ['Summer 2019', 'Summer 2020'],
                mainImageUrl: '/siteimages/resume/salus.png',
                darkImageUrl: '/siteimages/resume/salus_dark.png',
                experiencePoints: [
                    `Designed and developed a <C>mobile-friendly online eLearning platform</C> for an international client with 2300+ total users, using <L>HTML</L>, <L>CSS</L>, 
        <L>JavaScript</L>, and an internal language.`,
                    `Entrusted with implementing <L>CSS</L> with minimal HTML changes to render an existing platform with 2500+ users <C>mobile-aware</C>`,
                    `Developed and implemented numerous <L>JavaScript</L> programs to <C>promote user engagement</C> with educational materials`,
                    `<C>Led the visual design work</C> for a mobile eLearning app deployed to 10 000+ users`,
                    `Edited supervisors' external communications to create greater professionalism and impact in dealings with clients.`
                ]
            }));
            me.experienceItems.push(new ResumeOccupationItemComponent({
                parentElement: experienceParent,
                workplaceName: 'Western University \u2013 Bit by Bit Computer Camp',
                jobTitle: 'Youth Leader',
                dates: ['Summer 2018', 'Summer 2019'],
                mainImageUrl: '/siteimages/resume/western.png',
                darkImageUrl: '/siteimages/resume/western_dark.png',
                experiencePoints: [
                    `<C>Worked with a team</C> to organize and run a highly-successful educational summer camp for ~80 local youth per week`,
                    `<C>Taught engaging lessons</C> on basic fundamentals in <L>Scratch</L>, <L>Photoshop</L>, <L>Python</L>, <L>HTML/CSS</L>, and <L>Unity</L>`,
                    `Commended by supervisors for exceptional <C>initiative</C> and <C>leadership</C>`
                ],
                flipped: true,
                asGrid: true,
            }));
            me.experienceItems.push(new ResumeOccupationItemComponent({
                parentElement: experienceParent,
                workplaceName: 'Arcane \u2013 Arcane Code Camp',
                jobTitle: 'Instructional Assistant',
                dates: ['Fall 2017, Winter 2018'],
                mainImageUrl: '/siteimages/resume/arcane.png',
                darkImageUrl: '/siteimages/resume/arcane_dark.png',
                experiencePoints: [
                    `<C>Worked with a team</C> to teach <L>JavaScript</L> fundamentals to local youth`,
                    `Led 1-1 lessons with struggling students to reduce drop-out rates`
                ],
                asGrid: true,
            }));
        }
        function loadLanguages() {
            const parentElement = document.getElementById('languages-list');
            me.languages.push(new ResumeLanguageComponent(parentElement, 'English', 'Native'));
            me.languages.push(new ResumeLanguageComponent(parentElement, 'French', 'Conversational'));
            me.languages.push(new ResumeLanguageComponent(parentElement, 'Spanish', 'Fundamental'));
        }
        function loadProjects() {
            const container = document.getElementById('projects-container');
            me.projects.push(new ResumeExperienceItemComponent({
                parentElement: container,
                title: CoreDataService.siteName,
                dates: ['Spring 2017 \u2013 Present'],
                mainImageUrl: CoreDataService.siteLogoSrc,
                darkImageUrl: CoreDataService.siteLogoSrc,
                imageAlt: CoreDataService.siteName,
                experiencePoints: [
                    `Developed and maintained a <C>mobile-aware</C> portfolio website, upgrading it as my development and <C>design</C> capabilities grew`,
                    `Updated site regularly with new projects, including a <L term='javascript typescript'>COVID-19 infection model</L>, <L term='java'>a machine-learning AI</L>,
           and <L term='javascript typescript'>3D‑graphing projects</L>`
                ],
                flipped: true,
                type: 'grid',
            }));
            me.projects[me.projects.length - 1].container.querySelector('img.dark-only').classList.add('dark-invert-filter');
        }
        function loadSkills() {
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
                ['NestJS', false],
            ];
            skillInfo.forEach((info) => {
                me.skills.push(new ResumeSkillComponent(skillParent, info[0], info[1], info[2], info[3]));
            });
        }
    }
}
new ResumePage();
//# sourceMappingURL=resume.page.js.map