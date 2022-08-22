var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cws } from "../../cws.js";
import { Button } from "../../components/button.component.js";
import { NPCsName } from "./helper-repository/name.js";
import { NPCsRace } from "./core/race.js";
export class NPCsNamesList {
    constructor() {
        this.pageContent = document.body.querySelector('.content');
        this.tableContainer = null;
        this.tables = {
            firstNames: HTMLTableElement = null,
            lastNames: HTMLTableElement = null,
        };
        this.submitButton = null;
        this.outputField = null;
        const me = this;
        this.tableContainer = cws.createElement({
            type: 'div',
        });
        this.pageContent.appendChild(this.tableContainer);
        me.generateTables();
        this.submitButton = Button.createByAppending(me.pageContent, () => {
            me.generateJSON();
        }, 'Submit', true);
        this.outputField = cws.createElement({
            type: 'textarea',
            id: 'npcs-names-output',
        });
        this.pageContent.appendChild(this.outputField);
    }
    generateJSON() {
        const me = this;
        me.outputField.value = '{';
        generateTableJSON(this.tables.firstNames, 'firstNames');
        generateTableJSON(this.tables.lastNames, 'lastNames', true);
        me.outputField.value += '}';
        function generateTableJSON(table, attributeName, last) {
            const rows = Array.from(table.querySelector('tbody').querySelectorAll('tr'));
            const archetypesList = NPCsRace.archetypes;
            me.outputField.value += `"${attributeName}": [`;
            const names = rows.map((row) => {
                const selectedArchetypes = [];
                for (let i = 1; i < row.cells.length; i++) {
                    if (row.cells[i].querySelector('button').classList.contains('selected'))
                        selectedArchetypes.push(archetypesList[i - 1]);
                }
                return new NPCsName({ name: row.cells[0].innerText, owners: selectedArchetypes });
            }).sort((a, b) => {
                return a.name < b.name ? -1 : 1;
            });
            for (let i = 0; i < names.length; i++) {
                me.outputField.value += ` ${JSON.stringify(names[i])}`;
                if (i < names.length - 1)
                    me.outputField.value += ',\n';
            }
            me.outputField.value += ']';
            if (!last)
                me.outputField.value += ',';
        }
    }
    generateTables() {
        return __awaiter(this, void 0, void 0, function* () {
            const namesList = yield NPCsName.getList();
            this.tables.firstNames = yield this.generateTable(cws.Array.distinct(namesList.firstNames.all, (a, b) => { return a.name === b.name; }), 'first-names');
            this.tables.lastNames = yield this.generateTable(cws.Array.distinct(namesList.lastNames.all, (a, b) => { return a.name === b.name; }), 'last-names');
        });
    }
    generateTable(namesList, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const tableHeadMainRow = cws.createElement({
                type: 'tr',
                children: [cws.createElement({
                        type: 'th',
                        innerText: 'name',
                    })]
            }), tableBody = cws.createElement({
                type: 'tbody',
            }), table = cws.createElement({
                type: 'table',
                id: id,
                children: [
                    cws.createElement({
                        type: 'thead',
                        children: [tableHeadMainRow]
                    }),
                    tableBody
                ]
            });
            const archetypesList = NPCsRace.archetypes;
            archetypesList.forEach((archetype) => {
                tableHeadMainRow.appendChild(cws.createElement({
                    type: 'th',
                    innerText: archetype,
                }));
            });
            namesList.forEach((name) => {
                const newRow = cws.createElement({
                    type: 'tr',
                    children: [cws.createElement({
                            type: 'td',
                            innerText: name.name,
                        })],
                });
                archetypesList.forEach((archetype) => {
                    const selector = cws.createElement({
                        type: 'button',
                        innerText: archetype,
                        classList: cws.Array.includes(name.owners, archetype) ? 'selected' : '',
                    });
                    const newCell = cws.createElement({
                        type: 'td',
                        children: [selector],
                    });
                    selector.addEventListener('click', () => {
                        if (selector.classList.contains('selected'))
                            selector.classList.remove('selected');
                        else
                            selector.classList.add('selected');
                    });
                    newRow.appendChild(newCell);
                });
                tableBody.appendChild(newRow);
            });
            this.tableContainer.appendChild(table);
            return table;
        });
    }
}
new NPCsNamesList();
//# sourceMappingURL=npcs-names-list.js.map