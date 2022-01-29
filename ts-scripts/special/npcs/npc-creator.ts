import { cws } from "../../cws.js";
import { Button } from "../_components/button.component.js";
import { ResizingInput } from "../_components/resizing-input.component.js";
import { NPCsReplacerSpan } from "./components/npcs-creator-replacer-span.component.js";
import { NPCsMemorySaveBarComponent } from "./components/npcs-memory-save-bar.component.js";
import { NPCsCharacterData, NPCsCharacterDataCreationData } from "./core/character-data.js";
import { NPCsClass } from "./core/class.js";
import { NPCsClassicCard } from "./core/classic-card.js";
import { NPCsMemory } from "./core/npcs-memory.js";
import { NPCsRace } from "./core/race.js";
import { NPCsAttackMelee } from "./helper-repository/action-attack-melee.js";
import { NPCsAttackMixed } from "./helper-repository/action-attack-mixed.js";
import { NPCsAttackRanged } from "./helper-repository/action-attack-ranged.js";
import { NPCsAttack } from "./helper-repository/action-attack.js";
import { NPCsReaction } from "./helper-repository/action-reaction.js";
import { NPCsAction } from "./helper-repository/action.js";
import { NPCsArmour } from "./helper-repository/armour.js";
import { NPCsAttribute } from "./helper-repository/attribute.js";
import { NPCsBooleanList } from "./helper-repository/boolean-list.js";
import { NPCsConditionTypes } from "./helper-repository/condition-types.js";
import { NPCsDamageTypes } from "./helper-repository/damage-types.js";
import { CON, DEX, NPCsAbility, NPCsCharacterAlignmentMoral, NPCsCharacterAlignmentOrder, NPCsDice, NPCsHelper, NPCsLanguages, NPCsLanguageType } from "./helper-repository/general.js";
import { NPCsInventory } from "./helper-repository/inventory.js";
import { NPCsSkill, NPCsSkillset } from "./helper-repository/skill-set.js";
import { NPCsSpell } from "./helper-repository/spell.js";
import { NPCsSpellcasterData } from "./helper-repository/spellcaster-data.js";

interface NPCsCreatorHTML {
  savedCharacterList: HTMLUListElement;
  savedCharacterListContainer: HTMLDivElement;

  savedCharacterBar: NPCsMemorySaveBarComponent;

  classSelector: HTMLSelectElement;
  raceSelector: HTMLSelectElement;

  abilities: NPCsCreatorAbility[];
  container: HTMLDivElement;
  resizeableInputs: ResizingInput[];

  nameEntry: HTMLInputElement;
  hitDiceEntry: ResizingInput;
  speedEntry: ResizingInput;
  darkvisionEntry: ResizingInput;
  challengeRatingEntry: ResizingInput;

  displays: {
    armourClass: HTMLHeadingElement,
    hitPoints: HTMLHeadingElement,
    passivePerception: HTMLHeadingElement,
  }

  armourSelect: HTMLSelectElement;

  selectorContainers: {
    damageVulnerabilities: HTMLDivElement,
    damageResistances: HTMLDivElement,
    damageImmunities: HTMLDivElement,
    conditionResistances: HTMLDivElement,
    conditionImmunities: HTMLDivElement,
    languages: HTMLDivElement,
    skills: HTMLDivElement,
  },

  attributesContainer: HTMLDivElement;
  alignmentContainer: HTMLDivElement;
  actionsContainer: HTMLDivElement;
  reactionsContainer: HTMLDivElement;
  attacksContainer: HTMLDivElement;
  spellsContainer: HTMLDivElement;
  spellLevelInput: ResizingInput;

  viewButton: Button;
  saveButton: Button;
  displayButton: Button;

  regexReplacerSpans: NPCsReplacerSpan[];

  cardPopup: HTMLDivElement;
}

interface SelectBackups {
  oldRace: string;
  oldClass: string;
}

interface NPCsCreatorAbility {
  container: HTMLDivElement;
  score: ResizingInput;
  modifier: HTMLDivElement;
  name: HTMLHeadingElement;
  savingThrow: HTMLHeadingElement;
}

class NPCsCreator {
  isDirty: boolean = false;

  selectBackups: SelectBackups = {
    oldRace: null,
    oldClass: null,
  };

  HTML: NPCsCreatorHTML = {
    savedCharacterList: null,
    savedCharacterListContainer: document.getElementById('npcs-creator-side-bar') as HTMLDivElement,

    savedCharacterBar: new NPCsMemorySaveBarComponent(document.getElementById('main'),
      (character: NPCsCharacterData) => {
        this.attemptLoadSavedCharacter(character);
      }, () => {
        this.reloadSavedList();
      }),

    classSelector: null,
    raceSelector: null,

    abilities: null,
    container: null,
    resizeableInputs: null,

    nameEntry: null,
    hitDiceEntry: null,
    speedEntry: null,
    darkvisionEntry: null,
    challengeRatingEntry: null,

    displays: {
      armourClass: null,
      hitPoints: null,
      passivePerception: null,
    },

    armourSelect: null,

    selectorContainers: {
      damageVulnerabilities: null,
      damageResistances: null,
      damageImmunities: null,
      conditionResistances: null,
      conditionImmunities: null,
      languages: null,
      skills: null,
    },

    attributesContainer: null,
    alignmentContainer: null,
    actionsContainer: null,
    reactionsContainer: null,
    attacksContainer: null,
    spellsContainer: null,
    spellLevelInput: null,

    viewButton: null,
    saveButton: null,
    displayButton: null,

    regexReplacerSpans: [],

    cardPopup: null,
  };

  constructor() {
    this.loadHTML();
  }

  get currentRace(): NPCsRace {
    return NPCsRace.getRaceByName(this.HTML.raceSelector.value);
  }

  get currentClass(): NPCsClass {
    return NPCsClass.getClassByName(this.HTML.classSelector.value);
  }

  async attemptLoadSavedCharacter(this: NPCsCreator, character: NPCsCharacterData) {
    const confirmation = await this.attemptPageReset('Loading a saved character will overwrite the current information on screen.  Continue?', true);
    if (confirmation)
      this.loadCharacterData(character, false, true);
  }

  async attemptPageReset(this: NPCsCreator, altMessage?: string, doNotLoadCharacter?: boolean): Promise<boolean> {
    const confirmation = !this.isDirty || confirm(altMessage || "Changing the character's class or race will reset any previously-entered data.  Are you sure you wish to continue?");

    if (confirmation) {
      if (!doNotLoadCharacter) {
        const newCharacter: NPCsCharacterData = await NPCsCharacterData.create(this.currentRace, this.currentClass, ['', '']);
        this.loadCharacterData(newCharacter, true);

        this.HTML.abilities.forEach((ability: NPCsCreatorAbility) => {
          ability.score.value = '';
        });

        this.resetDisplayValues(true);
      }
      this.isDirty = false;
    } else {
      this.HTML.raceSelector.value = this.selectBackups.oldRace;
      this.HTML.classSelector.value = this.selectBackups.oldClass;
    }

    return confirmation;
  }

  async displayCharacterCard(this: NPCsCreator): Promise<void> {
    const me = this,
      currentCharacter: NPCsCharacterData = await this.getCharacterData(),
      characterCard: NPCsClassicCard = new NPCsClassicCard(currentCharacter),
      cardHTML: HTMLDivElement = characterCard.createClassicCardHTML();

    characterCard.getSaveButton(cardHTML).addEventListener('click', () => {
      me.reloadSavedList();
    });

    this.HTML.cardPopup.querySelector('.popup-body').appendChild(cardHTML);
    this.HTML.cardPopup.classList.add('show-popup');
  }

  async getCharacterData(this: NPCsCreator): Promise<NPCsCharacterData> {
    const me = this;
    let creationData: NPCsCharacterDataCreationData;

    try {
      validateSpells();

      creationData = {
        names: await getNames(),
        race: me.currentRace,
        class: me.currentClass,
        ID: NPCsCharacterData.generateCharacterID(),
        abilityScores: getAbilityScores(),
        orderAlignment: getAlignments()[0],
        moralAlignment: getAlignments()[1],
        speed: getSpeed(),
        languages: getLanguages(),
        attributes: getAttributes(),
        saves: getSaves(),
        skills: getSkills(),
        darkvision: getDarkvision(),
        armour: getArmour(),
        CR: getChallengeRating(),
        damageVulnerabilities: getBooleanTypes(me.HTML.selectorContainers.damageVulnerabilities, 'damage') as NPCsDamageTypes,
        damageResistances: getBooleanTypes(me.HTML.selectorContainers.damageResistances, 'damage') as NPCsDamageTypes,
        damageImmunities: getBooleanTypes(me.HTML.selectorContainers.damageImmunities, 'damage') as NPCsDamageTypes,
        conditionResistances: getBooleanTypes(me.HTML.selectorContainers.conditionResistances, 'condition') as NPCsConditionTypes,
        conditionImmunities: getBooleanTypes(me.HTML.selectorContainers.conditionImmunities, 'condition') as NPCsConditionTypes,
        hitDice: getHitDice(),
        HP: getHP(),
        actions: getActions(),
        reactions: getReactions(),
        racialSpells: me.currentRace.spellData,
        spells: getSpells(),
      };
    } catch (e) {
      console.error(e);

      alert(e.message);
    }

    return new NPCsCharacterData(creationData);

    function getAbilityScores(): [number, number, number, number, number, number] {
      const output: number[] = [];

      for (let i = 0; i < 6; i++) {
        const value = getNumericInput(me.HTML.abilities[i].score, NPCsHelper.abilityToStr(i as NPCsAbility, true));
        if (isNaN(value))
          throw new Error(`Invalid ability score given: ${NPCsHelper.abilityToStr(i as NPCsAbility, true)} ${me.HTML.abilities[i].score.value}`);
        output.push(value);
      }

      return output as [number, number, number, number, number, number];
    }

    function getAccordionSelections(accordionContainer: HTMLDivElement): string[] {
      const selections: Node[] = cws.Array.from.NodeListOf(accordionContainer.querySelectorAll('.accordion')).filter((accordion: HTMLElement) => {
        return accordion.querySelector('.toggle-selector').classList.contains('selected');
      });

      return selections.map((accordion: HTMLElement) => {
        return (accordion.querySelector('.accordion-name').querySelector('h4') as HTMLHeadingElement).innerText;
      });
    }

    function getActions(): NPCsAction[] {
      const miscActionsList = cws.Object.values(NPCsInventory.actionsList.misc);
      const miscActions: NPCsAction[] = getAccordionSelections(me.HTML.actionsContainer).map((name: string) => {
        return miscActionsList.filter((action: NPCsAction) => {
          return action.uniqueName === name;
        })[0];
      });

      enum columnMap {
        name = 0,
        damage = 1,
        properties = 2,
        equipped = 3,
      };

      const selectedAttacks: NPCsAction[] = cws.Array.from.NodeListOf(me.HTML.attacksContainer.querySelectorAll('tr')).filter((row: HTMLTableRowElement) => {
        const cells: HTMLTableCellElement[] = cws.Array.from.NodeListOf(row.querySelectorAll('td')) as HTMLTableCellElement[];

        return cells[columnMap.equipped]
          && cells[columnMap.equipped].querySelector('.toggle-selector')
          && cells[columnMap.equipped].querySelector('.toggle-selector').classList.contains('selected')
          && window.getComputedStyle(cells[columnMap.damage]).visibility !== 'hidden';
      }).map((row: HTMLTableRowElement) => {
        const cells: HTMLTableCellElement[] = cws.Array.from.NodeListOf(row.querySelectorAll('td')) as HTMLTableCellElement[];
        return NPCsInventory.getAttackByName(cells[columnMap.name].innerText.trim());
      });

      return selectedAttacks.concat(miscActions).sort((a: NPCsAction, b: NPCsAction) => {
        return a.name < b.name ? -1 : 1;
      });
    }

    function getAlignments(): [NPCsCharacterAlignmentOrder, NPCsCharacterAlignmentMoral] {
      const selectedAlignmentCell: HTMLTableCellElement = me.HTML.alignmentContainer.querySelector('.selected');

      if (!selectedAlignmentCell) {
        return [
          me.currentRace.generateOrderAlignment(),
          me.currentRace.generateMoralAlignment(),
        ]
      }

      const moralValue: number = selectedAlignmentCell.cellIndex,
        orderValue: number = (selectedAlignmentCell.parentElement as HTMLTableRowElement).rowIndex,
        orderMap: NPCsCharacterAlignmentOrder[] = ['lawful', 'neutral', 'chaotic', 'true'],
        moralMap: NPCsCharacterAlignmentMoral[] = ['good', 'neutral', 'evil'];

      if (moralValue === 1 && orderValue === 1) return [orderMap[3], moralMap[1]]
      else return [orderMap[orderValue], moralMap[moralValue]];
    }

    function getArmour(): NPCsArmour {
      return NPCsArmour.getArmourByName(me.HTML.armourSelect.value);
    }

    function getAttributes(): NPCsAttribute[] {
      return getAccordionSelections(me.HTML.attributesContainer).map((name: string) => {
        return NPCsAttribute.getAttributeByName(name);
      });
    }

    function getBooleanTypes(booleanSelectorContainer: HTMLDivElement, type: 'damage' | 'condition'): NPCsDamageTypes | NPCsConditionTypes {
      const selections = getBooleanSelectorSelections(booleanSelectorContainer)[0];
      const basicTypesMap = (type === 'damage' ? new NPCsDamageTypes() : new NPCsConditionTypes());

      selections.forEach((selection: string) => {
        basicTypesMap[selection.toLowerCase()] = true;
      });

      return basicTypesMap;
    }

    /**
     * @returns [values[], isExpertiseSelected[]]
     */
    function getBooleanSelectorSelections(booleanSelectorContainer: HTMLDivElement, searchForExpertise?: boolean): [string[], boolean[]] {
      const selectors: Node[] = cws.Array.from.NodeListOf(booleanSelectorContainer.querySelectorAll('.toggle-selector.selected'));
      const expertiseSelections: boolean[] = [];

      if (searchForExpertise) {
        selectors.forEach((selector: HTMLElement) => {
          const expertiseSelector = selector.querySelector('.skill-expertise');

          if (expertiseSelector.classList.contains('selected'))
            expertiseSelections.push(true);
          else
            expertiseSelections.push(false)
        });
      }

      return [
        searchForExpertise
          ? selectors.map((s: HTMLElement) => { return (s.querySelector('.skill-name') as HTMLElement).innerText.split('\n')[0] })
          : selectors.map((s: HTMLElement) => { return s.innerText.split('\n')[0] }),
        expertiseSelections
      ];
    }

    function getChallengeRating(): number {
      return getNumericInput(me.HTML.challengeRatingEntry, 'challenge rating');
    }

    function getDarkvision() {
      return getNumericInput(me.HTML.darkvisionEntry, 'darkvision');
    }

    function getHitDice(): NPCsDice {
      return new NPCsDice(me.HTML.hitDiceEntry.value || me.HTML.hitDiceEntry.placeholder);
    }

    function getHP(): number {
      return parseInt(me.HTML.displays.hitPoints.innerText)
    }

    function getLanguages(): NPCsLanguageType[] {
      return getBooleanSelectorSelections(me.HTML.selectorContainers.languages)[0] as NPCsLanguageType[];
    }

    async function getNames(): Promise<[string, string]> {
      const input = me.HTML.nameEntry.value;

      if (input === '')
        return await me.currentRace.generateName();

      const parts = input.split(' ').filter((s: string) => { return s !== '' });
      return [parts[0], parts.slice(1).join(' ')];
    }

    function getNumericInput(el: HTMLInputElement | ResizingInput, type: string, NaNdefaultValue?: number): number {
      const value: number = parseInt(el.value);
      if (el.value === '')
        return parseInt(el.placeholder);
      else if (isNaN(value)) {
        if (NaNdefaultValue)
          return NaNdefaultValue;
        throw new Error(`Invalid ${type.toLowerCase()} given: ${value}`);
      } else
        return value;
    }

    function getReactions(): NPCsReaction[] {
      const reactions = cws.Object.values(NPCsInventory.actionsList.reactions);
      return getAccordionSelections(me.HTML.reactionsContainer).map((name: string) => {
        return reactions.filter((reaction: NPCsReaction) => {
          return reaction.name === name;
        })[0];
      });
    }

    function getSaves(): boolean[] {
      return me.HTML.abilities.map((a: NPCsCreatorAbility) => {
        return a.savingThrow.classList.contains('selected');
      });
    }

    function getSkills(): NPCsSkillset {
      const selections = getBooleanSelectorSelections(me.HTML.selectorContainers.skills, true);
      const data = [];

      for (let i = 0; i < selections[0].length; i++) {
        data.push({
          name: selections[0][i],
          expertise: selections[1][i],
        })
      }

      return new NPCsSkillset(NPCsSkillset.giveSkills(data));
    }

    function getSpeed(): number {
      return getNumericInput(me.HTML.speedEntry, 'speed');
    }

    function getSpellcastingLevel(): number {
      return getNumericInput(me.HTML.spellsContainer.querySelector('#spellcasting-ability-level') as HTMLInputElement, 'spellcasting level', 3);
    }

    function getSpells(): NPCsSpellcasterData {
      let abilitySelection: NPCsAbility;
      // get spell selections
      const selectedSpellSelectors: HTMLElement[] = getSelectedSpellSelectors();

      if (selectedSpellSelectors.length === 0) return null;

      // get spells
      const selectedSpells = selectedSpellSelectors.map((name: HTMLElement) => { return NPCsSpell.getSpellByName(name.innerText) });

      // get spellcasting ability only if there are actually spells
      const abilitySelectors: HTMLElement[] = cws.Array.from.NodeListOf(me.HTML.spellsContainer.querySelectorAll('.spellcasting-ability-selector.selected')) as HTMLElement[];
      if (abilitySelectors.length !== 1)
        throw new Error('No spellcasting ability selected.');
      else {
        const ability = NPCsHelper.strToAbility(abilitySelectors[0].innerText);
        if (ability === -1)
          throw new Error('Bad ability selected: ' + abilitySelectors[0].innerText);
        else abilitySelection = ability;
      }

      const spellcastingLevel: number = getSpellcastingLevel();

      return new NPCsSpellcasterData({
        spellList: selectedSpells,
        spellcastingAbility: abilitySelection,
        spellcastingLevel: spellcastingLevel,
      });
    }

    function getSelectedSpellSelectors(): HTMLElement[] {
      return cws.Array.from.NodeListOf(me.HTML.spellsContainer.querySelectorAll('.toggle-selector.selected'))
        .filter((selector: HTMLButtonElement) => {
          for (let i = 0; i < 6; i++)
            if (selector.innerText === NPCsHelper.abilityToStr(i as NPCsAbility, true))
              return false;
          return true;
        }) as HTMLElement[];
    }

    function validateSpells() {
      const selectedSpellSelectors = getSelectedSpellSelectors();
      // if (me.currentRace.spellData) activateSpellcastingAttribute(NPCsAttribute.list.innateSpellcasting.name);

      // ^ removed to allow user to create magical-race characters who have somehow lost their magic

      if (selectedSpellSelectors.length > 0) {
        activateSpellcastingAttribute(NPCsAttribute.list.spellcasting.name);

        const spellData: NPCsSpellcasterData = getSpells(),
          dividedList = spellData.dividedSpellList;
        for (let i = 1; i < dividedList.length; i++) {
          if (dividedList[i].length > 0 && NPCsSpellcasterData.spellSlotsByLevel[getSpellcastingLevel()][i - 1] === 0)
            throw new Error(`Invalid spell selection: your character must be a higher level to cast ${dividedList[i][0].name}.`);
        }
      }
    }

    function activateSpellcastingAttribute(spellcastingAttributeName: string): void {
      const spellcastingAttribute: HTMLElement = cws.Array.from.NodeListOf(me.HTML.attributesContainer.querySelectorAll('.accordion'))
        .filter((accordion: HTMLElement) => {
          return (accordion.querySelector('.accordion-name').querySelector('h4') as HTMLElement).innerText === spellcastingAttributeName;
        })[0] as HTMLElement;

      spellcastingAttribute.querySelector('.accordion-name').classList.add('selected');
      spellcastingAttribute.querySelector('.toggle-selector').classList.add('selected');
      spellcastingAttribute.querySelector('.toggle-selector').innerHTML = 'Remove';
    }
  }

  loadCharacterData(this: NPCsCreator, data: NPCsCharacterData, setAsPlaceholders?: boolean, automaticallyDirty?: boolean): void {
    const me = this;
    setName();
    setClass();
    setRace();

    setArmour();
    setHitDice();
    setSpeed();

    setAbilities();
    setSavingThrows();

    setBooleanListSelectors(me.HTML.selectorContainers.damageVulnerabilities, data.damageVulnerabilities);
    setBooleanListSelectors(me.HTML.selectorContainers.damageResistances, data.damageResistances);
    setBooleanListSelectors(me.HTML.selectorContainers.damageImmunities, data.damageImmunities);
    setBooleanListSelectors(me.HTML.selectorContainers.conditionResistances, data.conditionResistances);
    setBooleanListSelectors(me.HTML.selectorContainers.conditionImmunities, data.conditionImmunities);
    setLanguages();
    setSkills();
    setAlignment();

    setDarkvision();
    setChallengeRating();

    setAttributes();
    setActions();
    setReactions();

    setAttacks();
    setSpells();

    // display changes once the user-changeable values are implemented
    me.resetDisplayValues();
    me.resetSelectBackups();

    if (automaticallyDirty)
      me.isDirty = true;

    function setAbilities() {
      for (let i = 0; i < me.HTML.abilities.length; i++) {
        setInput(me.HTML.abilities[i].score, data.abilityScores[i]);
      }
    }

    function setAccordions(parentElement: HTMLElement, selectedNames: string[]): void {
      const accordions = getAccordions(parentElement);

      accordions.forEach((accordionObject) => {
        if (cws.Array.contains(selectedNames, accordionObject.innerNameElement.innerText)) {
          accordionObject.heading.classList.add('selected');
          accordionObject.selector.classList.add('selected');
          accordionObject.selector.innerText = 'Remove';
        } else {
          accordionObject.heading.classList.remove('selected');
          accordionObject.selector.classList.remove('selected');
          accordionObject.selector.innerText = 'Add';
        }
      });
    }

    function setActions() {
      setAccordions(me.HTML.actionsContainer, data.actions.map((a: NPCsAction) => { return a.uniqueName }));
    }

    function setAlignment() {
      const alignmentCells: HTMLTableCellElement[] = cws.Array.from.NodeListOf(me.HTML.alignmentContainer.querySelectorAll('td')) as HTMLTableCellElement[];
      alignmentCells.forEach((cell: HTMLTableCellElement) => {
        if (cell.innerText.toLowerCase() === data.alignment.toLowerCase())
          cell.classList.add('selected');
        else
          cell.classList.remove('selected');
      });
    }

    function setArmour() {
      me.HTML.armourSelect.value = data.armour.name.toLowerCase();
    }

    function setAttacks() {
      enum columnMap {
        name = 0,
        damage = 1,
        properties = 2,
        equipped = 3,
      };

      const attackRows: HTMLTableRowElement[] = cws.Array.from.NodeListOf(me.HTML.attacksContainer.querySelectorAll('tr')).filter((row: HTMLTableRowElement) => {
        const cells: HTMLTableCellElement[] = cws.Array.from.NodeListOf(row.querySelectorAll('td')) as HTMLTableCellElement[];

        return cells[columnMap.equipped]
          && cells[columnMap.equipped].querySelector('.toggle-selector')
          && window.getComputedStyle(cells[columnMap.damage]).visibility !== 'hidden';
      }),
        dataAttackNames: string[] = data.actions.filter((action: NPCsAction) => {
          return action instanceof NPCsAttack;
        }).map((attack: NPCsAttack) => {
          return attack.uniqueName.toLowerCase();
        });

      attackRows.forEach((row: HTMLTableRowElement) => {
        const selector = row.cells[columnMap.equipped].querySelector('.toggle-selector');
        if (cws.Array.contains(dataAttackNames, row.cells[columnMap.name].innerText.trim().toLowerCase())) {
          selector.classList.add('selected');
          selector.innerHTML = 'Unequip';
        } else {
          selector.classList.remove('selected');
          selector.innerHTML = 'Equip';
        }
      });
    }

    function setAttributes() {
      const dataAttributeNames: string[] = data.attributes.map((attr: NPCsAttribute) => { return attr.name });
      setAccordions(me.HTML.attributesContainer, dataAttributeNames);
    }

    function setBooleanListSelectors(accordion: HTMLDivElement, values: NPCsBooleanList) {
      const selectors: HTMLButtonElement[] = cws.Array.from.NodeListOf(accordion.querySelectorAll('.toggle-selector')) as HTMLButtonElement[];
      selectors.forEach((selector: HTMLButtonElement) => {
        const shouldBeSelected = values[selector.innerText.toLowerCase()];
        if (shouldBeSelected) selector.classList.add('selected');
        else selector.classList.remove('selected');
      });
    }

    function setClass() {
      me.HTML.classSelector.value = data.class.name.toLowerCase();
    }

    function setDarkvision() {
      setInput(me.HTML.darkvisionEntry, data.darkvision);
    }

    function setChallengeRating() {
      setInput(me.HTML.challengeRatingEntry, Math.round(data.challengeRating * 4) / 4);
    }

    function setHitDice() {
      setInput(me.HTML.hitDiceEntry, data.hitDice.print());

      me.HTML.displays.hitPoints.innerText = data.HP + '';
    }

    function setLanguages() {
      const selectors: HTMLButtonElement[] = cws.Array.from.NodeListOf(me.HTML.selectorContainers.languages.querySelectorAll('.toggle-selector')) as HTMLButtonElement[];
      selectors.forEach((selector: HTMLButtonElement) => {
        const shouldBeSelected = cws.Array.includes(data.languages, selector.innerText);
        if (shouldBeSelected) selector.classList.add('selected');
        else selector.classList.remove('selected');
      });
    }

    function setName() {
      if (data.name.trim() !== '')
        setInput(me.HTML.nameEntry, data.name);
    }

    function setRace() {
      me.HTML.raceSelector.value = data.race.name.toLowerCase();
    }

    function setReactions() {
      setAccordions(me.HTML.reactionsContainer, data.reactions.map((r: NPCsReaction) => { return r.uniqueName }));
    }

    function setSavingThrows() {
      for (let i = 0; i < me.HTML.abilities.length; i++) {
        if (data.savingThrows[i]) {
          me.HTML.abilities[i].savingThrow.classList.add('selected');
          me.HTML.abilities[i].savingThrow.innerText = 'proficient';
        } else {
          me.HTML.abilities[i].savingThrow.classList.remove('selected');
          me.HTML.abilities[i].savingThrow.innerText = 'not proficient';
        }
      }
    }

    function setSkills() {
      const selectors: HTMLButtonElement[] = cws.Array.from.NodeListOf(me.HTML.selectorContainers.skills.querySelectorAll('.toggle-selector')) as HTMLButtonElement[];

      selectors.forEach((selector: HTMLButtonElement) => {
        const correspondingSkill: NPCsSkill = data.skills.getSkillByName((selector.querySelector('.skill-name') as HTMLElement).innerText);
        const expertiseSelector: HTMLElement = selector.querySelector('.skill-expertise') as HTMLElement;
        if (correspondingSkill.isSkillPossessed) {
          selector.classList.add('selected');
          if (correspondingSkill.expertise)
            expertiseSelector.classList.add('selected');
          else
            expertiseSelector.classList.remove('selected')
        } else {
          selector.classList.remove('selected');
          expertiseSelector.classList.remove('selected')
        }
      });
    }

    function setSpeed() {
      setInput(me.HTML.speedEntry, data.speed);
    }

    function setSpells() {
      // set the spellcasting ability 
      const abilitySelectors: HTMLElement[] = cws.Array.from.NodeListOf(me.HTML.spellsContainer.querySelectorAll('.toggle-selector.spellcasting-ability-selector'));
      abilitySelectors.forEach((selector: HTMLElement) => {
        if (data.spells && NPCsHelper.abilityToStr(data.spells.spellcastingAbility, true).toLowerCase() === selector.innerText.trim().toLowerCase())
          selector.classList.add('selected');
        else
          selector.classList.remove('selected');
      });

      // set the spellcasting level 
      setInput(me.HTML.spellLevelInput, data.spells ? data.spells.spellcastingLevel : '3');

      // set spells
      const spellSelectors: HTMLElement[] = cws.Array.from.NodeListOf(me.HTML.spellsContainer.querySelectorAll('.toggle-selector'))
        .filter((el: HTMLElement) => {
          return !el.classList.contains('spellcasting-ability-selector');
        }) as HTMLElement[],
        dataSpellNames: string[] = data.spells ? data.spells.list.map((s: NPCsSpell) => { return s.name.toLowerCase(); }) : [];


      spellSelectors.forEach((selector: HTMLElement) => {
        if (cws.Array.contains(dataSpellNames, selector.innerText.trim().toLowerCase())) {
          selector.classList.add('selected');
        } else selector.classList.remove('selected');
      });
    }

    /**
     * Sets either the input element's placeholder or value, depending on what is appropriate
     */
    function setInput(element: HTMLInputElement | ResizingInput, value: string | number): void {
      if (setAsPlaceholders) element.placeholder = value + '';
      else element.value = value + '';
    }

    function getAccordions(parentElement: HTMLElement) {
      return cws.Array.from.NodeListOf(parentElement.querySelectorAll('.accordion')).map((accordionEl: HTMLElement) => {
        const accordionHeading = accordionEl.querySelector('.accordion-name') as HTMLElement;

        return {
          accordion: accordionEl,
          heading: accordionHeading,
          innerNameElement: accordionHeading.querySelector('h4') as HTMLElement,
          selector: accordionEl.querySelector('.toggle-selector') as HTMLElement,
        }
      });
    }
  }

  loadHTML(this: NPCsCreator): void {
    const me = this;

    this.HTML.container = document.getElementById('npcs-creator-main') as HTMLDivElement;
    this.HTML.classSelector = document.getElementById('class-selector') as HTMLSelectElement;
    this.HTML.raceSelector = document.getElementById('race-selector') as HTMLSelectElement;

    loadClasses();
    loadRaces();
    loadArmours();

    this.HTML.abilities = [];
    loadAbilities();

    this.HTML.nameEntry = document.getElementById('name-input') as HTMLInputElement;
    this.HTML.nameEntry.addEventListener('input', () => {
      me.reloadReplacers();
    });

    this.HTML.speedEntry = new ResizingInput(document.getElementById('speed-input') as HTMLInputElement);
    this.HTML.speedEntry.placeholder = this.currentRace.speed + '';
    this.HTML.darkvisionEntry = new ResizingInput(document.getElementById('darkvision-entry') as HTMLInputElement);
    this.HTML.darkvisionEntry.placeholder = this.currentRace.darkvision + '';
    this.HTML.hitDiceEntry = new ResizingInput(document.getElementById('hit-dice-entry') as HTMLInputElement);
    this.HTML.hitDiceEntry.placeholder = this.currentClass.hitDice.print();
    this.HTML.hitDiceEntry.addEventListener('input', () => {
      try {
        new NPCsDice(this.HTML.hitDiceEntry.value);
        me.resetDisplayValues(true);
      } catch (e) {

      }
    });
    this.HTML.challengeRatingEntry = new ResizingInput(document.getElementById('challenge-rating-entry') as HTMLInputElement);
    this.HTML.challengeRatingEntry.placeholder = this.currentClass.CR + '';

    this.HTML.displays.armourClass = document.getElementById('armour-class-display') as HTMLHeadingElement;
    this.HTML.displays.hitPoints = document.getElementById('hit-points-display') as HTMLHeadingElement;
    this.HTML.displays.passivePerception = document.getElementById('passive-perception-display') as HTMLHeadingElement;

    this.HTML.selectorContainers.damageVulnerabilities = loadBooleanSelector('Damage Vulnerabilities', 'damage');
    this.HTML.selectorContainers.damageResistances = loadBooleanSelector('Damage Resistances', 'damage');
    this.HTML.selectorContainers.damageImmunities = loadBooleanSelector('Damage Immunities', 'damage');
    this.HTML.selectorContainers.conditionResistances = loadBooleanSelector('Condition Resistances', 'condition');
    this.HTML.selectorContainers.conditionImmunities = loadBooleanSelector('Condition Immunities', 'condition');
    this.HTML.selectorContainers.languages = loadBooleanSelector('Languages', 'language');
    this.HTML.selectorContainers.skills = loadBooleanSelector('Skills', 'skills');
    cws.Array.from.NodeListOf(this.HTML.selectorContainers.skills.querySelectorAll('.toggle-selector'))
      .filter((element: HTMLElement) => {
        return element.innerHTML.toLowerCase().includes(NPCsSkillset.baseSkillset.perception.name.toLowerCase());
      })[0].addEventListener('click', (e: Event) => {
        me.resetDisplayValues();
      });

    this.HTML.alignmentContainer = NPCsCreator.createAccordion(document.getElementById('alignment-container'), '<strong>Alignment</strong>', '');
    this.HTML.attributesContainer = NPCsCreator.createAccordion(document.getElementById('attributes-container'), '<strong>Attributes</strong>', '');
    this.HTML.actionsContainer = NPCsCreator.createAccordion(document.getElementById('actions-container'), '<strong>Actions</strong>', '');
    this.HTML.reactionsContainer = NPCsCreator.createAccordion(document.getElementById('reactions-container'), '<strong>Reactions</strong>', '');
    this.HTML.attacksContainer = NPCsCreator.createAccordion(document.getElementById('attacks-container'), '<h4>Attacks</h4>', '');
    loadAttributes();
    loadAlignment();
    loadActions();
    loadReactions();
    loadAttacks();
    loadSpells();

    this.HTML.viewButton = Button.createByAttachment(document.getElementById('view-created-npc-button'), () => { me.displayCharacterCard() }, 'View');
    this.HTML.saveButton = Button.createByAttachment(document.getElementById('save-created-npc-button'), async () => {
      const originalText = me.HTML.saveButton.element.innerText;

      NPCsMemory.save(await me.getCharacterData());
      me.HTML.saveButton.element.innerText = 'Saved!';
      me.HTML.saveButton.element.classList.add('button-success');
      me.reloadSavedList();

      setTimeout(() => {
        me.HTML.saveButton.element.innerText = originalText;
        me.HTML.saveButton.element.classList.remove('button-success');
      }, 1500);
    }, 'Save');
    this.HTML.displayButton = Button.createByAttachment(document.getElementById('print-created-npc-button'), () => {
      me.printCharacter();
    }, 'Display');

    this.HTML.cardPopup = document.getElementById('card-display') as HTMLDivElement;
    this.HTML.cardPopup.querySelector('.popup-close').addEventListener('click', () => {
      this.HTML.cardPopup.querySelector('.popup-body').innerHTML = '';
      this.HTML.cardPopup.classList.remove('show-popup');
    });

    me.reloadSavedList();
    me.resetSelectBackups();

    me.HTML.savedCharacterBar.HTML.footerElement.classList.add('mobile-only');

    loadDirtyWatcher();

    this.HTML.resizeableInputs = ResizingInput.findAndCreate();

    this.resetDisplayValues();

    // HELPER FUNCTIONS

    function loadAbilities() {
      const abilityModifierSpanClassName = 'ability-modifier';

      for (let ability = 0; ability < 6; ability++) {
        const nextAbilityContainer: HTMLDivElement = document.createElement('div');
        nextAbilityContainer.classList.add('vertical-grid');
        nextAbilityContainer.innerHTML =
          `<h5></h5>
           <p></p>
           <h4>${NPCsHelper.abilityToStr(ability as NPCsAbility, true)}</h4>
           <h6>not proficient</h6>`;

        const abilityInputEl = document.createElement('input');
        abilityInputEl.placeholder = (me.currentClass.abilities[ability] + me.currentRace.modifiers[ability]) + '';
        abilityInputEl.classList.add('fit-to-content');

        const nextAbility: NPCsCreatorAbility = {
          container: nextAbilityContainer,
          score: new ResizingInput(abilityInputEl),
          modifier: nextAbilityContainer.querySelector('p'),
          name: nextAbilityContainer.querySelector('h4'),
          savingThrow: nextAbilityContainer.querySelector('h6'),
        }

        abilityInputEl.addEventListener('focusin', (e: Event) => {
          if (me.currentRace.modifiers[ability] === 0
            || abilityInputEl.parentElement.querySelectorAll(`.${abilityModifierSpanClassName}`).length > 0)
            return;

          // subtract modifier

          if (isNaN(parseInt(nextAbility.score.value)))
            nextAbility.score.placeholder = (parseInt(nextAbility.score.placeholder) - me.currentRace.modifiers[ability]) + '';
          else
            nextAbility.score.value = (parseInt(nextAbility.score.value) - me.currentRace.modifiers[ability]) + '';

          // separate modifier

          let modifierSpan: HTMLSpanElement = document.createElement('span');
          modifierSpan.classList.add(abilityModifierSpanClassName);
          modifierSpan.innerText = ' ' + NPCsHelper.getFormattedModifier(me.currentRace.modifiers[ability]).split('').join(' ');
          abilityInputEl.insertAdjacentElement('afterend', modifierSpan);
        });

        abilityInputEl.addEventListener('focusout', (e: Event) => {
          if (ability === DEX)
            me.resetDisplayValues(false);
          if (ability === CON)
            me.resetDisplayValues(true);

          if (me.currentRace.modifiers[ability] === 0 || abilityInputEl.parentElement.querySelectorAll(`.${abilityModifierSpanClassName}`).length === 0)
            return;

          // add racial modifier

          if (isNaN(parseInt(nextAbility.score.value)))
            nextAbility.score.placeholder = (parseInt(nextAbility.score.placeholder) + me.currentRace.modifiers[ability]) + '';
          else
            nextAbility.score.value = (parseInt(nextAbility.score.value) + me.currentRace.modifiers[ability]) + '';

          // remove racial modifier span

          abilityInputEl.parentElement.querySelector(`.${abilityModifierSpanClassName}`).remove();

          // change ability modifier
          me.resetDisplayValues(false);
        });

        nextAbility.container.querySelector('h5').appendChild(abilityInputEl);
        nextAbility.modifier.innerText = NPCsHelper.getScoreModifier(parseInt(nextAbility.score.value)) + '';

        nextAbility.savingThrow.addEventListener('click', () => {
          if (nextAbility.savingThrow.classList.contains('selected')) {
            nextAbility.savingThrow.classList.remove('selected');
            nextAbility.savingThrow.innerHTML = 'not proficient';
          } else {
            nextAbility.savingThrow.classList.add('selected');
            nextAbility.savingThrow.innerHTML = 'proficient';
          }
        });

        me.HTML.container.querySelector('.abilities').appendChild(nextAbility.container);
        me.HTML.abilities[ability] = nextAbility;
      }
    }

    function loadArmours() {
      const armourArray: NPCsArmour[] = cws.Object.values(NPCsArmour.list);
      me.HTML.armourSelect = document.getElementById('armour-selector') as HTMLSelectElement;
      loadGenericSelect(
        me.HTML.armourSelect,
        armourArray.map((a: NPCsArmour) => { return a.name }),
        'leather');

      me.HTML.armourSelect.addEventListener('change', (e: Event) => {
        me.resetDisplayValues();
      });
    }

    function loadActions() {
      const actionsArray: NPCsAction[] = cws.Object.values(NPCsInventory.actionsList.misc);
      const names: string[] = [],
        bodies: NPCsReplacerSpan[] = [];

      actionsArray.forEach((action: NPCsAction) => {
        let name: string;
        if (action.uniqueName) {
          name = action.uniqueName;
        } else if (action.subtitle) {
          name = `${action.name} (${action.subtitle})`;
        } else {
          name = action.name;
        }

        names.push(name);

        const bodyReplacer: NPCsReplacerSpan = new NPCsReplacerSpan(action.body);
        me.HTML.regexReplacerSpans.push(bodyReplacer);
        bodies.push(bodyReplacer);
      });

      loadAccordions(me.HTML.actionsContainer.querySelector('.accordion-body'), names, bodies);
    }

    function loadAlignment() {
      const orders: NPCsCharacterAlignmentOrder[] = ['lawful', 'neutral', 'chaotic', 'true'];
      const morals: NPCsCharacterAlignmentMoral[] = ['good', 'neutral', 'evil'];

      const accordionBody = me.HTML.alignmentContainer.querySelector('.accordion-body');
      const grid = cws.createElement({
        type: 'table',
        id: 'alignment-table',
      });

      const tbody = cws.createElement({
        type: 'tbody'
      });
      grid.appendChild(tbody);

      for (let y = 0; y < 3; y++) {
        const row = cws.createElement({
          type: 'tr',
        });

        for (let x = 0; x < 3; x++) {
          const alignmentCell = cws.createElement({
            type: 'td',
          });

          let orderAlignment: string = orders[x];
          if (x === 1 && y === 1) orderAlignment = orders[3];

          alignmentCell.innerHTML = `${orderAlignment} ${morals[y]}`;

          alignmentCell.addEventListener('click', () => {
            const cells = cws.Array.from.NodeListOf(tbody.querySelectorAll('td'));
            cells.forEach((cell: HTMLElement) => {
              cell.classList.remove('selected');
            });

            alignmentCell.classList.add('selected');
          });

          row.appendChild(alignmentCell);
        }

        tbody.appendChild(row);
      }

      accordionBody.appendChild(grid);
    }

    function loadAttacks() {
      const table = document.getElementById('attacks-table');
      const meleeHeader = table.querySelector('#melee-header') as HTMLTableRowElement;
      const rangedHeader = table.querySelector('#ranged-header') as HTMLTableRowElement;

      const mixedAttacks = getAttacks(NPCsInventory.actionsList.attacks.mixed);
      const meleeAttacks = getAttacks(NPCsInventory.actionsList.attacks.melee, 'Melee');
      const rangedAttacks = getAttacks(NPCsInventory.actionsList.attacks.ranged, 'Ranged');

      meleeAttacks.forEach((attack: NPCsAttackMelee) => {
        generateRow(meleeHeader, attack, attack.getProperties());
      });

      rangedAttacks.forEach((attack: NPCsAttackRanged) => {
        generateRow(rangedHeader, attack, attack.getProperties());
      });

      me.HTML.attacksContainer.querySelector('.accordion-body').appendChild(table);

      function getAttacks(inventory: Record<string, NPCsAttack>, mixedType?: 'Melee' | 'Ranged'): NPCsAttack[] {
        const attacks = cws.Object.values(inventory);

        if (mixedType)
          mixedAttacks.forEach((attack: NPCsAttackMixed) => {
            if (attack.category === mixedType)
              attacks.push(attack);
          });

        return attacks.sort((a: NPCsAttack, b: NPCsAttack) => { return a.name < b.name ? 1 : -1 });
      }

      function generateRow(headerRow: HTMLTableRowElement, attack: NPCsAttack, properties: string) {
        const newRow = document.createElement('tr');

        newRow.innerHTML =
          `<td>
            ${attack.name}
          </td>
          <td>
            ${attack.hitDice.print()} ${attack.damageType}
          </td>
          <td>
            ${properties}
          </td>
          <td>
            <button class='toggle-selector'>Equip</button>
          </td>`;

        const button = newRow.querySelector('.toggle-selector');
        button.addEventListener('click', () => {
          if (button.classList.contains('selected')) {
            button.classList.remove('selected');
            button.innerHTML = 'Equip';
          } else {
            button.classList.add('selected');
            button.innerHTML = 'Unequip';
          }
        });

        headerRow.insertAdjacentElement('afterend', newRow);
      }
    }

    function loadAttributes() {
      const attributeArray: NPCsAttribute[] = cws.Object.values(NPCsAttribute.list);
      const names = [],
        bodies = [];

      attributeArray.forEach((attr: NPCsAttribute) => {
        names.push(attr.name);

        const bodyReplacer: NPCsReplacerSpan = new NPCsReplacerSpan(attr.body);
        me.HTML.regexReplacerSpans.push(bodyReplacer);
        bodies.push(bodyReplacer);
      });

      loadAccordions(me.HTML.attributesContainer.querySelector('.accordion-body'), names, bodies);
    }

    function loadAccordions(parent: HTMLElement, names: string[], bodies: string[] | NPCsReplacerSpan[]) {
      for (let i = 0; i < names.length; i++) {
        const newAccordion = NPCsCreator.createAccordion(parent, `<h4 class='accordion-title'>${names[i]}</h4> <button class='toggle-selector'>Add</button>`, bodies[i]);

        // add/remove logic

        const name = newAccordion.querySelector('.accordion-name');
        const selector = newAccordion.querySelector('.toggle-selector');

        if (selector)
          selector.addEventListener('click', () => {
            if (selector.classList.contains('selected')) {
              selector.classList.remove('selected');
              name.classList.remove('selected');
              selector.innerHTML = 'Add';
            } else {
              selector.classList.add('selected');
              name.classList.add('selected');
              selector.innerHTML = 'Remove';
            }
          });

        parent.appendChild(newAccordion);
      }
    }

    function loadBooleanSelector(name: string, type: 'damage' | 'condition' | 'language' | 'skills'): HTMLDivElement {
      const container: HTMLDivElement = document.createElement('div');
      container.classList.add('boolean-types-list');

      const selectorContainer = document.createElement('div');

      let rootOptions: string[];

      switch (type) {
        case 'condition':
          rootOptions = Object.keys(NPCsConditionTypes.list).map((type: string) => { return cws.toCapitalized(type) });
          break;
        case 'damage':
          rootOptions = Object.keys(NPCsDamageTypes.list).map((type: string) => { return cws.toCapitalized(type) });
          break;
        case 'language':
          rootOptions = NPCsLanguages;
          break;
        case 'skills':
          rootOptions = NPCsSkillset.baseSkillset.map((skill: NPCsSkill) => {
            return skill.name;
          });
      }

      rootOptions.sort().forEach((option: string) => {
        let innerContent: HTMLSpanElement;
        if (type === 'skills') {
          innerContent = cws.createElement({
            type: 'span',
            children: [cws.createElement({
              type: 'span',
              classList: 'skill-name',
              innerText: option,
            }),
            cws.createElement({
              type: 'div',
              classList: 'skill-expertise',
              children: [cws.createElement({
                type: 'span',
                innerText: 'Exp.',
                classList: 'desktop-only'
              }), cws.createElement({
                type: 'span',
                innerText: 'Expertise?',
                classList: 'mobile-only'
              })]
            })]
          });

          const expertiseSelector = innerContent.querySelector('.skill-expertise') as HTMLDivElement;

          expertiseSelector.addEventListener('click', () => {
            const parentSelector = cws.findParentElementByClassName(expertiseSelector, 'toggle-selector');
            if (!parentSelector.classList.contains('selected')) {
              parentSelector.classList.add('selected')
            }

            if (expertiseSelector.classList.contains('selected')) {
              expertiseSelector.classList.remove('selected');
            } else {
              expertiseSelector.classList.add('selected');
            }
          });
        } else
          innerContent = cws.createElement({
            type: 'span',
            innerText: option,
          });

        const selector = cws.createElement({
          type: 'button',
          classList: ['toggle-selector'],
        });
        selector.appendChild(innerContent);

        selector.addEventListener('click', (e: Event) => {
          const clickedExpertiseElements = e.composedPath().filter((target: HTMLElement) => {
            if (!target.classList)
              return false;

            return target.classList.contains('skill-expertise');
          });

          if (clickedExpertiseElements.length > 0) return;

          if (selector.classList.contains('selected')) {
            if (type === 'skills') {
              const expertiseSelector = selector.querySelector('.skill-expertise') as HTMLElement;
              expertiseSelector.classList.remove('selected');
            }

            selector.classList.remove('selected');
          } else
            selector.classList.add('selected')
        });

        if (type === 'skills') {
          const skillContainer = cws.createElement({
            type: 'div',
            classList: 'skill-container',
          });
          skillContainer.appendChild(selector);
          selectorContainer.appendChild(skillContainer);
        } else
          selectorContainer.appendChild(selector);
      });

      container.appendChild(selectorContainer);

      const accordion = NPCsCreator.createAccordion(document.getElementById('boolean-types-block'), `<h4>${name}</h4>`, '');
      accordion.querySelector('.accordion-body').appendChild(container);

      return container;
    }

    function loadClasses() {
      const classArray: NPCsClass[] = cws.Object.values(NPCsClass.list);
      loadGenericSelect(
        me.HTML.classSelector,
        classArray.map((c: NPCsClass) => { return c.name.toLowerCase() }),
        'knight');

      me.HTML.classSelector.addEventListener('change', (e: Event) => {
        me.attemptPageReset();
      });

      me.HTML.classSelector.addEventListener('focusin', (e: Event) => {
        me.selectBackups.oldClass = me.HTML.classSelector.value;
      });
    }

    function loadDirtyWatcher() {
      const toggleSelectors = cws.Array.from.NodeListOf(me.HTML.container.querySelectorAll('.toggle-selector')),
        selects = cws.Array.from.NodeListOf(me.HTML.container.querySelectorAll('select')),
        inputs = cws.Array.from.NodeListOf(me.HTML.container.querySelectorAll('input'));

      toggleSelectors.forEach((selector: HTMLElement) => {
        selector.addEventListener('click', () => {
          me.isDirty = true;
        });
      });

      selects.forEach((select: HTMLSelectElement) => {
        if (!cws.orEquals(select.id, [me.HTML.classSelector.id, me.HTML.raceSelector.id]))
          select.addEventListener('change', () => {
            me.isDirty = true;
          });
      });

      inputs.forEach((input: HTMLInputElement) => {
        input.addEventListener('input', () => {
          me.isDirty = true;
        });
      });
    }

    function loadRaces() {
      const raceArray: NPCsRace[] = cws.Object.values(NPCsRace.list);
      loadGenericSelect(
        me.HTML.raceSelector,
        raceArray.map((r: NPCsRace) => { return r.name }),
        'human');

      me.HTML.raceSelector.addEventListener('change', (e: Event) => {
        me.attemptPageReset();
      });

      me.HTML.raceSelector.addEventListener('focusin', (e: Event) => {
        me.selectBackups.oldRace = me.HTML.raceSelector.value;
      });
    }

    function loadGenericSelect(selectEl: HTMLSelectElement, names: string[], autoFocusName: string, values?: string[] | null) {
      if (!cws.Array.includes(names, autoFocusName))
        throw new Error(`AutoFocusName ${autoFocusName} not found in names array`);

      for (let i = 0; i < names.length; i++) {
        let newOption: HTMLOptionElement = document.createElement('option');
        newOption.innerText = names[i];
        newOption.value = values ? values[i] || names[i] : names[i];
        if (names[i] === autoFocusName)
          newOption['autofocus'] = true;

        selectEl.appendChild(newOption);
      }
    }

    function loadReactions() {
      const reactionsArray: NPCsReaction[] = cws.Object.values(NPCsInventory.actionsList.reactions);
      const names = [],
        bodies = [];

      reactionsArray.forEach((reaction: NPCsReaction) => {
        let name: string;
        if (reaction.uniqueName) {
          name = reaction.uniqueName;
        } else if (reaction.subtitle) {
          name = `${reaction.name} (${reaction.subtitle})`;
        } else {
          name = reaction.name;
        }

        names.push(name);

        const bodyReplacer: NPCsReplacerSpan = new NPCsReplacerSpan(reaction.body);
        me.HTML.regexReplacerSpans.push(bodyReplacer);
        bodies.push(bodyReplacer);
      });

      loadAccordions(me.HTML.reactionsContainer.querySelector('.accordion-body'), names, bodies);
    }

    function loadSpells() {
      me.HTML.spellsContainer = document.getElementById('spells-container') as HTMLDivElement;
      const accordion = NPCsCreator.createAccordion(me.HTML.spellsContainer, '<strong>Spells</strong>', '');
      const body = accordion.querySelector('.accordion-body');

      loadAbilitySelector();
      loadLevelSelector();

      for (let i = 0; i < NPCsSpell.list.length; i++)
        loadLevel(i);

      function loadAbilitySelector() {
        const abilityAccordion = NPCsCreator.createAccordion(body, '<strong>Spellcasting Ability</strong>');
        const abilityBody = abilityAccordion.querySelector('.accordion-body');

        const spellcastingSelectorClassName = 'spellcasting-ability-selector';

        for (let i = 0; i < 6; i++) {
          const abililty = cws.createElement({
            type: 'div',
            classList: ['toggle-selector', spellcastingSelectorClassName],
            innerText: NPCsHelper.abilityToStr(i as NPCsAbility, true),
            listeners: [{
              type: 'click',
              fn: () => {
                if (abililty.classList.contains('selected'))
                  abililty.classList.remove('selected');
                else {
                  const selectors = cws.Array.from.NodeListOf(abilityBody.querySelectorAll(`.${spellcastingSelectorClassName}`));
                  selectors.forEach((selector: HTMLElement) => {
                    selector.classList.remove('selected');
                  });

                  abililty.classList.add('selected');
                }
              }
            }]
          });

          abilityBody.appendChild(abililty);
        }
      }

      function loadLevelSelector() {
        const levelAccordion: HTMLDivElement = NPCsCreator.createAccordion(accordion, '<strong>Spellcasting Level</strong>'),
          levelBody = levelAccordion.querySelector('.accordion-body'),
          label = cws.createElement({
            type: 'h3',
            innerText: 'Spellcasting Level',
            style: 'text-align: center'
          }),
          inputWrapper = cws.createElement({
            type: 'h5',
            style: 'text-align: center'
          }),
          input = cws.createElement({
            type: 'input',
            id: 'spellcasting-ability-level'
          }),
          container = cws.createElement({
            type: 'div',
            classList: 'spellcasting-level-container'
          });

        me.HTML.spellLevelInput = new ResizingInput(input);

        inputWrapper.appendChild(input);
        container.appendChild(inputWrapper);
        container.appendChild(label);
        levelBody.appendChild(container);
        body.appendChild(levelAccordion);

        levelAccordion.addEventListener('click', () => {
          me.HTML.spellLevelInput.resizeToContent();
        });

        me.HTML.spellLevelInput.placeholder = '3';
      }

      function loadLevel(level: number) {
        const levelAccordion = NPCsCreator.createAccordion(body, `<strong>${level === 0 ? 'Cantrips' : `Level ${level}`}</strong>`, '');
        const levelBody = levelAccordion.querySelector('.accordion-body');
        const spellsList = cws.Object.values(NPCsSpell.list[level]).sort((a, b) => {
          return a.name < b.name ? -1 : 1;
        });

        for (let i = 0; i < spellsList.length; i++) {
          const newSpell = cws.createElement({
            type: 'div',
            classList: ['spell-selector', 'toggle-selector'],
            innerText: spellsList[i].name,
            listeners: [{
              type: 'click',
              fn: () => {
                if (newSpell.classList.contains('selected'))
                  newSpell.classList.remove('selected');
                else
                  newSpell.classList.add('selected');
              }
            }]
          });

          levelBody.appendChild(newSpell);
        }
      }
    }
  }

  async printCharacter(this: NPCsCreator): Promise<void> {
    new NPCsClassicCard(await this.getCharacterData()).printCharacter();
  }

  async reloadReplacers(this: NPCsCreator): Promise<void> {
    const currentData = await this.getCharacterData();

    this.HTML.regexReplacerSpans.forEach((span: NPCsReplacerSpan) => {
      span.fillAsData(currentData);
    });
  }

  reloadSavedList(this: NPCsCreator) {
    const me = this,
      list = NPCsMemory.HTML.createCharacterList((character: NPCsCharacterData) => {
        me.attemptLoadSavedCharacter(character);
      }, me.HTML.savedCharacterList);

    if (!me.HTML.savedCharacterList)
      me.HTML.savedCharacterListContainer.appendChild(list);

    me.HTML.savedCharacterList = list;
    me.HTML.savedCharacterBar.refreshSavedBar();
  }

  async resetDisplayValues(this: NPCsCreator, resetHP?: boolean) {
    const data: NPCsCharacterData = await this.getCharacterData();

    for (let i = 0; i < this.HTML.abilities.length; i++) {
      this.HTML.abilities[i].modifier.innerText = NPCsHelper.getFormattedModifier(data.abilityModifiers[i]);
    }

    this.HTML.displays.armourClass.innerText = data.armourClass + '';

    if (resetHP) {
      this.HTML.displays.hitPoints.innerText = data.averageHP + '';
    }

    this.HTML.displays.passivePerception.innerText = data.passivePerception + '';

    this.reloadReplacers();
  }

  resetSelectBackups(this: NPCsCreator): void {
    this.selectBackups.oldRace = this.HTML.raceSelector.value;
    this.selectBackups.oldClass = this.HTML.classSelector.value;
  }

  static createAccordion(parent: Element, name: string, body?: string | NPCsReplacerSpan): HTMLTableElement {
    const newAccordion = cws.createElement({
      type: 'table',
      classList: ['accordion', 'closed'],
      children: [
        cws.createElement({
          type: 'tbody',
          children: [
            cws.createElement({
              type: 'tr',
              children: [
                cws.createElement({
                  type: 'td',
                  children: [cws.createElement({
                    type: 'span',
                    innerHTML: '+',
                  })],
                  classList: 'accordion-status',
                  otherNodes: [{
                    type: 'width',
                    value: '20'
                  }]
                }),
                cws.createElement({
                  type: 'td',
                  innerHTML: name,
                  classList: 'accordion-name',
                }),
              ]
            }),
            cws.createElement({
              type: 'tr',
              children: [
                cws.createElement({
                  type: 'td',
                }),
                cws.createElement({
                  type: 'td',
                  children: [getBody()]
                }),
              ]
            }),
          ]
        })
      ]
    });

    // open/close logic

    const statusEl = newAccordion.querySelector('.accordion-status');
    statusEl.addEventListener('click', () => {
      if (newAccordion.classList.contains('closed')) {
        newAccordion.classList.remove('closed');
        newAccordion.classList.add('opened');
        statusEl.innerHTML = statusEl.innerHTML.replace('+', '-');
      } else {
        newAccordion.classList.remove('opened');
        newAccordion.classList.add('closed');
        statusEl.innerHTML = statusEl.innerHTML.replace('-', '+');
      }
    });

    parent.appendChild(newAccordion);
    return newAccordion;

    function getBody(): HTMLSpanElement {
      if (body instanceof NPCsReplacerSpan) {
        return cws.createElement({
          type: 'p',
          classList: 'accordion-body',
          children: [body.element],
        });
      } else
        return cws.createElement({
          type: 'p',
          classList: 'accordion-body',
          innerHTML: body,
        });
    }
  }
}

new NPCsCreator();