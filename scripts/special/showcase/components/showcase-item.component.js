import { cws } from "../../../cws.js";
export class ShowcaseItem {
    constructor() {
        this._id = ShowcaseItem.next_id++;
        this.hasShadow = false;
    }
    get id() { return this._id; }
    giveShadow(location) {
        if (!this.hasShadow)
            this.container.classList.add(location === 'top' ? 'top-shadow' : 'bottom-shadow');
        else {
            this.container.classList.remove('top-shadow');
            this.container.classList.remove('bottom-shadow');
            this.container.classList.add('both-shadow');
        }
        this.hasShadow = true;
        return this;
    }
    rebuildContainer(parent, children, config) {
        const content = cws.createElement({
            type: 'div',
            classList: 'showcase-item-content',
            children: config.isRightAligned ? children : children.reverse()
        }), container = cws.createElement({
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
    rebuildImage(item) {
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
ShowcaseItem.next_id = 0;
ShowcaseItem.classNames = {
    image: 'image',
};
//# sourceMappingURL=showcase-item.component.js.map