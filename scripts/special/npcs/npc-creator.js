var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cws } from "../../cws.js";
import { Button } from "../../components/button.component.js";
import { ResizingInput } from "../../components/resizing-input.component.js";
import { NPCsReplacerSpan } from "./components/npcs-creator-replacer-span.component.js";
import { NPCsMemorySaveBarComponent } from "./components/npcs-memory-save-bar.component.js";
import { NPCsCharacterData } from "./core/character-data.js";
import { NPCsClass } from "./core/class.js";
import { NPCsClassicCard } from "./core/classic-card.js";
import { NPCsMemory } from "./core/npcs-memory.js";
import { NPCsRace } from "./core/race.js";
import { NPCsAttack } from "./helper-repository/action-attack.js";
import { NPCsArmour } from "./helper-repository/armour.js";
import { NPCsAttribute } from "./helper-repository/attribute.js";
import { NPCsConditionTypes } from "./helper-repository/condition-types.js";
import { NPCsDamageTypes } from "./helper-repository/damage-types.js";
import { CON, DEX, NPCsDice, NPCsHelper, NPCsLanguages } from "./helper-repository/general.js";
import { NPCsInventory } from "./helper-repository/inventory.js";
import { NPCsSkillset } from "./helper-repository/skill-set.js";
import { NPCsSpell } from "./helper-repository/spell.js";
import { NPCsSpellcasterData } from "./helper-repository/spellcaster-data.js";
class NPCsCreator {
    constructor() {
        this.isDirty = false;
        this.selectBackups = {
            oldRace: null,
            oldClass: null,
        };
        this.HTML = {
            savedCharacterList: null,
            savedCharacterListContainer: document.getElementById('npcs-creator-side-bar'),
            savedCharacterBar: new NPCsMemorySaveBarComponent(document.getElementById('main'), (character) => {
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
        this.loadHTML();
    }
    get currentRace() {
        return NPCsRace.getRaceByName(this.HTML.raceSelector.value);
    }
    get currentClass() {
        return NPCsClass.getClassByName(this.HTML.classSelector.value);
    }
    attemptLoadSavedCharacter(character) {
        return __awaiter(this, void 0, void 0, function* () {
            const confirmation = yield this.attemptPageReset('Loading a saved character will overwrite the current information on screen.  Continue?', true);
            if (confirmation)
                this.loadCharacterData(character, false, true);
        });
    }
    attemptPageReset(altMessage, doNotLoadCharacter) {
        return __awaiter(this, void 0, void 0, function* () {
            const confirmation = !this.isDirty || confirm(altMessage || "Changing the character's class or race will reset any previously-entered data.  Are you sure you wish to continue?");
            if (confirmation) {
                if (!doNotLoadCharacter) {
                    const newCharacter = yield NPCsCharacterData.create(this.currentRace, this.currentClass, ['', '']);
                    this.loadCharacterData(newCharacter, true);
                    this.HTML.abilities.forEach((ability) => {
                        ability.score.value = '';
                    });
                    this.resetDisplayValues(true);
                }
                this.isDirty = false;
            }
            else {
                this.HTML.raceSelector.value = this.selectBackups.oldRace;
                this.HTML.classSelector.value = this.selectBackups.oldClass;
            }
            return confirmation;
        });
    }
    displayCharacterCard() {
        return __awaiter(this, void 0, void 0, function* () {
            const me = this, currentCharacter = yield this.getCharacterData(), characterCard = new NPCsClassicCard(currentCharacter), cardHTML = characterCard.createClassicCardHTML();
            characterCard.getSaveButton(cardHTML).addEventListener('click', () => {
                me.reloadSavedList();
            });
            this.HTML.cardPopup.querySelector('.popup-body').appendChild(cardHTML);
            this.HTML.cardPopup.classList.add('show-popup');
        });
    }
    getCharacterData() {
        return __awaiter(this, void 0, void 0, function* () {
            const me = this;
            let creationData;
            try {
                validateSpells();
                creationData = {
                    names: yield getNames(),
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
                    damageVulnerabilities: getBooleanTypes(me.HTML.selectorContainers.damageVulnerabilities, 'damage'),
                    damageResistances: getBooleanTypes(me.HTML.selectorContainers.damageResistances, 'damage'),
                    damageImmunities: getBooleanTypes(me.HTML.selectorContainers.damageImmunities, 'damage'),
                    conditionResistances: getBooleanTypes(me.HTML.selectorContainers.conditionResistances, 'condition'),
                    conditionImmunities: getBooleanTypes(me.HTML.selectorContainers.conditionImmunities, 'condition'),
                    hitDice: getHitDice(),
                    HP: getHP(),
                    actions: getActions(),
                    reactions: getReactions(),
                    racialSpells: me.currentRace.spellData,
                    spells: getSpells(),
                };
            }
            catch (e) {
                console.error(e);
                alert(e.message);
            }
            return new NPCsCharacterData(creationData);
            function getAbilityScores() {
                const output = [];
                for (let i = 0; i < 6; i++) {
                    const value = getNumericInput(me.HTML.abilities[i].score, NPCsHelper.abilityToStr(i, true));
                    if (isNaN(value))
                        throw new Error(`Invalid ability score given: ${NPCsHelper.abilityToStr(i, true)} ${me.HTML.abilities[i].score.value}`);
                    output.push(value);
                }
                return output;
            }
            function getAccordionSelections(accordionContainer) {
                const selections = cws.Array.from.NodeListOf(accordionContainer.querySelectorAll('.accordion')).filter((accordion) => {
                    return accordion.querySelector('.toggle-selector').classList.contains('selected');
                });
                return selections.map((accordion) => {
                    return accordion.querySelector('.accordion-name').querySelector('h4').innerText;
                });
            }
            function getActions() {
                const miscActionsList = cws.Object.values(NPCsInventory.actionsList.misc);
                const miscActions = getAccordionSelections(me.HTML.actionsContainer).map((name) => {
                    return miscActionsList.filter((action) => {
                        return action.uniqueName === name;
                    })[0];
                });
                let columnMap;
                (function (columnMap) {
                    columnMap[columnMap["name"] = 0] = "name";
                    columnMap[columnMap["damage"] = 1] = "damage";
                    columnMap[columnMap["properties"] = 2] = "properties";
                    columnMap[columnMap["equipped"] = 3] = "equipped";
                })(columnMap || (columnMap = {}));
                ;
                const selectedAttacks = cws.Array.from.NodeListOf(me.HTML.attacksContainer.querySelectorAll('tr')).filter((row) => {
                    const cells = cws.Array.from.NodeListOf(row.querySelectorAll('td'));
                    return cells[columnMap.equipped]
                        && cells[columnMap.equipped].querySelector('.toggle-selector')
                        && cells[columnMap.equipped].querySelector('.toggle-selector').classList.contains('selected')
                        && window.getComputedStyle(cells[columnMap.damage]).visibility !== 'hidden';
                }).map((row) => {
                    const cells = cws.Array.from.NodeListOf(row.querySelectorAll('td'));
                    return NPCsInventory.getAttackByName(cells[columnMap.name].innerText.trim());
                });
                return selectedAttacks.concat(miscActions).sort((a, b) => {
                    return a.name < b.name ? -1 : 1;
                });
            }
            function getAlignments() {
                const selectedAlignmentCell = me.HTML.alignmentContainer.querySelector('.selected');
                if (!selectedAlignmentCell) {
                    return [
                        me.currentRace.generateOrderAlignment(),
                        me.currentRace.generateMoralAlignment(),
                    ];
                }
                const moralValue = selectedAlignmentCell.cellIndex, orderValue = selectedAlignmentCell.parentElement.rowIndex, orderMap = ['lawful', 'neutral', 'chaotic', 'true'], moralMap = ['good', 'neutral', 'evil'];
                if (moralValue === 1 && orderValue === 1)
                    return [orderMap[3], moralMap[1]];
                else
                    return [orderMap[orderValue], moralMap[moralValue]];
            }
            function getArmour() {
                return NPCsArmour.getArmourByName(me.HTML.armourSelect.value);
            }
            function getAttributes() {
                return getAccordionSelections(me.HTML.attributesContainer).map((name) => {
                    return NPCsAttribute.getAttributeByName(name);
                });
            }
            function getBooleanTypes(booleanSelectorContainer, type) {
                const selections = getBooleanSelectorSelections(booleanSelectorContainer)[0];
                const basicTypesMap = (type === 'damage' ? new NPCsDamageTypes() : new NPCsConditionTypes());
                selections.forEach((selection) => {
                    basicTypesMap[selection.toLowerCase()] = true;
                });
                return basicTypesMap;
            }
            /**
             * @returns [values[], isExpertiseSelected[]]
             */
            function getBooleanSelectorSelections(booleanSelectorContainer, searchForExpertise) {
                const selectors = cws.Array.from.NodeListOf(booleanSelectorContainer.querySelectorAll('.toggle-selector.selected'));
                const expertiseSelections = [];
                if (searchForExpertise) {
                    selectors.forEach((selector) => {
                        const expertiseSelector = selector.querySelector('.skill-expertise');
                        if (expertiseSelector.classList.contains('selected'))
                            expertiseSelections.push(true);
                        else
                            expertiseSelections.push(false);
                    });
                }
                return [
                    searchForExpertise
                        ? selectors.map((s) => { return s.querySelector('.skill-name').innerText.split('\n')[0]; })
                        : selectors.map((s) => { return s.innerText.split('\n')[0]; }),
                    expertiseSelections
                ];
            }
            function getChallengeRating() {
                return getNumericInput(me.HTML.challengeRatingEntry, 'challenge rating');
            }
            function getDarkvision() {
                return getNumericInput(me.HTML.darkvisionEntry, 'darkvision');
            }
            function getHitDice() {
                return new NPCsDice(me.HTML.hitDiceEntry.value || me.HTML.hitDiceEntry.placeholder);
            }
            function getHP() {
                return parseInt(me.HTML.displays.hitPoints.innerText);
            }
            function getLanguages() {
                return getBooleanSelectorSelections(me.HTML.selectorContainers.languages)[0];
            }
            function getNames() {
                return __awaiter(this, void 0, void 0, function* () {
                    const input = me.HTML.nameEntry.value;
                    if (input === '')
                        return yield me.currentRace.generateName();
                    const parts = input.split(' ').filter((s) => { return s !== ''; });
                    return [parts[0], parts.slice(1).join(' ')];
                });
            }
            function getNumericInput(el, type, NaNdefaultValue) {
                const value = parseInt(el.value);
                if (el.value === '')
                    return parseInt(el.placeholder);
                else if (isNaN(value)) {
                    if (NaNdefaultValue)
                        return NaNdefaultValue;
                    throw new Error(`Invalid ${type.toLowerCase()} given: ${value}`);
                }
                else
                    return value;
            }
            function getReactions() {
                const reactions = cws.Object.values(NPCsInventory.actionsList.reactions);
                return getAccordionSelections(me.HTML.reactionsContainer).map((name) => {
                    return reactions.filter((reaction) => {
                        return reaction.name === name;
                    })[0];
                });
            }
            function getSaves() {
                return me.HTML.abilities.map((a) => {
                    return a.savingThrow.classList.contains('selected');
                });
            }
            function getSkills() {
                const selections = getBooleanSelectorSelections(me.HTML.selectorContainers.skills, true);
                const data = [];
                for (let i = 0; i < selections[0].length; i++) {
                    data.push({
                        name: selections[0][i],
                        expertise: selections[1][i],
                    });
                }
                return new NPCsSkillset(NPCsSkillset.giveSkills(data));
            }
            function getSpeed() {
                return getNumericInput(me.HTML.speedEntry, 'speed');
            }
            function getSpellcastingLevel() {
                return getNumericInput(me.HTML.spellsContainer.querySelector('#spellcasting-ability-level'), 'spellcasting level', 3);
            }
            function getSpells() {
                let abilitySelection;
                // get spell selections
                const selectedSpellSelectors = getSelectedSpellSelectors();
                if (selectedSpellSelectors.length === 0)
                    return null;
                // get spells
                const selectedSpells = selectedSpellSelectors.map((name) => { return NPCsSpell.getSpellByName(name.innerText); });
                // get spellcasting ability only if there are actually spells
                const abilitySelectors = cws.Array.from.NodeListOf(me.HTML.spellsContainer.querySelectorAll('.spellcasting-ability-selector.selected'));
                if (abilitySelectors.length !== 1)
                    throw new Error('No spellcasting ability selected.');
                else {
                    const ability = NPCsHelper.strToAbility(abilitySelectors[0].innerText);
                    if (ability === -1)
                        throw new Error('Bad ability selected: ' + abilitySelectors[0].innerText);
                    else
                        abilitySelection = ability;
                }
                const spellcastingLevel = getSpellcastingLevel();
                return new NPCsSpellcasterData({
                    spellList: selectedSpells,
                    spellcastingAbility: abilitySelection,
                    spellcastingLevel: spellcastingLevel,
                });
            }
            function getSelectedSpellSelectors() {
                return cws.Array.from.NodeListOf(me.HTML.spellsContainer.querySelectorAll('.toggle-selector.selected'))
                    .filter((selector) => {
                    for (let i = 0; i < 6; i++)
                        if (selector.innerText === NPCsHelper.abilityToStr(i, true))
                            return false;
                    return true;
                });
            }
            function validateSpells() {
                const selectedSpellSelectors = getSelectedSpellSelectors();
                // if (me.currentRace.spellData) activateSpellcastingAttribute(NPCsAttribute.list.innateSpellcasting.name);
                // ^ removed to allow user to create magical-race characters who have somehow lost their magic
                if (selectedSpellSelectors.length > 0) {
                    activateSpellcastingAttribute(NPCsAttribute.list.spellcasting.name);
                    const spellData = getSpells(), dividedList = spellData.dividedSpellList;
                    for (let i = 1; i < dividedList.length; i++) {
                        if (dividedList[i].length > 0 && NPCsSpellcasterData.spellSlotsByLevel[getSpellcastingLevel()][i - 1] === 0)
                            throw new Error(`Invalid spell selection: your character must be a higher level to cast ${dividedList[i][0].name}.`);
                    }
                }
            }
            function activateSpellcastingAttribute(spellcastingAttributeName) {
                const spellcastingAttribute = cws.Array.from.NodeListOf(me.HTML.attributesContainer.querySelectorAll('.accordion'))
                    .filter((accordion) => {
                    return accordion.querySelector('.accordion-name').querySelector('h4').innerText === spellcastingAttributeName;
                })[0];
                spellcastingAttribute.querySelector('.accordion-name').classList.add('selected');
                spellcastingAttribute.querySelector('.toggle-selector').classList.add('selected');
                spellcastingAttribute.querySelector('.toggle-selector').innerHTML = 'Remove';
            }
        });
    }
    loadCharacterData(data, setAsPlaceholders, automaticallyDirty) {
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
        function setAccordions(parentElement, selectedNames) {
            const accordions = getAccordions(parentElement);
            accordions.forEach((accordionObject) => {
                if (cws.Array.contains(selectedNames, accordionObject.innerNameElement.innerText)) {
                    accordionObject.heading.classList.add('selected');
                    accordionObject.selector.classList.add('selected');
                    accordionObject.selector.innerText = 'Remove';
                }
                else {
                    accordionObject.heading.classList.remove('selected');
                    accordionObject.selector.classList.remove('selected');
                    accordionObject.selector.innerText = 'Add';
                }
            });
        }
        function setActions() {
            setAccordions(me.HTML.actionsContainer, data.actions.map((a) => { return a.uniqueName; }));
        }
        function setAlignment() {
            const alignmentCells = cws.Array.from.NodeListOf(me.HTML.alignmentContainer.querySelectorAll('td'));
            alignmentCells.forEach((cell) => {
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
            let columnMap;
            (function (columnMap) {
                columnMap[columnMap["name"] = 0] = "name";
                columnMap[columnMap["damage"] = 1] = "damage";
                columnMap[columnMap["properties"] = 2] = "properties";
                columnMap[columnMap["equipped"] = 3] = "equipped";
            })(columnMap || (columnMap = {}));
            ;
            const attackRows = cws.Array.from.NodeListOf(me.HTML.attacksContainer.querySelectorAll('tr')).filter((row) => {
                const cells = cws.Array.from.NodeListOf(row.querySelectorAll('td'));
                return cells[columnMap.equipped]
                    && cells[columnMap.equipped].querySelector('.toggle-selector')
                    && window.getComputedStyle(cells[columnMap.damage]).visibility !== 'hidden';
            }), dataAttackNames = data.actions.filter((action) => {
                return action instanceof NPCsAttack;
            }).map((attack) => {
                return attack.uniqueName.toLowerCase();
            });
            attackRows.forEach((row) => {
                const selector = row.cells[columnMap.equipped].querySelector('.toggle-selector');
                if (cws.Array.contains(dataAttackNames, row.cells[columnMap.name].innerText.trim().toLowerCase())) {
                    selector.classList.add('selected');
                    selector.innerHTML = 'Unequip';
                }
                else {
                    selector.classList.remove('selected');
                    selector.innerHTML = 'Equip';
                }
            });
        }
        function setAttributes() {
            const dataAttributeNames = data.attributes.map((attr) => { return attr.name; });
            setAccordions(me.HTML.attributesContainer, dataAttributeNames);
        }
        function setBooleanListSelectors(accordion, values) {
            const selectors = cws.Array.from.NodeListOf(accordion.querySelectorAll('.toggle-selector'));
            selectors.forEach((selector) => {
                const shouldBeSelected = values[selector.innerText.toLowerCase()];
                if (shouldBeSelected)
                    selector.classList.add('selected');
                else
                    selector.classList.remove('selected');
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
            const selectors = cws.Array.from.NodeListOf(me.HTML.selectorContainers.languages.querySelectorAll('.toggle-selector'));
            selectors.forEach((selector) => {
                const shouldBeSelected = cws.Array.includes(data.languages, selector.innerText);
                if (shouldBeSelected)
                    selector.classList.add('selected');
                else
                    selector.classList.remove('selected');
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
            setAccordions(me.HTML.reactionsContainer, data.reactions.map((r) => { return r.uniqueName; }));
        }
        function setSavingThrows() {
            for (let i = 0; i < me.HTML.abilities.length; i++) {
                if (data.savingThrows[i]) {
                    me.HTML.abilities[i].savingThrow.classList.add('selected');
                    me.HTML.abilities[i].savingThrow.innerText = 'proficient';
                }
                else {
                    me.HTML.abilities[i].savingThrow.classList.remove('selected');
                    me.HTML.abilities[i].savingThrow.innerText = 'not proficient';
                }
            }
        }
        function setSkills() {
            const selectors = cws.Array.from.NodeListOf(me.HTML.selectorContainers.skills.querySelectorAll('.toggle-selector'));
            selectors.forEach((selector) => {
                const correspondingSkill = data.skills.getSkillByName(selector.querySelector('.skill-name').innerText);
                const expertiseSelector = selector.querySelector('.skill-expertise');
                if (correspondingSkill.isSkillPossessed) {
                    selector.classList.add('selected');
                    if (correspondingSkill.expertise)
                        expertiseSelector.classList.add('selected');
                    else
                        expertiseSelector.classList.remove('selected');
                }
                else {
                    selector.classList.remove('selected');
                    expertiseSelector.classList.remove('selected');
                }
            });
        }
        function setSpeed() {
            setInput(me.HTML.speedEntry, data.speed);
        }
        function setSpells() {
            // set the spellcasting ability 
            const abilitySelectors = cws.Array.from.NodeListOf(me.HTML.spellsContainer.querySelectorAll('.toggle-selector.spellcasting-ability-selector'));
            abilitySelectors.forEach((selector) => {
                if (data.spells && NPCsHelper.abilityToStr(data.spells.spellcastingAbility, true).toLowerCase() === selector.innerText.trim().toLowerCase())
                    selector.classList.add('selected');
                else
                    selector.classList.remove('selected');
            });
            // set the spellcasting level 
            setInput(me.HTML.spellLevelInput, data.spells ? data.spells.spellcastingLevel : '3');
            // set spells
            const spellSelectors = cws.Array.from.NodeListOf(me.HTML.spellsContainer.querySelectorAll('.toggle-selector'))
                .filter((el) => {
                return !el.classList.contains('spellcasting-ability-selector');
            }), dataSpellNames = data.spells ? data.spells.list.map((s) => { return s.name.toLowerCase(); }) : [];
            spellSelectors.forEach((selector) => {
                if (cws.Array.contains(dataSpellNames, selector.innerText.trim().toLowerCase())) {
                    selector.classList.add('selected');
                }
                else
                    selector.classList.remove('selected');
            });
        }
        /**
         * Sets either the input element's placeholder or value, depending on what is appropriate
         */
        function setInput(element, value) {
            if (setAsPlaceholders)
                element.placeholder = value + '';
            else
                element.value = value + '';
        }
        function getAccordions(parentElement) {
            return cws.Array.from.NodeListOf(parentElement.querySelectorAll('.accordion')).map((accordionEl) => {
                const accordionHeading = accordionEl.querySelector('.accordion-name');
                return {
                    accordion: accordionEl,
                    heading: accordionHeading,
                    innerNameElement: accordionHeading.querySelector('h4'),
                    selector: accordionEl.querySelector('.toggle-selector'),
                };
            });
        }
    }
    loadHTML() {
        const me = this;
        this.HTML.container = document.getElementById('npcs-creator-main');
        this.HTML.classSelector = document.getElementById('class-selector');
        this.HTML.raceSelector = document.getElementById('race-selector');
        loadClasses();
        loadRaces();
        loadArmours();
        this.HTML.abilities = [];
        loadAbilities();
        this.HTML.nameEntry = document.getElementById('name-input');
        this.HTML.nameEntry.addEventListener('input', () => {
            me.reloadReplacers();
        });
        this.HTML.speedEntry = new ResizingInput(document.getElementById('speed-input'));
        this.HTML.speedEntry.placeholder = this.currentRace.speed + '';
        this.HTML.darkvisionEntry = new ResizingInput(document.getElementById('darkvision-entry'));
        this.HTML.darkvisionEntry.placeholder = this.currentRace.darkvision + '';
        this.HTML.hitDiceEntry = new ResizingInput(document.getElementById('hit-dice-entry'));
        this.HTML.hitDiceEntry.placeholder = this.currentClass.hitDice.print();
        this.HTML.hitDiceEntry.addEventListener('input', () => {
            try {
                new NPCsDice(this.HTML.hitDiceEntry.value);
                me.resetDisplayValues(true);
            }
            catch (e) {
            }
        });
        this.HTML.challengeRatingEntry = new ResizingInput(document.getElementById('challenge-rating-entry'));
        this.HTML.challengeRatingEntry.placeholder = this.currentClass.CR + '';
        this.HTML.displays.armourClass = document.getElementById('armour-class-display');
        this.HTML.displays.hitPoints = document.getElementById('hit-points-display');
        this.HTML.displays.passivePerception = document.getElementById('passive-perception-display');
        this.HTML.selectorContainers.damageVulnerabilities = loadBooleanSelector('Damage Vulnerabilities', 'damage');
        this.HTML.selectorContainers.damageResistances = loadBooleanSelector('Damage Resistances', 'damage');
        this.HTML.selectorContainers.damageImmunities = loadBooleanSelector('Damage Immunities', 'damage');
        this.HTML.selectorContainers.conditionResistances = loadBooleanSelector('Condition Resistances', 'condition');
        this.HTML.selectorContainers.conditionImmunities = loadBooleanSelector('Condition Immunities', 'condition');
        this.HTML.selectorContainers.languages = loadBooleanSelector('Languages', 'language');
        this.HTML.selectorContainers.skills = loadBooleanSelector('Skills', 'skills');
        cws.Array.from.NodeListOf(this.HTML.selectorContainers.skills.querySelectorAll('.toggle-selector'))
            .filter((element) => {
            return element.innerHTML.toLowerCase().includes(NPCsSkillset.baseSkillset.perception.name.toLowerCase());
        })[0].addEventListener('click', (e) => {
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
        this.HTML.viewButton = Button.createByAttachment(document.getElementById('view-created-npc-button'), () => { me.displayCharacterCard(); }, 'View');
        this.HTML.saveButton = Button.createByAttachment(document.getElementById('save-created-npc-button'), () => __awaiter(this, void 0, void 0, function* () {
            const originalText = me.HTML.saveButton.element.innerText;
            NPCsMemory.save(yield me.getCharacterData());
            me.HTML.saveButton.element.innerText = 'Saved!';
            me.HTML.saveButton.element.classList.add('button-success');
            me.reloadSavedList();
            setTimeout(() => {
                me.HTML.saveButton.element.innerText = originalText;
                me.HTML.saveButton.element.classList.remove('button-success');
            }, 1500);
        }), 'Save');
        this.HTML.displayButton = Button.createByAttachment(document.getElementById('print-created-npc-button'), () => {
            me.printCharacter();
        }, 'Display');
        this.HTML.cardPopup = document.getElementById('card-display');
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
                const nextAbilityContainer = document.createElement('div');
                nextAbilityContainer.classList.add('vertical-grid');
                nextAbilityContainer.innerHTML =
                    `<h5></h5>
           <p></p>
           <h4>${NPCsHelper.abilityToStr(ability, true)}</h4>
           <h6>not proficient</h6>`;
                const abilityInputEl = document.createElement('input');
                abilityInputEl.placeholder = (me.currentClass.abilities[ability] + me.currentRace.modifiers[ability]) + '';
                abilityInputEl.classList.add('fit-to-content');
                const nextAbility = {
                    container: nextAbilityContainer,
                    score: new ResizingInput(abilityInputEl),
                    modifier: nextAbilityContainer.querySelector('p'),
                    name: nextAbilityContainer.querySelector('h4'),
                    savingThrow: nextAbilityContainer.querySelector('h6'),
                };
                abilityInputEl.addEventListener('focusin', (e) => {
                    if (me.currentRace.modifiers[ability] === 0
                        || abilityInputEl.parentElement.querySelectorAll(`.${abilityModifierSpanClassName}`).length > 0)
                        return;
                    // subtract modifier
                    if (isNaN(parseInt(nextAbility.score.value)))
                        nextAbility.score.placeholder = (parseInt(nextAbility.score.placeholder) - me.currentRace.modifiers[ability]) + '';
                    else
                        nextAbility.score.value = (parseInt(nextAbility.score.value) - me.currentRace.modifiers[ability]) + '';
                    // separate modifier
                    let modifierSpan = document.createElement('span');
                    modifierSpan.classList.add(abilityModifierSpanClassName);
                    modifierSpan.innerText = ' ' + NPCsHelper.getFormattedModifier(me.currentRace.modifiers[ability]).split('').join(' ');
                    abilityInputEl.insertAdjacentElement('afterend', modifierSpan);
                });
                abilityInputEl.addEventListener('focusout', (e) => {
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
                    }
                    else {
                        nextAbility.savingThrow.classList.add('selected');
                        nextAbility.savingThrow.innerHTML = 'proficient';
                    }
                });
                me.HTML.container.querySelector('.abilities').appendChild(nextAbility.container);
                me.HTML.abilities[ability] = nextAbility;
            }
        }
        function loadArmours() {
            const armourArray = cws.Object.values(NPCsArmour.list);
            me.HTML.armourSelect = document.getElementById('armour-selector');
            loadGenericSelect(me.HTML.armourSelect, armourArray.map((a) => { return a.name; }), 'leather');
            me.HTML.armourSelect.addEventListener('change', (e) => {
                me.resetDisplayValues();
            });
        }
        function loadActions() {
            const actionsArray = cws.Object.values(NPCsInventory.actionsList.misc);
            const names = [], bodies = [];
            actionsArray.forEach((action) => {
                let name;
                if (action.uniqueName) {
                    name = action.uniqueName;
                }
                else if (action.subtitle) {
                    name = `${action.name} (${action.subtitle})`;
                }
                else {
                    name = action.name;
                }
                names.push(name);
                const bodyReplacer = new NPCsReplacerSpan(action.body);
                me.HTML.regexReplacerSpans.push(bodyReplacer);
                bodies.push(bodyReplacer);
            });
            loadAccordions(me.HTML.actionsContainer.querySelector('.accordion-body'), names, bodies);
        }
        function loadAlignment() {
            const orders = ['lawful', 'neutral', 'chaotic', 'true'];
            const morals = ['good', 'neutral', 'evil'];
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
                    let orderAlignment = orders[x];
                    if (x === 1 && y === 1)
                        orderAlignment = orders[3];
                    alignmentCell.innerHTML = `${orderAlignment} ${morals[y]}`;
                    alignmentCell.addEventListener('click', () => {
                        const cells = cws.Array.from.NodeListOf(tbody.querySelectorAll('td'));
                        cells.forEach((cell) => {
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
            const meleeHeader = table.querySelector('#melee-header');
            const rangedHeader = table.querySelector('#ranged-header');
            const mixedAttacks = getAttacks(NPCsInventory.actionsList.attacks.mixed);
            const meleeAttacks = getAttacks(NPCsInventory.actionsList.attacks.melee, 'Melee');
            const rangedAttacks = getAttacks(NPCsInventory.actionsList.attacks.ranged, 'Ranged');
            meleeAttacks.forEach((attack) => {
                generateRow(meleeHeader, attack, attack.getProperties());
            });
            rangedAttacks.forEach((attack) => {
                generateRow(rangedHeader, attack, attack.getProperties());
            });
            me.HTML.attacksContainer.querySelector('.accordion-body').appendChild(table);
            function getAttacks(inventory, mixedType) {
                const attacks = cws.Object.values(inventory);
                if (mixedType)
                    mixedAttacks.forEach((attack) => {
                        if (attack.category === mixedType)
                            attacks.push(attack);
                    });
                return attacks.sort((a, b) => { return a.name < b.name ? 1 : -1; });
            }
            function generateRow(headerRow, attack, properties) {
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
                    }
                    else {
                        button.classList.add('selected');
                        button.innerHTML = 'Unequip';
                    }
                });
                headerRow.insertAdjacentElement('afterend', newRow);
            }
        }
        function loadAttributes() {
            const attributeArray = cws.Object.values(NPCsAttribute.list);
            const names = [], bodies = [];
            attributeArray.forEach((attr) => {
                names.push(attr.name);
                const bodyReplacer = new NPCsReplacerSpan(attr.body);
                me.HTML.regexReplacerSpans.push(bodyReplacer);
                bodies.push(bodyReplacer);
            });
            loadAccordions(me.HTML.attributesContainer.querySelector('.accordion-body'), names, bodies);
        }
        function loadAccordions(parent, names, bodies) {
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
                        }
                        else {
                            selector.classList.add('selected');
                            name.classList.add('selected');
                            selector.innerHTML = 'Remove';
                        }
                    });
                parent.appendChild(newAccordion);
            }
        }
        function loadBooleanSelector(name, type) {
            const container = document.createElement('div');
            container.classList.add('boolean-types-list');
            const selectorContainer = document.createElement('div');
            let rootOptions;
            switch (type) {
                case 'condition':
                    rootOptions = Object.keys(NPCsConditionTypes.list).map((type) => { return cws.toCapitalized(type); });
                    break;
                case 'damage':
                    rootOptions = Object.keys(NPCsDamageTypes.list).map((type) => { return cws.toCapitalized(type); });
                    break;
                case 'language':
                    rootOptions = NPCsLanguages;
                    break;
                case 'skills':
                    rootOptions = NPCsSkillset.baseSkillset.map((skill) => {
                        return skill.name;
                    });
            }
            rootOptions.sort().forEach((option) => {
                let innerContent;
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
                    const expertiseSelector = innerContent.querySelector('.skill-expertise');
                    expertiseSelector.addEventListener('click', () => {
                        const parentSelector = cws.findParentElementByClassName(expertiseSelector, 'toggle-selector');
                        if (!parentSelector.classList.contains('selected')) {
                            parentSelector.classList.add('selected');
                        }
                        if (expertiseSelector.classList.contains('selected')) {
                            expertiseSelector.classList.remove('selected');
                        }
                        else {
                            expertiseSelector.classList.add('selected');
                        }
                    });
                }
                else
                    innerContent = cws.createElement({
                        type: 'span',
                        innerText: option,
                    });
                const selector = cws.createElement({
                    type: 'button',
                    classList: ['toggle-selector'],
                });
                selector.appendChild(innerContent);
                selector.addEventListener('click', (e) => {
                    const clickedExpertiseElements = e.composedPath().filter((target) => {
                        if (!target.classList)
                            return false;
                        return target.classList.contains('skill-expertise');
                    });
                    if (clickedExpertiseElements.length > 0)
                        return;
                    if (selector.classList.contains('selected')) {
                        if (type === 'skills') {
                            const expertiseSelector = selector.querySelector('.skill-expertise');
                            expertiseSelector.classList.remove('selected');
                        }
                        selector.classList.remove('selected');
                    }
                    else
                        selector.classList.add('selected');
                });
                if (type === 'skills') {
                    const skillContainer = cws.createElement({
                        type: 'div',
                        classList: 'skill-container',
                    });
                    skillContainer.appendChild(selector);
                    selectorContainer.appendChild(skillContainer);
                }
                else
                    selectorContainer.appendChild(selector);
            });
            container.appendChild(selectorContainer);
            const accordion = NPCsCreator.createAccordion(document.getElementById('boolean-types-block'), `<h4>${name}</h4>`, '');
            accordion.querySelector('.accordion-body').appendChild(container);
            return container;
        }
        function loadClasses() {
            const classArray = cws.Object.values(NPCsClass.list);
            loadGenericSelect(me.HTML.classSelector, classArray.map((c) => { return c.name.toLowerCase(); }), 'knight');
            me.HTML.classSelector.addEventListener('change', (e) => {
                me.attemptPageReset();
            });
            me.HTML.classSelector.addEventListener('focusin', (e) => {
                me.selectBackups.oldClass = me.HTML.classSelector.value;
            });
        }
        function loadDirtyWatcher() {
            const toggleSelectors = cws.Array.from.NodeListOf(me.HTML.container.querySelectorAll('.toggle-selector')), selects = cws.Array.from.NodeListOf(me.HTML.container.querySelectorAll('select')), inputs = cws.Array.from.NodeListOf(me.HTML.container.querySelectorAll('input'));
            toggleSelectors.forEach((selector) => {
                selector.addEventListener('click', () => {
                    me.isDirty = true;
                });
            });
            selects.forEach((select) => {
                if (!cws.orEquals(select.id, [me.HTML.classSelector.id, me.HTML.raceSelector.id]))
                    select.addEventListener('change', () => {
                        me.isDirty = true;
                    });
            });
            inputs.forEach((input) => {
                input.addEventListener('input', () => {
                    me.isDirty = true;
                });
            });
        }
        function loadRaces() {
            const raceArray = cws.Object.values(NPCsRace.list);
            loadGenericSelect(me.HTML.raceSelector, raceArray.map((r) => { return r.name; }), 'human');
            me.HTML.raceSelector.addEventListener('change', (e) => {
                me.attemptPageReset();
            });
            me.HTML.raceSelector.addEventListener('focusin', (e) => {
                me.selectBackups.oldRace = me.HTML.raceSelector.value;
            });
        }
        function loadGenericSelect(selectEl, names, autoFocusName, values) {
            if (!cws.Array.includes(names, autoFocusName))
                throw new Error(`AutoFocusName ${autoFocusName} not found in names array`);
            for (let i = 0; i < names.length; i++) {
                let newOption = document.createElement('option');
                newOption.innerText = names[i];
                newOption.value = values ? values[i] || names[i] : names[i];
                if (names[i] === autoFocusName)
                    newOption['autofocus'] = true;
                selectEl.appendChild(newOption);
            }
        }
        function loadReactions() {
            const reactionsArray = cws.Object.values(NPCsInventory.actionsList.reactions);
            const names = [], bodies = [];
            reactionsArray.forEach((reaction) => {
                let name;
                if (reaction.uniqueName) {
                    name = reaction.uniqueName;
                }
                else if (reaction.subtitle) {
                    name = `${reaction.name} (${reaction.subtitle})`;
                }
                else {
                    name = reaction.name;
                }
                names.push(name);
                const bodyReplacer = new NPCsReplacerSpan(reaction.body);
                me.HTML.regexReplacerSpans.push(bodyReplacer);
                bodies.push(bodyReplacer);
            });
            loadAccordions(me.HTML.reactionsContainer.querySelector('.accordion-body'), names, bodies);
        }
        function loadSpells() {
            me.HTML.spellsContainer = document.getElementById('spells-container');
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
                        innerText: NPCsHelper.abilityToStr(i, true),
                        listeners: [{
                                type: 'click',
                                fn: () => {
                                    if (abililty.classList.contains('selected'))
                                        abililty.classList.remove('selected');
                                    else {
                                        const selectors = cws.Array.from.NodeListOf(abilityBody.querySelectorAll(`.${spellcastingSelectorClassName}`));
                                        selectors.forEach((selector) => {
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
                const levelAccordion = NPCsCreator.createAccordion(accordion, '<strong>Spellcasting Level</strong>'), levelBody = levelAccordion.querySelector('.accordion-body'), label = cws.createElement({
                    type: 'h3',
                    innerText: 'Spellcasting Level',
                    style: 'text-align: center'
                }), inputWrapper = cws.createElement({
                    type: 'h5',
                    style: 'text-align: center'
                }), input = cws.createElement({
                    type: 'input',
                    id: 'spellcasting-ability-level'
                }), container = cws.createElement({
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
            function loadLevel(level) {
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
    printCharacter() {
        return __awaiter(this, void 0, void 0, function* () {
            new NPCsClassicCard(yield this.getCharacterData()).printCharacter();
        });
    }
    reloadReplacers() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentData = yield this.getCharacterData();
            this.HTML.regexReplacerSpans.forEach((span) => {
                span.fillAsData(currentData);
            });
        });
    }
    reloadSavedList() {
        const me = this, list = NPCsMemory.HTML.createCharacterList((character) => {
            me.attemptLoadSavedCharacter(character);
        }, me.HTML.savedCharacterList);
        if (!me.HTML.savedCharacterList)
            me.HTML.savedCharacterListContainer.appendChild(list);
        me.HTML.savedCharacterList = list;
        me.HTML.savedCharacterBar.refreshSavedBar();
    }
    resetDisplayValues(resetHP) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getCharacterData();
            for (let i = 0; i < this.HTML.abilities.length; i++) {
                this.HTML.abilities[i].modifier.innerText = NPCsHelper.getFormattedModifier(data.abilityModifiers[i]);
            }
            this.HTML.displays.armourClass.innerText = data.armourClass + '';
            if (resetHP) {
                this.HTML.displays.hitPoints.innerText = data.averageHP + '';
            }
            this.HTML.displays.passivePerception.innerText = data.passivePerception + '';
            this.reloadReplacers();
        });
    }
    resetSelectBackups() {
        this.selectBackups.oldRace = this.HTML.raceSelector.value;
        this.selectBackups.oldClass = this.HTML.classSelector.value;
    }
    static createAccordion(parent, name, body) {
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
            }
            else {
                newAccordion.classList.remove('opened');
                newAccordion.classList.add('closed');
                statusEl.innerHTML = statusEl.innerHTML.replace('-', '+');
            }
        });
        parent.appendChild(newAccordion);
        return newAccordion;
        function getBody() {
            if (body instanceof NPCsReplacerSpan) {
                return cws.createElement({
                    type: 'p',
                    classList: 'accordion-body',
                    children: [body.element],
                });
            }
            else
                return cws.createElement({
                    type: 'p',
                    classList: 'accordion-body',
                    innerHTML: body,
                });
        }
    }
}
new NPCsCreator();
//# sourceMappingURL=npc-creator.js.map