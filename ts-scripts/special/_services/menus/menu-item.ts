export type MenuItemType = "Game" | "Tool";

export interface MenuItemConfig {
  name: string;
  type: MenuItemType,
  shortName?: string;
  description?: string,

  archive?: boolean;
  showInSmallMenus?: boolean;
  isSecret?: boolean;

  showcaseConfig?: {
    displayBanner?: boolean;
    highlightType?: number;
  }

  links?: {
    showcase?: string;
  }
}

export class MenuItem {
  readonly name: string;
  readonly shortName?: string;
  readonly type: MenuItemType;
  readonly description?: string;

  readonly displayBanner: boolean = false;

  readonly links: {
    showcase: string;
  } = {
      showcase: null,
    }

  readonly archive: boolean = false;
  readonly showInSmallMenus: boolean = true;
  readonly isSecret: boolean = false;
  readonly highlightType: number = 0;

  constructor(config: MenuItemConfig) {
    this.name = config.name;
    this.shortName = config.shortName ?? this.name;
    this.description = config.description;
    this.type = config.type;

    this.setConfigBoolean('archive', config);
    this.setConfigBoolean('showInSmallMenus', config);
    this.setConfigBoolean('isSecret', config);

    this.setShowcaseConfigValue('displayBanner', config);
    this.setShowcaseConfigValue('highlightType', config, 'number');

    if (!config.links?.showcase) this.displayBanner = false;

    this.links.showcase = config.links?.showcase;
  }

  // If a value is given, set to that value; otherwise maintain default
  protected setConfigBoolean<Config>(key: keyof this & keyof Config, config: Config) {
    if (typeof config[key] === 'boolean')
      (this[key] as unknown as boolean) = (config[key] as unknown as boolean);
  }

  // If a value is given, set to that value; otherwise maintain default
  protected setShowcaseConfigValue<Config>(key: keyof this & keyof Config, config: { showcaseConfig?: Config }, type: string = 'boolean') {
    if (config.showcaseConfig && typeof config.showcaseConfig[key] === type)
      (this[key] as unknown as boolean) = (config.showcaseConfig[key] as unknown as boolean);
  }

  // If a value is given, set to that value; otherwise maintain default
  protected getValueIfGiven<T>(givenValue: T, defaultValue: T) {
    return (givenValue !== undefined) ? givenValue : defaultValue;
  }
}
