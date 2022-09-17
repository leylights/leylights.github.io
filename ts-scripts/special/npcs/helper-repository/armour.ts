import { Molasses } from "../../../molasses.js";

export enum NPCsArmourWeightEnum {
  light = "light",
  medium = "medium",
  heavy = "heavy"
}

var nextArmourID: number = 1;

export class NPCsArmour {
  private _armourClass: number;
  private _weight: NPCsArmourWeightEnum;
  private _strengthReq: number;
  private _stealthDisadvantage: boolean;
  private _name: string;
  private _ID: number;

  constructor(type: string, armourClass: number, weight: NPCsArmourWeightEnum, stealthDisadvantage?: boolean, strReq?: number) {
    this._name = type;
    this._armourClass = armourClass;
    this._weight = weight;
    this._strengthReq = strReq || 0;
    this._stealthDisadvantage = stealthDisadvantage || false;
    this._ID = nextArmourID;
    nextArmourID++;
  }

  get armourClass(): number {
    return this._armourClass;
  }

  get AC(): number {
    return this.armourClass;
  }

  get ID(): number {
    return this._ID;
  }

  get name(): string {
    return this._name;
  }

  get weight(): NPCsArmourWeightEnum {
    return this._weight;
  }

  get strengthReq(): number {
    return this._strengthReq;
  }

  get stealthDisadvantage(): boolean {
    return this._stealthDisadvantage;
  }

  static getArmourByName(name: string) {
    const result: NPCsArmour[] = Molasses.Object.values(NPCsArmour.list).filter((a: NPCsArmour) => {
      return a.name.toLowerCase() === name.toLowerCase();
    });

    if (result.length === 1)
      return result[0];
    else throw new Error('No such armour found: ' + name);
  }

  static getNextBestArmour(armour: NPCsArmour) {
    if (Molasses.orEquals(
      armour.name,
      Molasses.Object.values(NPCsArmour.list).map((a: NPCsArmour) => { return a.name }))
    ) {
      let armours = Molasses.Object.values(NPCsArmour.list);
      let indexOfCurrent = armours.map((mappedArmour: NPCsArmour) => {
        return mappedArmour.name;
      }).indexOf(armour.name);
      let betterIndex = indexOfCurrent + 1;

      if (betterIndex >= armours.length) {
        throw new Error("No better armour found");
      }

      return armours[betterIndex];
    } else {
      throw new Error("Armour not in NPCsArmour inventory");
    }
  }

  static getNextWorstArmour(armour: NPCsArmour) {
    if (Molasses.orEquals(
      armour.name,
      Molasses.Object.values(NPCsArmour.list).map((a: NPCsArmour) => { return a.name }))
    ) {
      let armours = Molasses.Object.values(NPCsArmour.list);
      let indexOfCurrent = armours.map((mappedArmour: NPCsArmour) => {
        return mappedArmour.name;
      }).indexOf(armour.name);
      let worseIndex = indexOfCurrent - 1;

      if (worseIndex < 0) {
        console.log(armours);
        throw new Error(`No worse armour found than ${armour.name}`);
      }

      return armours[worseIndex];
    } else {
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
    }
  }
}
