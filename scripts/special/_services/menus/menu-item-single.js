import { CoreDataService } from "../core-data.service.js";
import { MenuItem } from "./menu-item.js";
export class MenuItemSingle extends MenuItem {
    constructor(config) {
        var _a;
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
        this.singleLinks = {
            href: null,
            thumbnail: null,
            hrefIsExternal: false,
        };
        this.invertOnDark = false;
        this.isExternalLink = false;
        this.showDate = true;
        this.noindex = false;
        this.date = config.date;
        this.singleLinks.href = config.links.href;
        this.singleLinks.thumbnail = (_a = config.links.thumbnail) !== null && _a !== void 0 ? _a : CoreDataService.siteLogoSrc;
        this.singleLinks.hrefIsExternal = config.links.hrefIsExternal;
        this.setConfigBoolean('showcase', config);
        this.setConfigBoolean('archive', config);
        this.setConfigBoolean('showInSmallMenus', config);
        this.setConfigBoolean('isExternalLink', config);
        this.setConfigBoolean('showDate', config);
        this.setConfigBoolean('noindex', config);
        if (config.isSecret)
            this.noindex = true;
        if (!config.links.thumbnail) // does not use logo as thumbnail
            this.setConfigBoolean('invertOnDark', config);
    }
}
//# sourceMappingURL=menu-item-single.js.map