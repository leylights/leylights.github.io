import { cws } from "../../../cws.js";
export class COVIDDisplayCard {
    constructor(title, value, parentElement) {
        this.element = cws.createElement({
            type: 'div',
            classList: 'display-card',
            children: [
                cws.createElement({
                    type: 'h2',
                    classList: 'card-value',
                    innerText: value + '',
                }), cws.createElement({
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