import { NPCsAttack } from "./action-attack";
import { NPCsDamageTypes } from "./damage-types";
import { NPCsAbility, NPCsDice } from "./general";

type NPCsAttackMixedCreationData = {
  name: string,

  ability: NPCsAbility;
  damageType: keyof NPCsDamageTypes;
  hitDice: NPCsDice;
  targetCount: number;
  range: number;
  longRange: number;

  category: 'Melee' | 'Ranged';

  reach?: boolean | null;
  finesse?: boolean | null;
  light?: boolean | null;
  heavy?: boolean | null;
  twoHanded?: boolean | null;
  special?: boolean | null;

  versatileDice?: NPCsDice;

  loading?: boolean | null;
  thrown?: boolean | null;
}

export class NPCsAttackMixed extends NPCsAttack {
  loading: boolean;
  category: 'Melee' | 'Ranged'

  constructor(data: NPCsAttackMixedCreationData) {
    super({
      name: data.name,
      reach: 5,
      range: data.range,
      longRange: data.longRange,
      ability: data.ability,
      targetCount: data.targetCount,
      hitDice: data.hitDice,
      attackType: "Mixed",
      damageType: data.damageType,

      finesse: data.finesse,
      special: data.special,
      light: data.light,
      heavy: data.heavy,
      twoHanded: data.twoHanded,
      versatileDice: data.versatileDice,
      thrown: data.thrown,
    });

    this.loading = data.loading;
    this.category = data.category;
  }

  get isVersatile(): boolean {
    return !!this.versatileDice;
  }

  clone(this: NPCsAttackMixed): NPCsAttackMixed {
    return new NPCsAttackMixed({
      name: this.name,

      ability: this.ability,
      damageType: this.damageType,
      hitDice: this.hitDice,
      targetCount: this.targetCount,
      range: this.range,
      longRange: this.longRange,
    
      finesse: this.finesse,
      light: this.light,
      heavy: this.heavy,
      twoHanded: this.twoHanded,
      special: this.special,
    
      versatileDice: this.versatileDice ? this.versatileDice.clone() : null,
    
      loading: this.loading,
      thrown: this.thrown,

      category: this.category,
    });
  }

  getProperties(this: NPCsAttackMixed): string {
    let properties: string[] = [];
    if (this.light)
      properties.push('light');
    if (this.heavy)
      properties.push('heavy');
    if (this.twoHanded)
      properties.push('two-handed');
    if (this.isVersatile)
      properties.push(`versatile (${this.versatileDice.print()})`);
    if (this.finesse)
      properties.push(`finesse`);
    if (this.reach > 5)
      properties.push(`reach`);
    if (this.special)
      properties.push(`special`);
    if (this.loading)
      properties.push('loading');
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
