import { cws } from "../../../cws.js";
import { NPCsAttackMelee } from "./action-attack-melee.js";
import { NPCsAttackMixed } from "./action-attack-mixed.js";
import { NPCsAttackRanged } from "./action-attack-ranged.js";
import { NPCsAttack } from "./action-attack.js";
import { NPCsReaction } from "./action-reaction.js";
import { NPCsAction } from "./action.js";
import { DEX, NPCsDice, STR } from "./general.js";

export class NPCsInventory {
  static getActionByUniqueName(name: string) {
    const miscActions: NPCsAction[] = cws.Object.values(NPCsInventory.actionsList.misc);
    const meleeAttacks: NPCsAttackMelee[] = cws.Object.values(NPCsInventory.actionsList.attacks.melee);
    const rangedAttacks: NPCsAttackRanged[] = cws.Object.values(NPCsInventory.actionsList.attacks.ranged);
    const mixedAttacks: NPCsAttackMixed[] = cws.Object.values(NPCsInventory.actionsList.attacks.mixed);
    const reactions: NPCsReaction[] = cws.Object.values(NPCsInventory.actionsList.reactions);

    const result = [
      findOneOrFail(miscActions),
      findOneOrFail(meleeAttacks),
      findOneOrFail(rangedAttacks),
      findOneOrFail(mixedAttacks),
      findOneOrFail(reactions),
    ].filter((a: NPCsAction | -1) => {
      return a !== -1;
    })[0];

    return result;

    function findOneOrFail(array: NPCsAction[]): NPCsAction | -1 {
      for (let i = 0; i < array.length; i++) {
        if (array[i].uniqueName === name)
          return array[i];
      }

      return -1;
    }
  }

  static getAttackByName(name: string): NPCsAttack {
    const attacks = cws.Object.values(NPCsInventory.actionsList.attacks.melee)
      .concat(cws.Object.values(NPCsInventory.actionsList.attacks.mixed))
      .concat(cws.Object.values(NPCsInventory.actionsList.attacks.ranged));

    const result = attacks.filter((attack: NPCsAttack) => {
      return attack.name === name;
    });

    if (result.length === 0)
      throw new Error(`Weapon not found: ${name}`);
    else return result[0];
  }

  static actionsList = {
    misc: {
      dreadfulAspect: new NPCsAction({
        name: "Dreadful Aspect",
        subtitle: "Recharges after a Short or Long Rest",
        body: `NAME emanates an aura of menace.  Each enemy within 30 feet of NAME that can see NAME
        must make a DC CLASS_SPELL_SAVE_DC Wisdom saving throw.  On a failed save, the target is
        frightened of NAME for 1 minute. If a creature frightened by this effect ends its turn more than
        30 feet away from NAME, it can attempt another Wisdom saving throw to
        end the effect on it.`
      }),
      leadership: new NPCsAction({
        name: "Leadership",
        subtitle: "Recharges after a Short or Long Rest",
        body: `For 1 minute, NAME can utter a special command or warning whenever a nonhostile creature
       that they can see within 30 feet of it makes an attack roll or a saving throw. 
       The creature can add a d4 to its roll provided it can hear and understand NAME. 
       A creature can benefit from only one Leadership die at a time. This effect ends if NAME is incapacitated.`
      }),
      multiattackMeleeTwo: new NPCsAction({
        name: "Multiattack",
        uniqueName: 'Multiattack (Melee 2)',
        body: `NAME makes two melee attacks.`
      }),
      multiattackMeleeThree: new NPCsAction({
        name: "Multiattack",
        uniqueName: 'Multiattack (Melee 3)',
        body: `NAME makes three melee attacks.`
      }),
      multiattackMeleeThreeOrRangedTwo: new NPCsAction({
        name: "Multiattack",
        uniqueName: 'Multiattack (Melee 3 or Ranged 2)',
        body: `NAME makes three melee attacks or two ranged attacks.`
      }),
      multiattackMeleeThreeOrRangedThree: new NPCsAction({
        name: "Multiattack",
        uniqueName: 'Multiattack (Melee 3 or Ranged 3)',
        body: `NAME makes three melee attacks or three ranged attacks.`
      }),
      multiattackRangedTwo: new NPCsAction({
        name: "Multiattack",
        uniqueName: 'Multiattack (Ranged 2)',
        body: `NAME makes two ranged attacks.`
      }),
      warcry: new NPCsAction({
        name: "War Cry",
        subtitle: '1/day',
        body: `Each creature NAME chooses within 30ft. of them, who can hear NAME,
        and who is not already under the effect of War Cry, gains advantage on all attack rolls
        until the start of NAME's next turn. NAME can immediately attack as a bonus action`
      }),
    },
    attacks: {
      melee: {
        battleaxe: new NPCsAttackMelee({
          name: "Battleaxe",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d8'),
          damageType: 'slashing',
          versatileDice: new NPCsDice('1d10')
        }),
        club: new NPCsAttackMelee({
          name: "Club",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d4'),
          damageType: 'bludgeoning',
          light: true,
        }),
        flail: new NPCsAttackMelee({
          name: "Flail",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d8'),
          damageType: 'bludgeoning',
        }),
        glaive: new NPCsAttackMelee({
          name: "Glaive",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d10'),
          damageType: 'slashing',
          heavy: true,
          reach: true,
          twoHanded: true,
        }),
        greatclub: new NPCsAttackMelee({
          name: "Greatclub",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d8'),
          damageType: 'bludgeoning',
          twoHanded: true,
        }),
        greataxe: new NPCsAttackMelee({
          name: "Greataxe",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d12'),
          damageType: 'slashing',
          heavy: true,
          twoHanded: true,
        }),
        greatsword: new NPCsAttackMelee({
          name: "Greatsword",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('2d6'),
          damageType: 'slashing',
          heavy: true,
          twoHanded: true,
        }),
        halberd: new NPCsAttackMelee({
          name: "Halberd",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d10'),
          damageType: 'slashing',
          heavy: true,
          twoHanded: true,
          reach: true,
        }),
        lance: new NPCsAttackMelee({
          name: "Lance",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d12'),
          damageType: 'piercing',
          reach: true,
          special: true,
        }),
        longsword: new NPCsAttackMelee({
          name: "Longsword",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d8'),
          damageType: 'slashing',
          versatileDice: new NPCsDice('1d10'),
        }),
        mace: new NPCsAttackMelee({
          name: "Mace",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d6'),
          damageType: 'bludgeoning'
        }),
        maul: new NPCsAttackMelee({
          name: "Maul",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('2d6'),
          damageType: 'bludgeoning',
          heavy: true,
          twoHanded: true,
        }),
        morningstar: new NPCsAttackMelee({
          name: "Morningstar",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d8'),
          damageType: 'piercing'
        }),
        pike: new NPCsAttackMelee({
          name: "Pike",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d10'),
          damageType: 'piercing',
          heavy: true,
          reach: true,
          twoHanded: true,
        }),
        quarterstaff: new NPCsAttackMelee({
          name: "Quarterstaff",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d6'),
          damageType: 'bludgeoning',
          versatileDice: new NPCsDice('1d8'),
        }),
        rapier: new NPCsAttackMelee({
          name: "Rapier",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d8'),
          damageType: 'piercing',
          finesse: true,
        }),
        scimitar: new NPCsAttackMelee({
          name: "Scimitar",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d6'),
          damageType: 'slashing',
          finesse: true,
          light: true,
        }),
        shortsword: new NPCsAttackMelee({
          name: "Shortsword",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d6'),
          damageType: 'piercing',
          finesse: true,
          light: true,
        }),
        sickle: new NPCsAttackMelee({
          name: "Sickle",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d4'),
          damageType: 'slashing',
          light: true,
        }),
        shieldBash: new NPCsAttackMelee({
          name: "Shield bash",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d4'),
          damageType: 'bludgeoning',
          additionalEndText: '. If the target is a Medium or smaller creature, it must succeed on a DC FILL_DC_STR saving throw or be knocked prone',
        }),
        warPick: new NPCsAttackMelee({
          name: "War pick",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d8'),
          damageType: 'piercing',
        }),
        warhammer: new NPCsAttackMelee({
          name: "Warhammer",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d8'),
          damageType: 'bludgeoning',
          versatileDice: new NPCsDice('1d10'),
        }),
        whip: new NPCsAttackMelee({
          name: "Whip",
          ability: STR,
          targetCount: 1,
          hitDice: new NPCsDice('1d4'),
          damageType: 'slashing',
          finesse: true,
          reach: true,
        }),
      },
      mixed: {
        dagger: new NPCsAttackMixed({
          name: "Dagger",
          ability: STR,
          targetCount: 1,
          range: 20,
          longRange: 60,
          hitDice: new NPCsDice('1d4'),
          damageType: 'piercing',
          finesse: true,
          light: true,
          thrown: true,
          category: 'Melee',
        }),
        handaxe: new NPCsAttackMixed({
          name: "Handaxe",
          ability: STR,
          targetCount: 1,
          range: 20,
          longRange: 60,
          hitDice: new NPCsDice('1d6'),
          damageType: 'slashing',
          light: true,
          thrown: true,
          category: 'Melee',
        }),
        javelin: new NPCsAttackMixed({
          name: "Javelin",
          ability: STR,
          targetCount: 1,
          range: 30,
          longRange: 120,
          hitDice: new NPCsDice('1d6'),
          damageType: 'piercing',
          thrown: true,
          category: 'Melee',
        }),
        lightHammer: new NPCsAttackMixed({
          name: "Light hammer",
          ability: STR,
          targetCount: 1,
          range: 20,
          longRange: 60,
          hitDice: new NPCsDice('1d4'),
          damageType: 'bludgeoning',
          light: true,
          thrown: true,
          category: 'Melee',
        }),
        spear: new NPCsAttackMixed({
          name: "Spear",
          ability: STR,
          targetCount: 1,
          range: 20,
          longRange: 60,
          hitDice: new NPCsDice('1d6'),
          damageType: 'piercing',
          thrown: true,
          versatileDice: new NPCsDice('1d8'),
          category: 'Melee',
        }),
        trident: new NPCsAttackMixed({
          name: "Trident",
          ability: STR,
          targetCount: 1,
          range: 20,
          longRange: 60,
          hitDice: new NPCsDice('1d6'),
          damageType: 'piercing',
          thrown: true,
          versatileDice: new NPCsDice('1d8'),
          category: 'Melee',
        })
      },
      ranged: {
        blowgun: new NPCsAttackRanged({
          name: "Blowgun",
          ability: DEX,
          targetCount: 1,
          range: 25,
          longRange: 100,
          hitDice: new NPCsDice('1d1'),
          damageType: 'piercing',
          loading: true,
        }),
        dart: new NPCsAttackRanged({
          name: "Dart",
          ability: DEX,
          targetCount: 1,
          range: 20,
          longRange: 60,
          hitDice: new NPCsDice('1d4'),
          damageType: 'piercing',
          finesse: true,
          thrown: true,
        }),
        handCrossbow: new NPCsAttackRanged({
          name: "Hand Crossbow",
          ability: DEX,
          targetCount: 1,
          range: 30,
          longRange: 120,
          hitDice: new NPCsDice('1d6'),
          damageType: 'piercing',
          loading: true,
          light: true,
        }),
        heavyCrossbow: new NPCsAttackRanged({
          name: "Heavy Crossbow",
          ability: DEX,
          targetCount: 1,
          range: 100,
          longRange: 400,
          hitDice: new NPCsDice('1d10'),
          damageType: 'piercing',
          loading: true,
          heavy: true,
          twoHanded: true,
        }),
        lightCrossbow: new NPCsAttackRanged({
          name: "Light Crossbow",
          ability: DEX,
          targetCount: 1,
          range: 80,
          longRange: 320,
          hitDice: new NPCsDice('1d8'),
          damageType: 'piercing',
          loading: true,
          twoHanded: true,
        }),
        longbow: new NPCsAttackRanged({
          name: "Longbow",
          ability: DEX,
          targetCount: 1,
          range: 150,
          longRange: 600,
          hitDice: new NPCsDice('1d8'),
          damageType: 'piercing',
          twoHanded: true,
        }),
        shortbow: new NPCsAttackRanged({
          name: "Shortbow",
          ability: DEX,
          targetCount: 1,
          range: 80,
          longRange: 320,
          hitDice: new NPCsDice('1d6'),
          damageType: 'piercing',
          twoHanded: true,
        }),
        sling: new NPCsAttackRanged({
          name: "Sling",
          ability: DEX,
          targetCount: 1,
          range: 30,
          longRange: 120,
          hitDice: new NPCsDice('1d4'),
          damageType: 'bludgeoning'
        }),
      },
    },
    reactions: {
      parry: new NPCsReaction({
        name: "Parry",
        body: "NAME adds PROFICIENCY_BONUS to their AC against one melee attack that would hit them. To do so, NAME must see the attacker and be wielding a melee weapon."
      }),
      uncannyDodge: new NPCsReaction({
        name: "Uncanny Dodge",
        body: "NAME reduces half of the damage of one attack that hits them.  NAME must be able to see the attacker."
      }),
    },

  }
}