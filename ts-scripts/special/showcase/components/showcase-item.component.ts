import { cws } from "../../../cws.js";
import { MenuItemSingle } from "../../_services/menus/menu-item-single.js";

export class ShowcaseItem {
  private static next_id = 0;

  private _id: number = ShowcaseItem.next_id++;
  container: HTMLElement;

  static readonly classNames = {
    image: 'image',
  }

  private hasShadow: boolean = false;

  get id(): number { return this._id }

  giveShadow(this: ShowcaseItem, location: 'top' | 'bot'): ShowcaseItem {
    if (!this.hasShadow)
      this.container.classList.add(location === 'top' ? 'top-shadow' : 'bottom-shadow');
    else {
      this.container.classList.remove('top-shadow');
      this.container.classList.remove('bottom-shadow');
      this.container.classList.add('both-shadow')
    }

    this.hasShadow = true;
    return this;
  }

  rebuildContainer(this: ShowcaseItem, parent: HTMLElement, children: HTMLElement[], config: {
    isRightAligned?: boolean,
    isSecret?: boolean,
    href?: string,
    className?: string
  }): void {
    const
      content = cws.createElement({
        type: 'div',
        classList: 'showcase-item-content',
        children: config.isRightAligned ? children : children.reverse()
      }),
      container = cws.createElement({
        type: 'div',
        classList: ['showcase-item-container', config.className],
        children: [
          cws.createElement({
            type: 'div',
            id: `showcase_item_${this.id}`,
            classList: ['showcase-item']
              .concat(config.isSecret ? ['secret-item'] : [])
              .concat(config.isRightAligned ? ['right-aligned-item'] : []),
            children: config.href ? [
              cws.createElement({
                type: 'a',
                otherNodes: [{ type: 'href', value: config.href }],
                children: [
                  content
                ]
              })
            ] : [
              content
            ]
          })
        ]
      });

    if (this.container)
      this.container.remove();

    this.container = container;
    parent.appendChild(this.container);
  }

  protected rebuildImage(this: ShowcaseItem, item: MenuItemSingle): HTMLDivElement {
    return cws.createElement({
      type: 'div',
      classList: 'image-shadow-container no-opacity',
      children: [
        cws.createElement({
          type: 'img',
          classList: [ShowcaseItem.classNames.image, 'single-item-image']
            .concat(item.invertOnDark ? ['dark-invert-filter'] : [])
            .concat(!item.singleLinks.thumbnail || item.singleLinks.thumbnail.match(/logo(.*)\.svg/) ? ['site-logo'] : []),
          otherNodes: [
            { type: 'src', value: item.singleLinks.thumbnail },
            { type: 'alt', value: "" },
          ]
        })
      ]
    });
  }
}
