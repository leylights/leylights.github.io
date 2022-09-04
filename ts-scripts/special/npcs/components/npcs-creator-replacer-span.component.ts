import { Leylights } from "../../../leylights.js";
import { NPCsCharacterData } from "../core/character-data.js";

export class NPCsReplacerSpan {
  private _originalBody: string;
  private _currentBody: string;
  id: number = NPCsReplacerSpan.nextId++;
  element: HTMLElement = Leylights.createElement({
    type: 'span',
    classList: 'npcs-replacer-span',
    id: `npcs-replacer-span-${this.id}`
  });

  constructor(body: string) {
    this._originalBody = body;
    this._currentBody = body;
    this.element.innerHTML = this._currentBody;
  }

  get originalBody(): string {
    return this._originalBody;
  }

  set originalBody(s: string) {
    this._originalBody = s;
    this.element.innerHTML = this._currentBody;
  }

  fillAsData(data: NPCsCharacterData) {
    this._currentBody = data.fillStringPlaceholders(this.originalBody);
    this.element.innerHTML = this._currentBody;
  }

  private static nextId: number = 1;
}
