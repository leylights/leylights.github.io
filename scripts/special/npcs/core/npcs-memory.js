import { Leylights } from "../../../leylights.js";
import { NPCsMemorySaveBarComponent } from "../components/npcs-memory-save-bar.component.js";
import { NPCsCharacterData } from "./character-data.js";
import { NPCsClassicCard } from "./classic-card.js";
const SPLITTER = '||breakpoint||';
const STORAGE_KEY = 'npcsSavedCharacters';
export class NPCsMemory {
    static clear() {
        NPCsMemory.setRaw('');
    }
    static delete(data) {
        if (!NPCsMemory.includes(data))
            throw new Error(`${data.name} cannot be removed from saved characters; they were not in the retrieved list of saved characters.`);
        NPCsMemory.set(NPCsMemory.getAll().filter((entry) => {
            return entry.name !== data.name;
        }));
    }
    static getAll() {
        return NPCsMemory.getRaw().map((str) => {
            return NPCsCharacterData.createFromStorageString(str);
        });
    }
    static includes(data) {
        return NPCsMemory.getAll().filter((element) => {
            return element.name === data.name;
        }).length > 0;
    }
    static save(source) {
        const data = (source instanceof NPCsClassicCard)
            ? source.data
            : source;
        if (!NPCsMemory.includes(data)) {
            NPCsMemory.add(data);
        }
        else {
            NPCsMemory.delete(data);
            NPCsMemory.add(data);
        }
    }
    static add(data) {
        let current = NPCsMemory.getRaw();
        current.push(data.getStorageString());
        NPCsMemory.setRaw(current.join(SPLITTER));
    }
    static getRaw() {
        const result = localStorage.getItem(STORAGE_KEY);
        if (result)
            return result.split(SPLITTER);
        else
            return [];
    }
    static set(data) {
        NPCsMemory.setRaw(data.map((entry) => {
            return entry.getStorageString();
        }).join(SPLITTER));
    }
    static setRaw(data) {
        localStorage.setItem(STORAGE_KEY, data);
    }
}
NPCsMemory.HTML = {
    createCharacterList(loadFunction, existingList) {
        const savedCharacters = NPCsMemory.getAll();
        if (existingList)
            Array.from(existingList.children).forEach((child) => {
                child.remove();
            });
        else
            existingList = Leylights.createElement({
                type: 'ul',
                id: 'saved-character-list'
            });
        savedCharacters.forEach((character) => {
            createListItem(character);
        });
        return existingList;
        function createListItem(character) {
            const deleteElement = Leylights.createElement({
                type: 'button',
                classList: 'saved-character-delete',
                innerText: 'x',
            });
            const element = Leylights.createElement({
                type: 'li',
                id: `saved-character-${character.ID}`,
                children: [Leylights.createElement({
                        type: 'div',
                        classList: 'saved-character-name',
                        innerText: character.name
                    }), deleteElement,]
            });
            deleteElement.addEventListener('click', () => {
                if (confirm(`Are you sure you want to delete ${character.name}?  This action cannot be undone.`)) {
                    NPCsMemory.delete(character);
                    element.remove();
                }
            });
            element.addEventListener('click', (event) => {
                const clickedDeleteElements = event.composedPath().filter((target) => {
                    if (!target.classList)
                        return false;
                    return target.classList.contains('saved-character-delete');
                });
                if (clickedDeleteElements.length > 0)
                    return;
                loadFunction(character);
            });
            existingList.appendChild(element);
        }
    },
    createSavedBar(parentElement, iconClickAction, iconDeleteAction) {
        return new NPCsMemorySaveBarComponent(parentElement, iconClickAction, iconDeleteAction);
    }
};
//# sourceMappingURL=npcs-memory.js.map