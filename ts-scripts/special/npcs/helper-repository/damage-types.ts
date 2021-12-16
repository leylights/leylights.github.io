import { NPCsBooleanList } from "./boolean-list.js";

type NPCsDamageTypesCreationData = {
  bludgeoning?: boolean;
  piercing?: boolean;
  slashing?: boolean;

  acid?: boolean;
  cold?: boolean;
  fire?: boolean;
  force?: boolean;
  lightning?: boolean;
  necrotic?: boolean;
  poison?: boolean;
  psychic?: boolean;
  radiant?: boolean;
  thunder?: boolean;
}

export class NPCsDamageTypes extends NPCsBooleanList {
  bludgeoning: boolean = false;
  piercing: boolean = false;
  slashing: boolean = false;

  acid: boolean = false;
  cold: boolean = false;
  fire: boolean = false;
  force: boolean = false;
  lightning: boolean = false;
  necrotic: boolean = false;
  poison: boolean = false;
  psychic: boolean = false;
  radiant: boolean = false;
  thunder: boolean = false;

  constructor(data?: NPCsDamageTypesCreationData) {
    super();

    if (data) {
      this.bludgeoning = data.bludgeoning || false;
      this.piercing = data.piercing || false;
      this.slashing = data.slashing || false;

      this.acid = data.acid || false;
      this.cold = data.cold || false;
      this.fire = data.fire || false;
      this.force = data.force || false;
      this.lightning = data.lightning || false;
      this.necrotic = data.necrotic || false;
      this.poison = data.poison || false;
      this.psychic = data.psychic || false;
      this.radiant = data.radiant || false;
      this.thunder = data.thunder || false;
    }
  }

  clone(): NPCsDamageTypes {
    return new NPCsDamageTypes({
      bludgeoning: this.bludgeoning,
      piercing: this.piercing,
      slashing: this.slashing,

      acid: this.acid,
      cold: this.cold,
      fire: this.fire,
      force: this.force,
      lightning: this.lightning,
      necrotic: this.necrotic,
      poison: this.poison,
      psychic: this.psychic,
      radiant: this.radiant,
      thunder: this.thunder,
    });
  }

  static physicalDamageTypes: Record<string, boolean> = {
    bludgeoning: false,
    piercing: false,
    slashing: false,
  }

  static elementalDamageTypes: Record<string, boolean> = {
    acid: false,
    cold: false,
    fire: false,
    force: false,
    lightning: false,
    necrotic: false,
    poison: false,
    psychic: false,
    radiant: false,
    thunder: false
  }

  static list = new NPCsDamageTypes();
}
