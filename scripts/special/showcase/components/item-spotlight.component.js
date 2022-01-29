import { cws } from "../../../cws.js";
export class ShowcaseItemSpotlight {
    constructor(item, parentElement) {
        this._id = ShowcaseItemSpotlight.next_id++;
        this.item = item;
        this.rebuild(parentElement);
    }
    get id() { return this._id; }
    rebuild(parent) {
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
    parallaxScroll() {
        // if (this.id != 3) return this;
        const me = this, imageRect = this.image.getBoundingClientRect(), containerRect = this.container.getBoundingClientRect();
        newScroll();
        return this;
        // Set bounds of image scrolling
        function newScroll() {
            const x = getScrollProgress();
            const b = 0;
            const m = getSlope();
            me.image.style.bottom = (m * x + b) + 'px';
            function getSlope() {
                return getImageHeight() - containerRect.height;
                function getImageHeight() {
                    return Math.min(imageRect.height, ShowcaseItemSpotlight.PARALLAX.maxTotalHeight());
                }
            }
            function getScrollProgress() {
                return ((containerRect.y + containerRect.height) / (containerRect.height + window.outerHeight));
            }
        }
    }
    resizeToContents() {
        const maxHeight = this.image.getBoundingClientRect().height - ShowcaseItemSpotlight.PARALLAX.containerPadding;
        if (this.container.getBoundingClientRect().height > maxHeight)
            this.container.style.height = `${maxHeight}px`;
        return this;
    }
}
ShowcaseItemSpotlight.next_id = 0;
ShowcaseItemSpotlight.PARALLAX = {
    containerPadding: 70,
    imageMaxAddedHeight: 240,
    maxTotalHeight: () => { return ShowcaseItemSpotlight.PARALLAX.spotlightHeight + ShowcaseItemSpotlight.PARALLAX.imageMaxAddedHeight; },
    spotlightHeight: parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--showcase-spotlight-height')),
};
//# sourceMappingURL=item-spotlight.component.js.map