import { NPCsAttack } from "./action-attack.js";
import { NPCsDamageTypes } from "./damage-types.js";
import { NPCsAbility, NPCsDice } from "./general.js";

type NPCsAttackRangedCreationData = {
  name: string,

  ability: NPCsAbility;
  damageType: keyof NPCsDamageTypes;
  hitDice: NPCsDice;
  targetCount: number;
  range: number;
  longRange: number;

  light?: boolean | null;
  loading?: boolean | null;
  heavy?: boolean | null;
  thrown?: boolean | null;
  twoHanded?: boolean | null;
  special?: boolean | null;
  finesse?: boolean | null;
}

export class NPCsAttackRanged extends NPCsAttack {
  loading: boolean;

  constructor(data: NPCsAttackRangedCreationData) {
    super({
      name: data.name,
      range: data.range,
      longRange: data.longRange,
      ability: data.ability,
      targetCount: data.targetCount,
      hitDice: data.hitDice,
      attackType: "Ranged",
      damageType: data.damageType,
      light: data.light,
      heavy: data.heavy,
      twoHanded: data.twoHanded,
      thrown: data.thrown,
      special: data.special,
      finesse: data.finesse,
    });

    this.loading = data.loading || false;
  }

  clone(this: NPCsAttackRanged): NPCsAttackRanged {
    return new NPCsAttackRanged({
      name: this.name,
    
      ability: this.ability,
      damageType: this.damageType,
      hitDice: this.hitDice.clone(),
      targetCount: this.targetCount,
    
      light: this.light,
      heavy: this.heavy,
      range: this.range,
      longRange: this.longRange,
      twoHanded: this.twoHanded,
      special: this.special,
      loading: this.loading,
      finesse: this.finesse,
    });
  }

  getProperties(this: NPCsAttackRanged): string {
    let properties = [];
    if (this.light)
      properties.push('light');
    if (this.heavy)
      properties.push('heavy');
    if (this.loading)
      properties.push('loading');
    if (this.twoHanded)
      properties.push('two-handed');
    if (this.finesse)
      properties.push('finesse');
    if (this.thrown)
      properties.push(`thrown (range ${this.range}/${this.longRange})`);
    else
      properties.push(`ammunition (range ${this.range}/${this.longRange})`);

    if (properties.length === 0)
      return '';

    properties = properties.sort();

    const outputStr = properties[0].charAt(0).toUpperCase() + properties.join(', ').substr(1);
    return outputStr;
  }
}