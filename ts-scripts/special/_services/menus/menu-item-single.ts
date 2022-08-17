import { CoreDataService } from "../core-data.service.js";
import { MenuItem, MenuItemType } from "./menu-item.js";

interface MenuItemSingleConfig {
  name: string,
  type: MenuItemType,
  date: string,
  links: {
    href: string,
    thumbnail?: string,
    hrefIsExternal?: boolean,
    showcase?: string,
  },

  description?: string,
  shortName?: string,
  showcase?: boolean,
  archive?: boolean,
  invertOnDark?: boolean,
  showInSmallMenus?: boolean,
  isSecret?: boolean,
  isExternalLink?: boolean,
  showDate?: boolean,

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

  isExternalLink: boolean = false;
  showDate: boolean = true;
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
      showcase: config.showcase,
      links: {
        showcase: config.links.showcase
      }
    });

    this.date = config.date;

    this.singleLinks.href = config.links.href;
    this.singleLinks.thumbnail = config.links.thumbnail ?? CoreDataService.siteLogoSrc;

    this.singleLinks.hrefIsExternal = config.links.hrefIsExternal;

    this.setConfigBoolean('showcase', config);
    this.setConfigBoolean('archive', config);

    this.setConfigBoolean('showInSmallMenus', config);
    this.setConfigBoolean('isExternalLink', config);
    this.setConfigBoolean('showDate', config);

    this.setConfigBoolean('noindex', config);
    if (config.isSecret) this.noindex = true;

    if (config.links.thumbnail) // does not use logo as thumbnail
      this.setConfigBoolean('invertOnDark', config);
    else this.invertOnDark = true;

  }
} 
