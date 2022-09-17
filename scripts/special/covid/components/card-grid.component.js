var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Molasses } from "../../../molasses.js";
import { COVIDHelper } from "../helper.js";
import { COVIDDisplayCard } from "./display-card.component.js";
import { COVIDSection } from "./section.component.js";
export class COVIDCardGrid {
    constructor(title, cardData, parentElement, config) {
        this.cards = [];
        const me = this, gridClass = 'card-grid';
        this.element = Molasses.createElement({
            type: 'div',
            classList: 'grid-section',
            children: [Molasses.createElement({
                    type: 'h2',
                    innerText: title,
                }), Molasses.createElement({
                    type: 'div',
                    classList: gridClass + ((config === null || config === void 0 ? void 0 : config.maxTwoAcross) ? ' max-two-across' : ''),
                })]
        });
        // Set up the card grid
        this.grid = this.element.querySelector(`.${gridClass}`);
        cardData.forEach((card) => {
            const HTMLCard = new COVIDDisplayCard(card.title.toUpperCase(), card.noRequestCardText || '...', me.grid);
            me.cards.push(HTMLCard);
            if (!card.noRequest) {
                card.responseGetter().then((result) => __awaiter(this, void 0, void 0, function* () {
                    // set result
                    if (card.valueAsPercentage && typeof result === 'number') {
                        HTMLCard.value = COVIDHelper.formatAsPercentage(result);
                    }
                    else {
                        HTMLCard.value = result;
                    }
                    // style card
                    if (card.isSuccess && card.isSuccess(result))
                        HTMLCard.classList.add('success-card');
                    else if (card.isFailure && card.isFailure(result))
                        HTMLCard.classList.add('fail-card');
                    else if (card.isNeutral && card.isNeutral(result))
                        HTMLCard.classList.add('neutral-card');
                }));
            }
        });
        // Append
        if (parentElement instanceof COVIDSection)
            parentElement.appendToBody(this.element);
        else
            parentElement.appendChild(this.element);
    }
}
//# sourceMappingURL=card-grid.component.js.map