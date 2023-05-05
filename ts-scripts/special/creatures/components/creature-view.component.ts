import { SummonsCreatureAttack } from "../creature";

// This class should never be constructed
export class SummonsCreatureViewComponent {
  readonly id: number;

  constructor() {
    throw new Error("Cannot instantiate SummonsCreatureDisplayComponent");
  }

  setRolls(attack: SummonsCreatureAttack, damage: number, attackLimits: {
    greenBound: number,
    redBound: number,
  }): void { }
}
