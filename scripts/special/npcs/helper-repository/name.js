var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Leylights } from "../../../leylights.js";
import { NPCsRace } from "../core/race.js";
export class NPCsName {
    constructor(data) {
        this.name = data.name;
        this.owners = data.owners;
    }
    get ownerRaces() {
        const me = this;
        return Leylights.Object.values(NPCsRace.list).filter((race) => {
            return Leylights.Array.includes(me.owners, race.archetype);
        });
    }
    static getList() {
        return __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => {
                const req = new XMLHttpRequest();
                req.onload = () => {
                    if (req.status === 200) {
                        resolve(req.responseText);
                    }
                    else {
                        reject();
                    }
                };
                req.open('GET', '/json-data/npcs/names.json');
                req.send();
            });
            yield promise;
            const namesList = JSON.parse(yield promise);
            const result = {
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
            };
            return result;
        });
    }
    static getNames(list, type, archetype) {
        const nameArray = (type === 'first' ? list.firstNames : list.lastNames).map((data) => {
            return new NPCsName(data);
        });
        if (archetype)
            return nameArray.filter((name) => { return Leylights.Array.includes(name.owners, archetype); });
        else
            return nameArray;
    }
}
//# sourceMappingURL=name.js.map