import { Molasses } from "../../../molasses";
import { COVIDSection } from "./section.component";

export class COVIDSectionCollection {
  private sections: COVIDSection[] = [];

  private setHeightToMax: boolean = false;

  private id?: string;

  readonly sectionsContainer: HTMLElement;
  readonly tabsContainer: HTMLElement;

  constructor(parentElement: HTMLElement, config?: {
    setHeightToMax?: boolean,
    id?: string,
  }) {
    // set config
    this.setHeightToMax = config?.setHeightToMax || false;
    this.id = config?.id;

    // create elements
    this.tabsContainer = Molasses.createElement({
      type: 'div',
      classList: 'covid-tabs-container',
      children: [
        Molasses.createElement({
          type: 'div',
          id: config?.id ? config?.id + '-tab' : null,
          classList: 'covid-tab-spacer',
          innerHTML: '&nbsp;',
        })
      ]
    });

    parentElement.appendChild(this.tabsContainer);

    this.sectionsContainer = Molasses.createElement({
      type: 'div',
      classList: 'covid-sections-container',
      id: config?.id,
    });

    parentElement.appendChild(this.sectionsContainer);
  }

  /**
   * Deselect all previously-open tabs
   */
  deselectAll(this: COVIDSectionCollection) {
    this.sections.forEach((s) => { s.deselect() });
  }

  /**
   * Register sections with the parent
   */
  register(this: COVIDSectionCollection, section: COVIDSection) {
    this.sections.push(section);
    this.resetHeight();
  }

  resetHeight(this: COVIDSectionCollection): void {
    const section = this.sections.filter((section) => section.isSelected)[0]
      ?? this.sections[0];
    this.sectionsContainer.style.height = section ? section.bodyHeight : '0px';
  }

  /**
   * Selects the first section
   */
  selectFirstSection(this: COVIDSectionCollection) {
    if (this.sections.length == 0)
      throw new Error("No first section to select");
    this.sections[0].select();
  }
}
