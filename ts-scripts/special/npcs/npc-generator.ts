import { Leylights } from "../../leylights.js"; import { Button } from "../../components/button.component.js";
import { KeyboardListener } from "../../tools/keyboard-listener.js";
import { NPCsCharacterData } from "./core/character-data.js";
import { NPCsClass } from "./core/class.js";
import { NPCsClassicCard } from "./core/classic-card.js";
import { NPCsMemory } from "./core/npcs-memory.js";
import { NPCsRace } from "./core/race.js";

const CR_SHIFT_RANGE: number = 1.5;
const CSS_TOP_PADDING: number = 20;
const SCROLL_BUFFER: number = 10;

var autoGenerating: boolean = false;
var autoGenerationInterval: number = null;

var keyListener: KeyboardListener = new KeyboardListener(window);

type menuType = {
  raceSelector: HTMLSelectElement,
  classSelector: HTMLSelectElement,
  nameSelector: HTMLInputElement,
  challengeRatingSelector: HTMLInputElement,
  generator: Button,
}

var menu: menuType = {
  raceSelector: null,
  classSelector: null,
  nameSelector: null,
  challengeRatingSelector: null,
  generator: null,
}

class NPCsGenerator {
  static footer = NPCsMemory.HTML.createSavedBar(document.getElementById('main'), async (data: NPCsCharacterData) => {
    await NPCsGenerator.createCard('card', data);
  }, (data: NPCsCharacterData) => {
    NPCsClassicCard.unsave(data);
  });

  static async init(): Promise<void> {
    var topMargin = NPCsGenerator.getTopMargin();
    // initialize HTML
    menu.raceSelector = document.getElementById('races') as HTMLSelectElement;

    // fill race dropdown

    Leylights.Object.values(NPCsRace.list).forEach((race: NPCsRace) => {
      let raceSelector = document.createElement("option");
      raceSelector.innerHTML = race.name;
      menu.raceSelector.appendChild(raceSelector);
    });

    menu.classSelector = document.getElementById('characterClasses') as HTMLSelectElement;
    menu.nameSelector = document.getElementById('inputName') as HTMLInputElement;
    menu.challengeRatingSelector = document.getElementById('inputCr') as HTMLInputElement;
    menu.generator = Button.createByAttachment(document.getElementById("generateButton"), () => { NPCsGenerator.createCard('card') }, 'generateNPC');
    document.getElementById('main').style.marginTop = (topMargin) + 'px';

    let classNames: string[] = Leylights.Object.values(NPCsClass.list)
      .map(a => {
        return a.name;
      })
      .sort((a: string, b: string) => {
        return a < b ? -1 : 1;
      });

    for (let i = 0; i < classNames.length; i++)
      NPCsGenerator.addClassToDropdown(classNames[i].toLowerCase());

    keyListener.addEventListener((listener: KeyboardListener, e: KeyboardEvent) => {
      return listener.areKeysDown('auto'.split(''), 'and');
    }, (listener: KeyboardListener, e: KeyboardEvent) => {
      if (!autoGenerating) {
        NPCsGenerator.toggleAutoGeneration(true);
        autoGenerating = true;
      }
    });

    keyListener.addEventListener((listener: KeyboardListener, e: KeyboardEvent) => {
      return listener.areKeysDown('end'.split(''), 'and');
    }, (listener: KeyboardListener, e: KeyboardEvent) => {
      if (autoGenerating) {
        NPCsGenerator.toggleAutoGeneration(false);
        autoGenerating = false;
      }
    });

    await NPCsGenerator.createCard('top');
  }

  /**
   * Adds a new field to the classes dropdown 
   */

  static addClassToDropdown(name: string) {
    let baseSelector = document.createElement("option");
    baseSelector.innerHTML = name;
    menu.classSelector.appendChild(baseSelector);
  }

  static getTopMargin(): number {
    return document.getElementById('npcsHead').getBoundingClientRect().bottom + CSS_TOP_PADDING;
  }

  /**
   * Begins automatically generating NPCS
   */
  static toggleAutoGeneration(enable: boolean) {
    NPCsGenerator.createCard('card');

    if (enable)
      autoGenerationInterval = setInterval(() => { NPCsGenerator.createCard('card') }, 1000);
    else {
      clearInterval(autoGenerationInterval);
      autoGenerationInterval = null;
    }
  }

  static async createCard(scrollTo?: 'card' | 'top' | null, data?: NPCsCharacterData): Promise<void> {
    const me = this;

    let race: NPCsRace;
    let characterClass: NPCsClass;
    let names: [string, string];
    let newCharacter: NPCsCharacterData;

    // get race, class
    if (!data) {
      let races: NPCsRace[] = Leylights.Object.values(NPCsRace.list);
      let raceInput: string = menu.raceSelector.value;
      let raceSelection: NPCsRace[] = races.filter((raceFilter: NPCsRace) => {
        return raceFilter.name === raceInput;
      });

      if (raceSelection.length > 0)
        race = raceSelection[0];
      else
        race = NPCsRace.getRandomRace();

      let classes: NPCsClass[] = Leylights.Object.values(NPCsClass.list);
      let classInput: string = menu.classSelector.value;
      let classSelection: NPCsClass[] = classes.filter((classEntry: NPCsClass) => {
        return classEntry.name.toLowerCase() === classInput.toLowerCase();
      });

      if (classSelection.length > 0)
        characterClass = classSelection[0];
      else
        characterClass = NPCsClass.getRandomClass();

      // get name(s)

      let nameInput = menu.nameSelector.value.trim();
      if (nameInput !== '') {
        let namesList = menu.nameSelector.value.split(' ').map((str: string) => { return str.trim() });

        names = [null, null];

        names[0] = Leylights.toCapitalized(namesList[0]);
        names[1] = namesList.slice(1).join(' ');
      } else {
        names = null;
      }

      // create character

      newCharacter = await NPCsCharacterData.create(race, characterClass, names);

      // get cr from menu
      let targetCR: number;
      let inputField: HTMLInputElement = document.getElementById("inputCr") as HTMLInputElement;

      targetCR = Leylights.roundToDecimalPlaces(parseFloat(inputField.value), 2);
      if (isNaN(targetCR))
        newCharacter.alterCRBy(CR_SHIFT_RANGE);
      else
        newCharacter.alterCRTo(targetCR);
    } else {
      newCharacter = data;
    }

    // create card
    const newCard: HTMLDivElement = new NPCsClassicCard(newCharacter).createClassicCardHTML();
    document.getElementById("main").appendChild(newCard);
    Button.createByAttachment(newCard.querySelector('.save-npc'), () => {
      me.footer.refreshSavedBar();
    });


    if (scrollTo === 'card') {
      const headerBarRect = document.getElementById('npcsHead').getBoundingClientRect();

      window.scrollTo(
        0,
        newCard.getBoundingClientRect().y
        + window.scrollY
        - (headerBarRect.top + headerBarRect.height)
        - SCROLL_BUFFER);
    } else if (scrollTo === 'top') {
      window.scrollTo(0, 0);
    }
  }
}

NPCsGenerator.init();
