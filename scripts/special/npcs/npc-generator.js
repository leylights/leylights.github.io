var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
import { Molasses } from "../../molasses.js";
import { Button } from "../../components/button.component.js";
import { KeyboardListener } from "../../tools/keyboard-listener.js";
import { NPCsCharacterData } from "./core/character-data.js";
import { NPCsClass } from "./core/class.js";
import { NPCsClassicCard } from "./core/classic-card.js";
import { NPCsMemory } from "./core/npcs-memory.js";
import { NPCsRace } from "./core/race.js";
const CR_SHIFT_RANGE = 1.5;
const CSS_TOP_PADDING = 20;
const SCROLL_BUFFER = 10;
var autoGenerating = false;
var autoGenerationInterval = null;
var keyListener = new KeyboardListener(window);
var menu = {
    raceSelector: null,
    classSelector: null,
    nameSelector: null,
    challengeRatingSelector: null,
    generator: null,
};
class NPCsGenerator {
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            var topMargin = NPCsGenerator.getTopMargin();
            // initialize HTML
            menu.raceSelector = document.getElementById('races');
            // fill race dropdown
            Molasses.Object.values(NPCsRace.list).forEach((race) => {
                let raceSelector = document.createElement("option");
                raceSelector.innerHTML = race.name;
                menu.raceSelector.appendChild(raceSelector);
            });
            menu.classSelector = document.getElementById('characterClasses');
            menu.nameSelector = document.getElementById('inputName');
            menu.challengeRatingSelector = document.getElementById('inputCr');
            menu.generator = Button.createByAttachment(document.getElementById("generateButton"), () => { NPCsGenerator.createCard('card'); }, 'generateNPC');
            document.getElementById('main').style.marginTop = (topMargin) + 'px';
            let classNames = Molasses.Object.values(NPCsClass.list)
                .map(a => {
                return a.name;
            })
                .sort((a, b) => {
                return a < b ? -1 : 1;
            });
            for (let i = 0; i < classNames.length; i++)
                NPCsGenerator.addClassToDropdown(classNames[i].toLowerCase());
            keyListener.addEventListener((listener, e) => {
                return listener.areKeysDown('auto'.split(''), 'and');
            }, (listener, e) => {
                if (!autoGenerating) {
                    NPCsGenerator.toggleAutoGeneration(true);
                    autoGenerating = true;
                }
            });
            keyListener.addEventListener((listener, e) => {
                return listener.areKeysDown('end'.split(''), 'and');
            }, (listener, e) => {
                if (autoGenerating) {
                    NPCsGenerator.toggleAutoGeneration(false);
                    autoGenerating = false;
                }
            });
            yield NPCsGenerator.createCard('top');
        });
    }
    /**
     * Adds a new field to the classes dropdown
     */
    static addClassToDropdown(name) {
        let baseSelector = document.createElement("option");
        baseSelector.innerHTML = name;
        menu.classSelector.appendChild(baseSelector);
    }
    static getTopMargin() {
        return document.getElementById('npcsHead').getBoundingClientRect().bottom + CSS_TOP_PADDING;
    }
    /**
     * Begins automatically generating NPCS
     */
    static toggleAutoGeneration(enable) {
        NPCsGenerator.createCard('card');
        if (enable)
            autoGenerationInterval = setInterval(() => { NPCsGenerator.createCard('card'); }, 1000);
        else {
            clearInterval(autoGenerationInterval);
            autoGenerationInterval = null;
        }
    }
    static createCard(scrollTo, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const me = this;
            let race;
            let characterClass;
            let names;
            let newCharacter;
            // get race, class
            if (!data) {
                let races = Molasses.Object.values(NPCsRace.list);
                let raceInput = menu.raceSelector.value;
                let raceSelection = races.filter((raceFilter) => {
                    return raceFilter.name === raceInput;
                });
                if (raceSelection.length > 0)
                    race = raceSelection[0];
                else
                    race = NPCsRace.getRandomRace();
                let classes = Molasses.Object.values(NPCsClass.list);
                let classInput = menu.classSelector.value;
                let classSelection = classes.filter((classEntry) => {
                    return classEntry.name.toLowerCase() === classInput.toLowerCase();
                });
                if (classSelection.length > 0)
                    characterClass = classSelection[0];
                else
                    characterClass = NPCsClass.getRandomClass();
                // get name(s)
                let nameInput = menu.nameSelector.value.trim();
                if (nameInput !== '') {
                    let namesList = menu.nameSelector.value.split(' ').map((str) => { return str.trim(); });
                    names = [null, null];
                    names[0] = Molasses.toCapitalized(namesList[0]);
                    names[1] = namesList.slice(1).join(' ');
                }
                else {
                    names = null;
                }
                // create character
                newCharacter = yield NPCsCharacterData.create(race, characterClass, names);
                // get cr from menu
                let targetCR;
                let inputField = document.getElementById("inputCr");
                targetCR = Molasses.roundToDecimalPlaces(parseFloat(inputField.value), 2);
                if (isNaN(targetCR))
                    newCharacter.alterCRBy(CR_SHIFT_RANGE);
                else
                    newCharacter.alterCRTo(targetCR);
            }
            else {
                newCharacter = data;
            }
            // create card
            const newCard = new NPCsClassicCard(newCharacter).createClassicCardHTML();
            document.getElementById("main").appendChild(newCard);
            Button.createByAttachment(newCard.querySelector('.save-npc'), () => {
                me.footer.refreshSavedBar();
            });
            if (scrollTo === 'card') {
                const headerBarRect = document.getElementById('npcsHead').getBoundingClientRect();
                window.scrollTo(0, newCard.getBoundingClientRect().y
                    + window.scrollY
                    - (headerBarRect.top + headerBarRect.height)
                    - SCROLL_BUFFER);
            }
            else if (scrollTo === 'top') {
                window.scrollTo(0, 0);
            }
        });
    }
}
_a = NPCsGenerator;
NPCsGenerator.footer = NPCsMemory.HTML.createSavedBar(document.getElementById('main'), (data) => __awaiter(void 0, void 0, void 0, function* () {
    yield NPCsGenerator.createCard('card', data);
}), (data) => {
    NPCsClassicCard.unsave(data);
});
NPCsGenerator.init();
//# sourceMappingURL=npc-generator.js.map