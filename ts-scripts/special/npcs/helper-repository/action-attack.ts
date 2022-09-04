import { Leylights } from "../../../leylights.js";
import { NPCsCharacterData } from "../core/character-data.js";
import { NPCsAction } from "./action.js";
import { NPCsAttribute } from "./attribute.js";
import { NPCsDamageTypes } from "./damage-types.js";
import { DEX, NPCsAbility, NPCsDice, NPCsHelper, STR } from "./general.js";

export type NPCsAttackCreationData = {
  name: string,

  ability: NPCsAbility;
  damageType: keyof NPCsDamageTypes;
  hitDice: NPCsDice;
  targetCount: number;
  reach?: number;
  range?: number;
  longRange?: number;
  attackType: 'Melee' | 'Ranged' | 'Mixed';
  finesse?: boolean;
  special?: boolean;
  light?: boolean;
  heavy?: boolean;
  twoHanded?: boolean;
  versatileDice?: NPCsDice;
  thrown?: boolean;
  additionalEndText?: string;
}

export class NPCsAttack extends NPCsAction {
  reach: number;
  private _range: number;
  longRange: number;
  ability: NPCsAbility;
  targetCount: number;
  hitDice: NPCsDice;
  attackType: 'Melee' | 'Ranged' | 'Mixed';
  damageType: keyof NPCsDamageTypes;
  finesse: boolean;
  special: boolean;
  additionalHitDice: NPCsDice[] = [];
  light: boolean;
  heavy: boolean;
  twoHanded: boolean;
  versatileDice: NPCsDice;
  thrown: boolean;

  additionalEndText: string = "";

  constructor(data: NPCsAttackCreationData) {
    super({
      name: data.name,
      body: 'Error: Use NPCsActionAttack.getHTML() instead',
    });

    this.reach = data.reach || null;
    this._range = data.range || null;
    this.longRange = data.longRange || null;
    this.ability = data.ability;
    this.targetCount = data.targetCount;
    this.hitDice = data.hitDice;
    this.attackType = data.attackType;
    this.damageType = data.damageType;
    this.finesse = data.finesse || false;
    this.special = data.special || false;
    this.light = data.light || false;
    this.heavy = data.heavy || false;
    this.twoHanded = data.twoHanded || false;
    this.thrown = data.thrown || false;

    if (data.versatileDice)
      this.makeVersatile(data.versatileDice);

    if (data.additionalEndText)
      this.addEndText(data.additionalEndText);
  }

  get isVersatile(): boolean {
    return !!this.versatileDice;
  }

  get range(): number {
    return this._range;
  }

  set range(n: number) {
    let rangeMod = this.longRange / this.range;

    this.range = n;
    this.longRange = n * rangeMod;
  }

  addEndText = function (this: NPCsAttack, endText: string): NPCsAttack {
    this.additionalEndText = endText;
    return this;
  }

  clone(this: NPCsAttack): NPCsAttack {
    return new NPCsAttack({
      name: this.name,
    
      ability: this.ability,
      damageType: this.damageType,
      hitDice: this.hitDice.clone(),
      targetCount: this.targetCount,
      reach: this.reach,
      range: this.range,
      longRange: this.longRange,
      attackType: this.attackType,
      finesse: this.finesse,
      special: this.special,
      light: this.light,
      heavy: this.heavy,
      twoHanded: this.twoHanded,
      versatileDice: this.versatileDice ? this.versatileDice.clone() : null,
      thrown: this.thrown,
      additionalEndText: this.additionalEndText,
    });
  }

  getHTMLRangeOrReach(this: NPCsAttack) {
    switch (this.attackType) {
      case 'Melee':
        return `reach ${this.reach} ft.`;
      case 'Ranged':
        return `range ${this.range}/${this.longRange} ft.`;
      case 'Mixed':
        return `reach ${this.reach} ft. and range ${this.range}/${this.longRange} ft.`;
    }
  }

  getHTML(this: NPCsAttack, data?: NPCsCharacterData): string {
    let attackType: string = this.attackType == 'Mixed' ? 'Melee or Ranged' : this.attackType;
    return `<i>${attackType} Weapon Attack:</i> ${NPCsHelper.abilityToStr(this.ability, false)}_WITH_PROF to hit, 
    ${this.getHTMLRangeOrReach()}, ${Leylights.numberToString(this.targetCount)} target. <i>Hit:</i> ${this.getAttacksListHTML(data)} ${this.damageType} damage${this.additionalEndText || '.'}`;
  }

  getAttacksListHTML = function (this: NPCsAttack, data?: NPCsCharacterData) {
    let baseHitDice: NPCsDice = this.hitDice;

    if (data) {
      // BRUTE ATTRIBUTE: Increase every melee attack's hit dice by one
      let bruteFilter = data.attributes.filter((attr: NPCsAttribute) => {
        return attr.name.toLowerCase() === 'brute';
      });
      let furyFilter = data.attributes.filter((attr: NPCsAttribute) => {
        return attr.name.toLowerCase() === 'fury';
      });

      if (this.attackType === 'Melee' && bruteFilter.length > 0) {
        baseHitDice = this.hitDice.clone();
        baseHitDice.amount++;
      }
      if (furyFilter.length > 0) {
        this.additionalHitDice.push(new NPCsDice('1d8'))
      }
    }

    let base = `ATTACK_${baseHitDice.print()}_${NPCsHelper.abilityToStr(this.ability, false)}`;

    if (this.additionalHitDice.length > 0) {
      this.additionalHitDice.forEach((die: NPCsDice) => {
        base += ` + ATTACK_${die.print()}_NUL`
      });
    }

    return base;
  }

  makeVersatile = function (this: NPCsAttack, twoHandedHitDice: NPCsDice): NPCsAttack {
    this.versatileDice = twoHandedHitDice.clone();
    this.addEndText(`, or ATTACK_${this.versatileDice.print()}_${NPCsHelper.abilityToStr(this.ability, false)} ${this.damageType} damage if used with both hands.`);
    return this;
  }

  toggleFinesse = function (this: NPCsAttack) {
    if (!this.finesse)
      throw new Error(this.name + ' is not finesse');

    if (this.ability === STR)
      this.ability = DEX;
    else
      this.ability = STR;

    return this;
  }
}
