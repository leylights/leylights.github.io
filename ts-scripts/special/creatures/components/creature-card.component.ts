import { Molasses } from "../../../molasses";
import { Button } from "../../../components/button.component";
import { ResizingInput } from "../../../components/resizing-input.component";
import { SummonsCreature, SummonsCreatureAttack } from "../creature";
import { SummonsCreatureViewComponent } from "./creature-view.component";

export class SummonsCreatureCardComponent implements SummonsCreatureViewComponent {
  private element: HTMLElement;
  private attackDisplay: HTMLDivElement;
  private attackSubtitle: HTMLHeadingElement;
  private damageDisplay: HTMLDivElement;
  private deleteButton: Button;

  readonly id: number;

  constructor(creature: SummonsCreature, parentElement: HTMLElement, deleteFunction: (target: SummonsCreatureCardComponent) => void) {
    const me = this;

    this.id = SummonsCreatureCardComponent.nextCardId++;

    this.element = Molasses.createElement({
      type: 'div',
      classList: 'creature-card-new',
      children: [
        Molasses.createElement({
          type: 'div',
          classList: 'name-row',
          children: [
            Molasses.createElement({
              type: 'div',
              classList: 'creature-name',
              children: [
                Molasses.createElement({
                  type: 'input',
                  classList: 'fit-to-content',
                  otherNodes: [{ type: 'value', value: creature.name }]
                }),
              ],
            }),
            Molasses.createElement({
              type: 'div',
              classList: 'creature-hp',
              children: [Molasses.createElement({
                type: 'p',
                children: [
                  Molasses.createElement({
                    type: 'span',
                    innerText: 'HP: ('
                  }),
                  Molasses.createElement({
                    type: 'input',
                    classList: 'fit-to-content',
                    otherNodes: [{ type: 'value', value: creature.hp + '', }]
                  }),
                  Molasses.createElement({
                    type: 'span',
                    innerText: ' / ' + creature.TOTAL_HP + ')',
                  }),
                ]
              })],
            }),
            Molasses.createElement({
              type: 'div',
              classList: 'card-delete-button',
              children: [
                Molasses.createElement({
                  type: 'span',
                  innerText: 'x'
                }),
              ]
            })]
        }),
        Molasses.createElement({
          type: 'hr'
        }),
        Molasses.createTable({
          body: [
            [
              Molasses.createElement({
                type: 'div',
                classList: 'card-roll-display attack-roll',
                innerText: '-'
              }), Molasses.createElement({
                type: 'div',
                classList: 'card-roll-display damage-roll',
                innerText: '-'
              })
            ], [
              Molasses.createElement({
                type: 'h4',
                innerText: 'ATTACK',
                classList: 'attack-subtitle'
              }), Molasses.createElement({
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

  setRolls(attack: SummonsCreatureAttack, damage: number, attackLimits: {
    greenBound: number,
    redBound: number,
  }): void {
    if (attackLimits.redBound > attackLimits.greenBound) {
      throw new Error("Red must be lower than green bound");
    }

    // Set attack roll
    this.attackDisplay.innerText = attack.result + '';

    // Set attack colour
    const midpoint = (attackLimits.greenBound + attackLimits.redBound) / 2;
    let colour: string;

    if (attack.isCritical) {
      colour = '#03d3d3';
    } else if (attack.result < attackLimits.redBound) {
      colour = '#880000';
    } else if (attack.result < midpoint) {
      colour = `rgb(127, ${127 * ((attack.result - attackLimits.redBound) / (midpoint - attackLimits.redBound))}, 0)`;
    } else if (attack.result < attackLimits.greenBound) {
      colour = `rgb(${127 * ((attackLimits.greenBound - attack.result) / (attackLimits.greenBound - midpoint))}, 127, 0)`;
    } else {
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

  private static nextCardId: number = 100000;
}
