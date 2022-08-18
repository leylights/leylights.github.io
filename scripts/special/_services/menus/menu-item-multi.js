import { MenuItem } from "./menu-item.js";
export class MenuItemMulti extends MenuItem {
    constructor(config) {
        super({
            name: config.name,
            shortName: config.shortName,
            type: config.type,
            description: config.description,
            showcaseConfig: config.showcaseConfig,
        });
        this.children = config.children;
    }
}
//# sourceMappingURL=menu-item-multi.js.map