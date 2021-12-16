import { NPCsCharacterData } from "../core/character-data.js";
import { NPCsAbility } from "./general.js";
import { NPCsSpell } from "./spell.js";

type NPCsDividedSpellList = [NPCsSpell[], NPCsSpell[], NPCsSpell[], NPCsSpell[], NPCsSpell[], NPCsSpell[], NPCsSpell[], NPCsSpell[], NPCsSpell[], NPCsSpell[]];

type NPCsSpellcasterCreationData = {
  spellList: NPCsSpell[];
  spellcastingLevel?: number;
  spellcastingAbility: NPCsAbility;
  characterData?: NPCsCharacterData | null;
}

export class NPCsSpellcasterData {
  list: NPCsSpell[];
  spellcastingLevel?: number;
  spellcastingAbility: NPCsAbility;
  characterData?: NPCsCharacterData | null;

  constructor(data: NPCsSpellcasterCreationData) {
    this.list = data.spellList;
    this.spellcastingLevel = data.spellcastingLevel || null;
    this.spellcastingAbility = data.spellcastingAbility;
    this.characterData = data.characterData || null;
  }

  get dividedSpellList(): NPCsDividedSpellList {
    const dividedList: NPCsDividedSpellList = [[], [], [], [], [], [], [], [], [], []];

    // populate the divided list
    this.list.forEach((spell: NPCsSpell) => {
      dividedList[spell.level].push(spell);
    });

    return dividedList;
  }

  clone(): NPCsSpellcasterData {
    return new NPCsSpellcasterData({
      spellList: this.list,
      spellcastingLevel: this.spellcastingLevel,
      spellcastingAbility: this.spellcastingAbility,
      characterData: this.characterData,
    });
  }

  static spellSlotsByLevel = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0], // 0

    [2, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0],
    [4, 2, 0, 0, 0, 0, 0, 0, 0],
    [4, 3, 0, 0, 0, 0, 0, 0, 0],
    [4, 3, 2, 0, 0, 0, 0, 0, 0],

    [4, 3, 3, 0, 0, 0, 0, 0, 0],
    [4, 3, 3, 1, 0, 0, 0, 0, 0],
    [4, 3, 3, 2, 0, 0, 0, 0, 0],
    [4, 3, 3, 3, 1, 0, 0, 0, 0],
    [4, 3, 3, 3, 2, 0, 0, 0, 0],

    [4, 3, 3, 3, 2, 1, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 0],

    [4, 3, 3, 3, 2, 1, 1, 1, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 1],
    [4, 3, 3, 3, 3, 1, 1, 1, 1],
    [4, 3, 3, 3, 3, 2, 1, 1, 1],
    [4, 3, 3, 3, 2, 2, 2, 1, 1], // 20
  ];
}