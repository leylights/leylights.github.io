import { NPCsAttack } from "./action-attack.js";
export class NPCsAttackRanged extends NPCsAttack {
    constructor(data) {
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
    clone() {
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
    getProperties() {
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
//# sourceMappingURL=action-attack-ranged.js.map