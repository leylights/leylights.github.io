import { NPCsBooleanList } from "./boolean-list.js";
export class NPCsConditionTypes extends NPCsBooleanList {
    constructor(data) {
        super();
        this.blinded = false;
        this.charmed = false;
        this.deafened = false;
        this.frightened = false;
        this.grappled = false;
        this.incapacitated = false;
        this.paralyzed = false;
        this.petrified = false;
        this.poisoned = false;
        this.stunned = false;
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
    clone() {
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
    mergeWith(that) {
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
}
NPCsConditionTypes.list = new NPCsConditionTypes();
//# sourceMappingURL=condition-types.js.map