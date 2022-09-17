import { Molasses } from "../../../molasses.js";
import { ShowcaseItem } from "./showcase-item.component.js";
export class ShowcaseMultiItem extends ShowcaseItem {
    constructor(item, parentElement) {
        super();
        this.item = item;
        this.parent = parentElement;
        this.rebuild();
    }
    get isSecret() {
        return this.item.isSecret;
    }
    getDate() {
        const mostRecentDate = new Date(Math.max(...this.item.children.map((item) => new Date(item.date).getTime())));
        return mostRecentDate.toLocaleString('default', { month: 'long' }) + ' ' + mostRecentDate.getFullYear();
    }
    rebuild() {
        const imageContainer = Molasses.createElement({
            type: 'div',
            classList: 'image-container',
            children: [Molasses.createElement({
                    type: 'div',
                    classList: 'images-internal-container',
                    children: this.item.children.map((item) => {
                        return Molasses.createElement({
                            type: 'a',
                            classList: 'captioned-image',
                            otherNodes: {
                                href: item.singleLinks.href,
                            },
                            children: [
                                this.rebuildImage(item),
                                Molasses.createElement({
                                    type: 'div',
                                    classList: 'caption',
                                    children: [Molasses.createElement({
                                            type: 'span',
                                            classList: 'captioned-name',
                                            innerText: item.shortName
                                        }), Molasses.createElement({
                                            type: 'span',
                                            classList: 'captioned-date',
                                            innerText: item.date
                                        }),]
                                }),
                            ]
                        });
                    }),
                })],
        }), textContainer = Molasses.createElement({
            type: 'div',
            classList: 'text-container',
            children: [Molasses.createElement({
                    type: 'span',
                    classList: 'date no-opacity',
                    innerText: `${this.getDate()} / ${this.item.type}s`
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
        this.rebuildContainer(this.parent, [imageContainer, textContainer], {
            isLeftAligned: true,
            isSecret: this.isSecret,
            classList: ['multi-item'],
            highlightType: this.item.highlightType
        });
    }
}
//# sourceMappingURL=multi-item.component.js.map