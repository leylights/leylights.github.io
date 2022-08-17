import { MenuItemSingle } from "./menu-item-single.js";
import { MenuItem, MenuItemType } from "./menu-item.js";

interface MenuItemMultiConfig {
  name: string;
  shortName?: string;
  description?: string;
  type: MenuItemType;

  children: MenuItemSingle[];
}

export class MenuItemMulti extends MenuItem {
  children: MenuItemSingle[];

  constructor(config: MenuItemMultiConfig) {
    super({
      name: config.name,
      shortName: config.shortName,
      type: config.type,
      description: config.description,
    });

    this.children = config.children;
  }
}
