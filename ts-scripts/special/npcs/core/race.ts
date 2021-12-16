import { NPCsAttribute } from "../helper-repository/attribute.js";
import { NPCsConditionTypes } from "../helper-repository/condition-types.js";
import { NPCsDamageTypes } from "../helper-repository/damage-types.js";
import { CHA, INT, NPCsCharacterAlignmentMoral, NPCsCharacterAlignmentOrder, NPCsCharacterSize, NPCsLanguages, NPCsLanguageType } from "../helper-repository/general.js";
import { NPCsSkillCreationData, NPCsSkillset } from "../helper-repository/skill-set.js";
import { NPCsSpellcasterData } from "../helper-repository/spellcaster-data.js";
import { NPCsSpell } from "../helper-repository/spell.js";
import { cws } from "../../../cws.js";
import { NPCsName } from "../helper-repository/name.js";

export type NPCsRaceArchetype = "human"
  | "elf"
  | "dwarf"
  | "halfling";

export type NPCsRaceCreationData = {
  name: string,
  archetype: NPCsRaceArchetype;
  size: NPCsCharacterSize,
  orderAlignment: NPCsCharacterAlignmentOrder,
  moralAlignment: NPCsCharacterAlignmentMoral,
  alignmentAffinity: number,
  modifiers: number[],
  speed: number,
  languages: NPCsLanguageType[],
  totalKnownLanguages: number;
  attributes: NPCsAttribute[];
  saves: boolean[];
  racialSkillsCreationData: NPCsSkillCreationData[],
  darkvision?: number
  damageVulnerabilities: NPCsDamageTypes,
  damageResistances: NPCsDamageTypes,
  damageImmunities: NPCsDamageTypes,
  conditionResistances: NPCsConditionTypes,
  conditionImmunities: NPCsConditionTypes,

  spellData?: NPCsSpellcasterData | null,
}

export type NPCsRaceList = {
  hillDwarf: NPCsRace,
  mountainDwarf: NPCsRace,
  highElf: NPCsRace,
  woodElf: NPCsRace,
  drow: NPCsRace,
  lightfootHalfling: NPCsRace,
  stoutHalfling: NPCsRace,
  human: NPCsRace,
}

export class NPCsRace {
  name: string;
  archetype: NPCsRaceArchetype;
  size: NPCsCharacterSize;
  orderAlignment: NPCsCharacterAlignmentOrder;
  moralAlignment: NPCsCharacterAlignmentMoral;
  alignmentAffinity: number;
  modifiers: number[];
  speed: number;
  languages: NPCsLanguageType[];
  totalKnownLanguages: number;
  attributes: NPCsAttribute[];
  saves: boolean[]
  racialSkills: NPCsSkillset;
  darkvision: number
  damageVulnerabilities: NPCsDamageTypes;
  damageResistances: NPCsDamageTypes;
  damageImmunities: NPCsDamageTypes;
  conditionResistances: NPCsConditionTypes;
  conditionImmunities: NPCsConditionTypes;

  spellData: NPCsSpellcasterData;

  constructor(data: NPCsRaceCreationData) {
    this.name = data.name;
    this.archetype = data.archetype;
    this.size = data.size;
    this.orderAlignment = data.orderAlignment;
    this.moralAlignment = data.moralAlignment;
    this.alignmentAffinity = data.alignmentAffinity;
    this.modifiers = data.modifiers;
    this.speed = data.speed;
    this.saves = data.saves;

    // setting languages

    this.languages = [];
    this.totalKnownLanguages = data.totalKnownLanguages;

    for (let i = 0; i < data.languages.length; i++)
      this.languages[i] = data.languages[i];

    // setting attributes

    this.attributes = [];

    for (let i = 0; i < data.attributes.length; i++)
      this.attributes[i] = data.attributes[i];

    // setting skills

    this.racialSkills = new NPCsSkillset(data.racialSkillsCreationData);

    this.darkvision = data.darkvision || 0;

    this.damageVulnerabilities = data.damageVulnerabilities;
    this.damageResistances = data.damageResistances;
    this.damageImmunities = data.damageImmunities;
    this.conditionResistances = data.conditionResistances;
    this.conditionImmunities = data.conditionImmunities;

    this.spellData = data.spellData || null;
  }

  /**
   * Generates an alignment for the character on the given axis
   */
  private static generateGenericAlignment<T extends string>(
    options: [T, T, T],
    affinity: number,
    favouredAlignment: T): T {
    let optionAffinities = [1, 1, 1];

    // set up chances of each alignment 

    switch (favouredAlignment) {
      case options[0]:
        optionAffinities[0] += affinity;
        break;
      case options[1]:
        optionAffinities[1] += affinity;
        break;
      case options[2]:
        optionAffinities[2] += affinity;
        break;
    }

    // generate and assign alignment

    let alignmentChoice = Math.ceil(Math.random() * (cws.Array.get.sum(optionAffinities)));

    if (alignmentChoice <= optionAffinities[0])
      return options[0];
    else if (alignmentChoice <= cws.Array.get.sum(optionAffinities, 0, 2))
      return options[1];
    else
      return options[2];
  }

  /**
   * Generates a moral alignment for a character of this race
   */
  generateMoralAlignment(this: NPCsRace): NPCsCharacterAlignmentMoral {
    return NPCsRace.generateGenericAlignment(["good", "neutral", "evil"],
      this.alignmentAffinity,
      this.moralAlignment);
  }

  /**
   * Generates an order alignment for a character of this race
   */
  generateOrderAlignment(this: NPCsRace): NPCsCharacterAlignmentOrder {
    return NPCsRace.generateGenericAlignment(["lawful", "neutral", "chaotic"],
      this.alignmentAffinity,
      this.orderAlignment);
  }

  /**
   * Generates a language list for a character of this race
   */
  generateRandomLanguageList(this: NPCsRace): NPCsLanguageType[] {
    let selectedLanguages: NPCsLanguageType[] = [];

    // assign each racial language to selection
    for (let i = 0; i < this.languages.length; i++)
      selectedLanguages.push(this.languages[i]);

    // fill extra languages
    while (selectedLanguages.length < this.totalKnownLanguages) {
      let languageOptions = NPCsLanguages;
      const TIMEOUT = 25;

      for (let i = 0; i < TIMEOUT; i++) {
        const newLang = cws.Array.get.randomElement(languageOptions);

        const languagePreexists = selectedLanguages.filter((a: NPCsLanguageType) => { return a === newLang }).length !== 0;

        if (!languagePreexists) {
          selectedLanguages.push(newLang);
          break;
        }
      }
    }

    return selectedLanguages;
  }

  /**
   * Generates a name for the NPC based on its race
   * @param {Race} race The NPC's race
   */
  async generateName(this: NPCsRace): Promise<[string, string]> {
    const names: [string, string] = ['', ''];
    const list = await NPCsName.getList();

    switch (this.archetype) {
      case "dwarf":
        names[0] = cws.Array.get.randomElement(list.firstNames.dwarf).name;
        names[1] = cws.Array.get.randomElement(list.lastNames.dwarf).name;
        break;
      case "elf":
        names[0] = cws.Array.get.randomElement(list.firstNames.elf).name;
        names[1] = cws.Array.get.randomElement(list.lastNames.elf).name;
        break;
      case "halfling":
        names[0] = cws.Array.get.randomElement(list.firstNames.halfling).name;
        names[1] = cws.Array.get.randomElement(list.lastNames.halfling).name;
        break;
      case "human":
        names[0] = cws.Array.get.randomElement(list.firstNames.human).name;
        names[1] = cws.Array.get.randomElement(list.lastNames.human).name;
        break;
    }

    return names;
  }

  static list = {
    hillDwarf: new NPCsRace({
      name: "hill dwarf",
      archetype: "dwarf",
      size: "small",
      orderAlignment: "lawful",
      moralAlignment: null,
      alignmentAffinity: 3,
      modifiers: [0, 0, 2, 0, 1, 0],
      speed: 25,
      totalKnownLanguages: 2,
      languages: [
        'Common',
        'Dwarvish'
      ],
      attributes: [],
      racialSkillsCreationData: [],
      saves: [],
      darkvision: 60,
      damageVulnerabilities: new NPCsDamageTypes(),
      damageResistances: new NPCsDamageTypes({ poison: true }),
      damageImmunities: new NPCsDamageTypes(),
      conditionResistances: new NPCsConditionTypes(),
      conditionImmunities: new NPCsConditionTypes(),
    }),
    mountainDwarf: new NPCsRace({
      name: "mountain dwarf",
      archetype: "dwarf",
      size: "small",
      orderAlignment: "lawful",
      moralAlignment: null,
      alignmentAffinity: 3,
      modifiers: [2, 0, 2, 0, 0, 0],
      speed: 25,
      totalKnownLanguages: 2,
      languages: [
        "Common",
        "Dwarvish"
      ],
      attributes: [],
      racialSkillsCreationData: [],
      saves: [],
      darkvision: 60,
      damageVulnerabilities: new NPCsDamageTypes(),
      damageResistances: new NPCsDamageTypes({ poison: true }),
      damageImmunities: new NPCsDamageTypes(),
      conditionResistances: new NPCsConditionTypes(),
      conditionImmunities: new NPCsConditionTypes(),
    }),
    highElf: new NPCsRace({
      name: "high elf",
      archetype: "elf",
      size: "medium",
      orderAlignment: "chaotic",
      moralAlignment: null,
      alignmentAffinity: 2,
      modifiers: [0, 2, 0, 1, 0, 0],
      speed: 30,
      totalKnownLanguages: 3,
      languages: [
        "Common",
        "Elvish"
      ],
      attributes: [
        NPCsAttribute.list.feyAncestry,
        NPCsAttribute.list.innateSpellcasting.clone({
          relatedAbility: INT
        }),
      ],
      racialSkillsCreationData:
        NPCsSkillset.giveSkills([
          {
            name: "perception"
          }
        ]),
      saves: [],
      darkvision: 60,
      damageVulnerabilities: new NPCsDamageTypes(),
      damageResistances: new NPCsDamageTypes(),
      damageImmunities: new NPCsDamageTypes(),
      conditionResistances: new NPCsConditionTypes({ charmed: true }),
      conditionImmunities: new NPCsConditionTypes(),
      spellData: new NPCsSpellcasterData({
        spellList: NPCsSpell.getRandomWizardCantrips(1),
        spellcastingAbility: INT
      }),
    }),
    woodElf: new NPCsRace({
      name: "wood elf",
      archetype: "elf",
      size: "medium",
      orderAlignment: "chaotic",
      moralAlignment: null,
      alignmentAffinity: 3,
      modifiers: [0, 2, 0, 0, 1, 0],
      speed: 35,
      totalKnownLanguages: 2,
      languages: [
        "Common",
        "Elvish"
      ],
      attributes: [
        NPCsAttribute.list.feyAncestry,
        NPCsAttribute.list.maskOfTheWild
      ],
      racialSkillsCreationData:
        NPCsSkillset.giveSkills([
          {
            name: "perception"
          }
        ]),
      saves: [],
      darkvision: 60,
      damageVulnerabilities: new NPCsDamageTypes(),
      damageResistances: new NPCsDamageTypes(),
      damageImmunities: new NPCsDamageTypes(),
      conditionResistances: new NPCsConditionTypes({ charmed: true }),
      conditionImmunities: new NPCsConditionTypes(),
    }),
    drow: new NPCsRace({
      name: "drow",
      archetype: "elf",
      size: "medium",
      orderAlignment: "chaotic",
      moralAlignment: "evil",
      alignmentAffinity: 6,
      modifiers: [0, 2, 0, 0, 0, 1],
      speed: 30,
      totalKnownLanguages: 2,
      languages: [
        "Common",
        "Elvish"
      ],
      attributes: [
        NPCsAttribute.list.feyAncestry,
        NPCsAttribute.list.sunlightSensitivity,
        NPCsAttribute.list.innateSpellcasting.clone({
          relatedAbility: INT
        }),
      ],
      racialSkillsCreationData:
        NPCsSkillset.giveSkills([
          {
            name: "perception"
          }
        ]),
      saves: [],
      darkvision: 120,
      damageVulnerabilities: new NPCsDamageTypes(),
      damageResistances: new NPCsDamageTypes(),
      damageImmunities: new NPCsDamageTypes(),
      conditionResistances: new NPCsConditionTypes({ charmed: true }),
      conditionImmunities: new NPCsConditionTypes(),
      spellData: new NPCsSpellcasterData({
        spellList: [
          NPCsSpell.list[0].dancingLights,
          NPCsSpell.list[1].faerieFire,
          NPCsSpell.list[2].darkness,
        ],
        spellcastingAbility: CHA,
      })
    }),
    lightfootHalfling: new NPCsRace({
      name: "lightfoot halfling",
      archetype: "halfling",
      size: "small",
      orderAlignment: "lawful",
      moralAlignment: "good",
      alignmentAffinity: 4,
      modifiers: [0, 2, 0, 0, 0, 1],
      speed: 25,
      totalKnownLanguages: 2,
      languages: [
        "Common",
        "Halfling"
      ],
      attributes: [
        NPCsAttribute.list.lucky,
        NPCsAttribute.list.halflingNimbleness,
        NPCsAttribute.list.naturallyStealthy,
      ],
      racialSkillsCreationData: [],
      saves: [],
      darkvision: null,
      damageVulnerabilities: new NPCsDamageTypes(),
      damageResistances: new NPCsDamageTypes({ poison: true }),
      damageImmunities: new NPCsDamageTypes(),
      conditionResistances: new NPCsConditionTypes({ frightened: true }),
      conditionImmunities: new NPCsConditionTypes(),
    }),
    stoutHalfling: new NPCsRace({
      name: "stout halfling",
      archetype: "halfling",
      size: "small",
      orderAlignment: "lawful",
      moralAlignment: "good",
      alignmentAffinity: 4,
      modifiers: [0, 2, 1, 0, 0, 0],
      speed: 25,
      totalKnownLanguages: 2,
      languages: [
        "Common",
        "Halfling"
      ],
      attributes: [
        NPCsAttribute.list.lucky,
        NPCsAttribute.list.halflingNimbleness,
      ],
      racialSkillsCreationData: [],
      saves: [],
      darkvision: null,
      damageVulnerabilities: new NPCsDamageTypes(),
      damageResistances: new NPCsDamageTypes({ poison: true }),
      damageImmunities: new NPCsDamageTypes(),
      conditionResistances: new NPCsConditionTypes({ frightened: true }),
      conditionImmunities: new NPCsConditionTypes(),
    }),
    human: new NPCsRace({
      name: "human",
      archetype: "human",
      size: "medium",
      orderAlignment: null,
      moralAlignment: null,
      alignmentAffinity: 0,
      modifiers: [1, 1, 1, 1, 1, 1],
      speed: 30,
      totalKnownLanguages: 2,
      languages: [
        "Common",
      ],
      attributes: [],
      racialSkillsCreationData: [],
      saves: [],
      darkvision: null,
      damageVulnerabilities: new NPCsDamageTypes(),
      damageResistances: new NPCsDamageTypes(),
      damageImmunities: new NPCsDamageTypes(),
      conditionResistances: new NPCsConditionTypes(),
      conditionImmunities: new NPCsConditionTypes(),
    }),
  };

  static get archetypes(): NPCsRaceArchetype[] {
    const allArchetypes = cws.Object.values(NPCsRace.list).map((race: NPCsRace) => {
      return race.archetype;
    });

    let result: NPCsRaceArchetype[] = [];
    allArchetypes.forEach((archetype: NPCsRaceArchetype) => {
      if (!cws.Array.includes(result, archetype))
        result.push(archetype);
    });

    return result.sort();
  }

  static getRaceByName(name: string): NPCsRace {
    const result: NPCsRace[] = cws.Object.values(NPCsRace.list).filter((r: NPCsRace) => {
      return r.name.toLowerCase() === name.toLowerCase();
    });

    if (result.length === 1)
      return result[0];
    else throw new Error('No such race found: ' + name);
  }

  static getRandomRace(): NPCsRace {
    let options: NPCsRace[] = cws.Object.values(NPCsRace.list);
    return cws.Array.get.randomElement(options);
  }
}