import { Leylights } from "../../../leylights.js";
import { Button } from "../../../components/button.component.js";
import { ResizingInput } from "../../../components/resizing-input.component.js";
export class SummonsCreatureCardComponent {
    constructor(creature, parentElement, deleteFunction) {
        const me = this;
        this.id = SummonsCreatureCardComponent.nextCardId++;
        this.element = Leylights.createElement({
            type: 'div',
            classList: 'creature-card-new',
            children: [
                Leylights.createElement({
                    type: 'div',
                    classList: 'name-row',
                    children: [
                        Leylights.createElement({
                            type: 'div',
                            classList: 'creature-name',
                            children: [
                                Leylights.createElement({
                                    type: 'input',
                                    classList: 'fit-to-content',
                                    otherNodes: [{ type: 'value', value: creature.name }]
                                }),
                            ],
                        }),
                        Leylights.createElement({
                            type: 'div',
                            classList: 'creature-hp',
                            children: [Leylights.createElement({
                                    type: 'p',
                                    children: [
                                        Leylights.createElement({
                                            type: 'span',
                                            innerText: 'HP: ('
                                        }),
                                        Leylights.createElement({
                                            type: 'input',
                                            classList: 'fit-to-content',
                                            otherNodes: [{ type: 'value', value: creature.hp + '', }]
                                        }),
                                        Leylights.createElement({
                                            type: 'span',
                                            innerText: ' / ' + creature.TOTAL_HP + ')',
                                        }),
                                    ]
                                })],
                        }),
                        Leylights.createElement({
                            type: 'div',
                            classList: 'card-delete-button',
                            children: [
                                Leylights.createElement({
                                    type: 'span',
                                    innerText: 'x'
                                }),
                            ]
                        })
                    ]
                }),
                Leylights.createElement({
                    type: 'hr'
                }),
                Leylights.createTable({
                    body: [
                        [
                            Leylights.createElement({
                                type: 'div',
                                classList: 'card-roll-display attack-roll',
                                innerText: '-'
                            }), Leylights.createElement({
                                type: 'div',
                                classList: 'card-roll-display damage-roll',
                                innerText: '-'
                            })
                        ], [
                            Leylights.createElement({
                                type: 'h4',
                                innerText: 'ATTACK',
                                classList: 'attack-subtitle'
                            }), Leylights.createElement({
                                type: 'h4',
                                innerText: 'DAMAGE'
                            }),
                        ]
                    ],
                    classList: ['roll-table'],
                }),
            ]
        });
        this.attackDisplay = this.element.querySelector('.attack-roll');
        this.attackSubtitle = this.element.querySelector('.attack-subtitle');
        this.damageDisplay = this.element.querySelector('.damage-roll');
        this.deleteButton = Button.createByAttachment(this.element.querySelector('.card-delete-button'), () => {
            me.element.remove();
            deleteFunction(me);
        }, 'Card delete');
        parentElement.appendChild(this.element);
        ResizingInput.findAndCreate(this.element);
    }
    setRolls(attack, damage, attackLimits) {
        if (attackLimits.redBound > attackLimits.greenBound) {
            throw new Error("Red must be lower than green bound");
        }
        // Set attack roll
        this.attackDisplay.innerText = attack.result + '';
        // Set attack colour
        const midpoint = (attackLimits.greenBound + attackLimits.redBound) / 2;
        let colour;
        if (attack.isCritical) {
            colour = '#03d3d3';
        }
        else if (attack.result < attackLimits.redBound) {
            colour = '#880000';
        }
        else if (attack.result < midpoint) {
            colour = `rgb(127, ${127 * ((attack.result - attackLimits.redBound) / (midpoint - attackLimits.redBound))}, 0)`;
        }
        else if (attack.result < attackLimits.greenBound) {
            colour = `rgb(${127 * ((attackLimits.greenBound - attack.result) / (attackLimits.greenBound - midpoint))}, 127, 0)`;
        }
        else {
            colour = '#008800';
        }
        this.attackDisplay.style.backgroundColor = colour;
        if (attack.isCritical) {
            this.attackSubtitle.innerText = 'CRITICAL';
            this.attackSubtitle.style.fontWeight = 'bold';
        }
        else {
            this.attackSubtitle.innerText = 'ATTACK';
            this.attackSubtitle.style.fontWeight = '';
        }
        // Set damage roll
        this.damageDisplay.innerText = damage + '';
    }
}
SummonsCreatureCardComponent.nextCardId = 100000;
//# sourceMappingURL=creature-card.component.js.map