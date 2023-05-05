import { CoreDataService } from "../core-data.service";
import { MenuItem, MenuItemConfig } from "./menu-item";

type MenuItemSingleConfig = MenuItemConfig & {
  date: string,
  links: {
    href: string,
    thumbnail?: string,
    hrefIsExternal?: boolean,
  },

  isExternalLink?: boolean,

  showcaseConfig?: {
    invertOnDark?: boolean,
    showDate?: boolean,
    isCentered?: boolean,
  }

  noindex?: boolean,
}

export class MenuItemSingle extends MenuItem {
  date: string;

  singleLinks: {
    href: string;
    thumbnail: string;
    hrefIsExternal: boolean;
  } = {
      href: null,
      thumbnail: null,
      hrefIsExternal: false,
    };

  description: string;

  invertOnDark: boolean = false;
  showDate: boolean = true;
  isCentered: boolean = false;

  isExternalLink: boolean = false;
  noindex: boolean = false;

  constructor(config: MenuItemSingleConfig) {
    super({
      name: config.name,
      shortName: config.shortName,
      type: config.type,
      description: config.description,

      archive: config.archive,
      showInSmallMenus: config.showInSmallMenus,
      isSecret: config.isSecret,
      showcaseConfig: config.showcaseConfig,
      links: {
        showcase: config.links.showcase
      }
    });

    this.date = config.date;

    this.singleLinks.href = config.links.href;
    this.singleLinks.thumbnail = config.links.thumbnail ?? CoreDataService.siteLogoSrc;

    this.singleLinks.hrefIsExternal = config.links.hrefIsExternal;

    this.setConfigBoolean('archive', config);

    this.setConfigBoolean('showInSmallMenus', config);
    this.setConfigBoolean('isExternalLink', config);

    this.setShowcaseConfigValue('showDate', config);
    this.setShowcaseConfigValue('isCentered', config);

    this.setConfigBoolean('noindex', config);
    if (config.isSecret) this.noindex = true;

    if (config.links.thumbnail) // does not use logo as thumbnail
      this.setShowcaseConfigValue('invertOnDark', config);
    else this.invertOnDark = true;

  }
} 
