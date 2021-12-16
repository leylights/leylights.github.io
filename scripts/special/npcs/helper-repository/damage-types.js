import { NPCsBooleanList } from "./boolean-list.js";
export class NPCsDamageTypes extends NPCsBooleanList {
    constructor(data) {
        super();
        this.bludgeoning = false;
        this.piercing = false;
        this.slashing = false;
        this.acid = false;
        this.cold = false;
        this.fire = false;
        this.force = false;
        this.lightning = false;
        this.necrotic = false;
        this.poison = false;
        this.psychic = false;
        this.radiant = false;
        this.thunder = false;
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
    clone() {
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
}
NPCsDamageTypes.physicalDamageTypes = {
    bludgeoning: false,
    piercing: false,
    slashing: false,
};
NPCsDamageTypes.elementalDamageTypes = {
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
};
NPCsDamageTypes.list = new NPCsDamageTypes();
//# sourceMappingURL=damage-types.js.map