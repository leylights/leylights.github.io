import { Molasses } from "../../../molasses.js";
import { COVIDHelper } from "../helper.js";
import { COVIDDisplayCard } from "./display-card.component.js";
import { COVIDSection } from "./section.component.js";

export type COVIDGridCardConfig = {
  title: string,
  responseGetter?: () => Promise<(string | number)>,
  noRequest?: boolean,
  noRequestCardText?: string,
  isSuccess?: (response: string | number) => boolean,
  isNeutral?: (response: string | number) => boolean,
  isFailure?: (response: string | number) => boolean,
  valueAsPercentage?: boolean,
};

export class COVIDCardGrid {
  private element: HTMLDivElement;
  private grid: HTMLDivElement;

  private cards: COVIDDisplayCard[] = [];

  constructor(
    title: string,
    cardData: COVIDGridCardConfig[],
    parentElement: COVIDSection | HTMLElement,
    config?: {
      maxTwoAcross: boolean;
    }) {

    const me = this,
      gridClass = 'card-grid';
    this.element = Molasses.createElement({
      type: 'div',
      classList: 'grid-section',
      children: [Molasses.createElement({
        type: 'h2',
        innerText: title,
      }), Molasses.createElement({
        type: 'div',
        classList: gridClass + (config?.maxTwoAcross ? ' max-two-across' : ''),
      })]
    });

    // Set up the card grid
    this.grid = this.element.querySelector(`.${gridClass}`);
    cardData.forEach((card) => {
      const HTMLCard = new COVIDDisplayCard(card.title.toUpperCase(), card.noRequestCardText || '...', me.grid);
      me.cards.push(HTMLCard);
      if (!card.noRequest) {
        card.responseGetter().then(async (result) => {
          // set result
          if (card.valueAsPercentage && typeof result === 'number') {
            HTMLCard.value = COVIDHelper.formatAsPercentage(result);
          } else {
            HTMLCard.value = result;
          }

          // style card
          if (card.isSuccess && card.isSuccess(result))
            HTMLCard.classList.add('success-card');
          else if (card.isFailure && card.isFailure(result))
            HTMLCard.classList.add('fail-card');
          else if (card.isNeutral && card.isNeutral(result))
            HTMLCard.classList.add('neutral-card');
        });
      }
    });

    // Append
    if (parentElement instanceof COVIDSection)
      parentElement.appendToBody(this.element);
    else
      parentElement.appendChild(this.element);
  }
}
