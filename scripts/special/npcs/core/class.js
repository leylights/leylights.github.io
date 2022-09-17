import { Molasses } from "../../../molasses.js";
import { NPCsArmour } from "../helper-repository/armour.js";
import { NPCsAttribute } from "../helper-repository/attribute.js";
import { NPCsConditionTypes } from "../helper-repository/condition-types.js";
import { CHA, NPCsDice, WIS } from "../helper-repository/general.js";
import { NPCsSkillset } from "../helper-repository/skill-set.js";
import { NPCsSpellcasterData } from "../helper-repository/spellcaster-data.js";
import { NPCsInventory } from "../helper-repository/inventory.js";
import { NPCsSpell } from "../helper-repository/spell.js";
export class NPCsClass {
    constructor(data) {
        this.name = data.name;
        this.armour = data.armour;
        this.hitDice = data.hitDice;
        this.abilities = data.abilities;
        this.saves = data.saves;
        this.CR = data.CR;
        this.conditionResistances = data.conditionResistances || new NPCsConditionTypes();
        this.attributes = data.attributes;
        this.actions = data.actions;
        this.reactions = data.reactions;
        this.skills = new NPCsSkillset(data.skillsData);
        this.spells = data.spells;
    }
    static getClassByName(name) {
        const result = Molasses.Object.values(NPCsClass.list).filter((c) => {
            return c.name.toLowerCase() === name.toLowerCase();
        });
        if (result.length === 1)
            return result[0];
        else
            throw new Error('No such class found: ' + name);
    }
    static getRandomClass() {
        let options = Molasses.Object.values(NPCsClass.list);
        return Molasses.Array.get.randomElement(options);
    }
}
NPCsClass.list = {
    acolyte: new NPCsClass({
        name: 'Acolyte',
        armour: NPCsArmour.list.unarmoured,
        hitDice: new NPCsDice('2d8'),
        abilities: [10, 10, 10, 10, 14, 11],
        saves: [false, false, false, false, false, false],
        skillsData: NPCsSkillset.giveSkills([
            {
                name: "medicine"
            },
            {
                name: "religion",
            },
        ]),
        CR: 0.25,
        conditionResistances: null,
        attributes: [
            NPCsAttribute.list.spellcasting
        ],
        actions: [
            NPCsInventory.actionsList.attacks.melee.club,
        ],
        reactions: [],
        spells: new NPCsSpellcasterData({
            spellList: [
                NPCsSpell.list[0].light,
                NPCsSpell.list[0].sacredFlame,
                NPCsSpell.list[0].thaumaturgy,
                NPCsSpell.list[1].bless,
                NPCsSpell.list[1].cureWounds,
                NPCsSpell.list[1].sanctuary,
            ],
            spellcastingAbility: WIS,
            spellcastingLevel: 1,
        })
    }),
    archer: new NPCsClass({
        name: 'Archer',
        armour: NPCsArmour.list.studdedLeather,
        hitDice: new NPCsDice('10d8'),
        abilities: [11, 18, 16, 11, 13, 10],
        saves: [false, false, false, false, false, false],
        skillsData: NPCsSkillset.giveSkills([
            {
                name: "acrobatics"
            },
            {
                name: "perception",
                expertise: true
            },
        ]),
        CR: 3.2,
        conditionResistances: null,
        attributes: [NPCsAttribute.list.archersEye],
        actions: [
            NPCsInventory.actionsList.misc.multiattackRangedTwo,
            NPCsInventory.actionsList.attacks.ranged.longbow,
            NPCsInventory.actionsList.attacks.melee.shortsword.toggleFinesse(),
        ],
        reactions: []
    }),
    bandit: new NPCsClass({
        name: 'Bandit',
        armour: NPCsArmour.list.leather,
        hitDice: new NPCsDice('2d8'),
        abilities: [11, 12, 12, 10, 10, 10],
        saves: [false, false, false, false, false, false],
        skillsData: [],
        CR: 0.125,
        conditionResistances: null,
        attributes: [],
        actions: [
            NPCsInventory.actionsList.attacks.melee.scimitar,
            NPCsInventory.actionsList.attacks.ranged.lightCrossbow,
        ],
        reactions: []
    }),
    beserker: new NPCsClass({
        name: 'Beserker',
        armour: NPCsArmour.list.hide,
        hitDice: new NPCsDice('9d8'),
        abilities: [16, 12, 17, 9, 11, 9],
        saves: [false, false, false, false, false, false],
        skillsData: [],
        CR: 2.2,
        conditionResistances: null,
        attributes: [NPCsAttribute.list.reckless],
        actions: [
            NPCsInventory.actionsList.attacks.melee.greataxe,
        ],
        reactions: []
    }),
    blackguard: new NPCsClass({
        name: 'Blackguard',
        armour: NPCsArmour.list.plate,
        hitDice: new NPCsDice('18d8'),
        abilities: [18, 11, 18, 11, 14, 15],
        saves: [false, false, false, false, true, true],
        skillsData: [{
                name: 'Athletics'
            }, {
                name: 'Deception'
            }, {
                name: 'Intimidation'
            },],
        CR: 8,
        conditionResistances: null,
        attributes: [NPCsAttribute.list.spellcasting],
        spells: new NPCsSpellcasterData({
            spellList: [
                NPCsSpell.list[1].command,
                NPCsSpell.list[1].protectionFromEvilAndGood,
                NPCsSpell.list[1].thunderousSmite,
                NPCsSpell.list[2].brandingSmite,
                NPCsSpell.list[2].findSteed,
                NPCsSpell.list[3].blindingSmite,
                NPCsSpell.list[3].dispelMagic,
            ],
            spellcastingAbility: CHA,
            spellcastingLevel: 10,
        }),
        actions: [
            NPCsInventory.actionsList.misc.multiattackMeleeThreeOrRangedThree,
            NPCsInventory.actionsList.attacks.melee.glaive,
            NPCsInventory.actionsList.attacks.ranged.shortbow,
            NPCsInventory.actionsList.misc.dreadfulAspect,
        ],
        reactions: []
    }),
    brute: new NPCsClass({
        name: 'Brute',
        armour: NPCsArmour.list.studdedLeather,
        hitDice: new NPCsDice('5d8'),
        abilities: [15, 14, 13, 8, 11, 9],
        saves: [false, false, false, false, false, false],
        skillsData: NPCsSkillset.giveSkills([
            {
                name: "athletics"
            },
            {
                name: "survival",
            },
        ]),
        CR: 1.3,
        conditionResistances: null,
        attributes: [NPCsAttribute.list.brute, NPCsAttribute.list.martialAdvantage],
        actions: [
            NPCsInventory.actionsList.attacks.melee.morningstar,
            NPCsInventory.actionsList.attacks.mixed.javelin,
        ],
        reactions: []
    }),
    captain: new NPCsClass({
        name: 'Captain',
        armour: NPCsArmour.list.halfPlate,
        hitDice: new NPCsDice('6d8'),
        abilities: [15, 14, 14, 12, 10, 13],
        saves: [false, false, false, false, false, false],
        skillsData: [],
        CR: 3.3,
        conditionResistances: null,
        attributes: [NPCsAttribute.list.martialAdvantage],
        actions: [
            NPCsInventory.actionsList.misc.multiattackMeleeTwo,
            NPCsInventory.actionsList.attacks.melee.greatsword,
            NPCsInventory.actionsList.attacks.mixed.javelin,
            NPCsInventory.actionsList.misc.leadership,
        ],
        reactions: []
    }),
    fanatic: new NPCsClass({
        name: 'Fanatic',
        armour: NPCsArmour.list.leather,
        hitDice: new NPCsDice('6d8'),
        abilities: [11, 14, 12, 10, 13, 14],
        saves: [false, false, false, false, false, false],
        skillsData: [
            {
                name: 'Deception'
            },
            {
                name: 'Persuasion'
            },
            {
                name: 'Religion'
            },
        ],
        CR: 2,
        conditionResistances: new NPCsConditionTypes({
            charmed: true,
            frightened: true
        }),
        attributes: [
            NPCsAttribute.list.spellcasting,
        ],
        actions: [
            NPCsInventory.actionsList.misc.multiattackMeleeTwo,
            NPCsInventory.actionsList.attacks.mixed.dagger.toggleFinesse(),
        ],
        spells: new NPCsSpellcasterData({
            spellList: [
                NPCsSpell.list[0].light,
                NPCsSpell.list[0].sacredFlame,
                NPCsSpell.list[0].thaumaturgy,
                NPCsSpell.list[1].command,
                NPCsSpell.list[1].inflictWounds,
                NPCsSpell.list[1].shieldOfFaith,
                NPCsSpell.list[2].holdPerson,
                NPCsSpell.list[2].spiritualWeapon,
            ],
            spellcastingAbility: WIS,
            spellcastingLevel: 4,
        }),
        reactions: []
    }),
    gladiator: new NPCsClass({
        name: 'Gladiator',
        armour: NPCsArmour.list.studdedLeather,
        hitDice: new NPCsDice('15d8'),
        abilities: [18, 15, 16, 10, 12, 15],
        saves: [true, true, true, false, false, false],
        skillsData: NPCsSkillset.giveSkills([
            {
                name: "athletics",
                expertise: true
            },
            {
                name: "intimidation",
            },
        ]),
        CR: 5.2,
        conditionResistances: new NPCsConditionTypes({ frightened: true }),
        attributes: [NPCsAttribute.list.brute],
        actions: [
            NPCsInventory.actionsList.misc.multiattackMeleeThreeOrRangedTwo,
            NPCsInventory.actionsList.attacks.mixed.spear,
            NPCsInventory.actionsList.attacks.melee.shieldBash,
        ],
        reactions: [
            NPCsInventory.actionsList.reactions.parry,
        ]
    }),
    knight: new NPCsClass({
        name: 'Knight',
        armour: NPCsArmour.list.plate,
        hitDice: new NPCsDice('8d8'),
        abilities: [16, 11, 14, 11, 11, 15],
        saves: [false, false, true, false, true, false],
        skillsData: [],
        CR: 3.3,
        conditionResistances: new NPCsConditionTypes({ frightened: true }),
        attributes: [],
        actions: [
            NPCsInventory.actionsList.misc.multiattackMeleeTwo,
            NPCsInventory.actionsList.attacks.melee.greatsword,
            NPCsInventory.actionsList.attacks.ranged.heavyCrossbow,
            NPCsInventory.actionsList.misc.leadership,
        ],
        reactions: [
            NPCsInventory.actionsList.reactions.parry,
        ]
    }),
    masterThief: new NPCsClass({
        name: 'Master Thief',
        armour: NPCsArmour.list.studdedLeather,
        hitDice: new NPCsDice('13d8'),
        abilities: [11, 18, 14, 11, 11, 12],
        saves: [false, true, false, true, false, false],
        skillsData: [{
                name: 'Acrobatics',
            }, {
                name: 'Athletics',
            }, {
                name: 'Perception',
            }, {
                name: 'Sleight of Hand',
            }, {
                name: 'Stealth',
            }],
        CR: 5,
        conditionResistances: null,
        attributes: [
            NPCsAttribute.list.cunningAction,
            NPCsAttribute.list.evasion,
            NPCsAttribute.list.sneakAttack,
        ],
        actions: [
            NPCsInventory.actionsList.misc.multiattackMeleeThree,
            NPCsInventory.actionsList.attacks.melee.shortsword.toggleFinesse(),
            NPCsInventory.actionsList.attacks.ranged.lightCrossbow,
        ],
        reactions: [
            NPCsInventory.actionsList.reactions.uncannyDodge,
        ]
    }),
    veteran: new NPCsClass({
        name: 'Veteran',
        armour: NPCsArmour.list.splint,
        hitDice: new NPCsDice('9d8'),
        abilities: [16, 13, 14, 10, 11, 10],
        saves: [false, false, false, false, false, false],
        skillsData: NPCsSkillset.giveSkills([
            {
                name: "athletics",
            },
            {
                name: "perception",
            },
        ]),
        CR: 3.3,
        conditionResistances: null,
        attributes: [],
        actions: [
            NPCsInventory.actionsList.misc.multiattackMeleeTwo,
            NPCsInventory.actionsList.attacks.melee.longsword,
            NPCsInventory.actionsList.attacks.melee.shortsword,
            NPCsInventory.actionsList.attacks.ranged.heavyCrossbow,
        ],
        reactions: []
    }),
    warchief: new NPCsClass({
        name: 'Warchief',
        armour: NPCsArmour.list.chainMail,
        hitDice: new NPCsDice('11d8'),
        abilities: [18, 12, 18, 11, 11, 16],
        saves: [true, false, true, false, true, false],
        skillsData: NPCsSkillset.giveSkills([
            {
                name: "intimidation",
            },
        ]),
        CR: 4,
        conditionResistances: null,
        attributes: [
            NPCsAttribute.list.aggressive,
            NPCsAttribute.list.fury, // https://www.aidedd.org/dnd/monstres.php?vf=orque-chef-de-guerre furie de gruumsh
        ],
        actions: [
            NPCsInventory.actionsList.misc.multiattackMeleeTwo,
            NPCsInventory.actionsList.attacks.melee.greataxe,
            NPCsInventory.actionsList.attacks.melee.lance,
            NPCsInventory.actionsList.misc.warcry,
        ],
        reactions: []
    }),
    thug: new NPCsClass({
        name: 'Thug',
        armour: NPCsArmour.list.leather,
        hitDice: new NPCsDice('5d8'),
        abilities: [15, 11, 14, 10, 10, 11],
        saves: [false, false, false, false, false, false],
        skillsData: NPCsSkillset.giveSkills([
            {
                name: "intimidation",
            },
        ]),
        CR: 0.5,
        conditionResistances: null,
        attributes: [],
        actions: [
            NPCsInventory.actionsList.misc.multiattackMeleeTwo,
            NPCsInventory.actionsList.attacks.melee.mace,
            NPCsInventory.actionsList.attacks.ranged.heavyCrossbow,
        ],
        reactions: []
    }),
};
//# sourceMappingURL=class.js.map