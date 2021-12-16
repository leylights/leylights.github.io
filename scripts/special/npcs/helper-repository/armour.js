import { cws } from "../../../cws.js";
export var NPCsArmourWeightEnum;
(function (NPCsArmourWeightEnum) {
    NPCsArmourWeightEnum["light"] = "light";
    NPCsArmourWeightEnum["medium"] = "medium";
    NPCsArmourWeightEnum["heavy"] = "heavy";
})(NPCsArmourWeightEnum || (NPCsArmourWeightEnum = {}));
var nextArmourID = 1;
export class NPCsArmour {
    constructor(type, armourClass, weight, stealthDisadvantage, strReq) {
        this._name = type;
        this._armourClass = armourClass;
        this._weight = weight;
        this._strengthReq = strReq || 0;
        this._stealthDisadvantage = stealthDisadvantage || false;
        this._ID = nextArmourID;
        nextArmourID++;
    }
    get armourClass() {
        return this._armourClass;
    }
    get AC() {
        return this.armourClass;
    }
    get ID() {
        return this._ID;
    }
    get name() {
        return this._name;
    }
    get weight() {
        return this._weight;
    }
    get strengthReq() {
        return this._strengthReq;
    }
    get stealthDisadvantage() {
        return this._stealthDisadvantage;
    }
    static getArmourByName(name) {
        const result = cws.Object.values(NPCsArmour.list).filter((a) => {
            return a.name.toLowerCase() === name.toLowerCase();
        });
        if (result.length === 1)
            return result[0];
        else
            throw new Error('No such armour found: ' + name);
    }
    static getNextBestArmour(armour) {
        if (cws.orEquals(armour.name, cws.Object.values(NPCsArmour.list).map((a) => { return a.name; }))) {
            let armours = cws.Object.values(NPCsArmour.list);
            let indexOfCurrent = armours.map((mappedArmour) => {
                return mappedArmour.name;
            }).indexOf(armour.name);
            let betterIndex = indexOfCurrent + 1;
            if (betterIndex >= armours.length) {
                throw new Error("No better armour found");
            }
            return armours[betterIndex];
        }
        else {
            throw new Error("Armour not in NPCsArmour inventory");
        }
    }
    static getNextWorstArmour(armour) {
        if (cws.orEquals(armour.name, cws.Object.values(NPCsArmour.list).map((a) => { return a.name; }))) {
            let armours = cws.Object.values(NPCsArmour.list);
            let indexOfCurrent = armours.map((mappedArmour) => {
                return mappedArmour.name;
            }).indexOf(armour.name);
            let worseIndex = indexOfCurrent - 1;
            if (worseIndex < 0) {
                console.log(armours);
                throw new Error(`No worse armour found than ${armour.name}`);
            }
            return armours[worseIndex];
        }
        else {
            throw new Error("Armour not in NPCsArmour inventory");
        }
    }
    static get list() {
        return {
            unarmoured: new NPCsArmour("unarmoured", 10, NPCsArmourWeightEnum.light),
            leather: new NPCsArmour("leather", 11, NPCsArmourWeightEnum.light),
            padded: new NPCsArmour("padded", 11, NPCsArmourWeightEnum.light, true),
            studdedLeather: new NPCsArmour("studded leather", 12, NPCsArmourWeightEnum.light),
            hide: new NPCsArmour("hide", 12, NPCsArmourWeightEnum.medium),
            chainShirt: new NPCsArmour("chain shirt", 13, NPCsArmourWeightEnum.medium),
            scaleMail: new NPCsArmour("scale mail", 14, NPCsArmourWeightEnum.medium, true),
            breastplate: new NPCsArmour("breastplate", 14, NPCsArmourWeightEnum.medium),
            halfPlate: new NPCsArmour("half plate", 15, NPCsArmourWeightEnum.medium, true),
            ringMail: new NPCsArmour("ring mail", 14, NPCsArmourWeightEnum.heavy, true),
            chainMail: new NPCsArmour("chain mail", 16, NPCsArmourWeightEnum.heavy, true, 13),
            splint: new NPCsArmour("splint", 17, NPCsArmourWeightEnum.heavy, true, 15),
            plate: new NPCsArmour("plate", 18, NPCsArmourWeightEnum.heavy, true, 15)
        };
    }
}
//# sourceMappingURL=armour.js.map