import { Molasses } from "../../../molasses.js";
export class COVIDDisplayCard {
    constructor(title, value, parentElement) {
        this.element = Molasses.createElement({
            type: 'div',
            classList: 'display-card',
            children: [
                Molasses.createElement({
                    type: 'h2',
                    classList: 'card-value',
                    innerText: value + '',
                }), Molasses.createElement({
                    type: 'h4',
                    classList: 'card-title',
                    innerText: title,
                }),
            ]
        });
        parentElement.appendChild(this.element);
    }
    get value() {
        return this.element.querySelector('.card-value').innerHTML;
    }
    get classList() {
        return this.element.classList;
    }
    set value(s) {
        this.element.querySelector('.card-value').innerHTML = s + '';
    }
}
//# sourceMappingURL=display-card.component.js.map