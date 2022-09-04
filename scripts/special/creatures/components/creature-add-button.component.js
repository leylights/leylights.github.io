import { Leylights } from "../../../leylights.js";
import { Button } from "../../../components/button.component.js";
import { SummonsCreatureFactory } from "../creature-factory.js";
export class SummonsCreatureAddButton {
    constructor(parentElement, addNewViewComponent, addNewCreature) {
        const me = this;
        // create select
        this.selector = Leylights.createElement({
            type: 'select',
            classList: 'create-select'
        });
        // fill select options
        const names = Leylights.Object.values(SummonsCreatureFactory.creatures).map((c) => { return c.name; });
        names.forEach((name) => {
            me.selector.appendChild(Leylights.createElement({
                type: 'option',
                innerText: name.toUpperCase(),
            }));
        });
        me.selector.appendChild(Leylights.createElement({
            type: 'option',
            innerText: SummonsCreatureAddButton.NEW_CREATURE_NAME.toUpperCase(),
        }));
        // create table
        this.table = Leylights.createTable({
            body: [[Leylights.createElement({
                        type: 'div',
                        classList: 'create-button'
                    }), this.selector]]
        });
        parentElement.appendChild(this.table);
        this.addButton = Button.createByReplacement(this.table.querySelector('.create-button'), () => {
            const selectedCreature = this.selector.value;
            if (selectedCreature == SummonsCreatureAddButton.NEW_CREATURE_NAME.toUpperCase()) {
                addNewCreature();
            }
            else {
                const createdCreature = Array.from(Leylights.Object.values(SummonsCreatureFactory.creatures)).filter((c) => {
                    return c.name.toUpperCase() === selectedCreature;
                })[0].creator();
                addNewViewComponent(createdCreature);
            }
        }, 'Add: ', false, null, 'create-button');
    }
}
SummonsCreatureAddButton.NEW_CREATURE_NAME = 'NEW';
//# sourceMappingURL=creature-add-button.component.js.map