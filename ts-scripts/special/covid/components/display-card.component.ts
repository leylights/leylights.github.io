import { Molasses } from "../../../molasses";

export class COVIDDisplayCard {
  private element: HTMLDivElement;

  constructor(title: string, value: string | number, parentElement: HTMLElement) {
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

  get value(): string {
    return this.element.querySelector('.card-value').innerHTML;
  }

  get classList(): DOMTokenList {
    return this.element.classList;
  }

  set value(s: string | number) {
    this.element.querySelector('.card-value').innerHTML = s + '';
  }
}
