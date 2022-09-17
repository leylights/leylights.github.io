import { Molasses } from "../../../molasses.js";
export class NPCsReplacerSpan {
    constructor(body) {
        this.id = NPCsReplacerSpan.nextId++;
        this.element = Molasses.createElement({
            type: 'span',
            classList: 'npcs-replacer-span',
            id: `npcs-replacer-span-${this.id}`
        });
        this._originalBody = body;
        this._currentBody = body;
        this.element.innerHTML = this._currentBody;
    }
    get originalBody() {
        return this._originalBody;
    }
    set originalBody(s) {
        this._originalBody = s;
        this.element.innerHTML = this._currentBody;
    }
    fillAsData(data) {
        this._currentBody = data.fillStringPlaceholders(this.originalBody);
        this.element.innerHTML = this._currentBody;
    }
}
NPCsReplacerSpan.nextId = 1;
//# sourceMappingURL=npcs-creator-replacer-span.component.js.map