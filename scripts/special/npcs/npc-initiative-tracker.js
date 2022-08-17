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
import { Button } from "../_components/button.component.js";
import { BASE_TEMP_HIGHLIGHT_TIME } from "../_components/general.js";
import { ResizingInput } from "../_components/resizing-input.component.js";
import { NPCsRace } from "./core/race.js";
import { NPCsDice } from "./helper-repository/general.js";
import { NPCsInitiativeTrackerCombatant } from "./helper-repository/initiative-tracker-combatant.js";
var InitialTableCellMap;
(function (InitialTableCellMap) {
    InitialTableCellMap[InitialTableCellMap["name"] = 0] = "name";
    InitialTableCellMap[InitialTableCellMap["initiative"] = 1] = "initiative";
    InitialTableCellMap[InitialTableCellMap["isNPC"] = 2] = "isNPC";
})(InitialTableCellMap || (InitialTableCellMap = {}));
export class NPCsInitiativeTracker {
    constructor() {
        this.combatants = [];
        this.currentRound = 1;
        this.firstCombatantId = null;
        this.HTML = {
            content: document.body.querySelector('#tracker-main'),
            sideBar: document.body.querySelector('#tracker-side-bar'),
            initial: {
                table: null,
                tableBody: null,
                beginButton: null,
            },
            tracker: {
                current: null,
                upcoming: null,
                upcomingPlayer: null,
                currentRound: null,
                nextButton: null,
                grid: null,
                topOfRoundArrow: null,
                combatantRows: [],
            }
        };
        this.loadInitialHTML();
        // temp
        if (NPCsInitiativeTracker.FILL_INPUT)
            setTimeout(() => {
                this.combatants = [
                    new NPCsInitiativeTrackerCombatant('Rand', 9, true, false, 4000),
                    new NPCsInitiativeTrackerCombatant('Dag', 13, true, false, 320),
                    new NPCsInitiativeTrackerCombatant('Achilles', 21, false, false),
                    new NPCsInitiativeTrackerCombatant('Chompers', 15, false, false),
                    new NPCsInitiativeTrackerCombatant('Cletus', 18, true, false),
                    new NPCsInitiativeTrackerCombatant('Aromashana', 15, false, false),
                    new NPCsInitiativeTrackerCombatant('Jemen', 19, false, false)
                ];
                this.loadTrackerHTML();
            }, 100);
    }
    get enabledCharacterCount() {
        return this.combatants.filter((combatant) => {
            return combatant.isEnabled;
        }).length;
    }
    get encounterIsValid() {
        return this.enabledCharacterCount > 1;
    }
    addTableRow() {
        const me = this, newRow = cws.createElement({
            type: 'tr',
            children: [
                cws.createElement({
                    type: 'td',
                }),
                cws.createElement({
                    type: 'td',
                })
            ]
        });
        Array.from(newRow.cells).forEach((cell) => {
            cell.contentEditable = 'true';
        });
        // set up isNPC cell after so that it does not become editable
        const isNPCButton = cws.createElement({
            type: 'button'
        }), isNPCBody = cws.createElement({
            type: 'div',
            classList: 'npc-data-cell',
            children: [
                cws.createElement({
                    type: 'div',
                    classList: 'is-npc-container',
                    children: [isNPCButton]
                }),
                cws.createElement({
                    type: 'div',
                    classList: 'health-input-container',
                    children: [cws.createElement({
                            type: 'input',
                            classList: 'health-input',
                            otherNodes: [{
                                    type: 'placeholder',
                                    value: 'HP'
                                }]
                        })]
                })
            ]
        }), isNPCCell = cws.createElement({
            type: 'td',
            children: [
                isNPCBody,
            ]
        });
        isNPCButton.addEventListener('click', () => {
            if (isNPCButton.classList.contains('selected')) {
                isNPCButton.classList.remove('selected');
                isNPCBody.classList.remove('selected');
                isNPCBody.classList.add('transition-to-deselected');
                const transitionTime = parseFloat(window.getComputedStyle(document.body).getPropertyValue('--hover-color-transition').match(/[0-9.]/g).join('')) * 1000;
                if (isNaN(transitionTime))
                    throw new Error('Cannot get --hover-color-transition time');
                setTimeout(() => {
                    isNPCBody.classList.remove('transition-to-deselected');
                }, transitionTime);
            }
            else {
                isNPCButton.classList.add('selected');
                isNPCBody.classList.add('selected');
            }
            me.tableExpansionListener();
            if (newRow.parentElement && newRow.rowIndex < me.HTML.initial.tableBody.rows.length)
                me.deleteTableRowIfEmpty(newRow);
        });
        newRow.addEventListener('focusout', () => {
            if (newRow.parentElement && newRow.rowIndex < me.HTML.initial.tableBody.rows.length)
                me.deleteTableRowIfEmpty(newRow);
        });
        newRow.appendChild(isNPCCell);
        this.HTML.initial.tableBody.appendChild(newRow);
    }
    changeCombatantEnabledState(disabledCombatant, enable) {
        const combatantRow = this.HTML.tracker.combatantRows.filter((row) => {
            return row.id === disabledCombatant.id;
        })[0];
        if (enable) {
            combatantRow.initiative.classList.remove('disabled');
            combatantRow.name.classList.remove('disabled');
        }
        else {
            combatantRow.initiative.classList.add('disabled');
            combatantRow.name.classList.add('disabled');
        }
        disabledCombatant.isEnabled = enable;
        if (this.encounterIsValid) {
            this.loadTrackerTitle();
            if (!enable && this.combatants[0].id === disabledCombatant.id) {
                this.loadNextCombatant();
            }
        }
    }
    deleteTableRowIfEmpty(row, alternateRowToDelete) {
        let isEmpty = true;
        if (!row.parentElement)
            return; // already removed
        Array.from(row.cells).forEach((cell) => {
            const button = cell.querySelector('button');
            if (button && button.classList.contains('selected'))
                isEmpty = false;
            else if (cell.innerText != '')
                isEmpty = false;
        });
        if (isEmpty)
            if (alternateRowToDelete)
                alternateRowToDelete.remove();
            else
                try {
                    row.remove();
                }
                catch (e) {
                    //
                }
    }
    tableExpansionListener() {
        const me = this, tbody = this.HTML.initial.tableBody, lastRow = tbody.rows[tbody.rows.length - 1];
        let needsExpansion = false;
        Array.from(lastRow.cells).forEach((cell) => {
            const button = cell.querySelector('button');
            if (button && button.classList.contains('selected'))
                needsExpansion = true;
            else if (cell.innerText != '')
                needsExpansion = true;
        });
        if (needsExpansion)
            this.addTableRow();
        else if (tbody.rows.length > 1) {
            const secondLastRow = tbody.rows[tbody.rows.length - 2];
            me.deleteTableRowIfEmpty(secondLastRow, lastRow);
        }
        // determine if ready to begin tracker
        const hasValidHPInput = Array.from(tbody.rows).filter((row) => {
            const cellValue = row.querySelector('.health-input').value;
            if (cellValue === '' || parseInt(cellValue) + '' == cellValue)
                return false;
            else
                return !NPCsDice.isValidDiceString(cellValue);
        }).length === 0; // only invalid rows remain in array
        if (!hasValidHPInput) {
            me.HTML.initial.beginButton.disable();
            return;
        }
        if (tbody.rows.length > 2) {
            let filledInitiativeCount = 0;
            Array.from(tbody.rows).forEach((row) => {
                const text = row.cells[InitialTableCellMap.initiative].innerText;
                if (text.trim().search(/[^0-9]/) === -1 // has no invalid characters
                    && text.trim().search(/[0-9]/) !== -1 // has number
                )
                    filledInitiativeCount++;
            });
            if (filledInitiativeCount === tbody.rows.length - 1)
                me.HTML.initial.beginButton.enable();
            else
                me.HTML.initial.beginButton.disable();
        }
    }
    loadInitialHTML() {
        const me = this, tbody = cws.createElement({
            type: 'tbody',
        }), table = cws.createElement({
            type: 'table',
            id: 'data-input-table',
            children: [
                cws.createElement({
                    type: 'thead',
                    children: [
                        cws.createElement({
                            type: 'tr',
                            children: [
                                cws.createElement({
                                    type: 'th',
                                    innerText: 'Name'
                                }),
                                cws.createElement({
                                    type: 'th',
                                    innerText: 'Initiative'
                                }),
                                cws.createElement({
                                    type: 'th',
                                    innerText: 'Is NPC?'
                                })
                            ]
                        })
                    ]
                }), tbody
            ]
        });
        me.HTML.initial.table = table;
        me.HTML.initial.tableBody = tbody;
        table.addEventListener('input', () => { me.tableExpansionListener(); });
        me.addTableRow();
        me.HTML.content.appendChild(table);
        // begin button
        me.HTML.initial.beginButton = Button.createByAppending(me.HTML.content, () => {
            const anyNaN = Array.from(me.HTML.initial.tableBody.rows).filter((row) => {
                return isNaN(parseInt(row.cells[InitialTableCellMap.initiative].innerText));
            }).length > 1;
            if (anyNaN)
                throw new Error('Bad input: one of the initiative fields is not a number');
            me.loadTrackerHTML();
        }, 'Begin', true);
        me.HTML.initial.beginButton.disable();
    }
    loadNextCombatant(forceAndSkipTitleChanges) {
        const me = this;
        if (!forceAndSkipTitleChanges && !me.encounterIsValid) {
            return;
        }
        me.HTML.tracker.grid.appendChild(me.HTML.tracker.combatantRows[0].container);
        me.combatants.push(me.combatants.shift());
        me.HTML.tracker.combatantRows.push(me.HTML.tracker.combatantRows.shift());
        if (me.combatants[0].id === me.firstCombatantId) { // new round
            me.HTML.tracker.grid.appendChild(me.HTML.tracker.topOfRoundArrow);
            me.currentRound++;
            me.resetCurrentRoundHTML();
        }
        if (me.combatants[0].isEnabled && !forceAndSkipTitleChanges)
            me.loadTrackerTitle();
        else
            me.loadNextCombatant();
    }
    loadToNextValidCombatant() {
        if (this.enabledCharacterCount === 0)
            return;
        while (!this.combatants[0].isEnabled)
            this.loadNextCombatant(true);
    }
    loadTrackerHTML() {
        return __awaiter(this, void 0, void 0, function* () {
            const me = this;
            me.HTML.initial.tableBody.rows[me.HTML.initial.tableBody.rows.length - 1].remove(); // remove empty row
            // load combatants array
            const takenNames = [];
            yield Promise.all(Array.from(me.HTML.initial.tableBody.rows).map((row) => __awaiter(this, void 0, void 0, function* () {
                const generateName = row.cells[InitialTableCellMap.name].innerText.trim() === '', HPField = getRowHPField(row);
                let HP = parseInt(HPField.value);
                if (NPCsDice.isValidDiceString(HPField.value))
                    HP = new NPCsDice(HPField.value).average;
                let name = '';
                if (generateName) {
                    for (let i = 0; i < 100; i++) {
                        name = (yield NPCsRace.list.human.generateName())[0];
                        if (!(cws.Array.includes(takenNames, name)))
                            break;
                    }
                }
                else {
                    name = row.cells[InitialTableCellMap.name].innerText;
                }
                takenNames.push(name);
                me.combatants.push(new NPCsInitiativeTrackerCombatant(name, parseFloat(row.cells[InitialTableCellMap.initiative].innerText), getRowIsNPCButton(row).classList.contains('selected'), generateName, !getRowIsNPCButton(row).classList.contains('selected') || isNaN(HP) ? null : HP));
            })));
            me.combatants.sort((a, b) => { return b.initiative - a.initiative; });
            me.firstCombatantId = me.combatants[0].id;
            // clear old elements
            Array.from(me.HTML.content.children).forEach((child) => { child.remove(); });
            // generate initiative tracker
            me.HTML.tracker.current = cws.createElement({
                type: 'h2',
            });
            me.HTML.tracker.upcoming = cws.createElement({
                type: 'h3',
            });
            me.HTML.tracker.upcomingPlayer = cws.createElement({
                type: 'h3',
                classList: 'invisible',
                innerText: 'Next player character:'
            });
            me.HTML.tracker.currentRound = cws.createElement({
                type: 'p',
                innerText: `Current round: 1`
            });
            const nextDiv = cws.createElement({
                type: 'div',
                style: 'position: relative',
                children: [
                    me.HTML.tracker.upcoming,
                    me.HTML.tracker.upcomingPlayer
                ]
            });
            const newPage = cws.createElement({
                type: 'div',
                id: 'initiative-tracker',
                children: [
                    me.HTML.tracker.current,
                    nextDiv,
                ],
            });
            me.HTML.tracker.nextButton = Button.createByAppending(nextDiv, () => {
                me.loadNextCombatant();
            }, 'Next', true, 'next-combatant-button');
            newPage.appendChild(me.HTML.tracker.currentRound);
            me.resetCurrentRoundHTML();
            me.HTML.tracker.topOfRoundArrow = cws.createElement({
                type: 'div',
                classList: 'top-of-round',
                children: [
                    cws.createElement({
                        type: 'div',
                        classList: 'arrow',
                        children: [cws.createElement({
                                type: 'div',
                                classList: ['triangle'],
                            }), cws.createElement({
                                type: 'div',
                                classList: ['line'],
                            })],
                    })
                ],
            });
            me.HTML.tracker.grid = cws.createElement({
                type: 'div',
                classList: 'combatant-grid',
            });
            me.combatants.forEach((combatant) => {
                createRow(combatant);
            });
            me.HTML.tracker.grid.appendChild(me.HTML.tracker.topOfRoundArrow);
            newPage.appendChild(me.HTML.tracker.grid);
            me.HTML.content.appendChild(newPage);
            me.HTML.tracker.combatantRows.forEach((row) => {
                if (row.HPInput)
                    row.HPInput.resizeToContent();
            });
            me.loadTrackerTitle();
            function createRow(combatant) {
                const deleteButton = cws.createElement({
                    type: 'span',
                    classList: 'npcs-delete-button',
                    innerText: 'remove'
                }), nextCombatantRow = {
                    isLong: combatant.hasAdditionalData,
                    initiative: cws.createElement({
                        type: 'div',
                        classList: ['combatant-initiative'].concat(combatant.isNPC ? ['is-npc'] : []),
                        innerText: combatant.initiative + '',
                    }),
                    name: cws.createElement({
                        type: 'div',
                        classList: 'combatant-name',
                        children: [
                            cws.createElement({
                                type: 'span',
                                innerText: combatant.name,
                            }),
                        ],
                    }),
                    deleteButton: Button.createByAttachment(deleteButton, () => {
                        me.changeCombatantEnabledState(combatant, nextCombatantRow.initiative.classList.contains('disabled'));
                        me.resetCombatValidity();
                        if (deleteButton.innerText === 'remove')
                            deleteButton.innerText = 'add';
                        else
                            deleteButton.innerText = 'remove';
                        if (me.enabledCharacterCount > 0)
                            me.loadToNextValidCombatant();
                    }, 'Remove'),
                    container: cws.createElement({
                        type: 'div',
                        classList: ['combatant-row'].concat(combatant.hasAdditionalData ? ['combatant-row-long'] : []),
                    }),
                    id: combatant.id,
                };
                nextCombatantRow.container.appendChild(nextCombatantRow.initiative);
                nextCombatantRow.container.appendChild(nextCombatantRow.name);
                if (combatant.HP) {
                    nextCombatantRow.HPInput = new ResizingInput(cws.createElement({
                        type: 'input',
                        classList: 'combatant-hp',
                        otherNodes: [{
                                type: 'value',
                                value: combatant.HP + ''
                            }, {
                                type: 'placeholder',
                                value: combatant.HP + ''
                            }]
                    }));
                    nextCombatantRow.HPContainer = cws.createElement({
                        type: 'div',
                        classList: 'combatant-hp-container',
                        children: [cws.createElement({
                                type: 'div',
                                children: [cws.createElement({
                                        type: 'span',
                                        innerText: 'HP: '
                                    }),
                                    nextCombatantRow.HPInput.element]
                            })]
                    });
                    nextCombatantRow.container.appendChild(nextCombatantRow.HPContainer);
                }
                nextCombatantRow.container.children[nextCombatantRow.container.children.length - 1].appendChild(deleteButton);
                me.HTML.tracker.grid.appendChild(nextCombatantRow.container);
                me.HTML.tracker.combatantRows.push(nextCombatantRow);
            }
            function getRowIsNPCButton(row) {
                return row.cells[InitialTableCellMap.isNPC].querySelector('button');
            }
            function getRowHPField(row) {
                return row.cells[InitialTableCellMap.isNPC].querySelector('input.health-input');
            }
        });
    }
    loadTrackerTitle() {
        const me = this;
        this.HTML.tracker.current.innerText = `Current combatant: ${this.combatants[0].name}`;
        this.HTML.tracker.upcoming.innerText = `On deck: ${getNextCharacter().name}`;
        if (this.combatants[0].isNPC && getNextCharacter().isNPC && getNextCharacter().isEnabled && hasPlayerCharacters()) {
            this.HTML.tracker.upcomingPlayer.innerText = `Next player character: ${getNextPlayerCharacter().name}`;
            this.HTML.tracker.upcomingPlayer.classList.remove('invisible');
        }
        else {
            this.HTML.tracker.upcomingPlayer.classList.add('invisible');
        }
        function getNextCharacter() {
            for (let i = 1; i < me.combatants.length; i++)
                if (me.combatants[i].isEnabled)
                    return me.combatants[i];
            throw new Error('Only 1 character remains; no next character can be found.');
        }
        function getNextPlayerCharacter() {
            for (let i = 0; i < me.combatants.length; i++)
                if (me.combatants[i].isEnabled && !me.combatants[i].isNPC)
                    return me.combatants[i];
        }
        function hasPlayerCharacters() {
            return me.combatants.filter((c) => {
                return c.isEnabled && !c.isNPC;
            }).length > 0;
        }
    }
    resetCombatValidity() {
        const me = this;
        if (me.encounterIsValid) {
            me.HTML.tracker.nextButton.enable();
            me.loadTrackerTitle();
        }
        else {
            me.HTML.tracker.nextButton.disable();
            me.HTML.tracker.current.innerText = 'Encounter complete';
            me.HTML.tracker.upcoming.innerText = 'One or less combatants remain';
            me.HTML.tracker.upcomingPlayer.classList.add('invisible');
        }
    }
    resetCurrentRoundHTML() {
        const me = this, lastRound = cws.parseFirstFloat(this.HTML.tracker.currentRound.innerText);
        if (lastRound !== this.currentRound) {
            const highlight = 'highlight-tracker-text', timeout = BASE_TEMP_HIGHLIGHT_TIME;
            this.HTML.tracker.currentRound.classList.add(highlight);
            this.HTML.tracker.currentRound.id = Date.now() + '';
            setTimeout(() => {
                const startTime = parseInt(me.HTML.tracker.currentRound.id);
                if (Date.now() - startTime <= timeout)
                    return;
                me.HTML.tracker.currentRound.classList.remove(highlight);
            }, timeout);
        }
        this.HTML.tracker.currentRound.innerText = `Current round: ${this.currentRound}`;
    }
}
NPCsInitiativeTracker.FILL_INPUT = false;
new NPCsInitiativeTracker();
//# sourceMappingURL=npc-initiative-tracker.js.map