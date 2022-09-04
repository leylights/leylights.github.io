import { Leylights } from "../../../leylights.js";
import { NPCsRace, NPCsRaceArchetype } from "../core/race.js";

interface RawNamesList {
  firstNames: NPCsNameCreationData[],
  lastNames: NPCsNameCreationData[],
}

interface NamesListStructure {
  firstNames: Record<NPCsRaceArchetype | 'all', NPCsName[]>
  lastNames: Record<NPCsRaceArchetype | 'all', NPCsName[]>
}

interface NPCsNameCreationData {
  name: string,
  owners: NPCsRaceArchetype[],
}

export class NPCsName {
  name: string;
  owners: NPCsRaceArchetype[];

  constructor(data: NPCsNameCreationData) {
    this.name = data.name;
    this.owners = data.owners;
  }

  get ownerRaces(): NPCsRace[] {
    const me = this;
    return Leylights.Object.values(NPCsRace.list).filter((race: NPCsRace) => {
      return Leylights.Array.includes(me.owners, race.archetype);
    });
  }

  static async getList(): Promise<NamesListStructure> {
    const promise = new Promise<string>((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.onload = () => {
        if (req.status === 200) {
          resolve(req.responseText);
        } else {
          reject();
        }
      };
      req.open('GET', '/json-data/npcs/names.json');
      req.send();
    });

    await promise;
    const namesList = JSON.parse(await promise) as RawNamesList;

    const result: NamesListStructure = {
      firstNames: {
        dwarf: NPCsName.getNames(namesList, 'first', 'dwarf'),
        elf: NPCsName.getNames(namesList, 'first', 'elf'),
        halfling: NPCsName.getNames(namesList, 'first', 'halfling'),
        human: NPCsName.getNames(namesList, 'first', 'human'),
        all: NPCsName.getNames(namesList, 'first'),
      },
      lastNames: {
        dwarf: NPCsName.getNames(namesList, 'last', 'dwarf'),
        elf: NPCsName.getNames(namesList, 'last', 'elf'),
        halfling: NPCsName.getNames(namesList, 'last', 'halfling'),
        human: NPCsName.getNames(namesList, 'last', 'human'),
        all: NPCsName.getNames(namesList, 'last'),
      }
    }

    return result;
  }

  private static getNames(list: RawNamesList, type: 'first' | 'last', archetype?: NPCsRaceArchetype): NPCsName[] {
    const nameArray: NPCsName[] = (type === 'first' ? list.firstNames : list.lastNames).map((data: NPCsNameCreationData) => {
      return new NPCsName(data);
    });

    if (archetype)
      return nameArray.filter((name: NPCsName) => { return Leylights.Array.includes(name.owners, archetype) });
    else
      return nameArray;
  }
}
