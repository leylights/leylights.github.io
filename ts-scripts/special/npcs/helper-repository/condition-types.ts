import { NPCsBooleanList } from "./boolean-list";

type NPCsConditionTypesCreationData = {
  blinded?: boolean;
  charmed?: boolean;
  deafened?: boolean;
  frightened?: boolean;
  grappled?: boolean;
  incapacitated?: boolean;
  paralyzed?: boolean;
  petrified?: boolean;
  poisoned?: boolean;
  stunned?: boolean;
}

export class NPCsConditionTypes extends NPCsBooleanList {
  blinded: boolean = false;
  charmed: boolean = false;
  deafened: boolean = false;
  frightened: boolean = false;
  grappled: boolean = false;
  incapacitated: boolean = false;
  paralyzed: boolean = false;
  petrified: boolean = false;
  poisoned: boolean = false;
  stunned: boolean = false;

  constructor(data?: NPCsConditionTypesCreationData) {
    super();

    if (data) {
      this.blinded = data.blinded || false;
      this.charmed = data.charmed || false;
      this.deafened = data.deafened || false;
      this.frightened = data.frightened || false;
      this.grappled = data.grappled || false;
      this.incapacitated = data.incapacitated || false;
      this.paralyzed = data.paralyzed || false;
      this.petrified = data.petrified || false;
      this.poisoned = data.poisoned || false;
      this.stunned = data.stunned || false;
    }
  }

  clone(this: NPCsConditionTypes): NPCsConditionTypes {
    return new NPCsConditionTypes({
      blinded: this.blinded,
      charmed: this.charmed,
      deafened: this.deafened,
      frightened: this.frightened,
      grappled: this.grappled,
      incapacitated: this.incapacitated,
      paralyzed: this.paralyzed,
      petrified: this.petrified,
      poisoned: this.poisoned,
      stunned: this.stunned,
    });
  }

  mergeWith(this: NPCsConditionTypes, that: NPCsConditionTypes): NPCsConditionTypes {
    return new NPCsConditionTypes({
      blinded: this.blinded || that.blinded,
      charmed: this.charmed || that.charmed,
      deafened: this.deafened || that.deafened,
      frightened: this.frightened || that.frightened,
      grappled: this.grappled || that.grappled,
      incapacitated: this.incapacitated || that.incapacitated,
      paralyzed: this.paralyzed || that.paralyzed,
      petrified: this.petrified || that.petrified,
      poisoned: this.poisoned || that.poisoned,
      stunned: this.stunned || that.stunned,
    });
  }

  static list = new NPCsConditionTypes();
}
