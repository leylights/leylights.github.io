import { cws } from "../../../cws.js";

type NPCsCantripData = {
  name: string,
  body?: string | null,
  includedInBasicRules?: boolean,
}

type NPCsSpellData = {
  name: string,
  level: number,
  body?: string | null,
  includedInBasicRules?: boolean,
}

export class NPCsSpell {
  private _name: string;
  private _level: number;
  private _body?: string | null;

  constructor(data: NPCsSpellData) {
    this._name = data.name;
    this._level = data.level;
    this._body = data.body || null;
  }

  get name(): string {
    return this._name;
  }

  get level(): number {
    return this._level;
  }

  get body(): string | null {
    return this._body;
  }

  clone(this: NPCsSpell): NPCsSpell {
    return new NPCsSpell({

      name: this.name.substr(0),
      level: this.level,
      body: this.body,
    })
  }

  private static createCantrip(data: NPCsCantripData) {
    return new NPCsSpell(
      {
        name: data.name,
        body: data.body,
        level: 0
      }
    )
  }

  static getSpellByName(name: string): NPCsSpell {
    for (const spellLevel of NPCsSpell.list) {
      const spells = cws.Object.values(spellLevel);
      for (const spell of spells) {
        if (name.toLowerCase() === spell.name.toLowerCase())
          return spell;
      }
    }

    throw new Error("No such NPCsSpell found: '" + name + "'");
  }

  static getRandomWizardCantrips(amount: number): NPCsSpell[] {
    if (amount < 0)
      throw new Error("Cannot get negative amount of cantrips: " + amount);

    // set up to get cantrips
    let wizardCantripNames: string[] = [
      "Acid Splash",
      "Blade Ward",
      "Chill Touch",
      "Dancing Lights",
      "Fire Bolt",
      "Friends",
      "Light",
      "Mage Hand",
      "Mending",
      "Message",
      "Minor Illusion",
      "Poison Spray",
      "Prestidigitation",
      "Ray of Frost",
      "Shocking Grasp",
      "True Strike"];

    // get the cantrips
    const outputSpells: NPCsSpell[] = [];

    while (true) {
      if (wizardCantripNames.length === 0 || outputSpells.length === amount)
        break;

      let nextIndex = Math.floor(Math.random() * wizardCantripNames.length);
      outputSpells.push(NPCsSpell.getSpellByName(wizardCantripNames[nextIndex]));
      outputSpells.splice(nextIndex, 1);
    }

    return outputSpells;
  }

  static list = [{
    acidSplash: NPCsSpell.createCantrip({
      name: 'Acid Splash',
      body: null,
      includedInBasicRules: true,
    }),
    bladeWard: NPCsSpell.createCantrip({
      name: 'Blade Ward',
      body: null
    }),
    chillTouch: NPCsSpell.createCantrip({
      name: 'Chill Touch',
      body: null
    }),
    dancingLights: NPCsSpell.createCantrip({
      name: 'Dancing Lights',
      body: null,
      includedInBasicRules: true,
    }),
    fireBolt: NPCsSpell.createCantrip({
      name: 'Fire Bolt',
      body: null,
      includedInBasicRules: true,
    }),
    friends: NPCsSpell.createCantrip({
      name: 'Friends',
      body: null
    }),
    guidance: NPCsSpell.createCantrip({
      name: 'Guidance',
      body: null,
      includedInBasicRules: true,
    }),
    light: NPCsSpell.createCantrip({
      name: 'Light',
      body: null,
      includedInBasicRules: true,
    }),
    mageHand: NPCsSpell.createCantrip({
      name: 'Mage Hand',
      body: null,
      includedInBasicRules: true,
    }),
    mending: NPCsSpell.createCantrip({
      name: 'Mending',
      body: null
    }),
    message: NPCsSpell.createCantrip({
      name: 'Message',
      body: null
    }),
    minorIllusion: NPCsSpell.createCantrip({
      name: 'Minor Illusion',
      body: null,
      includedInBasicRules: true,
    }),
    poisonSpray: NPCsSpell.createCantrip({
      name: 'Poison Spray',
      body: null,
      includedInBasicRules: true,
    }),
    prestidigitation: NPCsSpell.createCantrip({
      name: 'Prestidigitation',
      body: null,
      includedInBasicRules: true,
    }),
    rayOfFrost: NPCsSpell.createCantrip({
      name: 'Ray of Frost',
      body: null,
      includedInBasicRules: true,
    }),
    resistance: NPCsSpell.createCantrip({
      name: 'Resistance',
      body: null,
      includedInBasicRules: true,
    }),
    sacredFlame: NPCsSpell.createCantrip({
      name: 'Sacred Flame',
      body: null,
      includedInBasicRules: true,
    }),
    shockingGrasp: NPCsSpell.createCantrip({
      name: 'Shocking Grasp',
      body: null,
      includedInBasicRules: true,
    }),
    spareTheDying: NPCsSpell.createCantrip({
      name: 'Spare the Dying',
      body: null,
      includedInBasicRules: true,
    }),
    thaumaturgy: NPCsSpell.createCantrip({
      name: 'Thaumaturgy',
      body: null,
      includedInBasicRules: true,
    }),
    trueStrike: NPCsSpell.createCantrip({
      name: 'True Strike',
      body: null
    })
  },
  { // 1
    burningHands: new NPCsSpell({
      name: 'Burning Hands',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    bless: new NPCsSpell({
      name: 'Bless',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    charmPerson: new NPCsSpell({
      name: 'Charm Person',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    command: new NPCsSpell({
      name: 'Command',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    comprehendLanguages: new NPCsSpell({
      name: 'Comprehend Languages',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    cureWounds: new NPCsSpell({
      name: 'Cure Wounds',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    detectMagic: new NPCsSpell({
      name: 'Detect Magic',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    disguiseSelf: new NPCsSpell({
      name: 'Disguise Self',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    faerieFire: new NPCsSpell({
      name: 'Faerie Fire',
      level: 1,
      body: null
    }),
    guidingBolt: new NPCsSpell({
      name: 'Guiding Bolt',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    healingWord: new NPCsSpell({
      name: 'Healing Word',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    identify: new NPCsSpell({
      name: 'Identify',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    inflictWounds: new NPCsSpell({
      name: 'Inflict Wounds',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    mageArmour: new NPCsSpell({
      name: 'Mage Armour',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    magicMissile: new NPCsSpell({
      name: 'Magic Missile',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    protectionFromEvilAndGood: new NPCsSpell({
      name: 'Protection from Evil and Good',
      level: 1,
      body: null,
      includedInBasicRules: false,
    }),
    sanctuary: new NPCsSpell({
      name: 'Sanctuary',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    shield: new NPCsSpell({
      name: 'Shield',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    shieldOfFaith: new NPCsSpell({
      name: 'Shield of Faith',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    silentImage: new NPCsSpell({
      name: 'Silent Image',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    sleep: new NPCsSpell({
      name: 'Sleep',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
    thunderousSmite: new NPCsSpell({
      name: 'Thunderous Smite',
      level: 1,
      body: null,
      includedInBasicRules: false,
    }),
    thunderwave: new NPCsSpell({
      name: 'Thunderwave',
      level: 1,
      body: null,
      includedInBasicRules: true,
    }),
  }, { // 2
    aid: new NPCsSpell({
      name: 'Aid',
      level: 2,
      body: null,
      includedInBasicRules: true,
    }),
    arcaneLock: new NPCsSpell({
      name: 'Arcane Lock',
      level: 2,
      includedInBasicRules: true,
    }),
    augury: new NPCsSpell({
      name: 'Augury',
      level: 2,
      body: null,
      includedInBasicRules: true,
    }),
    blur: new NPCsSpell({
      name: 'Blur',
      level: 2,
      includedInBasicRules: true,
    }),
    brandingSmite: new NPCsSpell({
      name: 'Branding Smite',
      level: 2,
      body: null,
      includedInBasicRules: false,
    }),
    darkness: new NPCsSpell({
      name: 'Darkness',
      level: 2,
      body: null,
      includedInBasicRules: true,
    }),
    findSteed: new NPCsSpell({
      name: 'Find Steed',
      level: 2,
      body: null,
      includedInBasicRules: false,
    }),
    flamingSphere: new NPCsSpell({
      name: 'Flaming Sphere',
      level: 2,
      includedInBasicRules: true,
    }),
    holdPerson: new NPCsSpell({
      name: 'Hold Person',
      level: 2,
      body: null,
      includedInBasicRules: true,
    }),
    lesserRestoration: new NPCsSpell({
      name: 'Lesser Restoration',
      level: 2,
      body: null,
      includedInBasicRules: true,
    }),
    invisibility: new NPCsSpell({
      name: 'Invisibility',
      level: 2,
      includedInBasicRules: true,
    }),
    knock: new NPCsSpell({
      name: 'Knock',
      level: 2,
      includedInBasicRules: true,
    }),
    levitate: new NPCsSpell({
      name: 'Levitate',
      level: 2,
      includedInBasicRules: true,
    }),
    magicWeapon: new NPCsSpell({
      name: 'Magic Weapon',
      level: 2,
      includedInBasicRules: true,
    }),
    mistyStep: new NPCsSpell({
      name: 'Misty Step',
      level: 2,
      includedInBasicRules: true,
    }),
    prayerOfHealing: new NPCsSpell({
      name: 'Prayer of Healing',
      level: 2,
      body: null,
      includedInBasicRules: true,
    }),
    shatter: new NPCsSpell({
      name: 'Shatter',
      level: 2,
      includedInBasicRules: true,
    }),
    silence: new NPCsSpell({
      name: 'Silence',
      level: 2,
      body: null,
      includedInBasicRules: true,
    }),
    spiderClimb: new NPCsSpell({
      name: 'Spider Climb',
      level: 2,
      includedInBasicRules: true,
    }),
    spiritualWeapon: new NPCsSpell({
      name: 'Spiritual Weapon',
      level: 2,
      body: null,
      includedInBasicRules: true,
    }),
    suggestion: new NPCsSpell({
      name: 'Suggestion',
      level: 2,
      includedInBasicRules: true,
    }),
    wardingBond: new NPCsSpell({
      name: 'Warding Bond',
      level: 2,
      body: null,
      includedInBasicRules: true,
    }),
    web: new NPCsSpell({
      name: 'Web',
      level: 2,
      includedInBasicRules: true,
    }),
  }, { // 3
    beaconOfHope: new NPCsSpell({
      name: 'Beacon of Hope',
      level: 3,
      includedInBasicRules: true,
    }),
    blindingSmite: new NPCsSpell({
      name: 'Blinding Smite',
      level: 3,
      body: null,
      includedInBasicRules: false,
    }),
    counterspell: new NPCsSpell({
      name: 'Counterspell',
      level: 3,
      includedInBasicRules: true,
    }),
    dispelMagic: new NPCsSpell({
      name: 'Dispel Magic',
      level: 3,
      body: null,
      includedInBasicRules: true,
    }),
    fireball: new NPCsSpell({
      name: 'Fireball',
      level: 3,
      body: null,
      includedInBasicRules: true,
    }),
    fly: new NPCsSpell({
      name: 'Fly',
      level: 3,
      body: null,
      includedInBasicRules: true,
    }),
    haste: new NPCsSpell({
      name: 'Haste',
      level: 3,
      body: null,
      includedInBasicRules: true,
    }),
    lightningBolt: new NPCsSpell({
      name: 'Lightning Bolt',
      level: 3,
      body: null,
      includedInBasicRules: true,
    }),
    majorImage: new NPCsSpell({
      name: 'Major Image',
      level: 3,
      body: null,
      includedInBasicRules: true,
    }),
    massHealingWord: new NPCsSpell({
      name: 'Mass Healing Word',
      level: 3,
      includedInBasicRules: true,
    }),
    protectionFromEnergy: new NPCsSpell({
      name: 'Protection from Energy',
      level: 3,
      body: null,
      includedInBasicRules: true,
    }),
    removeCurse: new NPCsSpell({
      name: 'Remove Curse',
      level: 3,
      includedInBasicRules: true,
    }),
    revivify: new NPCsSpell({
      name: 'Revivify',
      level: 3,
      includedInBasicRules: true,
    }),
    speakWithDead: new NPCsSpell({
      name: 'Speak with Dead',
      level: 3,
      includedInBasicRules: true,
    }),
    spiritGuardians: new NPCsSpell({
      name: 'Spirit Guardians',
      level: 3,
      includedInBasicRules: true,
    }),
  }, { // 4
    arcaneEye: new NPCsSpell({
      name: 'Arcane Eye',
      level: 4,
      body: null,
      includedInBasicRules: true,
    }),
    deathWard: new NPCsSpell({
      name: 'Death Ward',
      level: 4,
      includedInBasicRules: true,
    }),
    dimensionDoor: new NPCsSpell({
      name: 'Dimension Door',
      level: 4,
      body: null,
      includedInBasicRules: true,
    }),
    divination: new NPCsSpell({
      name: 'Divination',
      level: 4,
      includedInBasicRules: true,
    }),
    freedomOfMovement: new NPCsSpell({
      name: 'Freedom of Movement',
      level: 4,
      includedInBasicRules: true,
    }),
    greaterInvisibility: new NPCsSpell({
      name: 'Greater Invisibility',
      level: 4,
      body: null,
      includedInBasicRules: true,
    }),
    guardianOfFaith: new NPCsSpell({
      name: 'Guardian of Faith',
      level: 4,
      includedInBasicRules: true,
    }),
    locateCreature: new NPCsSpell({
      name: 'Locate Creature',
      level: 4,
      includedInBasicRules: true,
    }),
    iceStorm: new NPCsSpell({
      name: 'Ice Storm',
      level: 4,
      body: null,
      includedInBasicRules: true,
    }),
    stoneskin: new NPCsSpell({
      name: 'Stoneskin',
      level: 4,
      body: null,
      includedInBasicRules: true,
    }),
    wallOfFire: new NPCsSpell({
      name: 'Wall of Fire',
      level: 4,
      body: null,
      includedInBasicRules: true,
    }),
  }, { // 5
    commune: new NPCsSpell({
      name: 'Commune',
      level: 5,
      includedInBasicRules: true,
    }),
    coneOfCold: new NPCsSpell({
      name: 'Cone of Cold',
      level: 5,
      body: null,
      includedInBasicRules: true,
    }),
    dominatePerson: new NPCsSpell({
      name: 'Dominate Person',
      level: 5,
      body: null,
      includedInBasicRules: true,
    }),
    dream: new NPCsSpell({
      name: 'Dream',
      level: 5,
      body: null,
      includedInBasicRules: true,
    }),
    flameStrike: new NPCsSpell({
      name: 'Flame Strike',
      level: 5,
      includedInBasicRules: true,
    }),
    greaterRestoration: new NPCsSpell({
      name: 'Greater Restoration',
      level: 5,
      includedInBasicRules: true,
    }),
    massCureWounds: new NPCsSpell({
      name: 'Mass Cure Wounds',
      level: 5,
      includedInBasicRules: true,
    }),
    passwall: new NPCsSpell({
      name: 'Passwall',
      level: 5,
      body: null,
      includedInBasicRules: true,
    }),
    raiseDead: new NPCsSpell({
      name: 'Raise Dead',
      level: 5,
      includedInBasicRules: true,
    }),
    wallOfStone: new NPCsSpell({
      name: 'Wall of Stone',
      level: 5,
      body: null,
      includedInBasicRules: true,
    }),
  }, { // 6
    bladeBarrier: new NPCsSpell({
      name: 'Blade Barrier',
      level: 6,
      includedInBasicRules: true,
    }),
    chainLightning: new NPCsSpell({
      name: 'Chain Lightning',
      level: 6,
      body: null,
      includedInBasicRules: true,
    }),
    disintegrate: new NPCsSpell({
      name: 'Disintegrate',
      level: 6,
      body: null,
      includedInBasicRules: true,
    }),
    findThePath: new NPCsSpell({
      name: 'Find the Path',
      level: 6,
      includedInBasicRules: true,
    }),
    globeOfInvulnerability: new NPCsSpell({
      name: 'Globe of Invulnerability',
      level: 6,
      body: null,
      includedInBasicRules: true,
    }),
    harm: new NPCsSpell({
      name: 'Harm',
      level: 6,
      includedInBasicRules: true,
    }),
    heal: new NPCsSpell({
      name: 'Heal',
      level: 6,
      includedInBasicRules: true,
    }),
    heroesFeast: new NPCsSpell({
      name: "Heroes' Feast",
      level: 6,
      includedInBasicRules: true,
    }),
    massSuggestion: new NPCsSpell({
      name: 'Mass Suggestion',
      level: 6,
      body: null,
      includedInBasicRules: true,
    }),
    ottosIrresistibleDance: new NPCsSpell({
      name: "Otto's Irresistible Dance",
      level: 6,
      body: null,
      includedInBasicRules: true,
    }),
    trueSeeing: new NPCsSpell({
      name: 'True Seeing',
      level: 6,
      body: null,
      includedInBasicRules: true,
    }),
  }, { // 7
    delayedBlastFireball: new NPCsSpell({
      name: 'Delayed Blast Fireball',
      level: 7,
      includedInBasicRules: true,
    }),
    etherealness: new NPCsSpell({
      name: 'Etherealness',
      level: 7,
      includedInBasicRules: true,
    }),
    fingerOfDeath: new NPCsSpell({
      name: 'Finger of Death',
      level: 7,
      body: null,
      includedInBasicRules: true,
    }),
    fireStorm: new NPCsSpell({
      name: 'Fire Storm',
      level: 7,
      includedInBasicRules: true,
    }),
    mordenkainensSword: new NPCsSpell({
      name: "Mordenkainen's Sword",
      level: 7,
      body: null,
      includedInBasicRules: true,
    }),
    regenerate: new NPCsSpell({
      name: 'Regenerate',
      level: 7,
      includedInBasicRules: true,
    }),
    resurrection: new NPCsSpell({
      name: 'Resurrection',
      level: 7,
      includedInBasicRules: true,
    }),
    teleport: new NPCsSpell({
      name: "Teleport",
      level: 7,
      body: null,
      includedInBasicRules: true,
    }),
  }, { // 8
    antimagicField: new NPCsSpell({
      name: "Antimagic Field",
      level: 8,
      includedInBasicRules: true,
    }),
    dominateMonster: new NPCsSpell({
      name: "Dominate Monster",
      level: 8,
      includedInBasicRules: true,
    }),
    earthquake: new NPCsSpell({
      name: "Earthquake",
      level: 8,
      includedInBasicRules: true,
    }),
    holyAura: new NPCsSpell({
      name: "Holy Aura",
      level: 8,
      includedInBasicRules: true,
    }),
    maze: new NPCsSpell({
      name: "Maze",
      level: 8,
      body: null,
      includedInBasicRules: true,
    }),
    powerWordStun: new NPCsSpell({
      name: "Power Word Stun",
      level: 8,
      body: null,
      includedInBasicRules: true,
    }),
    sunburst: new NPCsSpell({
      name: "Sunburst",
      level: 8,
      body: null,
      includedInBasicRules: true,
    }),
  }, { // 9
    astralProjection: new NPCsSpell({
      name: "Astral Projection",
      level: 9,
      body: null,
      includedInBasicRules: true,
    }),
    gate: new NPCsSpell({
      name: "Gate",
      level: 9,
      body: null,
      includedInBasicRules: true,
    }),
    foresight: new NPCsSpell({
      name: "Foresight",
      level: 9,
      body: null,
      includedInBasicRules: true,
    }),
    imprisonment: new NPCsSpell({
      name: "Imprisonment",
      level: 9,
      body: null,
      includedInBasicRules: true,
    }),
    massHeal: new NPCsSpell({
      name: "Mass Heal",
      level: 9,
      body: null,
      includedInBasicRules: true,
    }),
    meteorSwarm: new NPCsSpell({
      name: "Meteor Swarm",
      level: 9,
      body: null,
      includedInBasicRules: true,
    }),
    powerWordKill: new NPCsSpell({
      name: "Power Word Kill",
      level: 9,
      body: null,
      includedInBasicRules: true,
    }),
    timeStop: new NPCsSpell({
      name: "Time Stop",
      level: 9,
      body: null,
      includedInBasicRules: true,
    }),
    trueResurrection: new NPCsSpell({
      name: "True Resurrection",
      level: 9,
      body: null,
      includedInBasicRules: true,
    }),
  },];
}