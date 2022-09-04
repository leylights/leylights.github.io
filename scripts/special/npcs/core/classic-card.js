import { Leylights } from "../../../leylights.js";
import { NPCsAttribute } from "../helper-repository/attribute.js";
import { CHA, CON, DEX, INT, STR, WIS } from "../helper-repository/general.js";
import { NPCsCharacterDataBooleanTypes } from "./character-data.js";
import { NPCsAttack } from "../helper-repository/action-attack.js";
import { Button } from "../../../components/button.component.js";
import { NPCsMemory } from "./npcs-memory.js";
const SAVE_CLASS = 'save-npc';
export class NPCsClassicCard {
    constructor(data) {
        this.data = data;
    }
    /**
     * @param classicCard must be a result of this.createClassicCardHTML
     */
    getSaveButton(classicCard) {
        return classicCard.querySelector(`.${SAVE_CLASS}`);
    }
    /**
     * Generate the HTML card for this NPC in the classic format
     */
    createClassicCardHTML() {
        let outerElement = document.createElement('div');
        outerElement.setAttributeNode(Leylights.betterCreateAttr('class', 'monsterCard'));
        outerElement.setAttributeNode(Leylights.betterCreateAttr('id', 'monster-card-' + this.data.ID));
        const cardInnerHTML = `<div class="description">
        <div class='name-bar'>
        ${this.getName()}
          <div class='${this.getSaveButtonClass()}'>
            <img src='${Leylights.getRelativeUrlPath('siteimages/npcs/save.png')}'/>
          </div>
        </div>
        <h6 class="type">${Leylights.toTitleCase(this.data.size)} ${this.data.race.archetype.toLowerCase()}${this.getRace()}, ${this.data.alignment}</h6>
        <img class="slant-bar"
          src="${Leylights.getRelativeUrlPath("siteimages/npcs/slant_bar.png")}">
        <h6 class="ac"><strong>Armour Class</strong> ${this.data.AC} (${this.data.armour.name})</h6>
        <h6 class="hp"><strong>Hit Points</strong> ${this.data.HP} (${this.data.hitDice.print()} ${this.data.getHpFromCon()})</h6>
        <h6 class="speed"><strong>Speed</strong> ${this.data.speed} ft.</h6>
        <img class="slant-bar" 
          src="${Leylights.getRelativeUrlPath("siteimages/npcs/slant_bar.png")}">
        <table>
          <tr class="asNames">
            <th>STR</th>
            <th>DEX</th>
            <th>CON</th>
            <th>INT</th>
            <th>WIS</th>
            <th>CHA</th>
          </tr>
          <tr class="asValues">
            <td>${this.data.getFormattedAbility(STR)}</td>
            <td>${this.data.getFormattedAbility(DEX)}</td>
            <td>${this.data.getFormattedAbility(CON)}</td>
            <td>${this.data.getFormattedAbility(INT)}</td>
            <td>${this.data.getFormattedAbility(WIS)}</td>
            <td>${this.data.getFormattedAbility(CHA)}</td>
          </tr>
        </table>
        <img class="slant-bar" 
          src="${Leylights.getRelativeUrlPath("siteimages/npcs/slant_bar.png")}">
        ${this.getSavingThrowsSection()}
        ${this.getSkillsSection()}
        ${this.getBooleanTypesSection(NPCsCharacterDataBooleanTypes.damageVulnerabilities)}
        ${this.getBooleanTypesSection(NPCsCharacterDataBooleanTypes.damageResistances)}
        ${this.getBooleanTypesSection(NPCsCharacterDataBooleanTypes.damageImmunities)}
        ${this.getBooleanTypesSection(NPCsCharacterDataBooleanTypes.conditionResistances)}
        ${this.getBooleanTypesSection(NPCsCharacterDataBooleanTypes.conditionImmunities)}
        <h6 class="senses"><b>Senses</b> ${this.data.getDarkvisionString()}passive Perception ${this.data.passivePerception}</h6>
        <h6 class="languages"><b>Languages</b> ${this.data.getLanguageList()}</h6>
        <h6 class="challenge"><b>Challenge</b> ${this.data.level} (${this.data.XPReward} XP)</h6>
        <img id="slant_bar"
          src="${Leylights.getRelativeUrlPath("siteimages/npcs/slant_bar.png")}">
      </div>
      <div class="attributes">
      ${this.getAttributesList()}
      </div>
      <div class="actions">
        <h2>ACTIONS</h2>
        <div class="line"></div>
        ${this.getActionsList()}
      </div>
      ${this.getReactionsSection()}`;
        outerElement.innerHTML = this.data.fillStringPlaceholders(cardInnerHTML);
        this.saveButton = Button.createByAttachment(outerElement.querySelector(`.${SAVE_CLASS}`), () => {
            if (!this.data.isSaved) {
                NPCsMemory.save(this.data);
                NPCsClassicCard.save(this.data);
            }
            else {
                NPCsMemory.delete(this.data);
                NPCsClassicCard.unsave(this.data);
            }
            this.refreshSavedState(outerElement);
        });
        return outerElement;
    }
    getRace() {
        if (this.data.race.archetype === this.data.race.name)
            return '';
        else
            return ` (${this.data.race.name.toLowerCase()})`;
    }
    /**
     * Produces the HTML list of actions this character can do
     */
    getActionsList() {
        let output = "";
        const attacks = [];
        const miscActions = [];
        this.data.actions.forEach((action) => {
            if (action instanceof NPCsAttack) {
                attacks.push(action);
            }
            else {
                miscActions.push(action);
            }
        });
        miscActions.forEach((action) => {
            output += `<p><b><i>${action.name}.</i></b> ${action.body}</p>`;
        });
        attacks.forEach((attack) => {
            output += `<p><b><i>${attack.name}.</i></b> ${attack.getHTML(this.data)}</p>`;
        });
        return output;
    }
    /**
     * Produces the HTML list of attributes this has
     */
    getAttributesList() {
        let output = "";
        this.data.attributes.sort((a, b) => {
            return a.name < b.name ? -1 : 1;
        }).forEach((attribute) => {
            if (attribute.name === NPCsAttribute.list.spellcasting.name) {
                if (this.data.spellCount === 0)
                    return;
            }
            output += attribute.HTML;
        });
        return output;
    }
    /**
     * Gets the HTML string for a BooleanTypes list in the HTML card (e.g. damage vulnerabilities)
     */
    getBooleanTypesSection(type) {
        let sectionName;
        let sectionClassName;
        let data;
        switch (type) {
            case NPCsCharacterDataBooleanTypes.damageVulnerabilities:
                sectionName = "Damage Vulnerabilities";
                data = this.data.damageVulnerabilities;
                break;
            case NPCsCharacterDataBooleanTypes.damageResistances:
                sectionName = "Damage Resistances";
                data = this.data.damageResistances;
                break;
            case NPCsCharacterDataBooleanTypes.damageImmunities:
                sectionName = "Damage Immunities";
                data = this.data.damageImmunities;
                break;
            case NPCsCharacterDataBooleanTypes.conditionResistances:
                sectionName = "Condition Resistances";
                data = this.data.conditionResistances;
                break;
            case NPCsCharacterDataBooleanTypes.conditionImmunities:
                sectionName = "Condition Immunities";
                data = this.data.conditionImmunities;
                break;
        }
        sectionClassName = Leylights.toCamelCase(sectionName);
        if (data.list().length > 0)
            return `<h6 class="${sectionClassName}"><b>${sectionName}</b> ${data.list(' ')}</h6>`;
        else
            return '';
    }
    getName() {
        if (navigator.userAgent.toLowerCase().includes('firefox'))
            return `<h1 class="prename">${this.data.name.toUpperCase()}</h1>`;
        if (this.data.firstName.trim() === '') {
            return `<h1 class="prename">${this.data.lastName.toUpperCase()}</h1>`;
        }
        else if (this.data.lastName.trim() === '') {
            return `<h1 class="prename">${this.data.firstName.toUpperCase()}</h1>`;
        }
        else {
            return `<h1 class="prename">${this.data.firstName.toUpperCase()}&nbsp;</h1>
              <h1 class="surname">${this.data.lastName.toUpperCase()}</h1>`;
        }
    }
    /**
     * Produces the skills section as found in the HTML card
     */
    getSkillsSection() {
        if (this.data.skills.hasAnySkills)
            return `<h6 class="skills"><b>Skills</b> ${this.data.getSkillsList()}</h6>`;
        else
            return '';
    }
    /**
     * Produces the body of the Reactions section as found in the HTML card
     */
    getReactionsList() {
        let output = "";
        this.data.reactions.forEach((reaction) => {
            output += `<p><b><i>${reaction.name}.</i></b> ${reaction.body}</p>`;
        });
        return output;
    }
    /**
     * Produces the Reactions section as found in the HTML card
     */
    getReactionsSection() {
        if (this.data.reactions.length > 0)
            return `<div class="reactions">
              <h2>REACTIONS</h2>
              <div class="line"></div>
              ${this.getReactionsList()}
            </div>`;
        else
            return "";
    }
    getSaveButtonClass() {
        if (this.data.isSaved)
            return SAVE_CLASS + ' saved';
        else
            return SAVE_CLASS;
    }
    /**
     * Produces the saving throws section of the NPC card
     */
    getSavingThrowsSection() {
        if (this.data.saves.filter((save) => {
            return save;
        }).length > 0)
            return `<h6 class="saves"><b>Saving Throws</b> ${this.data.getSavingThrowsList()}</h6>`;
        else
            return "";
    }
    /**
     * Opens this classic card in a new tab
     */
    printCharacter() {
        const printWindow = window.open('', '_blank', '');
        printWindow.document.title = document.title.split('|')[0] + '| ' + this.data.name;
        printWindow.document.body.innerHTML = this.createClassicCardHTML().outerHTML;
        printWindow.document.body.querySelector(`.${SAVE_CLASS}`).remove();
        // set style
        Leylights.Array.from.NodeListOf(document.head.querySelectorAll('link'))
            .filter((link) => { return link.rel === 'stylesheet'; })
            .forEach((link) => {
            const newLink = link.cloneNode(true);
            newLink.href = link.href + '';
            printWindow.document.head.appendChild(newLink);
        });
        printWindow.document.body.style.paddingTop = '5vh';
        // reset image hrefs
        Leylights.Array.from.NodeListOf(printWindow.document.body.querySelectorAll('img'))
            .forEach((img) => {
            img.src = Leylights.getFullUrlPath(img.attributes['src'].value);
        });
        setTimeout(() => {
            if (printWindow.document.readyState === 'complete') {
                printWindow.print();
            }
            else {
                if (printWindow.document.fonts) {
                    printWindow.document.fonts.ready.then(printWindow.print);
                }
                else {
                    printWindow.addEventListener('load', (e) => {
                        printWindow.print();
                    });
                }
            }
        }, 100);
    }
    /**
     * Refreshes the saved state of this card
     */
    refreshSavedState(cardElement) {
        const saveButton = cardElement.querySelector(`.${SAVE_CLASS}`);
        if (this.data.isSaved)
            saveButton.className += ' saved';
        else {
            saveButton.className = saveButton.className.replace(/ saved/g, '');
        }
    }
    static save(data) {
        Leylights.Array.from.HTMLCollection(document.getElementsByClassName('monsterCard')).forEach((card) => {
            if (card.id.includes(data.ID + '')) {
                const saveButton = card.querySelector('.save-npc');
                saveButton.className += ' saved';
            }
        });
    }
    static unsave(data) {
        Leylights.Array.from.HTMLCollection(document.getElementsByClassName('monsterCard')).forEach((card) => {
            if (card.id.includes(data.ID + '')) {
                const saveButton = card.querySelector('.save-npc');
                saveButton.className = saveButton.className.replace(/saved/g, '').trim();
            }
        });
    }
}
//# sourceMappingURL=classic-card.js.map