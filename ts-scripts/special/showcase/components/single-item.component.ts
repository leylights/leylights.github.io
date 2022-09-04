import { Leylights } from "../../../leylights.js";
import { MenuItemSingle } from "../../../services/menus/menu-item-single.js";
import { ShowcaseItem } from "./showcase-item.component.js";

interface ShowcaseSingleItemConfig {
  unused_config_variable: null;
}

export class ShowcaseSingleItem extends ShowcaseItem {
  private item: MenuItemSingle;
  protected static className: 'multi-item';
  private config: ShowcaseSingleItemConfig;

  constructor(item: MenuItemSingle, parentElement: HTMLElement, config?: ShowcaseSingleItemConfig) {
    super();
    this.item = item;
    this.config = config;
    if (this.item.isCentered)
      this.rebuildCentered(parentElement);
    else
      this.rebuildMain(parentElement);
  }

  private rebuildCentered(this: ShowcaseSingleItem, parent: HTMLElement): void {
    const children = [
      Leylights.createElement({
        type: 'div',
        classList: 'title-container',
        children: [
          Leylights.createElement({
            type: 'h2',
            classList: 'title',
            innerText: this.item.name,
          }),
        ]
      }),
      Leylights.createElement({
        type: 'p',
        classList: 'description',
        innerText: this.item.description
      }),
    ];

    this.rebuildContainer(parent, children, {
      isLeftAligned: false,
      isSecret: this.item.isSecret,
      href: this.item.singleLinks.href,
      highlightType: this.item.highlightType,
      classList: ['single-item', 'centered'],
    });
  }

  private rebuildMain(this: ShowcaseSingleItem, parent: HTMLElement): void {
    const imageContainer = Leylights.createElement({
      type: 'div',
      classList: 'image-container',
      children: [
        Leylights.createElement({
          type: 'div',
          classList: ['image-shadow-container', 'no-opacity'],
          children: [
            Leylights.createElement({
              type: 'img',
              classList: [ShowcaseSingleItem.classNames.image, 'single-item-image']
                .concat(this.item.invertOnDark ? ['dark-invert-filter'] : [])
                .concat(!this.item.singleLinks.thumbnail || this.item.singleLinks.thumbnail.match(/logo(.*)\.svg/) ? ['site-logo'] : []),
              otherNodes: [
                { type: 'src', value: this.item.singleLinks.thumbnail },
                { type: 'alt', value: "" },
              ]
            })
          ]
        })]
    }),
      textContainer = Leylights.createElement({
        type: 'div',
        classList: 'text-container',
        children: [Leylights.createElement({
          type: 'span',
          classList: 'date no-opacity',
          innerText: `${this.item.date} / ${this.item.type}`
        }), Leylights.createElement({
          type: 'h2',
          classList: 'title no-opacity',
          innerText: this.item.name
        }), Leylights.createElement({
          type: 'p',
          classList: 'description no-opacity',
          innerHTML: this.item.description
        })]
      });

    this.rebuildContainer(parent, [imageContainer, textContainer], {
      isLeftAligned: this.item.type == 'Game',
      isSecret: this.item.isSecret,
      href: this.item.singleLinks.href,
      highlightType: this.item.highlightType,
      classList: ['single-item'],
    });
  }
}
