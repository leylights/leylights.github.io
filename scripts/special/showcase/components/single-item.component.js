import { cws } from "../../../cws.js";
import { ShowcaseItem } from "./showcase-item.component.js";
export class ShowcaseSingleItem extends ShowcaseItem {
    constructor(item, parentElement) {
        super();
        this.item = item;
        this.rebuild(parentElement);
    }
    rebuild(parent) {
        const imageContainer = cws.createElement({
            type: 'div',
            classList: 'image-container',
            children: [
                cws.createElement({
                    type: 'div',
                    classList: 'image-shadow-container no-opacity',
                    children: [
                        cws.createElement({
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
                })
            ]
        }), textContainer = cws.createElement({
            type: 'div',
            classList: 'text-container',
            children: [cws.createElement({
                    type: 'span',
                    classList: 'date no-opacity',
                    innerText: `${this.item.date} / ${this.item.type}`
                }), cws.createElement({
                    type: 'h2',
                    classList: 'title no-opacity',
                    innerText: this.item.name
                }), cws.createElement({
                    type: 'p',
                    classList: 'description no-opacity',
                    innerHTML: this.item.description
                })]
        });
        this.rebuildContainer(parent, [imageContainer, textContainer], {
            isRightAligned: this.item.type == 'Tool',
            isSecret: this.item.isSecret,
            href: this.item.singleLinks.href,
            className: 'single-item',
        });
    }
}
//# sourceMappingURL=single-item.component.js.map