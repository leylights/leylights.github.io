import { NPCsDice } from "../npcs/helper-repository/general.js";
export class SummonsCreature {
    constructor(data) {
        this._HP_DICE = [];
        this.DAMAGE_DICE = [];
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
    get name() {
        return this._NAME.toUpperCase();
    }
    rollAttack() {
        const roll = SummonsCreature.D20.roll();
        return {
            result: roll + this.ATTACK_MODIFIER,
            isCritical: roll === 20,
        };
    }
    rollDamage() {
        return this.rollDice(this.DAMAGE_DICE) + this.DAMAGE_MODIFIER;
    }
    rollDice(set) {
        return set.reduce((previousValue, currentValue) => {
            return previousValue + currentValue.roll();
        }, 0);
    }
}
SummonsCreature.D20 = new NPCsDice('1d20');
//# sourceMappingURL=creature.js.map