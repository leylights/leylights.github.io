type NPCsActionCreationData = {
  name: string,
  uniqueName?: string,
  subtitle?: string,
  body: string,
}

export class NPCsAction {
  name: string;
  private _uniqueName: string;
  subtitle: string;
  body: string;

  constructor(data: NPCsActionCreationData) {
    this.name = data.name.substr(0);
    this.body = data.body.substr(0);
    this.subtitle = data.subtitle ? data.subtitle.substr(0) : "";
    this._uniqueName = data.uniqueName;
  }

  get uniqueName() {
    return this._uniqueName || this.name;
  }

  clone(this: NPCsAction): NPCsAction {
    let clone = new NPCsAction({
      name: this.name,
      body: this.body,
      subtitle: this.subtitle,
      uniqueName: this._uniqueName,
    });
    return clone;
  }

  getCardHTML(this: NPCsAction): string {
    return `<p><strong><i>${this.name} ${this.subtitle}.</i></strong> ${this.body}</p>`
  }
}