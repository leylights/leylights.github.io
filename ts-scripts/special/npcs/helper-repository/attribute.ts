import { cws } from "../../../cws.js";
import { NPCsAbility, NPCsDice } from "./general.js";

export type NPCsAttributeFullList = {
  archersEye: NPCsAttribute;
  beastFriend: NPCsAttribute;
  feyAncestry: NPCsAttribute;
  halflingNimbleness: NPCsAttribute;
  innateSpellcasting: NPCsAttribute;
  lowMorale: NPCsAttribute;
  lucky: NPCsAttribute;
  maskOfTheWild: NPCsAttribute;
  naturallyStealthy: NPCsAttribute;
  reckless: NPCsAttribute;
  spellcasting: NPCsAttribute;
  sunlightSensitivity: NPCsAttribute;
} & NPCsAttributeClassList;

type NPCsAttributeClassList = {
  aggressive: NPCsAttribute;
  beastSlayer: NPCsAttribute;
  brute: NPCsAttribute;
  cunningAction: NPCsAttribute;
  darkDevotion: NPCsAttribute;
  evasion: NPCsAttribute;
  fury: NPCsAttribute;
  martialAdvantage: NPCsAttribute;
  packTactics: NPCsAttribute;
  sneakAttack: NPCsAttribute;
}

type NPCsAttributeCloneData = {
  name?: string,
  body?: string,
  subtitle?: string,
  relatedAbility?: NPCsAbility,
  hideBodyPunctuation?: boolean,
  isRaceLocked?: boolean,
}

type NPCsAttributeCreationData = {
  name: string,
  body: string,
  isRaceLocked?: boolean,
  subtitle?: string,
  relatedAbility?: NPCsAbility,
  hideBodyPunctuation?: boolean,
}

export class NPCsAttribute {
  name: string;
  body: string;
  subtitle: string;
  isRaceLocked: boolean;

  relatedAbility?: NPCsAbility | null;
  hideBodyPunctuation: boolean;

  constructor(data: NPCsAttributeCreationData) {
    this.name = data.name;
    this.body = data.body;
    this.subtitle = data.subtitle || '';
    this.relatedAbility = data.relatedAbility || null;
    this.hideBodyPunctuation = data.hideBodyPunctuation || false;
    this.isRaceLocked = data.isRaceLocked || false;
  }

  get HTML() {
    let period = this.hideBodyPunctuation ? '' : '.';
    return `<p><strong><i>${this.name}${this.subtitle !== '' ? ` (${this.subtitle})` : ''}.</i></strong> ${this.body}${period}</p>`
  }

  clone(overwriteData: NPCsAttributeCloneData) {
    let punctuationHiding = this.hideBodyPunctuation;
    if (typeof overwriteData.hideBodyPunctuation !== 'undefined')
      punctuationHiding = overwriteData.hideBodyPunctuation;

    return new NPCsAttribute({
      name: overwriteData.name || this.name,
      body: overwriteData.body || this.body,
      subtitle: overwriteData.subtitle || this.subtitle,
      relatedAbility: overwriteData.relatedAbility || this.relatedAbility,
      hideBodyPunctuation: punctuationHiding,
      isRaceLocked: this.isRaceLocked,
    })
  }

  static get classAttributes(): Record<string, NPCsAttribute> {
    const mainList: NPCsAttributeFullList = NPCsAttribute.list;

    const classAtrributesList: Record<string, NPCsAttribute> = {
      beastSlayer: mainList.beastSlayer,
      brute: mainList.brute,
      martialAdvantage: mainList.martialAdvantage,
      packTactics: mainList.packTactics
    }

    return classAtrributesList;
  }

  static getAttributeByName(name: string) {
    const result: NPCsAttribute[] = cws.Object.values(NPCsAttribute.list).filter((a: NPCsAttribute) => { return a.name === name });

    if (result.length > 0)
      return result[0];
    else
      throw new Error('attribute not found: ' + name);
  }

  static list: NPCsAttributeFullList = {
    aggressive: new NPCsAttribute({
      name: "Aggressive",
      body: "As a bonus action, NAME can move up to their speed towards an enemy they can see"
    }),
    archersEye: new NPCsAttribute({
      name: "Archer's Eye",
      subtitle: '3/day',
      body: "As a bonus action, NAME can add 1d10 to their next attack roll or damage roll with a bow"
    }),
    beastFriend: new NPCsAttribute({
      name: "Beast Friend",
      body: "NAME has disadvantage when making an attack roll against a beast, and takes double damage from all attacks by beasts"
    }),
    beastSlayer: new NPCsAttribute({
      name: "Beast Slayer",
      body: "NAME has advantage when making an attack roll against a beast. All successful attacks NAME makes against beasts are treated as criticals"
    }),
    brute: new NPCsAttribute({
      name: "Brute",
      body: "NAME's melee weapon attacks deal one extra die of damage"
    }),
    cunningAction: new NPCsAttribute({
      name: "Cunning Action",
      body: "On each of their turns, NAME can use a bonus action to take the Dodge, Disengage, or Hide actions"
    }),
    darkDevotion: new NPCsAttribute({
      name: "Dark Devotion",
      body: "NAME has advantage on saving throws against being charmed or frightened"
    }),
    evasion: new NPCsAttribute({
      name: "Evasion",
      body: `When NAME is subjected to an effect that allows them to make a Dexterity saving throw to take only half damage, NAME instead takes no damage if they succeed on the saving throw, and only half damage if they fail`
    }),
    feyAncestry: new NPCsAttribute({
      name: "Fey Ancestry",
      body: "Magic can't put NAME to sleep"
    }),
    fury: new NPCsAttribute({
      name: "Fury",
      body: "NAME inflicts an additional 1d8 damage on each melee attack"
    }),
    halflingNimbleness: new NPCsAttribute({
      name: "Halfling Nimbleness",
      body: "NAME can move through the space of any creature that is of a size larger than theirs",
      isRaceLocked: true,
    }),
    innateSpellcasting: new NPCsAttribute({
      name: "Innate Spellcasting",
      body: "NAME's innate spellcasting ability is RACIAL_SPELLCASTING_ABILITY_FULL (spell save DC RACIAL_SPELL_SAVE_DC, RACIAL_SPELL_MOD to hit with spell attacks). They can innately cast the following spells, requiring no material components:<br>RACIAL_SPELL_LIST",
      hideBodyPunctuation: true,
    }),
    lowMorale: new NPCsAttribute({
      name: "Low Morale",
      body: "When NAME witnesses the death of an ally, NAME is stunned until the end of their next turn"
    }),
    lucky: new NPCsAttribute({
      name: "Lucky",
      body: "When NAME rolls a 1 on an attack roll, ability check, or saving throw, they can reroll the die and must use the new roll"
    }),
    martialAdvantage: new NPCsAttribute({
      name: "Martial Advantage",
      body: "Once per turn, NAME can deal an extra 10 (3d6) damage to a creature they hit with a weapon attack if that creature is within 5 feet of an ally of NAME that isn't incapacitated"
    }),
    maskOfTheWild: new NPCsAttribute({
      name: "Mask of the Wild",
      body: "NAME can attempt to hide even when only lightly obscured by foliage, heavy rain, falling snow, mist, and other natural phenomena"
    }),
    naturallyStealthy: new NPCsAttribute({
      name: "Naturally Stealthy",
      body: "NAME can attempt to hide even when obscured only by a creature at least one size larger than them"
    }),
    packTactics: new NPCsAttribute({
      name: "Pack Tactics",
      body: "NAME has advantage on an attack roll against a creature if at least one of NAME's allies is within 5 feet of the creature and the ally isn’t incapacitated"
    }),
    reckless: new NPCsAttribute({
      name: "Reckless",
      body: "At the start of their turn, NAME can gain advantage on all melee weapon attack rolls during that turn, but attack rolls against them have advantage until the start of their next turn"
    }),
    sneakAttack: new NPCsAttribute({
      name: "Sneak Attack",
      subtitle: '1/turn',
      body: `NAME inflicts HALF_CHARACTER_LEVELd6 additional damage to one creature they attack with advantage,
      or which is within 5 ft. of an enemy of the target, that enemy is not incapacitated, and NAME does not
      have disadvantage on the attack roll`
    }),
    spellcasting: new NPCsAttribute({
      name: "Spellcasting",
      body: "NAME is a CLASS_SPELLCASTING_LEVEL spellcaster. Their spellcasting ability is CLASS_SPELLCASTING_ABILITY_FULL (spell save DC CLASS_SPELL_SAVE_DC, CLASS_SPELL_MOD to hit with spell attacks). NAME has the following spells prepared:<br>CLASS_SPELL_LIST",
      hideBodyPunctuation: true,
    }),
    sunlightSensitivity: new NPCsAttribute({
      name: "Sunlight Sensitivity",
      body: "NAME has disadvantage on attack rolls and on Wisdom (Perception) checks that rely on sight when they, the target of their attack, or whatever they are trying to perceive is in direct sunlight"
    }),
  }

  static positiveClassAttributesList = {
    archersEye: NPCsAttribute.list.archersEye,
    beastSlayer: NPCsAttribute.list.beastSlayer,
    brute: NPCsAttribute.list.brute,
    lucky: NPCsAttribute.list.lucky,
    martialAdvantage: NPCsAttribute.list.martialAdvantage,
    packTactics: NPCsAttribute.list.packTactics,
    reckless: NPCsAttribute.list.reckless,
  }

  static negativeClassAttributesList = {
    beastFriend: NPCsAttribute.list.beastFriend,
    lowMorale: NPCsAttribute.list.lowMorale,
  }
}