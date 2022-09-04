import { Leylights } from "../../../leylights.js";
import { MenuItemMulti } from "../../../services/menus/menu-item-multi.js";
import { ShowcaseItem } from "./showcase-item.component.js";

export class ShowcaseMultiItem extends ShowcaseItem {
  item: MenuItemMulti;
  parent: HTMLElement;

  constructor(item: MenuItemMulti, parentElement: HTMLElement) {
    super();
    this.item = item;
    this.parent = parentElement;

    this.rebuild();
  }

  get isSecret(): boolean {
    return this.item.isSecret;
  }

  getDate() {
    const mostRecentDate: Date = new Date(Math.max(...this.item.children.map((item) => new Date(item.date).getTime())));

    return mostRecentDate.toLocaleString('default', { month: 'long' }) + ' ' + mostRecentDate.getFullYear();
  }

  rebuild(this: ShowcaseMultiItem): void {
    const imageContainer = Leylights.createElement({
      type: 'div',
      classList: 'image-container',
      children: [Leylights.createElement({
        type: 'div',
        classList: 'images-internal-container',
        children: this.item.children.map((item) => {
          return Leylights.createElement({
            type: 'a',
            classList: 'captioned-image',
            otherNodes: {
              href: item.singleLinks.href,
            },
            children: [
              this.rebuildImage(item),
              Leylights.createElement({
                type: 'div',
                classList: 'caption',
                children: [Leylights.createElement({
                  type: 'span',
                  classList: 'captioned-name',
                  innerText: item.shortName
                }), Leylights.createElement({
                  type: 'span',
                  classList: 'captioned-date',
                  innerText: item.date
                }),]
              }),
            ]
          });
        }),
      })],
    }),
      textContainer = Leylights.createElement({
        type: 'div',
        classList: 'text-container',
        children: [Leylights.createElement({
          type: 'span',
          classList: 'date no-opacity',
          innerText: `${this.getDate()} / ${this.item.type}s`
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

    this.rebuildContainer(this.parent, [imageContainer, textContainer], {
      isLeftAligned: true,
      isSecret: this.isSecret,
      classList: ['multi-item'],
      highlightType: this.item.highlightType
    });
  }
}
