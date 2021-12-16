import { NPCsAttack } from "./action-attack.js";
import { NPCsDamageTypes } from "./damage-types.js";
import { NPCsAbility, NPCsDice, } from "./general.js";

type NPCsAttackMeleeCreationData = {
  name: string,

  ability: NPCsAbility;
  damageType: keyof NPCsDamageTypes;
  hitDice: NPCsDice;
  targetCount: number;

  light?: boolean;
  heavy?: boolean;
  reach?: boolean;
  twoHanded?: boolean;
  finesse?: boolean;
  special?: boolean;

  versatileDice?: NPCsDice;
  additionalEndText?: string;
}

export class NPCsAttackMelee extends NPCsAttack {
  constructor(data: NPCsAttackMeleeCreationData) {
    super({
      name: data.name,
      reach: 5,
      ability: data.ability,
      targetCount: data.targetCount,
      hitDice: data.hitDice,
      attackType: "Melee",
      damageType: data.damageType,
      finesse: data.finesse || false,
      special: data.special,
      light: data.light,
      heavy: data.heavy,
      twoHanded: data.twoHanded,
      versatileDice: data.versatileDice,
      additionalEndText: data.additionalEndText || null,
    });

    if (data.reach) {
      this.reach = 10;
    }
  }

  get isVersatile(): boolean {
    return !!this.versatileDice;
  }

  clone(this: NPCsAttackMelee): NPCsAttackMelee {
    return new NPCsAttackMelee({
      name: this.name,
    
      ability: this.ability,
      damageType: this.damageType,
      hitDice: this.hitDice.clone(),
      targetCount: this.targetCount,
    
      light: this.light,
      heavy: this.heavy,
      reach: this.reach > 5,
      twoHanded: this.twoHanded,
      finesse: this.finesse,
      special: this.special,
    
      versatileDice: this.versatileDice ? this.versatileDice.clone() : null,
      additionalEndText: this.additionalEndText,
    });
  }

  getProperties(this: NPCsAttackMelee): string {
    let properties = [];
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

    if (properties.length === 0)
      return '';

    properties = properties.sort();

    const outputStr = properties[0].charAt(0).toUpperCase() + properties.join(', ').substr(1);
    return outputStr;
  }
}