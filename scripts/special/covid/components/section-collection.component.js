import { cws } from "../../../cws.js";
export class COVIDSectionCollection {
    constructor(parentElement, config) {
        this.sections = [];
        this.setHeightToMax = false;
        // set config
        this.setHeightToMax = (config === null || config === void 0 ? void 0 : config.setHeightToMax) || false;
        this.id = config === null || config === void 0 ? void 0 : config.id;
        // create elements
        this.tabsContainer = cws.createElement({
            type: 'div',
            classList: 'covid-tabs-container',
            children: [
                cws.createElement({
                    type: 'div',
                    id: (config === null || config === void 0 ? void 0 : config.id) ? (config === null || config === void 0 ? void 0 : config.id) + '-tab' : null,
                    classList: 'covid-tab-spacer',
                    innerHTML: '&nbsp;',
                })
            ]
        });
        parentElement.appendChild(this.tabsContainer);
        this.sectionsContainer = cws.createElement({
            type: 'div',
            classList: 'covid-sections-container',
            id: config === null || config === void 0 ? void 0 : config.id,
        });
        parentElement.appendChild(this.sectionsContainer);
    }
    /**
     * Deselect all previously-open tabs
     */
    deselectAll() {
        this.sections.forEach((s) => { s.deselect(); });
    }
    /**
     * Register sections with the parent
     */
    register(section) {
        this.sections.push(section);
        this.resetHeight();
    }
    resetHeight() {
        if (this.setHeightToMax)
            this.sectionsContainer.style.height = this.sections.reduce((prev, current) => {
                return Math.max(prev, parseFloat(current.bodyHeight.trim()));
            }, 0) + 'px';
    }
    /**
     * Selects the first section
     */
    selectFirstSection() {
        if (this.sections.length == 0)
            throw new Error("No first section to select");
        this.sections[0].select();
    }
}
//# sourceMappingURL=section-collection.component.js.map