import { NPCsAbility } from "./general.js";
import { STR, DEX, INT, WIS, CHA } from "./general.js";

type NPCsSkillGiveData = {
  name: string;
  expertise?: boolean;
}

export type NPCsSkillCreationData = {
  name: string;
  ability?: NPCsAbility;
  isSkillPossessed?: boolean;
  expertise?: boolean;
}

export type NPCsSkillNames =
  "acrobatics"
  | "animalHandling"
  | "arcana"
  | "athletics"
  | "deception"
  | "history"
  | "insight"
  | "intimidation"
  | "investigation"
  | "medicine"
  | "nature"
  | "perception"
  | "performance"
  | "persuasion"
  | "religion"
  | "sleightOfHand"
  | "survival"
  | "stealth";

export class NPCsSkill {
  name: string;
  ability: NPCsAbility;
  isSkillPossessed: boolean;
  expertise: boolean;

  constructor(data: NPCsSkillCreationData) {
    this.name = data.name;
    this.ability = data.ability;
    this.isSkillPossessed = data.isSkillPossessed || false;
    this.expertise = data.expertise || false;
  }

  clone(): NPCsSkill {
    return new NPCsSkill({
      name: this.name,
      ability: this.ability,
      isSkillPossessed: this.isSkillPossessed,
      expertise: this.expertise
    })
  }
}

export class NPCsSkillset {
  acrobatics: NPCsSkill = new NPCsSkill({
    name: "Acrobatics",
    ability: DEX,
  });
  animalHandling: NPCsSkill = new NPCsSkill({
    name: "Animal Handling",
    ability: WIS
  });
  arcana: NPCsSkill = new NPCsSkill({
    name: "Arcana",
    ability: INT,
  });
  athletics: NPCsSkill = new NPCsSkill({
    name: "Athletics",
    ability: STR,
  });
  deception: NPCsSkill = new NPCsSkill({
    name: "Deception",
    ability: CHA,
  });
  history: NPCsSkill = new NPCsSkill({
    name: "History",
    ability: INT,
  });
  insight: NPCsSkill = new NPCsSkill({
    name: "Insight",
    ability: WIS,
  });
  intimidation: NPCsSkill = new NPCsSkill({
    name: "Intimidation",
    ability: CHA,
  });
  investigation: NPCsSkill = new NPCsSkill({
    name: "Investigation",
    ability: INT,
  });
  medicine: NPCsSkill = new NPCsSkill({
    name: "Medicine",
    ability: WIS,
  });
  nature: NPCsSkill = new NPCsSkill({
    name: "Nature",
    ability: INT,
  });
  perception: NPCsSkill = new NPCsSkill({
    name: "Perception",
    ability: WIS,
  });
  performance: NPCsSkill = new NPCsSkill({
    name: "Performance",
    ability: CHA,
  });
  persuasion: NPCsSkill = new NPCsSkill({
    name: "Persuasion",
    ability: CHA,
  });
  religion: NPCsSkill = new NPCsSkill({
    name: "Religion",
    ability: INT,
  });
  sleightOfHand: NPCsSkill = new NPCsSkill({
    name: "Sleight of Hand",
    ability: DEX,
  });
  survival: NPCsSkill = new NPCsSkill({
    name: "Survival",
    ability: WIS,
  });
  stealth: NPCsSkill = new NPCsSkill({
    name: "Stealth",
    ability: DEX,
  });

  constructor(skills?: NPCsSkillCreationData[]) {
    if (!skills)
      return;

    skills.forEach((skill: NPCsSkillCreationData) => {
      this.addSkill(skill);
    });
  }

  get hasAnySkills(): boolean {
    return this.filter((skill: NPCsSkill) => {
      return skill.isSkillPossessed;
    }).length > 0;
  }

  /**
   * Updates the skillset
   */
  addSkill(this: NPCsSkillset, skill: NPCsSkillCreationData): void {
    let createdSkill: NPCsSkill = new NPCsSkill({
      name: skill.name,
      expertise: skill.expertise,
      ability: this.getSkillByName(skill.name).ability,
      isSkillPossessed: true,
    });

    // @ts-ignore
    this[this.getSkillPropertyByName(skill.name)] = createdSkill;
  }

  clone(this: NPCsSkillset): NPCsSkillset {
    let skillKeys = Object.keys(NPCsSkillset.nullSkillList);
    let clone = new NPCsSkillset();

    skillKeys.forEach((key: keyof NPCsSkillset) => {
      let thisSkill: NPCsSkill = this[key] as NPCsSkill;

      // @ts-ignore
      clone[key] = new NPCsSkill({
        name: thisSkill.name,
        expertise: thisSkill.expertise,
        ability: thisSkill.ability,
        isSkillPossessed: thisSkill.isSkillPossessed
      });
    });

    return clone;
  }

  /**
   * Returns a skill by the given name.  Throws an error if the name is wrong
   */
  getSkillByName(this: NPCsSkillset, name: string): NPCsSkill {
    const attributes: (keyof NPCsSkillset)[] = Object.keys(this) as (keyof NPCsSkillset)[];

    for (const attribute of attributes) {
      if (this[attribute] instanceof NPCsSkill) {
        if ((this[attribute] as NPCsSkill).name.toLowerCase() === name.toLowerCase()) {
          return this[attribute] as NPCsSkill;
        }
      }
    }

    throw new Error("Skill not found: '" + name + "'");
  }

  getSkillPropertyByName(this: NPCsSkillset, name: string): keyof NPCsSkillset {
    const skill = this.getSkillByName(name);
    const skillPropertyNames: (keyof NPCsSkillset)[] = Object.keys(NPCsSkillset.nullSkillList) as (keyof NPCsSkillset)[];

    for (let i = 0; i < skillPropertyNames.length; i++) {
      if ((NPCsSkillset.baseSkillset[skillPropertyNames[i]] as NPCsSkill).name === skill.name)
        return skillPropertyNames[i];
    }

    throw new Error(`No such skill found: ${name}`);
  }

  mergeWith(this: NPCsSkillset, that: NPCsSkillset): NPCsSkillset {
    let skillKeys = Object.keys(NPCsSkillset.nullSkillList);
    let mergedSet = new NPCsSkillset();

    skillKeys.forEach((key: keyof NPCsSkillset) => {
      let thisSkill: NPCsSkill = this[key] as NPCsSkill;
      let thatSkill: NPCsSkill = that[key] as NPCsSkill;

      // @ts-ignore
      mergedSet[key] = new NPCsSkill({
        name: thisSkill.name,
        expertise: thisSkill.expertise || thatSkill.expertise,
        ability: thisSkill.ability,
        isSkillPossessed: thisSkill.isSkillPossessed || thatSkill.isSkillPossessed
      })
    });

    return mergedSet;
  }

  /**
   * Safe?: yes
   * Idempotent?: yes
   */
  filter(this: NPCsSkillset, filterFunction: (skill: NPCsSkill) => boolean): NPCsSkill[] {
    let output: NPCsSkill[] = [];
    let keys = Object.keys(NPCsSkillset.nullSkillList) as (keyof NPCsSkillset)[];

    keys.forEach((key: keyof NPCsSkillset) => {
      if (filterFunction(this[key] as NPCsSkill))
        output.push((this[key] as NPCsSkill).clone());
    });

    return output;
  }

  map<T>(this: NPCsSkillset, mapFunction: (skill: NPCsSkill) => T): T[] {
    let output: T[] = [];
    let keys = Object.keys(NPCsSkillset.nullSkillList) as (keyof NPCsSkillset)[];

    keys.forEach((key: keyof NPCsSkillset) => {
      output.push(mapFunction(this[key] as NPCsSkill));
    });

    return output;
  }

  /**
   * Allows skills to be easily created
   */
  static giveSkills(skills: NPCsSkillGiveData[]): NPCsSkillCreationData[] {
    let creationData: NPCsSkillCreationData[] = [];

    skills.forEach((skill: NPCsSkillGiveData) => {
      const correspondingSkill = NPCsSkillset.baseSkillset.getSkillByName(skill.name);
      creationData.push({
        name: correspondingSkill.name,
        expertise: skill.expertise || false,
        ability: correspondingSkill.ability,
        isSkillPossessed: true,
      });
    });

    return creationData;
  }

  static baseSkillset: NPCsSkillset = new NPCsSkillset();
  static nullSkillList: Record<string, null> = {
    acrobatics: null,
    animalHandling: null,
    arcana: null,
    athletics: null,
    deception: null,
    history: null,
    insight: null,
    intimidation: null,
    investigation: null,
    medicine: null,
    nature: null,
    perception: null,
    performance: null,
    persuasion: null,
    religion: null,
    sleightOfHand: null,
    survival: null,
    stealth: null,
  }
}
