import { cws } from "../../../cws.js";
import { Button } from "../../../components/button.component.js";
import { NPCsMemory } from "../core/npcs-memory.js";
export class NPCsMemorySaveBarComponent {
    constructor(parentElement, iconClickAction, iconDeleteAction) {
        this.HTML = {
            footerElement: null,
        };
        const me = this;
        me.clickAction = iconClickAction;
        me.deleteAction = iconDeleteAction;
        const refreshButton = cws.createElement({
            type: 'div',
            id: 'saved-bar-refresh',
            children: [
                cws.createElement({
                    type: 'div',
                    classList: 'save-icon-circle',
                    innerText: String.fromCharCode(0x21BB),
                }),
            ]
        });
        me.HTML.footerElement = cws.createElement({
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
    createSavedIcon(data, clickAction, deleteAction) {
        const me = this, mainIcon = cws.createElement({
            type: 'div',
            classList: 'save-icon-circle',
            innerText: data.names[0].charAt(0) + (data.names[1].charAt(0) || data.names[0].charAt(1) || ''),
        }), deleteIcon = cws.createElement({
            type: 'div',
            classList: 'save-icon-delete',
            innerText: 'x',
        }), container = cws.createElement({
            type: 'div',
            classList: 'save-icon',
            id: `saved-character-${data.ID}`,
            children: [mainIcon, deleteIcon]
        });
        Button.createByAttachment(mainIcon, () => {
            clickAction(data);
        });
        Button.createByAttachment(deleteIcon, () => {
            if (confirm(`Are you sure you want to delete ${data.name}?  This action cannot be undone.`)) {
                deleteAction(data);
                NPCsMemory.delete(data);
                me.refreshSavedBar();
            }
        });
        return container;
    }
    refreshSavedBar() {
        const me = this, oldIcons = document.getElementsByClassName('save-icon'), savedCharacters = NPCsMemory.getAll();
        for (let i = 0; i < oldIcons.length; i++) {
            oldIcons[i].remove();
            i--;
        }
        if (savedCharacters.length === 0)
            this.HTML.footerElement.style.display = 'none';
        else
            this.HTML.footerElement.style.display = '';
        savedCharacters.forEach((c) => {
            me.HTML.footerElement.appendChild(me.createSavedIcon(c, me.clickAction, me.deleteAction));
        });
    }
}
//# sourceMappingURL=npcs-memory-save-bar.component.js.map