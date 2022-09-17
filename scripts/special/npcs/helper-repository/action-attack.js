import { Molasses } from "../../../molasses.js";
import { NPCsAction } from "./action.js";
import { DEX, NPCsDice, NPCsHelper, STR } from "./general.js";
export class NPCsAttack extends NPCsAction {
    constructor(data) {
        super({
            name: data.name,
            body: 'Error: Use NPCsActionAttack.getHTML() instead',
        });
        this.additionalHitDice = [];
        this.additionalEndText = "";
        this.addEndText = function (endText) {
            this.additionalEndText = endText;
            return this;
        };
        this.getAttacksListHTML = function (data) {
            let baseHitDice = this.hitDice;
            if (data) {
                // BRUTE ATTRIBUTE: Increase every melee attack's hit dice by one
                let bruteFilter = data.attributes.filter((attr) => {
                    return attr.name.toLowerCase() === 'brute';
                });
                let furyFilter = data.attributes.filter((attr) => {
                    return attr.name.toLowerCase() === 'fury';
                });
                if (this.attackType === 'Melee' && bruteFilter.length > 0) {
                    baseHitDice = this.hitDice.clone();
                    baseHitDice.amount++;
                }
                if (furyFilter.length > 0) {
                    this.additionalHitDice.push(new NPCsDice('1d8'));
                }
            }
            let base = `ATTACK_${baseHitDice.print()}_${NPCsHelper.abilityToStr(this.ability, false)}`;
            if (this.additionalHitDice.length > 0) {
                this.additionalHitDice.forEach((die) => {
                    base += ` + ATTACK_${die.print()}_NUL`;
                });
            }
            return base;
        };
        this.makeVersatile = function (twoHandedHitDice) {
            this.versatileDice = twoHandedHitDice.clone();
            this.addEndText(`, or ATTACK_${this.versatileDice.print()}_${NPCsHelper.abilityToStr(this.ability, false)} ${this.damageType} damage if used with both hands.`);
            return this;
        };
        this.toggleFinesse = function () {
            if (!this.finesse)
                throw new Error(this.name + ' is not finesse');
            if (this.ability === STR)
                this.ability = DEX;
            else
                this.ability = STR;
            return this;
        };
        this.reach = data.reach || null;
        this._range = data.range || null;
        this.longRange = data.longRange || null;
        this.ability = data.ability;
        this.targetCount = data.targetCount;
        this.hitDice = data.hitDice;
        this.attackType = data.attackType;
        this.damageType = data.damageType;
        this.finesse = data.finesse || false;
        this.special = data.special || false;
        this.light = data.light || false;
        this.heavy = data.heavy || false;
        this.twoHanded = data.twoHanded || false;
        this.thrown = data.thrown || false;
        if (data.versatileDice)
            this.makeVersatile(data.versatileDice);
        if (data.additionalEndText)
            this.addEndText(data.additionalEndText);
    }
    get isVersatile() {
        return !!this.versatileDice;
    }
    get range() {
        return this._range;
    }
    set range(n) {
        let rangeMod = this.longRange / this.range;
        this.range = n;
        this.longRange = n * rangeMod;
    }
    clone() {
        return new NPCsAttack({
            name: this.name,
            ability: this.ability,
            damageType: this.damageType,
            hitDice: this.hitDice.clone(),
            targetCount: this.targetCount,
            reach: this.reach,
            range: this.range,
            longRange: this.longRange,
            attackType: this.attackType,
            finesse: this.finesse,
            special: this.special,
            light: this.light,
            heavy: this.heavy,
            twoHanded: this.twoHanded,
            versatileDice: this.versatileDice ? this.versatileDice.clone() : null,
            thrown: this.thrown,
            additionalEndText: this.additionalEndText,
        });
    }
    getHTMLRangeOrReach() {
        switch (this.attackType) {
            case 'Melee':
                return `reach ${this.reach} ft.`;
            case 'Ranged':
                return `range ${this.range}/${this.longRange} ft.`;
            case 'Mixed':
                return `reach ${this.reach} ft. and range ${this.range}/${this.longRange} ft.`;
        }
    }
    getHTML(data) {
        let attackType = this.attackType == 'Mixed' ? 'Melee or Ranged' : this.attackType;
        return `<i>${attackType} Weapon Attack:</i> ${NPCsHelper.abilityToStr(this.ability, false)}_WITH_PROF to hit, 
    ${this.getHTMLRangeOrReach()}, ${Molasses.numberToString(this.targetCount)} target. <i>Hit:</i> ${this.getAttacksListHTML(data)} ${this.damageType} damage${this.additionalEndText || '.'}`;
    }
}
//# sourceMappingURL=action-attack.js.map