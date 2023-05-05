import { SummonsCreature } from "./creature";

export class SummonsCreatureFactory {
  static creatures = {
    direwolf: {
      name: "Direwolf",
      creator: SummonsCreatureFactory.Direwolf
    },
    imp: {
      name: "Imp",
      creator: SummonsCreatureFactory.Imp
    },
    skeleton: {
      name: "Skeleton",
      creator: SummonsCreatureFactory.Skeleton
    },
    zombie: {
      name: "Zombie",
      creator: SummonsCreatureFactory.Zombie
    }
  }

  static Direwolf(): SummonsCreature {
    return new SummonsCreature({
      name: SummonsCreatureFactory.creatures.direwolf.name,
      healthDice: "5d10",
      healthMod: 10,
      attackMod: 5,
      damageDice: '2d6',
      damageMod: 3,
    });
  }

  static Imp(): SummonsCreature {
    return new SummonsCreature({
      name: SummonsCreatureFactory.creatures.imp.name,
      healthDice: "3d4",
      healthMod: 3,
      attackMod: 5,
      damageDice: '1d4+3d6',
      damageMod: 3,
    });
  }

  static Skeleton(): SummonsCreature {
    return new SummonsCreature({
      name: SummonsCreatureFactory.creatures.skeleton.name,
      healthDice: "2d8",
      healthMod: 4,
      attackMod: 4,
      damageDice: '1d6',
      damageMod: 2,
    });
  }

  static Zombie(): SummonsCreature {
    return new SummonsCreature({
      name: SummonsCreatureFactory.creatures.zombie.name,
      healthDice: "3d8",
      healthMod: 9,
      attackMod: 3,
      damageDice: '1d6',
      damageMod: 1,
    });
  }
}
