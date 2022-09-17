import { Molasses } from "../../../molasses.js";
import { ShowcaseItem } from "./showcase-item.component.js";
export class ShowcaseSingleItem extends ShowcaseItem {
    constructor(item, parentElement, config) {
        super();
        this.item = item;
        this.config = config;
        if (this.item.isCentered)
            this.rebuildCentered(parentElement);
        else
            this.rebuildMain(parentElement);
    }
    rebuildCentered(parent) {
        const children = [
            Molasses.createElement({
                type: 'div',
                classList: 'title-container',
                children: [
                    Molasses.createElement({
                        type: 'h2',
                        classList: 'title',
                        innerText: this.item.name,
                    }),
                ]
            }),
            Molasses.createElement({
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
    rebuildMain(parent) {
        const imageContainer = Molasses.createElement({
            type: 'div',
            classList: 'image-container',
            children: [
                Molasses.createElement({
                    type: 'div',
                    classList: ['image-shadow-container', 'no-opacity'],
                    children: [
                        Molasses.createElement({
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
        }), textContainer = Molasses.createElement({
            type: 'div',
            classList: 'text-container',
            children: [Molasses.createElement({
                    type: 'span',
                    classList: 'date no-opacity',
                    innerText: `${this.item.date} / ${this.item.type}`
                }), Molasses.createElement({
                    type: 'h2',
                    classList: 'title no-opacity',
                    innerText: this.item.name
                }), Molasses.createElement({
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
//# sourceMappingURL=single-item.component.js.map