import { Molasses } from "../../molasses.js";
import { Button } from "../../components/button.component.js";
import { InputComponent } from "../../components/input.component.js";
import { NPCsDice } from "../npcs/helper-repository/general.js";
import { SummonsCreatureAddButton } from "./components/creature-add-button.component.js";
import { SummonsCreatureCardComponent } from "./components/creature-card.component.js";
import { SummonsCreatureFactory } from "./creature-factory.js";
import { SummonsCreature } from "./creature.js";
;
export class SummonsPage {
    constructor() {
        this.creatures = [];
        this.gridView = document.getElementById('creatures-grid-view');
        this.gridHelpMessage = document.getElementById('creatures-help-message');
        this.popupBackground = document.getElementById('popups-background');
        this.creator = {
            element: document.getElementById('add-new-creature-container'),
            inputs: {
                name: new InputComponent({ element: document.getElementById('new-creature-name') }),
                hpDice: new InputComponent({ element: document.getElementById('new-creature-hp-dice') }),
                hpMod: new InputComponent({ element: document.getElementById('new-creature-hp-mod') }),
                atkMod: new InputComponent({ element: document.getElementById('new-creature-atk-mod') }),
                dmgDice: new InputComponent({ element: document.getElementById('new-creature-dmg-dice') }),
                dmgMod: new InputComponent({ element: document.getElementById('new-creature-dmg-mod') }),
            }
        };
        const me = this;
        // Create "roll" buttons
        Array.from(document.getElementsByClassName('roll-all-btn')).forEach((b) => {
            Button.createByReplacement(b, () => { me.rollAll(); }, 'Roll all', true, null, 'roll-all-btn');
        });
        // Create "add" buttons
        Array.from(document.getElementsByClassName('create-container')).forEach((c) => {
            new SummonsCreatureAddButton(c, (creature) => {
                me.creatures.push(me.buildCard(creature));
            }, () => {
                me.openCreatureCreator();
            });
        });
        // Create popup
        Button.createByReplacement(document.getElementById('create-new-creature-button'), () => {
            return me.createNewCreature();
        }, 'Create', true, 'create-new-creature-button');
        // Debug:
        const debugCreatures = [];
        // debugCreatures.push(SummonsCreatureFactory.Direwolf());
        // debugCreatures.push(SummonsCreatureFactory.Skeleton());
        // debugCreatures.push(SummonsCreatureFactory.Skeleton());
        // debugCreatures.push(SummonsCreatureFactory.Skeleton());
        // debugCreatures.push(SummonsCreatureFactory.Zombie());
        // Create all creatures
        debugCreatures.forEach((c) => { me.creatures.push(me.buildCard(c)); });
        // Set help message visibility
        this.gridHelpMessage.style.display = (this.creatures.length === 0) ? 'block' : '';
    }
    buildCard(creature) {
        const me = this;
        // Make help message invisible
        this.gridHelpMessage.style.display = '';
        return {
            creature: creature,
            display: new SummonsCreatureCardComponent(creature, this.gridView, (target) => { me.deleteCardComponent(target); }),
        };
    }
    // Creates a new creature and adds one instance of it to the grid
    // Returns false if failed
    createNewCreature() {
        const me = this;
        function intGate(el) {
            if (parseInt(el.value).toString() != el.value.trim()
                || el.value.trim() === ''
                || isNaN(parseInt(el.value))) {
                el.reject();
                return false;
            }
            return true;
        }
        function diceGate(el) {
            function reject() {
                el.reject();
                return false;
            }
            if (el.value.trim() == '')
                return reject();
            if (el.value.trim().split('+').join('') == '')
                return reject();
            try {
                el.value.split('+').forEach((s) => {
                    new NPCsDice(s);
                });
            }
            catch (e) {
                return reject();
            }
            return true;
        }
        // Check that inputs are valid
        if (this.creator.inputs.name.value.trim() == '') {
            this.creator.inputs.name.reject();
            return false;
        }
        if (!diceGate(this.creator.inputs.hpDice))
            return false;
        if (!intGate(this.creator.inputs.hpMod))
            return false;
        if (!intGate(this.creator.inputs.atkMod))
            return false;
        if (!diceGate(this.creator.inputs.dmgDice))
            return false;
        if (!intGate(this.creator.inputs.dmgMod))
            return false;
        const name = me.creator.inputs.name.value.trim();
        // Create the new creature and register it in the factory
        function creatureCreator() {
            return new SummonsCreature({
                name: name,
                healthDice: me.creator.inputs.hpDice.value,
                healthMod: parseInt(me.creator.inputs.hpMod.value),
                attackMod: parseInt(me.creator.inputs.atkMod.value),
                damageDice: me.creator.inputs.dmgDice.value,
                damageMod: parseInt(me.creator.inputs.dmgMod.value),
            });
        }
        SummonsCreatureFactory.creatures[Molasses.toCamelCase(name)] = {
            name: name,
            creator: creatureCreator
        };
        // Add the new creature to all creator buttons
        const addButtons = Array.from(document.getElementsByClassName('create-select'));
        addButtons.forEach((s) => {
            for (let i = 0; i < s.children.length; i++) {
                if (name.toUpperCase() < s.children[i].innerHTML) {
                    s.children[i].insertAdjacentElement('beforebegin', Molasses.createElement({
                        type: 'option',
                        innerText: name.toUpperCase()
                    }));
                    break;
                }
            }
        });
        // Create an instance of the new creature
        this.creatures.push(this.buildCard(creatureCreator()));
        // Close the popup
        this.creator.element.style.display = 'none';
        this.popupBackground.style.display = 'none';
    }
    // Removes a card from the creatures array
    deleteCardComponent(target) {
        this.creatures = this.creatures.filter((c) => {
            return target.id !== c.display.id;
        });
        this.gridHelpMessage.style.display = (this.creatures.length === 0) ? 'block' : '';
    }
    openCreatureCreator() {
        this.creator.element.style.display = 'block';
        this.popupBackground.style.display = 'block';
    }
    rollAll() {
        this.creatures.forEach((c) => {
            c.display.setRolls(c.creature.rollAttack(), c.creature.rollDamage(), {
                greenBound: 20,
                redBound: 10,
            });
        });
    }
}
new SummonsPage();
//# sourceMappingURL=summons.page.js.map