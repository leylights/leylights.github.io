
/**
 * Generates the data for a new NPC
 * 
 * @todo implement overwriteData
 */

import { Molasses } from "../../../molasses";
import { NPCsAction } from "../helper-repository/action";
import { NPCsReaction } from "../helper-repository/action-reaction";
import { NPCsArmour } from "../helper-repository/armour";
import { NPCsAttribute } from "../helper-repository/attribute";
import { NPCsClass } from "./class";
import { NPCsDamageTypes } from "../helper-repository/damage-types";
import { STR, DEX, CON, INT, WIS, CHA, NPCsCharacterAlignmentOrder, NPCsCharacterAlignmentMoral, NPCsDice, NPCsHelper, NPCsLanguageType, NPCsCharacterSize, NPCsAbility } from "../helper-repository/general";
import { NPCsRace } from "./race";
import { NPCsSkill, NPCsSkillNames as NPCsSkillName, NPCsSkillset } from "../helper-repository/skill-set";
import { NPCsBooleanList } from "../helper-repository/boolean-list";
import { NPCsSpellcasterData } from "../helper-repository/spellcaster-data";
import { NPCsConditionTypes } from "../helper-repository/condition-types";
import { NPCsInventory } from "../helper-repository/inventory";
import { NPCsSpell } from "../helper-repository/spell";
import { NPCsMemory } from "./npcs-memory";

export enum NPCsCharacterDataBooleanTypes {
  damageVulnerabilities,
  damageResistances,
  damageImmunities,
  conditionResistances,
  conditionImmunities
}

export type NPCsCharacterDataCreationData = {
  names: [string, string];
  race: NPCsRace;
  class: NPCsClass;

  ID: number;

  abilityScores: [number, number, number, number, number, number]; // 1-20
  orderAlignment: NPCsCharacterAlignmentOrder;
  moralAlignment: NPCsCharacterAlignmentMoral;

  speed: number;
  languages: NPCsLanguageType[];
  attributes: NPCsAttribute[];
  saves: boolean[];
  skills: NPCsSkillset;

  darkvision: number;
  armour: NPCsArmour;

  CR: number;

  damageVulnerabilities: NPCsDamageTypes;
  damageResistances: NPCsDamageTypes;
  damageImmunities: NPCsDamageTypes;
  conditionResistances: NPCsConditionTypes;
  conditionImmunities: NPCsConditionTypes;

  hitDice: NPCsDice;
  HP: number;

  actions: NPCsAction[];
  reactions: NPCsReaction[];
  racialSpells?: NPCsSpellcasterData | null;
  spells?: NPCsSpellcasterData | null;
}

export class NPCsCharacterData {
  names: [string, string];
  race: NPCsRace;
  class: NPCsClass;

  ID: number;

  abilityScores: number[]; // 1-20
  orderAlignment: NPCsCharacterAlignmentOrder;
  moralAlignment: NPCsCharacterAlignmentMoral;

  size: NPCsCharacterSize;
  speed: number;
  languages: NPCsLanguageType[];
  attributes: NPCsAttribute[];
  saves: boolean[];
  skills: NPCsSkillset;

  darkvision: number;
  armour: NPCsArmour;

  private _CR: number;

  damageVulnerabilities: NPCsDamageTypes;
  damageResistances: NPCsDamageTypes;
  damageImmunities: NPCsDamageTypes;
  conditionResistances: NPCsConditionTypes;
  conditionImmunities: NPCsConditionTypes;

  hitDice: NPCsDice;
  HP: number;

  actions: NPCsAction[];
  reactions: NPCsReaction[];
  racialSpells?: NPCsSpellcasterData | null;
  spells?: NPCsSpellcasterData | null;

  constructor(data: NPCsCharacterDataCreationData) {
    this.names = data.names;

    this.race = data.race;
    this.class = data.class;

    this.ID = data.ID;

    //*****ABILITY SCORES*****//

    this.abilityScores = data.abilityScores;

    //*****ALIGNMENT*****//

    this.moralAlignment = data.moralAlignment;
    this.orderAlignment = data.orderAlignment;

    //*****ARMOUR*****//

    this.armour = this.getBestWearableArmour(data.armour);

    //*****HEALTH*****//

    this.hitDice = data.hitDice.clone();
    if (data.HP)
      this.HP = data.HP;
    else
      this.resetHP();

    //*****SPEED/SIZE*****/

    this.speed = data.speed;
    this.size = data.race.size;

    //*****SAVING THROWS*****//

    this.saves = data.saves;

    //*****SKILLS*****/

    this.skills = data.skills;

    //*****DAMAGE AND CONDITIONS*****/

    this.damageVulnerabilities = data.damageVulnerabilities.clone();
    this.damageResistances = data.damageResistances.clone();
    this.damageImmunities = data.damageImmunities.clone();
    this.conditionResistances = data.conditionResistances.clone();
    this.conditionImmunities = data.conditionImmunities.clone();

    //*****LANGUAGES*****/

    this.languages = data.languages;

    /*****CR*****/

    this._CR = data.CR;

    /*****ATTRIBUTES*****/

    this.attributes = data.attributes;

    // delete duplicate attributes

    for (let i = 0; i < this.attributes.length; i++)
      for (let j = i + 1; j < this.attributes.length; j++) {
        if (this.attributes[j] == this.attributes[i]) {
          this.attributes.splice(j, j + 1);
          break;
        }
      }

    this.attributes.sort();

    //*****SENSES*****/

    this.darkvision = data.darkvision;

    /*****ACTIONS*****/

    this.actions = data.actions.map((action: NPCsAction) => {
      return action.clone();
    });

    /*****REACTIONS*****/

    this.reactions = [];

    data.reactions.forEach((reaction: NPCsReaction) => {
      this.reactions.push(reaction);
    });

    /*****SPELLS*****/
    this.racialSpells = data.racialSpells;
    this.spells = data.spells;
  }

  get AC(): number {
    let base = this.armour.AC;

    // add dex mods to AC
    if (this.armour.weight == "light") {
      base += this.abilityModifiers[DEX];
    } else if (this.armour.weight == "medium") {
      base += Math.min(this.abilityModifiers[DEX], 2);
    }

    return base;
  }

  get abilityModifiers(): number[] {
    return [
      Math.floor((this.abilityScores[STR] - 10) / 2),
      Math.floor((this.abilityScores[DEX] - 10) / 2),
      Math.floor((this.abilityScores[CON] - 10) / 2),
      Math.floor((this.abilityScores[INT] - 10) / 2),
      Math.floor((this.abilityScores[WIS] - 10) / 2),
      Math.floor((this.abilityScores[CHA] - 10) / 2)];
  }

  get alignment(): string {
    if (this.moralAlignment === "neutral" && this.orderAlignment === "neutral")
      return "true neutral";
    else return this.orderAlignment + ' ' + this.moralAlignment;
  }

  get armourClass(): number {
    return this.AC;
  }

  get averageHP(): number {
    const result = this.hitDice.average + this.abilityModifiers[CON] * this.hitDice.amount;
    if (result < 0)
      return 1;
    return result;
  }

  get firstName(): string {
    return this.names[0].trim();
  }

  get challengeRating(): number {
    return this._CR;
  }

  set challengeRating(n: number) {
    this._CR = Math.max(n, 0);
  }

  get isSaved(): boolean {
    return NPCsMemory.includes(this);
  }

  get lastName(): string {
    return this.names[1].trim();
  }

  get level(): number {
    return Math.round(this.challengeRating);
  }

  get name(): string {
    return this.names.map((name: string) => { return name.trim() }).join(' ').trim();
  }

  get passivePerception(): number {
    return 10
      + this.getSkillModifier(this.getSkill('perception'));
  }

  get proficiencyBonus(): number {
    return 2 + Math.floor(this.challengeRating / 4);
  }

  get savingThrows(): boolean[] {
    return this.saves;
  }

  get spellCount(): number {
    if (!this.spells)
      return 0;

    let count = 0;
    const dividedList = this.spells.dividedSpellList;

    for (let i = 0; i < dividedList.length; i++) {
      if (i === 0 || (dividedList[i].length > 0 && (this.getNthLevelSpellSlots(i) > 0))) {
        count += dividedList[i].length;
      }
    }

    return count;
  }

  get spellcastingModifier(): number | null {
    return this.getGenericSpellModifier(this.spells);
  }

  get spellcastingDC(): number | null {
    return this.getGenericSpellDC(this.spells);
  }

  get racialSpellcastingModifier(): number | null {
    return this.getGenericSpellModifier(this.racialSpells);
  }

  get racialSpellcastingDC(): number | null {
    return this.getGenericSpellDC(this.racialSpells);
  }

  /**
   * Adds a damage immunity of the given type to this character
   * @returns Whether the operation is successful 
   */
  alterDamageImmunity(this: NPCsCharacterData, type: keyof NPCsDamageTypes, newValue: boolean): boolean {
    if (typeof this.damageImmunities[type] === 'boolean') {
      if (this.damageImmunities[type] === newValue)
        return false;

      if (newValue === false) {
        this.damageImmunities[type] = newValue as any;
      } else {

        if (this.damageResistances[type]) {
          this.damageResistances[type] = false as any;
        }
        if (this.damageVulnerabilities[type]) {
          this.damageVulnerabilities[type] = false as any;
        }

        this.damageImmunities[type] = true as any;
      }
    } else
      throw new Error('Damage type not found: ' + type);

    return true;
  }

  /**
   * Adds a damage resistance of the given type to this character, IF no 
   * immunities of that type preexist 
   * @returns Whether the operation is successful 
   */
  alterDamageResistance(this: NPCsCharacterData, type: keyof NPCsDamageTypes, newValue: boolean): boolean {
    if (typeof this.damageResistances[type] === 'boolean') {
      if (this.damageResistances[type] === newValue)
        return false;

      if (newValue === false) {
        this.damageResistances[type] = false as any;
      } else {
        if (this.damageImmunities[type]) {
          return false; // already exists as immunity; do not duplicate
        }
        if (this.damageVulnerabilities[type]) {
          this.damageVulnerabilities[type] = false as any;
        }

        this.damageResistances[type] = true as any;
      }
    } else
      throw new Error('Damage type not found: ' + type);

    return true;
  }

  /**
   * Adds a damage vulnerability of the given type to this character, IF no 
   * resistances nor immunities of that type preexist 
   * @returns Whether the operation is successful 
   */
  alterDamageVulnerability(this: NPCsCharacterData, type: keyof NPCsDamageTypes, newValue: boolean): boolean {
    if (typeof this.damageVulnerabilities[type] === 'boolean') {
      if (this.damageVulnerabilities[type] === newValue)
        return false;

      if (newValue === false) {
        this.damageVulnerabilities[type] = false as any;
      } else {
        if (this.damageImmunities[type]) {
          return false; // already immune; cannot be vulnerable 
        }
        if (this.damageImmunities[type]) {
          return false; // already resistant; cannot be vulnerable
        }

        this.damageVulnerabilities[type] = true as any;
      }
    } else
      throw new Error('Damage type not found: ' + type);

    return true;
  }

  /**
   * Adds a condition resistance of the given type to this character, IF no 
   * immunities of that type preexist 
   * @returns Whether the operation is successful 
   */
  alterConditionResistance(this: NPCsCharacterData, type: keyof NPCsConditionTypes, newValue: boolean): boolean {
    if (typeof this.conditionResistances[type] === 'boolean') {
      if (this.conditionResistances[type] === newValue)
        return false;

      if (newValue === false) {
        this.conditionResistances[type] = false as any;
      } else {
        if (this.conditionImmunities[type]) {
          return false; // already immune; cannot be resistant 
        }

        this.conditionResistances[type] = true as any;
      }
    } else
      throw new Error('Damage type not found: ' + type);

    return true;
  }

  /**
   * Adds a condition immunity of the given type to this character
   * @returns Whether the operation is successful 
   */
  alterConditionImmunity(this: NPCsCharacterData, type: keyof NPCsConditionTypes, newValue: boolean): boolean {
    if (typeof this.conditionImmunities[type] === 'boolean') {
      if (this.conditionImmunities[type] === newValue)
        return false;

      if (newValue === false) {
        this.conditionImmunities[type] = false as any;
      } else {
        if (this.conditionResistances[type]) {
          this.conditionResistances[type] = false as any; // remove duplication
        }

        this.conditionImmunities[type] = true as any;
      }
    } else
      throw new Error('Damage type not found: ' + type);

    return true;
  }

  /**
   * Applies transformations to this character to alter its CR to
   *  somewhere within the given range of its current CR 
   */
  alterCRBy(range: number) {
    let target = ((Math.random() * (2 * range)) - range) + this.challengeRating;
    this.alterCRTo(target);
  }

  /**
   * Applies transformations to this character to alter its CR to
   *  the target CR 
   */
  alterCRTo(this: NPCsCharacterData, target: number) {
    const acceptableBoundsOfTarget = 0.2;
    const dicePerNewLevel = 1.4;

    enum alterState {
      better,
      worse
    }

    // alter HP to match new CR
    this.hitDice.amount = Math.round(this.hitDice.amount + (dicePerNewLevel * (target - this.challengeRating)));
    if (this.hitDice.amount <= 0) {
      this.hitDice.amount = 1;
      this.hitDice.value = 4;
    }

    this.resetHP();

    const alterationFunctions: ((data: NPCsCharacterData, state: alterState) => boolean)[] = [
      alterPhysicalResistance,
      alterPhysicalVulnerability,
      alterElementalResistance,
      alterConditionResistance,
      alterPositiveAttribute,
      alterArmour,
      alterAbilityScore,
      alterSavingThrow,
      alterElementalImmunity,
      alterMultiattack,
      alterConditionImmunity,
      superpowerAbilityScore,
      alterTotalPhysicalImmunity,
    ];

    function randomSkew(n: number) {
      return Molasses.nthRoot(n, 0.25);
    }

    const MAX_ITERATIONS = 600;
    let currentIteration = 1;

    if (acceptableBoundsOfTarget < target - this.challengeRating) {
      console.log('===== beginning positive alterations =====');
      while (acceptableBoundsOfTarget < target - this.challengeRating && this.challengeRating !== 0) {
        const alterationFn = Molasses.Array.get.randomElement(alterationFunctions, randomSkew);
        const success = alterationFn(this, alterState.better);

        if (success)
          console.log(`making better: ${alterationFn.name} - ${success ? 'SUCCESS' : 'FAILED'}.  New CR: ${this.challengeRating}`);

        currentIteration++;
        if (currentIteration > MAX_ITERATIONS)
          break;
      }
    } else if (this.challengeRating > target + 0.2) {
      console.log('===== beginning negative alterations =====');
      while (acceptableBoundsOfTarget < this.challengeRating - target && this.challengeRating !== 0) {
        const alterationFn = Molasses.Array.get.randomElement(alterationFunctions, randomSkew);
        const success = alterationFn(this, alterState.worse);

        if (success)
          console.log(`making worse: ${alterationFn.name} - ${success ? 'SUCCESS' : 'FAILED'}.  New CR: ${this.challengeRating}`);

        currentIteration++;
        if (currentIteration > MAX_ITERATIONS)
          break;
      }
    }

    function alterPositiveAttribute(this: void, data: NPCsCharacterData, alterStateType: alterState) {
      if (alterStateType === alterState.better) {
        let classAttr: NPCsAttribute = Molasses.Object.get.randomAttribute(NPCsAttribute.positiveClassAttributesList);
        if (Molasses.Array.contains(data.attributes, classAttr))
          return false;

        data.attributes[data.attributes.length] = classAttr;
      } else {
        const positiveAttributeBodies = Molasses.Object.values(NPCsAttribute.positiveClassAttributesList)
          .map((b: NPCsAttribute) => {
            return b.body;
          });

        let removedAttrArray: NPCsAttribute[] = data.attributes.filter((a: NPCsAttribute) => {
          return Molasses.orEquals(
            a.body,
            positiveAttributeBodies
          );
        });

        if (removedAttrArray.length === 0)
          return false; // no positive attribute to remove

        data.attributes = data.attributes.filter((a: NPCsAttribute) => {
          return a.body !== removedAttrArray[0].body;
        });
      }

      data.attributes.sort();
      alterCR(data, 0.5, alterStateType);
      return true;
    }

    function alterAbilityScore(this: void, data: NPCsCharacterData, alterStateType: alterState): boolean {
      return genericAlterAbilityScore(data, alterStateType, 4, 0.5);
    }

    function superpowerAbilityScore(this: void, data: NPCsCharacterData, alterStateType: alterState): boolean {
      return genericAlterAbilityScore(data, alterStateType, 10, 1.1);
    }

    function genericAlterAbilityScore(this: void, data: NPCsCharacterData, alterStateType: alterState, increment: number, CRchange: number): boolean {
      let upgradedAbility = Math.floor(Math.random() * 6);
      if (alterStateType === alterState.better)
        data.abilityScores[upgradedAbility] += increment;
      else
        data.abilityScores[upgradedAbility] -= increment;

      // changing values to compensate for boost
      data.resetHP();

      alterCR(data, CRchange, alterStateType);
      return true;
    }

    function alterArmour(this: void, data: NPCsCharacterData, alterStateType: alterState): boolean {
      if (alterStateType === alterState.better) {
        if (data.armour.name === 'plate')
          return false;
        data.armour = NPCsArmour.getNextBestArmour(data.armour);
      } else {
        if (data.armour.name === 'unarmoured')
          return false;
        data.armour = NPCsArmour.getNextWorstArmour(data.armour);
      }

      alterCR(data, 0.2, alterStateType);

      return true;
    }

    function alterMultiattack(this: void, data: NPCsCharacterData, alterStateType: alterState): boolean {
      const multiattackList: string[] = Molasses.Object.values(NPCsInventory.actionsList.misc)
        .filter((action: NPCsAction) => {
          return action.name.toLowerCase().includes('multiattack');
        })
        .map((action: NPCsAction) => { return action.uniqueName }),
        anyEqual = Molasses.anyEqual(data.actions.map((action: NPCsAction) => {
          return action.uniqueName
        }), multiattackList);

      if (alterStateType === alterState.better && anyEqual) {
        return false;
      } else if (alterStateType === alterState.worse && !anyEqual) {
        return false;
      }

      if (alterStateType === alterState.better) {
        data.actions.push(NPCsInventory.actionsList.misc.multiattackMeleeTwo);
      } else {
        data.actions = data.actions.filter((action: NPCsAction) => { // remove all multiattacks
          return !Molasses.orEquals(action.uniqueName, multiattackList)
        });
      }

      alterCR(data, 0.8, alterStateType);

      return true;
    }

    function alterTotalPhysicalImmunity(this: void, data: NPCsCharacterData, alterStateType: alterState): boolean {
      let newValue: boolean = (alterStateType === alterState.better);

      if (data.damageImmunities.bludgeoning !== newValue) {
        data.alterDamageImmunity("bludgeoning", newValue);
        alterCR(data, 0.3, alterStateType);
      }

      if (data.damageImmunities.slashing !== newValue) {
        data.alterDamageImmunity("slashing", newValue);
        alterCR(data, 0.3, alterStateType);
      }

      if (data.damageImmunities.piercing !== newValue) {
        data.alterDamageImmunity("piercing", newValue);
        alterCR(data, 0.3, alterStateType);
      }

      return true;
    }

    function alterPhysicalVulnerability(this: void, data: NPCsCharacterData, alterStateType: alterState): boolean {
      return alterGenericBooleanList(
        data,
        alterStateType,
        'physicalVulnerabilities',
        Object.keys(NPCsDamageTypes.physicalDamageTypes),
        0.4
      );
    }

    function alterPhysicalResistance(this: void, data: NPCsCharacterData, alterStateType: alterState): boolean {
      return alterGenericBooleanList(
        data,
        alterStateType,
        'physicalResistances',
        Object.keys(NPCsDamageTypes.physicalDamageTypes),
        0.4
      );
    }

    /**
     * Adds or removes an elemental resistance 
     * @returns Whether the change was successful
     */
    function alterElementalResistance(this: void, data: NPCsCharacterData, alterStateType: alterState): boolean {
      return alterGenericBooleanList(
        data,
        alterStateType,
        'elementalResistances',
        Object.keys(NPCsDamageTypes.elementalDamageTypes),
        0.3
      );
    }

    /**
     * Adds or removes an elemental immunity 
     * @returns Whether the change was successful
     */
    function alterElementalImmunity(this: void, data: NPCsCharacterData, alterStateType: alterState): boolean {
      return alterGenericBooleanList(
        data,
        alterStateType,
        'elementalImmunities',
        Object.keys(NPCsDamageTypes.elementalDamageTypes),
        0.5
      );
    }

    /**
     * Adds or removes an elemental immunity 
     * @returns Whether the change was successful
     */
    function alterConditionResistance(this: void, data: NPCsCharacterData, alterStateType: alterState): boolean {
      return alterGenericBooleanList(
        data,
        alterStateType,
        'conditionResistances',
        Object.keys(NPCsConditionTypes.list),
        0.2
      );
    }

    /**
     * Adds or removes an elemental immunity 
     * @returns Whether the change was successful
     */
    function alterConditionImmunity(this: void, data: NPCsCharacterData, alterStateType: alterState): boolean {
      return alterGenericBooleanList(
        data,
        alterStateType,
        'conditionImmunities',
        Object.keys(NPCsConditionTypes.list),
        0.4
      );
    }

    /**
     * Adds or removes an boolean type 
     * @requires options is a (keyof booleanList)[]
     * @returns Whether the change was successful
     */
    function alterGenericBooleanList(
      this: void,
      data: NPCsCharacterData,
      alterStateType: alterState,
      booleanListType:
        | 'physicalResistances'
        | 'physicalImmunities'
        | 'physicalVulnerabilities'
        | 'elementalResistances'
        | 'elementalImmunities'
        | 'elementalVulnerabilities'
        | 'conditionResistances'
        | 'conditionImmunities',
      options: string[],
      CRChange: number
    ) {
      let typeIndexMap: number[] = Molasses.Array.toN(options.length).sort(Molasses.jumbleSort);
      let success: boolean = false;
      let booleanList: NPCsBooleanList;
      let setterFunction: (attribute: keyof NPCsDamageTypes | keyof NPCsConditionTypes, newValue: boolean) => boolean;

      // set boolean list
      switch (booleanListType) {
        case 'physicalVulnerabilities':
        case 'elementalVulnerabilities':
          booleanList = data.damageVulnerabilities;
          setterFunction = data.alterDamageVulnerability;

          if (alterStateType === alterState.better) // if better, then remove vulnerability, i.e. make vulnerability worse
            alterStateType = alterState.worse;
          else
            alterStateType = alterState.better;
          break;
        case 'physicalResistances':
        case 'elementalResistances':
          booleanList = data.damageResistances;
          setterFunction = data.alterDamageResistance;
          break;
        case 'physicalImmunities':
        case 'elementalImmunities':
          booleanList = data.damageImmunities;
          setterFunction = data.alterDamageImmunity;
          break;
        case 'conditionResistances':
          booleanList = data.conditionResistances;
          setterFunction = data.alterConditionResistance;
          break;
        case 'conditionImmunities':
          booleanList = data.conditionImmunities;
          setterFunction = data.alterConditionImmunity;
          break;
      }

      let attribute: (keyof NPCsDamageTypes | keyof NPCsConditionTypes) = options[typeIndexMap[0]] as (keyof NPCsDamageTypes | keyof NPCsConditionTypes);
      let newValue = alterStateType === alterState.better;

      switch (booleanListType) {
        case 'physicalVulnerabilities':
        case 'elementalVulnerabilities':
          success = data.alterDamageVulnerability(attribute as keyof NPCsDamageTypes, newValue);
          break;
        case 'physicalResistances':
        case 'elementalResistances':
          success = data.alterDamageResistance(attribute as keyof NPCsDamageTypes, newValue);
          break;
        case 'physicalImmunities':
        case 'elementalImmunities':
          success = data.alterDamageImmunity(attribute as keyof NPCsDamageTypes, newValue);
          break;
        case 'conditionResistances':
          success = data.alterConditionResistance(attribute as keyof NPCsConditionTypes, newValue);
          break;
        case 'conditionImmunities':
          success = data.alterConditionImmunity(attribute as keyof NPCsConditionTypes, newValue);
          break;
      }

      if (success) {
        alterCR(data, CRChange, alterStateType);

        return true;
      } else {
        return false;
      }
    }

    function alterSavingThrow(this: void, data: NPCsCharacterData, alterStateType: alterState) {
      let saveIndexMap: number[] = Molasses.Array.toN(6).sort(Molasses.jumbleSort);
      let success: boolean = false;

      for (let i = 0; i < saveIndexMap.length; i++) {
        if (alterStateType === alterState.better && !data.saves[i]) {
          data.saves[i] = true;
          success = true;
          break;
        } else if (alterStateType === alterState.worse && data.saves[i]) {
          data.saves[i] = false;
          success = true;
          break;
        }
      }

      if (success) {
        alterCR(data, 0.3, alterStateType);
      }

      return success;
    }

    function alterCR(data: NPCsCharacterData, CRChange: number, alterStateType: alterState) {
      if (alterStateType === alterState.better) {
        data.challengeRating += CRChange;
      } else {
        data.challengeRating -= CRChange;
      }
    }
  }

  /**
   * Produces the list of spells this character has learned (excluding racial spells)
   */
  createSpellListHTML(this: NPCsCharacterData): string {
    return this.createGenericSpellListHTML(this.spells, false);
  }

  /**
   * Produces the list of spells this character knows from their race
   */
  createRacialSpellListHTML(this: NPCsCharacterData): string {
    return this.createGenericSpellListHTML(this.racialSpells, true);
  }

  /**
   * Produces the a list of spells this character knows from the given NPCsSpellcasterData
   */
  private createGenericSpellListHTML(this: NPCsCharacterData, spellData: NPCsSpellcasterData, isRacialSpells: boolean): string {
    if (!spellData)
      return '';

    let hasSpells: boolean = false;
    let dividedList: NPCsSpell[][] = spellData.dividedSpellList;

    // create the output
    let output: string = '';
    if (dividedList[0].length > 0) {
      output += 'At-will: ' + getLevelList(dividedList[0]) + '<br/>';
      hasSpells = true;
    }

    for (let i = 1; i < dividedList.length; i++) {
      if (dividedList[i].length > 0) {
        let spellSlots: number = isRacialSpells ? 1 : this.getNthLevelSpellSlots(i);
        if (spellSlots > 0) {
          output += `${i}<sup>${Molasses.getSuperscriptOrdinal(i)}</sup> Level (${spellSlots}/day): ${getLevelList(dividedList[i])}<br/>`;
          hasSpells = true;
        }
      }
    }

    function getLevelList(levelList: NPCsSpell[]): string {
      let list: string = '';

      levelList.forEach((spell: NPCsSpell) => {
        if (list !== '')
          list += ', ';

        list += `<i>${spell.name}</i>`;
      });

      return list;
    }

    if (hasSpells)
      return output;
    else return '';
  }

  /**
   * Replaces all placeholders in the string with their correpsonding data
   */
  fillStringPlaceholders(this: NPCsCharacterData, strWithPlaceholders: string): string {
    strWithPlaceholders = strWithPlaceholders.replace(/NAME/g, this.firstName)
      .replace(/HALF_CHARACTER_LEVEL/g, Math.ceil(this.level / 2) + '')
      .replace(/CHARACTER_LEVEL/g, this.level + '');

    // abilities with proficiency bonus
    for (let i = 0; i < this.abilityModifiers.length; i++) {
      strWithPlaceholders = strWithPlaceholders.replace(new RegExp(NPCsHelper.abilityToStr(i as NPCsAbility, false) + "_WITH_PROF", 'g'),
        NPCsHelper.getFormattedModifier(this.abilityModifiers[i] + this.proficiencyBonus));
    }

    // attacks
    strWithPlaceholders = strWithPlaceholders.replace(/PROFICIENCY_BONUS/g, this.proficiencyBonus + '');

    for (let i = 0; i < strWithPlaceholders.length; i++) {
      if (strWithPlaceholders.substring(i, i + 6) === 'ATTACK') {
        let diceStr: string = strWithPlaceholders.substr(i + 6).match(/_([^_]*)_/)[1], // regexp magic
          abilityStartPoint: number = (i + 6) + diceStr.length + 2,
          abilityStr: string = strWithPlaceholders.substring(abilityStartPoint, abilityStartPoint + 3),
          ability: NPCsAbility | -1 = NPCsHelper.strToAbility(abilityStr),
          attackDice: NPCsDice = new NPCsDice(diceStr),
          replacement: string;

        if (ability >= 0)
          replacement = `${attackDice.average + this.abilityModifiers[ability]} (${attackDice.print()} ${this.abilityModifiers[ability] >= 0 ? '+' : '-'} ${Math.abs(this.abilityModifiers[ability])})`;
        else
          replacement = `${attackDice.average} (${attackDice.print()})`;

        strWithPlaceholders = strWithPlaceholders.replace(new RegExp(`ATTACK_${diceStr}_${abilityStr}`, 'g'), replacement);
      }
    }

    // spells
    const
      racialSpells = this.racialSpells || new NPCsSpellcasterData({
        spellList: [],
        spellcastingLevel: 1,
        spellcastingAbility: CHA,
      }),
      classSpells = this.spells || new NPCsSpellcasterData({
        spellList: [],
        spellcastingLevel: 1,
        spellcastingAbility: INT,
      });

    strWithPlaceholders = strWithPlaceholders.replace(/RACIAL_SPELLCASTING_ABILITY_FULL/g, NPCsHelper.abilityToStr(racialSpells.spellcastingAbility, true))
      .replace(/RACIAL_SPELLCASTING_ABILITY_SHORT/g, NPCsHelper.abilityToStr(racialSpells.spellcastingAbility, false))
      .replace(/RACIAL_SPELL_SAVE_DC/g, ((this.racialSpells ? this.racialSpellcastingDC : 10) + ''))
      .replace(/RACIAL_SPELL_MOD/g, (NPCsHelper.getFormattedModifier(this.racialSpells ? this.racialSpellcastingModifier : 1)))
      .replace(/RACIAL_SPELL_LIST/g, (this.createRacialSpellListHTML() + ''));

    strWithPlaceholders = strWithPlaceholders.replace(/CLASS_SPELLCASTING_ABILITY_FULL/g, NPCsHelper.abilityToStr(classSpells.spellcastingAbility, true))
      .replace(/CLASS_SPELLCASTING_ABILITY_SHORT/g, NPCsHelper.abilityToStr(classSpells.spellcastingAbility, false))
      .replace(/CLASS_SPELL_SAVE_DC/g, ((this.spells ? this.spellcastingDC : 10) + ''))
      .replace(/CLASS_SPELLCASTING_LEVEL/g, (`${classSpells.spellcastingLevel}${Molasses.getSuperscriptOrdinal(classSpells.spellcastingLevel)} level`))
      .replace(/CLASS_SPELL_MOD/g, (NPCsHelper.getFormattedModifier(this.spells ? (this.spellcastingModifier) : 1)))
      .replace(/CLASS_SPELL_LIST/g, (this.createSpellListHTML() + ''));

    // ability DCs
    for (let i = 0; i < 6; i++) {
      strWithPlaceholders = strWithPlaceholders.replace(new RegExp(`FILL_DC_${NPCsHelper.abilityToStr(i as NPCsAbility, false)}`, 'g'),
        (8 + this.proficiencyBonus + this.abilityModifiers[i]) + '');
    }

    return strWithPlaceholders;
  }

  /**
   * Forces this character to have the given damage immunity, overriding previous vulnerabilites and resistances
   */
  forceDamageImmunity(this: NPCsCharacterData, type: keyof NPCsDamageTypes, newValue: boolean): void {
    if (typeof this.damageImmunities[type] === 'boolean') {
      this.damageImmunities[type] = newValue as any;
      this.damageResistances[type] = !newValue as any;
      this.damageVulnerabilities[type] = !newValue as any;
    } else
      throw new Error('Damage type not found: ' + type);
  }

  /**
   * Forces this character to have the given damage resistance, overriding previous vulnerabilites and resistances
   */
  forceDamageResistance(this: NPCsCharacterData, type: keyof NPCsDamageTypes, newValue: boolean): void {
    if (typeof this.forceDamageResistance[type] === 'boolean') {
      this.damageImmunities[type] = !newValue as any;
      this.damageResistances[type] = newValue as any;
      this.damageVulnerabilities[type] = !newValue as any;
    } else
      throw new Error('Damage type not found: ' + type);
  }

  /**
   * Forces this character to have the given damage vulnerability, overriding previous vulnerabilites and resistances
   */
  forceDamageVulnerability(this: NPCsCharacterData, type: keyof NPCsDamageTypes, newValue: boolean): void {
    if (typeof this.damageVulnerabilities[type] === 'boolean') {
      this.damageImmunities[type] = !newValue as any;
      this.damageResistances[type] = !newValue as any;
      this.damageVulnerabilities[type] = newValue as any;
    } else
      throw new Error('Damage type not found: ' + type);
  }

  /**
   * Gets the spell modifier for a given NPCsSpellcasterData
   */
  private getGenericSpellModifier(this: NPCsCharacterData, spellData: NPCsSpellcasterData): number | null {
    if (spellData)
      return this.proficiencyBonus + this.abilityModifiers[spellData.spellcastingAbility];
    else return null;
  }

  /**
   * Gets the spell DC for a given NPCsSpellcasterData
   */
  private getGenericSpellDC(this: NPCsCharacterData, spellData: NPCsSpellcasterData): number | null {
    if (spellData)
      return 8 + this.proficiencyBonus + this.abilityModifiers[spellData.spellcastingAbility];
    else return null;
  }

  get XPReward(): number {
    return NPCsCharacterData.getXpByCr(this.challengeRating);
  }

  /**
   * Gets the best armour this character is physically capable of wearing
   */
  getBestWearableArmour(this: NPCsCharacterData, topArmour: NPCsArmour): NPCsArmour {
    switch (topArmour.weight) {
      case "light":
      case "medium":
        return topArmour;
      case "heavy":
        if (this.abilityScores[STR] < topArmour.strengthReq)
          return this.getBestWearableArmour(NPCsArmour.getNextWorstArmour(topArmour));
        else
          return topArmour;
    }
  }

  /**
   * Gets a string representation of this character
   * 
   * @todo performance improvements / string length minimizing
   */
  getStorageString(this: NPCsCharacterData): string {
    const me = this;

    if (this.name.includes('?') || this.name.includes('=') || this.name.includes('&'))
      throw new Error('Invalid name for string enconding');

    let output: string = this.name;

    appendAttribute(
      'race',
      getIndexInObject(
        NPCsRace.list,
        this.race,
        (thisRace, raceEntry) => { return thisRace.name === raceEntry.name }
      ),
      true
    );

    appendAttribute(
      'class',
      getIndexInObject(
        NPCsClass.list,
        this.class,
        (attr, entry) => { return attr.name === entry.name }
      ),
    );

    fastAppend('moralAlignment');
    fastAppend('orderAlignment');

    appendAttribute(
      'armour',
      getIndexInObject(
        NPCsArmour.list,
        this.armour,
        (attr, entry) => { return attr.name === entry.name }
      ),
    );

    fastAppend('HP');
    fastAppend('ID');
    appendAttribute('hitDice', this.hitDice.print());
    fastAppend('speed');
    for (let i = 0; i < this.abilityScores.length; i++)
      appendAttribute(NPCsHelper.abilityToStr(i as NPCsAbility, false), this.abilityScores[i]);
    for (let i = 0; i < this.abilityScores.length; i++)
      appendAttribute(NPCsHelper.abilityToStr(i as NPCsAbility, false) + 'save', this.saves[i]);
    appendAttribute('dmgVul', this.damageVulnerabilities.list(','));
    appendAttribute('dmgRes', this.damageResistances.list(','));
    appendAttribute('dmgImn', this.damageImmunities.list(','));
    appendAttribute('cndRes', this.conditionResistances.list(','));
    appendAttribute('cndImn', this.conditionImmunities.list(','));
    fastAppend('darkvision');
    appendAttribute('langs', this.getLanguageList());
    appendAttribute('CR', this.challengeRating);
    appendAttribute('attrs', this.attributes.map((attr: NPCsAttribute) => { return attr.name }).join(','));
    appendAttribute('actions', this.actions.map((action: NPCsAction) => { return action.uniqueName }).join(','));
    appendAttribute('reactions', this.reactions.map((reaction: NPCsReaction) => { return reaction.uniqueName }).join(','));
    appendAttribute('skills', this.skills.map((skill: NPCsSkill) => {
      return skill.isSkillPossessed ?
        (skill.expertise
          ? skill.name + '_EXP'
          : skill.name)
        : null;
    }).filter((a: string | null) => {
      return a !== null;
    }).join(','));

    if (this.racialSpells) {
      appendAttribute('raceSpells', this.racialSpells.list.map((spell: NPCsSpell) => { return spell.name }).join(','));
      appendAttribute('raceSpellAbility', this.racialSpells.spellcastingAbility);
    }
    if (this.spells) {
      appendAttribute('spellAbility', this.spells.spellcastingAbility);
      appendAttribute('spellLevel', this.spells.spellcastingLevel);
      appendAttribute('spells', this.spells.list.map((spell: NPCsSpell) => { return spell.name }).join(','));
    }

    const cipher = Math.ceil(Math.random() * 9);

    return Molasses.caesarCipher(output, cipher) + cipher;

    function fastAppend(attribute: keyof NPCsCharacterData): void {
      if (typeof me[attribute] !== 'string' && typeof me[attribute] !== 'number')
        throw new Error('Bad fast append: ' + attribute);
      appendAttribute(attribute, me[attribute] as string | number);
    }

    function appendAttribute(attributeType: string, attribute: string | number | boolean, isFirst?: boolean): void {
      if (isFirst) output += '?';
      else output += '&';

      output += attributeType + '=' + attribute;
    }

    function getIndexInObject<comparatorType, objectEntryType>(
      listObject: Record<any, objectEntryType>,
      comparator: comparatorType,
      comparatorFn: (comparator: comparatorType, objectEntry: objectEntryType) => boolean
    ): number {
      let entries = Molasses.Object.entries(listObject);

      for (let i = 0; i < entries.length; i++) {
        if (comparatorFn(comparator, entries[i][1]))
          return i;
      }

      throw new Error(`Entry not in object`);
    }
  }

  /**
   * Gets the character's darkvision, in feet, or returns '' if the characters has no darkvision
   * 
   * (For use with the HTML card)
   */
  getDarkvisionString(this: NPCsCharacterData): string {
    if (this.darkvision && this.darkvision !== 0)
      return `darkvision ${this.darkvision} ft., `
    else
      return '';
  }

  /**
   * @example getFormattedAbility(DEX) => '9 (-1)'
   */
  getFormattedAbility(this: NPCsCharacterData, ability: NPCsAbility): string {
    let operator = this.abilityModifiers[ability] >= 0 ? '+' : '-';
    return `${this.abilityScores[ability]} (${operator}${Math.abs(this.abilityModifiers[ability])})`
  }

  /**
   * @example getHpFromCon() => '16 (3d8 + 3)'
   */
  getHpFromCon(this: NPCsCharacterData): string {
    let operator = this.abilityModifiers[CON] >= 0 ? " + " : " - ";

    return operator + ` ${Math.abs(this.abilityModifiers[CON] * this.hitDice.amount)}`;
  }

  /**
   * @example getLanguageList() => 'elvish, dwarvish'
   */
  getLanguageList(this: NPCsCharacterData): string {
    let output = "";

    this.languages.forEach((language: NPCsLanguageType) => {
      if (output !== '')
        output += ', ';

      output += language;
    });

    return output;
  }

  /**
   * Gets this character's saving throw modifier for the given ability
   */
  getSavingThrowModifier(this: NPCsCharacterData, save: NPCsAbility): number {
    return this.abilityModifiers[save] + (this.saves[save] ? this.proficiencyBonus : 0);
  }

  /**
   * Returns a string represtation of this character's proficient saving throw modifiers
   */
  getSavingThrowsList(this: NPCsCharacterData): string {
    let output: string = "";

    for (let i = 0; i < this.saves.length; i++) {
      if (this.saves[i]) {
        if (output !== '')
          output += ', ';

        output += NPCsHelper.abilityToStr(i as NPCsAbility, false) + ' '
          + (this.abilityModifiers[i] >= 0 ? '+' : '-')
          + Math.abs(this.getSavingThrowModifier(i as NPCsAbility));
      }
    }

    return output;
  }

  /**
   * Returns the desired NPC skill as possessed by this character
   */
  getSkill(this: NPCsCharacterData, skillName: NPCsSkillName): NPCsSkill {
    return this.skills.getSkillByName(skillName);
  }

  /**
   * Returns this character's modifier for the given skill
   */
  getSkillModifier(this: NPCsCharacterData, skill: NPCsSkill): number {
    let modifier = this.abilityModifiers[skill.ability];
    if (skill.isSkillPossessed) {
      modifier += this.proficiencyBonus;
      if (skill.expertise)
        modifier += this.proficiencyBonus;
    }

    return modifier;
  }

  /**
   * Returns a string list of this character's proficient skills
   */
  getSkillsList(this: NPCsCharacterData): string {
    let output: string = '';

    let possessedSkills: NPCsSkill[] = this.skills.filter((skill: NPCsSkill) => {
      return skill.isSkillPossessed
    });

    possessedSkills.forEach((skill: NPCsSkill) => {
      if (output !== '')
        output += ', ';

      let skillBonus: number = this.getSkillModifier(skill);

      output += skill.name + ' ' + (skillBonus >= 0 ? '+' : '-') + Math.abs(skillBonus);
    });

    return output;
  }

  getNthLevelSpellSlots(this: NPCsCharacterData, n: number) {
    if (n <= 0)
      throw new Error(`Cannot get spell slots for spells at level ${n}`);

    let levelToTwenty = Math.min(this.spells.spellcastingLevel, 20);
    return NPCsSpellcasterData.spellSlotsByLevel[levelToTwenty][n - 1];
  }

  resetHP(this: NPCsCharacterData): number {
    this.HP = this.hitDice.roll() + this.abilityModifiers[CON] * this.hitDice.amount;
    if (this.HP < 0)
      this.HP = 1;
    return this.HP;
  }

  static async create(race?: NPCsRace, characterClass?: NPCsClass, names?: [string, string]): Promise<NPCsCharacterData> {
    let tempData: Record<keyof NPCsCharacterDataCreationData | string, any> = {};

    if (names)
      tempData.names = names;
    else
      tempData.names = await race.generateName();

    tempData.race = race;
    tempData.class = characterClass;

    tempData.ID = NPCsCharacterData.generateCharacterID();

    //*****ABILITY SCORES*****//

    tempData.abilityScores = [
      characterClass.abilities[STR] + race.modifiers[STR],
      characterClass.abilities[DEX] + race.modifiers[DEX],
      characterClass.abilities[CON] + race.modifiers[CON],
      characterClass.abilities[INT] + race.modifiers[INT],
      characterClass.abilities[WIS] + race.modifiers[WIS],
      characterClass.abilities[CHA] + race.modifiers[CHA]];

    //*****ALIGNMENT*****//

    tempData.moralAlignment = race.generateMoralAlignment();
    tempData.orderAlignment = race.generateOrderAlignment();

    //*****ARMOUR*****//

    tempData.armour = characterClass.armour;

    //*****HEALTH*****//

    tempData.hitDice = characterClass.hitDice.clone();

    //*****SPEED/SIZE*****/

    tempData.speed = race.speed;
    tempData.size = race.size.substr(0) as NPCsCharacterSize;

    //*****SAVING THROWS*****//

    tempData.saves = [];
    for (let i = 0; i < 6; i++) {
      tempData.saves[i] = characterClass.saves[i] || race.saves[i] || false;
    }

    //*****SKILLS*****/

    tempData.skills = race.racialSkills.clone().mergeWith(characterClass.skills);

    //*****DAMAGE AND CONDITIONS*****/

    tempData.damageVulnerabilities = tempData.race.damageVulnerabilities.clone();
    tempData.damageResistances = tempData.race.damageResistances.clone();
    tempData.damageImmunities = tempData.race.damageImmunities.clone();
    tempData.conditionResistances = tempData.race.conditionResistances.clone().mergeWith(characterClass.conditionResistances);
    tempData.conditionImmunities = tempData.race.conditionImmunities.clone();

    //*****LANGUAGES*****/

    tempData.languages = race.generateRandomLanguageList();

    /*****CR*****/

    tempData.CR = characterClass.CR;

    /*****ATTRIBUTES*****/

    tempData.attributes = characterClass.attributes.concat(tempData.race.attributes);

    //*****SENSES*****/

    tempData.darkvision = race.darkvision;

    /*****ACTIONS*****/

    tempData.actions = characterClass.actions.map((action: NPCsAction) => {
      return action.clone();
    });

    /*****REACTIONS*****/

    tempData.reactions = [];

    characterClass.reactions.forEach((reaction: NPCsReaction) => {
      tempData.reactions.push(reaction);
    });

    /*****SPELLS*****/
    if (tempData.race.spellData) {
      tempData.racialSpells = tempData.race.spellData.clone();
      tempData.racialSpells.characterData = tempData;
    } else
      tempData.racialSpells = null;

    if (characterClass.spells) {
      tempData.spells = characterClass.spells.clone();
      tempData.spells.characterData = tempData;
    } else
      tempData.spells = null;

    return new NPCsCharacterData(tempData as NPCsCharacterDataCreationData);
  }

  static createFromStorageString(str: string): NPCsCharacterData {
    str = Molasses.caesarCipher(str, -Number(str.charAt(str.length - 1))); // decode

    let name = str.substring(0, str.search('\\?'));

    let attributesArray = str
      .substring(str.search('\\?') + 1, str.length - 1)
      .split('&')
      .map((attributeString: string) => {
        let equalSign = attributeString.search('=');
        return [attributeString.substring(0, equalSign), attributeString.substring(equalSign + 1)]
      });

    let attributes = {};

    attributes['firstName'] = name.search(' ') !== -1 ? name.substring(0, name.search(' ')) : name;
    attributes['lastName'] = name.search(' ') !== -1 ? name.substring(name.search(' ') + 1) : '';
    attributesArray.forEach((attributeEntry: [string, string]) => {
      attributes[attributeEntry[0]] = attributeEntry[1];
    });

    let filteredAttributes: NPCsCharacterDataCreationData = {
      race: Molasses.Object.values(NPCsRace.list)[attributes['race']],
      class: Molasses.Object.values(NPCsClass.list)[attributes['class']],
      names: [
        attributes['firstName'],
        attributes['lastName']
      ],
      abilityScores: [
        Number(attributes['STR']),
        Number(attributes['DEX']),
        Number(attributes['CON']),
        Number(attributes['INT']),
        Number(attributes['WIS']),
        Number(attributes['CHA']),
      ],
      saves: [
        strToBool(attributes['STRsave']),
        strToBool(attributes['DEXsave']),
        strToBool(attributes['CONsave']),
        strToBool(attributes['INTsave']),
        strToBool(attributes['WISsave']),
        strToBool(attributes['CHAsave']),
      ],
      armour: Molasses.Object.values(NPCsArmour.list)[attributes['armour']],
      moralAlignment: attributes['moralAlignment'],
      orderAlignment: attributes['orderAlignment'],
      ID: Number(attributes['ID']),
      HP: Number(attributes['HP']),
      hitDice: new NPCsDice(attributes['hitDice']),
      speed: Number(attributes['speed']),
      darkvision: Number(attributes['darkvision']),
      languages: attributes['langs'].split(', '),
      damageVulnerabilities: new NPCsDamageTypes(getBooleanTypeCreator(attributes['dmgVul'])),
      damageResistances: new NPCsDamageTypes(getBooleanTypeCreator(attributes['dmgRes'])),
      damageImmunities: new NPCsDamageTypes(getBooleanTypeCreator(attributes['dmgImn'])),
      conditionResistances: new NPCsConditionTypes(getBooleanTypeCreator(attributes['cndRes'])),
      conditionImmunities: new NPCsConditionTypes(getBooleanTypeCreator(attributes['cndImn'])),
      CR: Number(attributes['CR']),
      attributes: attributes['attrs'].split(',').filter((s: string) => { return s !== '' }).map((name: string) => { return NPCsAttribute.getAttributeByName(name) }),
      skills: new NPCsSkillset(
        NPCsSkillset.giveSkills(
          (attributes['skills'] as string)
            .split(',')
            .filter((s: string) => {
              return s !== ''
            }).map((name: string) => {
              const hasExpertise = name.includes('_EXP');
              return {
                name: name.replace('_EXP', ''),
                expertise: hasExpertise,
              }
            })
        )
      ),
      actions: attributes['actions'].split(',').filter((s: string) => { return s !== '' }).map((name: string) => { return NPCsInventory.getActionByUniqueName(name) }),
      reactions: attributes['reactions'].split(',').filter((s: string) => { return s !== '' }).map((name: string) => { return NPCsInventory.getActionByUniqueName(name) }),
      spells: attributes['spells'] ? new NPCsSpellcasterData({
        spellList: attributes['spells'].split(',').filter((s: string) => { return s !== '' }).map((name: string) => { return NPCsSpell.getSpellByName(name) }),
        spellcastingAbility: Number(attributes['spellAbility']) as NPCsAbility,
        spellcastingLevel: Number(attributes['spellLevel']),
      }) : null,
      racialSpells: attributes['raceSpells'] ? new NPCsSpellcasterData({
        spellList: attributes['raceSpells'].split(',').filter((s: string) => { return s !== '' }).map((name: string) => { return NPCsSpell.getSpellByName(name) }),
        spellcastingAbility: Number(attributes['raceSpellAbility']) as NPCsAbility,
      }) : null,
    };

    return new NPCsCharacterData(filteredAttributes);

    function getBooleanTypeCreator(str: string): Object {
      let output = {};
      let types = str.split(',');

      types.forEach((type: string) => {
        output[type] = true;
      });

      return output;
    }

    function strToBool(str: string): boolean {
      if (str === 'true') return true;
      else return false;
    }

    return null;
  }

  static generateCharacterID(): number {
    return Math.ceil(Math.random() * 10000000000);
  }

  /**
   * Calculates the xp the NPC is worth, based on its cr
   * @param {number} cr The NPC's cr
   */
  static getXpByCr(cr: number): number {
    return Math.round((65.2 * Math.pow(cr, 2) - 88.7 * cr + 268) / 10) * 10; // 65.2x^2 - 88.7x + 268
  }

  static getStringPlaceholderList(): RegExp[] {
    const resultList: RegExp[] = [];

    NPCsCharacterData.stringPlaceholderList
      .forEach((placeholder: string) => {
        const newResults = [];

        if (placeholder.search(/REPLACE_DICE/g) !== -1) {
          placeholder = placeholder.replace(/REPLACE_DICE/g, '.*');
        }

        if (placeholder.search(/REPLACE_ABL/g) !== -1) {
          for (let i = 0; i < 6; i++) {
            resultList.push(new RegExp(placeholder.replace(/REPLACE_ABL/g, NPCsHelper.abilityToStr(i as NPCsAbility, false)), 'g'));
          }
        } else {
          resultList.push(new RegExp(placeholder, 'g'));
        }
      });

    return resultList;
  }

  private static stringPlaceholderList = [
    'NAME',
    'HALF_CHARACTER_LEVEL',
    'CHARACTER_LEVEL',
    'REPLACE_ABL_WITH_PROF',
    'PROFICIENCY_BONUS',
    'ATTACK_REPLACE_DICE_REPLACE_ABL',
    'RACIAL_SPELLCASTING_ABILITY_FULL',
    'RACIAL_SPELLCASTING_ABILITY_SHORT',
    'RACIAL_SPELL_SAVE_DC',
    'RACIAL_SPELL_MOD',
    'RACIAL_SPELL_LIST',
    'CLASS_SPELLCASTING_ABILITY_FULL',
    'CLASS_SPELLCASTING_ABILITY_SHORT',
    'CLASS_SPELL_SAVE_DC',
    'CLASS_SPELLCASTING_LEVEL',
    'CLASS_SPELL_MOD',
    'CLASS_SPELL_LIST',
    'FILL_DC_REPLACE_ABL'
  ];
}
