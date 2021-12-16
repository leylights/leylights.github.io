export const STR = 0;
export const DEX = 1;
export const CON = 2;
export const INT = 3;
export const WIS = 4;
export const CHA = 5;
export const NPCsLanguages = [
    "Common",
    "Dwarvish",
    "Elvish",
    "Giant",
    "Gnomish",
    "Goblin",
    "Halfling",
    "Orc",
];
export class NPCsDice {
    constructor(diceStr) {
        this.clone = function () {
            return new NPCsDice(this.amount + 'd' + this.value);
        };
        this.roll = function () {
            let sum = 0;
            for (let i = 0; i < this.amount; i++) {
                sum += Math.ceil(Math.random() * this.value);
            }
            return sum;
        };
        /**
         * @returns 1d6, 4d4, etc.
         */
        this.print = function () {
            if (this.amount * this.value === 1)
                return '1';
            else
                return `${this.amount}d${this.value}`;
        };
        this.amount = parseInt(diceStr);
        this.value = parseInt(diceStr.substring((this.amount + "").length + 1));
        if (!NPCsDice.isValidDiceString(diceStr) || isNaN(this.amount) || isNaN(this.value))
            throw new Error('Bad dice given: ' + diceStr);
    }
    get average() {
        return Math.floor(this.amount * this.value / 2) + 1;
    }
    static isValidDiceString(s) {
        if (s.length < 3) // too short
            return false;
        if (s.search(/([^0-9d])/) !== -1) // bad characters in string
            return false;
        const dMatches = s.match(/[dD]/g);
        if (!dMatches)
            return false; // no d (e.g. 45)
        if (dMatches.length > 1) // too many d's in dice (e.g. 1d4d6)
            return false;
        if (s.charAt(0).toLowerCase() === 'd') // bad d location (e.g. d4)
            return false;
        if (s.charAt(s.length - 1).toLowerCase() === 'd') // d ends the string (e.g. 12d)
            return false;
        return true;
    }
}
export class NPCsHelper {
    static abilityToStr(ability, fullWords) {
        switch (ability) {
            case 0:
                return fullWords ? 'Strength' : 'STR';
            case 1:
                return fullWords ? 'Dexterity' : 'DEX';
            case 2:
                return fullWords ? 'Constitution' : 'CON';
            case 3:
                return fullWords ? 'Intelligence' : 'INT';
            case 4:
                return fullWords ? 'Wisdom' : 'WIS';
            case 5:
                return fullWords ? 'Charisma' : 'CHA';
        }
    }
    static strToAbility(str) {
        for (let i = 0; i < 6; i++) {
            if (str.toLowerCase() === NPCsAbilityShortNames[i].toLowerCase())
                return i;
            else if (str.toLowerCase() === NPCsAbilityFullNames[i].toLowerCase())
                return i;
        }
        if (str === 'NUL') {
            return -1;
        }
        throw new Error("Cannot convert to NPCsAbility: " + str);
    }
    /**
     * @example getModifier(13) => '+1'
     * @example getModifier(10) => '+0'
     * @example getModifier(1) => '-5'
     */
    static getScoreModifier(n) {
        return NPCsHelper.getFormattedModifier(Math.floor((n - 10) / 2));
    }
    /**
     * @example getModifier(13) => '+13'
     * @example getModifier(10) => '+10'
     * @example getModifier(-3) => '-3'
     */
    static getFormattedModifier(n) {
        const prefix = n >= 0 ? '+' : '-';
        const value = Math.abs(n);
        return prefix + value;
    }
}
export const NPCsAbilityShortNames = [0, 1, 2, 3, 4, 5].map((n) => {
    return NPCsHelper.abilityToStr(n, false);
});
export const NPCsAbilityFullNames = [0, 1, 2, 3, 4, 5].map((n) => {
    return NPCsHelper.abilityToStr(n, true);
});
//# sourceMappingURL=general.js.map