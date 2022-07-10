import { cws } from "../../../cws.js";
import { COVIDSectionCollection } from "./section-collection.component.js";

export class COVIDSection {
  private _body: HTMLElement;
  private contentsContainer: HTMLElement;
  private tab: HTMLElement;

  private parent: COVIDSectionCollection;

  constructor(title: string, shortTitle: string, elements: HTMLElement[], parent: COVIDSectionCollection, includeFooter?: boolean) {
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

    const bodyChildren: HTMLElement[] = [this.contentsContainer];
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

    elements.forEach((el: HTMLElement) => {
      this._body.appendChild(el);
    });

    parent.sectionsContainer.appendChild(this._body);
    parent.tabsContainer.appendChild(this.tab);
    parent.register(this);

    new ResizeObserver((entries) => {
      me.parent.resetHeight();
    }).observe(this._body);
  }

  get appendableBody(): HTMLElement {
    return this.contentsContainer;
  }

  get bodyHeight(): string {
    // return window.getComputedStyle(this._body).height;
    return this._body.getBoundingClientRect().height + 'px';
  }

  get isSelected(): boolean {
    return this.tab.classList.contains('selected');
  }

  appendChild(this: COVIDSection, child: HTMLElement): HTMLElement {
    return this.appendToBody(child);
  }
  appendToBody(this: COVIDSection, child: HTMLElement): HTMLElement {
    return this.contentsContainer.appendChild(child);
  }

  deselect(this: COVIDSection): void {
    this.tab.classList.remove('selected');
    this._body.classList.remove('selected');
  }

  select(this: COVIDSection): void {
    this.tab.classList.add('selected');
    this._body.classList.add('selected');
    this.parent.resetHeight();
  }
}
