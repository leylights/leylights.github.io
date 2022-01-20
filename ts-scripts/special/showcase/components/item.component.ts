import { cws } from "../../../cws.js";
import { MenuItem } from "../../../menu-items.js";

export class ShowcaseItem {
  private static next_id = 0;

  private item: MenuItem;
  private container: HTMLElement;
  private _id: number = ShowcaseItem.next_id++;

  private hasShadow: boolean = false;

  constructor(item: MenuItem, parentElement: HTMLElement) {
    this.item = item;
    this.rebuild(parentElement);
  }

  get id(): number { return this._id }

  giveShadow(this: ShowcaseItem, location: 'top' | 'bot'): ShowcaseItem {
    if (!this.hasShadow)
      this.container.classList.add(location === 'top' ? 'showcase-item-top-shadow' : 'showcase-item-bottom-shadow');
    else {
      this.container.classList.remove('showcase-item-top-shadow');
      this.container.classList.remove('showcase-item-bottom-shadow');
      this.container.classList.add('showcase-item-both-shadow')
    }

    this.hasShadow = true;
    return this;
  }

  rebuild(this: ShowcaseItem, parent: HTMLElement): void {
    const isRightAligned: boolean = this.item.type == 'Tool',
      imageContainer = cws.createElement({
        type: 'div',
        classList: 'showcase-item-image-container',
        children: [cws.createElement({
          type: 'img',
          classList: ['showcase-item-image']
            .concat(this.item.invertOnDark ? ['dark-invert-filter'] : []),
          otherNodes: [
            { type: 'src', value: this.item.links.thumbnail },
            { type: 'alt', value: this.item.shortName },
          ]
        })]
      }),
      textContainer = cws.createElement({
        type: 'div',
        classList: 'showcase-item-text-container',
        children: [cws.createElement({
          type: 'h2',
          classList: 'showcase-item-title',
          innerText: this.item.name
        }), cws.createElement({
          type: 'h3',
          classList: 'showcase-item-date',
          innerText: this.item.date
        }), cws.createElement({
          type: 'p',
          classList: 'showcase-item-description',
          innerHTML: this.item.description
        })]
      }),
      container = cws.createElement({
        type: 'div',
        classList: 'showcase-item-container',
        children: [
          cws.createElement({
            type: 'div',
            id: `showcase_item_${this.id}`,
            classList: ['showcase-item']
              .concat(this.item.isSecret ? ['secret-item'] : [])
              .concat(isRightAligned ? ['right-aligned-item'] : []),
            children: [
              cws.createElement({
                type: 'a',
                otherNodes: [{ type: 'href', value: this.item.links.href }],
                children: [
                  cws.createElement({
                    type: 'div',
                    classList: 'showcase-item-content',
                    children: isRightAligned ? [
                      imageContainer, textContainer
                    ] : [
                      textContainer, imageContainer
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });

    if (this.container)
      this.container.remove();

    this.container = container;
    parent.appendChild(this.container);
  }
}