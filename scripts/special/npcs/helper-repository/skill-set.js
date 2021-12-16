import { STR, DEX, INT, WIS, CHA } from "./general.js";
export class NPCsSkill {
    constructor(data) {
        this.name = data.name;
        this.ability = data.ability;
        this.isSkillPossessed = data.isSkillPossessed || false;
        this.expertise = data.expertise || false;
    }
    clone() {
        return new NPCsSkill({
            name: this.name,
            ability: this.ability,
            isSkillPossessed: this.isSkillPossessed,
            expertise: this.expertise
        });
    }
}
export class NPCsSkillset {
    constructor(skills) {
        this.acrobatics = new NPCsSkill({
            name: "Acrobatics",
            ability: DEX,
        });
        this.animalHandling = new NPCsSkill({
            name: "Animal Handling",
            ability: WIS
        });
        this.arcana = new NPCsSkill({
            name: "Arcana",
            ability: INT,
        });
        this.athletics = new NPCsSkill({
            name: "Athletics",
            ability: STR,
        });
        this.deception = new NPCsSkill({
            name: "Deception",
            ability: CHA,
        });
        this.history = new NPCsSkill({
            name: "History",
            ability: INT,
        });
        this.insight = new NPCsSkill({
            name: "Insight",
            ability: WIS,
        });
        this.intimidation = new NPCsSkill({
            name: "Intimidation",
            ability: CHA,
        });
        this.investigation = new NPCsSkill({
            name: "Investigation",
            ability: INT,
        });
        this.medicine = new NPCsSkill({
            name: "Medicine",
            ability: WIS,
        });
        this.nature = new NPCsSkill({
            name: "Nature",
            ability: INT,
        });
        this.perception = new NPCsSkill({
            name: "Perception",
            ability: WIS,
        });
        this.performance = new NPCsSkill({
            name: "Performance",
            ability: CHA,
        });
        this.persuasion = new NPCsSkill({
            name: "Persuasion",
            ability: CHA,
        });
        this.religion = new NPCsSkill({
            name: "Religion",
            ability: INT,
        });
        this.sleightOfHand = new NPCsSkill({
            name: "Sleight of Hand",
            ability: DEX,
        });
        this.survival = new NPCsSkill({
            name: "Survival",
            ability: WIS,
        });
        this.stealth = new NPCsSkill({
            name: "Stealth",
            ability: DEX,
        });
        if (!skills)
            return;
        skills.forEach((skill) => {
            this.addSkill(skill);
        });
    }
    get hasAnySkills() {
        return this.filter((skill) => {
            return skill.isSkillPossessed;
        }).length > 0;
    }
    /**
     * Updates the skillset
     */
    addSkill(skill) {
        let createdSkill = new NPCsSkill({
            name: skill.name,
            expertise: skill.expertise,
            ability: this.getSkillByName(skill.name).ability,
            isSkillPossessed: true,
        });
        // @ts-ignore
        this[this.getSkillPropertyByName(skill.name)] = createdSkill;
    }
    clone() {
        let skillKeys = Object.keys(NPCsSkillset.nullSkillList);
        let clone = new NPCsSkillset();
        skillKeys.forEach((key) => {
            let thisSkill = this[key];
            // @ts-ignore
            clone[key] = new NPCsSkill({
                name: thisSkill.name,
                expertise: thisSkill.expertise,
                ability: thisSkill.ability,
                isSkillPossessed: thisSkill.isSkillPossessed
            });
        });
        return clone;
    }
    /**
     * Returns a skill by the given name.  Throws an error if the name is wrong
     */
    getSkillByName(name) {
        const attributes = Object.keys(this);
        for (const attribute of attributes) {
            if (this[attribute] instanceof NPCsSkill) {
                if (this[attribute].name.toLowerCase() === name.toLowerCase()) {
                    return this[attribute];
                }
            }
        }
        throw new Error("Skill not found: '" + name + "'");
    }
    getSkillPropertyByName(name) {
        const skill = this.getSkillByName(name);
        const skillPropertyNames = Object.keys(NPCsSkillset.nullSkillList);
        for (let i = 0; i < skillPropertyNames.length; i++) {
            if (NPCsSkillset.baseSkillset[skillPropertyNames[i]].name === skill.name)
                return skillPropertyNames[i];
        }
        throw new Error(`No such skill found: ${name}`);
    }
    mergeWith(that) {
        let skillKeys = Object.keys(NPCsSkillset.nullSkillList);
        let mergedSet = new NPCsSkillset();
        skillKeys.forEach((key) => {
            let thisSkill = this[key];
            let thatSkill = that[key];
            // @ts-ignore
            mergedSet[key] = new NPCsSkill({
                name: thisSkill.name,
                expertise: thisSkill.expertise || thatSkill.expertise,
                ability: thisSkill.ability,
                isSkillPossessed: thisSkill.isSkillPossessed || thatSkill.isSkillPossessed
            });
        });
        return mergedSet;
    }
    /**
     * Safe?: yes
     * Idempotent?: yes
     */
    filter(filterFunction) {
        let output = [];
        let keys = Object.keys(NPCsSkillset.nullSkillList);
        keys.forEach((key) => {
            if (filterFunction(this[key]))
                output.push(this[key].clone());
        });
        return output;
    }
    map(mapFunction) {
        let output = [];
        let keys = Object.keys(NPCsSkillset.nullSkillList);
        keys.forEach((key) => {
            output.push(mapFunction(this[key]));
        });
        return output;
    }
    /**
     * Allows skills to be easily created
     */
    static giveSkills(skills) {
        let creationData = [];
        skills.forEach((skill) => {
            const correspondingSkill = NPCsSkillset.baseSkillset.getSkillByName(skill.name);
            creationData.push({
                name: correspondingSkill.name,
                expertise: skill.expertise || false,
                ability: correspondingSkill.ability,
                isSkillPossessed: true,
            });
        });
        return creationData;
    }
}
NPCsSkillset.baseSkillset = new NPCsSkillset();
NPCsSkillset.nullSkillList = {
    acrobatics: null,
    animalHandling: null,
    arcana: null,
    athletics: null,
    deception: null,
    history: null,
    insight: null,
    intimidation: null,
    investigation: null,
    medicine: null,
    nature: null,
    perception: null,
    performance: null,
    persuasion: null,
    religion: null,
    sleightOfHand: null,
    survival: null,
    stealth: null,
};
//# sourceMappingURL=skill-set.js.map