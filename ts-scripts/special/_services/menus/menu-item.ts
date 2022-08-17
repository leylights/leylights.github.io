export type MenuItemType = "Game" | "Tool";

interface MenuItemConfig {
  name: string;
  type: MenuItemType,
  shortName?: string;
  description?: string,

  archive?: boolean;
  showcase?: boolean;
  showInSmallMenus?: boolean;
  isSecret?: boolean;

  links?: {
    showcase?: string;
  }
}

export class MenuItem {
  readonly name: string;
  readonly shortName?: string;
  readonly type: MenuItemType;
  readonly description?: string;

  readonly showcase: boolean = false;

  readonly links: {
    showcase: string;
  } = {
      showcase: null,
    }

  readonly archive: boolean = false;
  readonly showInSmallMenus: boolean = true;
  readonly isSecret: boolean = false;

  constructor(config: MenuItemConfig) {
    this.name = config.name;
    this.shortName = config.shortName ?? this.name;
    this.description = config.description;
    this.type = config.type;

    this.setConfigBoolean('archive', config);
    this.setConfigBoolean('showInSmallMenus', config);
    this.setConfigBoolean('isSecret', config);

    this.setConfigBoolean('showcase', config);
    if (!config.links?.showcase) this.showcase = false;

    this.links.showcase = config.links?.showcase;
  }

  // If a value is given, set to that value; otherwise maintain default
  protected setConfigBoolean<Config>(key: keyof this & keyof Config, config: Config) {
    if (typeof config[key] === 'boolean')
      (this[key] as unknown as boolean) = (config[key] as unknown as boolean);
  }
}
