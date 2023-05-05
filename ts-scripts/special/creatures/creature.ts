import { NPCsDice } from "../npcs/helper-repository/general";

interface SummonsCreatureCreationData {
  name: string;
  healthDice: string;
  healthMod: number;
  attackMod: number;

  damageDice: string;
  damageMod: number;
}

export interface SummonsCreatureAttack {
  result: number;
  isCritical: boolean;
}

export class SummonsCreature {
  private readonly _NAME: string;

  private readonly _HP_DICE: NPCsDice[] = [];
  private readonly _HP_MOD: number;
  hp: number;
  readonly TOTAL_HP: number;

  readonly ATTACK_MODIFIER: number;

  readonly DAMAGE_DICE: NPCsDice[] = [];
  readonly DAMAGE_MODIFIER: number;

  constructor(data: SummonsCreatureCreationData) {
    this._NAME = data.name;
    data.healthDice.split('+').forEach((s) => {
      this._HP_DICE.push(new NPCsDice(s));
    });
    this._HP_MOD = data.healthMod;

    this.hp = this.rollDice(this._HP_DICE) + this._HP_MOD;
    this.TOTAL_HP = this.hp;

    this.ATTACK_MODIFIER = data.attackMod;

    this.DAMAGE_MODIFIER = data.damageMod;
    data.damageDice.split('+').forEach((s) => {
      this.DAMAGE_DICE.push(new NPCsDice(s));
    });
  }

  get name(): string {
    return this._NAME.toUpperCase();
  }

  private static D20: NPCsDice = new NPCsDice('1d20');
  rollAttack(this: SummonsCreature): SummonsCreatureAttack {
    const roll: number = SummonsCreature.D20.roll();
    return {
      result: roll + this.ATTACK_MODIFIER,
      isCritical: roll === 20,
    }
  }

  rollDamage(this: SummonsCreature): number {
    return this.rollDice(this.DAMAGE_DICE) + this.DAMAGE_MODIFIER;
  }

  private rollDice(this: SummonsCreature, set: NPCsDice[]): number {
    return set.reduce((previousValue: number, currentValue: NPCsDice) => {
      return previousValue + currentValue.roll();
    }, 0);
  }
}
