import { cws } from "../../../cws.js";
import { Button } from "../../_components/button.component.js";
import { NPCsMemorySaveBarComponent } from "../components/npcs-memory-save-bar.component.js";
import { NPCsCharacterData } from "./character-data.js";
import { NPCsClassicCard } from "./classic-card.js";

const SPLITTER = '||breakpoint||';
const STORAGE_KEY = 'npcsSavedCharacters';

export class NPCsMemory {
  static clear(): void {
    NPCsMemory.setRaw('');
  }

  static HTML = {
    createCharacterList(loadFunction: (data: NPCsCharacterData) => void, existingList?: HTMLUListElement): HTMLUListElement {
      const savedCharacters = NPCsMemory.getAll();

      if (existingList)
        Array.from(existingList.children).forEach((child: HTMLElement) => {
          child.remove();
        });
      else
        existingList = cws.createElement({
          type: 'ul',
          id: 'saved-character-list'
        });

      savedCharacters.forEach((character: NPCsCharacterData) => {
        createListItem(character);
      });

      return existingList;

      function createListItem(character: NPCsCharacterData) {
        const deleteElement = cws.createElement({
          type: 'button',
          classList: 'saved-character-delete',
          innerText: 'x',
        });

        const element: HTMLLIElement = cws.createElement({
          type: 'li',
          id: `saved-character-${character.ID}`,
          children: [cws.createElement({
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

        element.addEventListener('click', (event: Event) => {
          const clickedDeleteElements = event.composedPath().filter((target: HTMLElement) => {
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

    createSavedBar(
      parentElement: HTMLElement,
      iconClickAction: (character: NPCsCharacterData) => void,
      iconDeleteAction: (character: NPCsCharacterData) => void
    ): NPCsMemorySaveBarComponent {
      return new NPCsMemorySaveBarComponent(parentElement, iconClickAction, iconDeleteAction);
    }
  }

  static delete(data: NPCsCharacterData) {
    if (!NPCsMemory.includes(data))
      throw new Error(`${data.name} cannot be removed from saved characters; they were not in the retrieved list of saved characters.`);

    NPCsMemory.set(NPCsMemory.getAll().filter((entry: NPCsCharacterData) => {
      return entry.name !== data.name;
    }));
  }

  static getAll(this: NPCsMemory): NPCsCharacterData[] {
    return NPCsMemory.getRaw().map((str: string) => {
      return NPCsCharacterData.createFromStorageString(str);
    });
  }

  static includes(data: NPCsCharacterData): boolean {
    return NPCsMemory.getAll().filter((element: NPCsCharacterData) => {
      return element.name === data.name;
    }).length > 0;
  }

  static save(this: NPCsMemory, source: NPCsClassicCard | NPCsCharacterData): void {
    const data = (source instanceof NPCsClassicCard)
      ? source.data
      : source;

    if (!NPCsMemory.includes(data)) {
      NPCsMemory.add(data);
    } else {
      NPCsMemory.delete(data);
      NPCsMemory.add(data);
    }
  }

  private static add(data: NPCsCharacterData): void {
    let current: string[] = NPCsMemory.getRaw();
    current.push(data.getStorageString());
    NPCsMemory.setRaw(current.join(SPLITTER));
  }

  private static getRaw(): string[] {
    const result = localStorage.getItem(STORAGE_KEY);
    if (result)
      return result.split(SPLITTER);
    else
      return [];
  }

  private static set(data: NPCsCharacterData[]): void {
    NPCsMemory.setRaw(data.map((entry: NPCsCharacterData) => {
      return entry.getStorageString();
    }).join(SPLITTER));
  }

  private static setRaw(data: string): void {
    localStorage.setItem(STORAGE_KEY, data);
  }
}