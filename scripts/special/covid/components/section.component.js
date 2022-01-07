import { cws } from "../../../cws.js";
export class COVIDSection {
    constructor(title, shortTitle, elements, parent, includeFooter) {
        const me = this;
        // Create tab
        this.tab = cws.createElement({
            type: 'div',
            classList: 'covid-tab',
            children: [cws.createElement({
                    type: 'span',
                    innerText: shortTitle
                })]
        });
        this.tab.addEventListener('click', () => {
            parent.deselectAll();
            me.select();
        });
        this.parent = parent;
        // Create section
        this.contentsContainer = cws.createElement({
            type: 'div',
            classList: 'covid-section-contents'
        });
        const bodyChildren = [this.contentsContainer];
        if (includeFooter)
            bodyChildren.push(cws.createElement({
                type: 'div',
                classList: 'footer',
                children: [cws.createElement({
                        type: 'h6',
                        classList: 'data-source',
                        children: [
                            cws.createElement({ type: 'span', innerText: 'Retrieved from ' }),
                            cws.createElement({ type: 'a', innerText: 'https://opencovid.ca/', otherNodes: [{ type: 'href', value: 'https://opencovid.ca/' }] }),
                        ]
                    })]
            }));
        this._body = cws.createElement({
            type: 'div',
            classList: 'covid-section',
            children: bodyChildren,
        });
        elements.forEach((el) => {
            this._body.appendChild(el);
        });
        parent.sectionsContainer.appendChild(this._body);
        parent.tabsContainer.appendChild(this.tab);
        parent.register(this);
    }
    get appendableBody() {
        return this.contentsContainer;
    }
    get bodyHeight() {
        // return window.getComputedStyle(this._body).height;
        return this._body.getBoundingClientRect().height + 'px';
    }
    appendChild(child) {
        return this.appendToBody(child);
    }
    appendToBody(child) {
        return this.contentsContainer.appendChild(child);
    }
    deselect() {
        this.tab.classList.remove('selected');
        this._body.classList.remove('selected');
    }
    select() {
        this.tab.classList.add('selected');
        this._body.classList.add('selected');
        this.parent.resetHeight();
    }
}
//# sourceMappingURL=section.component.js.map