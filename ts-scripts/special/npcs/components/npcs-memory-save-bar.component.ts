import { Molasses } from "../../../molasses";
import { Button } from "../../../components/button.component";
import { NPCsCharacterData } from "../core/character-data";
import { NPCsMemory } from "../core/npcs-memory";

interface NPCsMemorySaveBarComponentHTML {
  footerElement: HTMLDivElement,
}

export class NPCsMemorySaveBarComponent {
  clickAction: (character: NPCsCharacterData) => void;
  deleteAction: (character: NPCsCharacterData) => void;
  HTML: NPCsMemorySaveBarComponentHTML = {
    footerElement: null,
  }

  constructor(parentElement: HTMLElement, iconClickAction: (character: NPCsCharacterData) => void, iconDeleteAction: (character: NPCsCharacterData) => void) {
    const me = this;

    me.clickAction = iconClickAction;
    me.deleteAction = iconDeleteAction;

    const refreshButton =
      Molasses.createElement({
        type: 'div',
        id: 'saved-bar-refresh',
        children: [
          Molasses.createElement({
            type: 'div',
            classList: 'save-icon-circle',
            innerText: String.fromCharCode(0x21BB),
          }),
        ]
      });

    me.HTML.footerElement = Molasses.createElement({
      type: 'div',
      id: 'npcs-footer',
      children: [
        refreshButton
      ]
    });

    me.refreshSavedBar();
    Button.createByAttachment(refreshButton, () => {
      me.refreshSavedBar();
    });

    parentElement.appendChild(me.HTML.footerElement);
  }

  private createSavedIcon(data: NPCsCharacterData, clickAction: (character: NPCsCharacterData) => void, deleteAction: (character: NPCsCharacterData) => void): HTMLElement {
    const me = this,
      mainIcon = Molasses.createElement({
        type: 'div',
        classList: 'save-icon-circle',
        innerText: data.names[0].charAt(0) + (data.names[1].charAt(0) || data.names[0].charAt(1) || ''),
      }), deleteIcon = Molasses.createElement({
        type: 'div',
        classList: 'save-icon-delete',
        innerText: 'x',
      }), container = Molasses.createElement({
        type: 'div',
        classList: 'save-icon',
        id: `saved-character-${data.ID}`,
        children: [mainIcon, deleteIcon]
      });

    Button.createByAttachment(
      mainIcon,
      () => {
        clickAction(data);
      }
    );

    Button.createByAttachment(
      deleteIcon,
      () => {
        if (confirm(`Are you sure you want to delete ${data.name}?  This action cannot be undone.`)) {
          deleteAction(data);
          NPCsMemory.delete(data);
          me.refreshSavedBar();
        }
      }
    );

    return container;
  }

  refreshSavedBar(): void {
    const me = this,
      oldIcons = document.getElementsByClassName('save-icon'),
      savedCharacters: NPCsCharacterData[] = NPCsMemory.getAll();

    for (let i = 0; i < oldIcons.length; i++) {
      oldIcons[i].remove();
      i--;
    }

    if (savedCharacters.length === 0)
      this.HTML.footerElement.style.display = 'none';
    else
      this.HTML.footerElement.style.display = '';

    savedCharacters.forEach((c: NPCsCharacterData) => {
      me.HTML.footerElement.appendChild(me.createSavedIcon(c, me.clickAction, me.deleteAction));
    });
  }
}
