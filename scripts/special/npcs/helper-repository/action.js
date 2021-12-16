export class NPCsAction {
    constructor(data) {
        this.name = data.name.substr(0);
        this.body = data.body.substr(0);
        this.subtitle = data.subtitle ? data.subtitle.substr(0) : "";
        this._uniqueName = data.uniqueName;
    }
    get uniqueName() {
        return this._uniqueName || this.name;
    }
    clone() {
        let clone = new NPCsAction({
            name: this.name,
            body: this.body,
            subtitle: this.subtitle,
            uniqueName: this._uniqueName,
        });
        return clone;
    }
    getCardHTML() {
        return `<p><strong><i>${this.name} ${this.subtitle}.</i></strong> ${this.body}</p>`;
    }
}
//# sourceMappingURL=action.js.map