import { cws } from "../../../cws.js";
export class ShowcaseItem {
    constructor(item, parentElement) {
        this._id = ShowcaseItem.next_id++;
        this.hasShadow = false;
        this.item = item;
        this.rebuild(parentElement);
    }
    get id() { return this._id; }
    giveShadow(location) {
        if (!this.hasShadow)
            this.container.classList.add(location === 'top' ? 'showcase-item-top-shadow' : 'showcase-item-bottom-shadow');
        else {
            this.container.classList.remove('showcase-item-top-shadow');
            this.container.classList.remove('showcase-item-bottom-shadow');
            this.container.classList.add('showcase-item-both-shadow');
        }
        this.hasShadow = true;
        return this;
    }
    rebuild(parent) {
        const isRightAligned = this.item.type == 'Tool', imageContainer = cws.createElement({
            type: 'div',
            classList: 'showcase-item-image-container',
            children: [cws.createElement({
                    type: 'img',
                    classList: ['showcase-item-image']
                        .concat(this.item.invertOnDark ? ['dark-invert-filter'] : [])
                        .concat(!this.item.links.thumbnail || this.item.links.thumbnail.match(/logo(.*)\.svg/) ? ['site-logo'] : []),
                    otherNodes: [
                        { type: 'src', value: this.item.links.thumbnail },
                        { type: 'alt', value: "" },
                    ]
                })]
        }), textContainer = cws.createElement({
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
        }), container = cws.createElement({
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
ShowcaseItem.next_id = 0;
//# sourceMappingURL=item.component.js.map