import { cws } from "../../../cws.js";
import { MenuItem } from "../../_services/menu-items.service.js";

export class ShowcaseItemSpotlight {
  private static next_id = 0;

  private item: MenuItem;
  private container: HTMLElement;
  private image: HTMLImageElement;
  private _id: number = ShowcaseItemSpotlight.next_id++;

  private static readonly PARALLAX = {
    containerPadding: 70, // minimum amount of room the image has to move
    imageMaxAddedHeight: 240,
    maxTotalHeight: () => { return ShowcaseItemSpotlight.PARALLAX.spotlightHeight + ShowcaseItemSpotlight.PARALLAX.imageMaxAddedHeight },
    spotlightHeight: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--showcase-spotlight-height')),
  }

  constructor(item: MenuItem, parentElement: HTMLElement) {
    this.item = item;
    this.rebuild(parentElement);
  }

  get id(): number { return this._id }

  rebuild(this: ShowcaseItemSpotlight, parent: HTMLElement): void {
    this.image = cws.createElement({
      type: 'img',
      classList: ['showcase-spotlight-item-image'],
      otherNodes: [
        { type: 'src', value: this.item.links.showcase },
        { type: 'alt', value: this.item.description },
      ]
    });

    const container = cws.createElement({
      type: 'div',
      classList: 'showcase-spotlight-container',
      id: 'showcase-spotlight-container-' + this.id,
      children: [this.image]
    });

    if (this.container)
      this.container.remove();

    this.container = container;
    parent.appendChild(this.container);
  }

  parallaxScroll(this: ShowcaseItemSpotlight): ShowcaseItemSpotlight {
    // if (this.id != 3) return this;
    const me = this,
      imageRect: DOMRect = this.image.getBoundingClientRect(),
      containerRect: DOMRect = this.container.getBoundingClientRect();

    newScroll();

    return this;

    // Set bounds of image scrolling
    function newScroll() {
      const x = getScrollProgress();
      const b = 0;
      const m = getSlope();

      me.image.style.bottom = (m * x + b) + 'px';

      function getSlope(): number {
        return getImageHeight() - containerRect.height;

        function getImageHeight(): number {
          return Math.min(imageRect.height, ShowcaseItemSpotlight.PARALLAX.maxTotalHeight());
        }
      }

      function getScrollProgress(): number {
        return ((containerRect.y + containerRect.height) / (containerRect.height + window.outerHeight));
      }
    }
  }

  resizeToContents(this: ShowcaseItemSpotlight): ShowcaseItemSpotlight {
    const maxHeight = this.image.getBoundingClientRect().height - ShowcaseItemSpotlight.PARALLAX.containerPadding;
    if (this.container.getBoundingClientRect().height > maxHeight)
      this.container.style.height = `${maxHeight}px`;

    return this;
  }
}