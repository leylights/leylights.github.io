export class MenuItem {
    constructor(config) {
        var _a, _b, _c;
        this.showcase = false;
        this.links = {
            showcase: null,
        };
        this.archive = false;
        this.showInSmallMenus = true;
        this.isSecret = false;
        this.name = config.name;
        this.shortName = (_a = config.shortName) !== null && _a !== void 0 ? _a : this.name;
        this.description = config.description;
        this.type = config.type;
        this.setConfigBoolean('archive', config);
        this.setConfigBoolean('showInSmallMenus', config);
        this.setConfigBoolean('isSecret', config);
        this.setConfigBoolean('showcase', config);
        if (!((_b = config.links) === null || _b === void 0 ? void 0 : _b.showcase))
            this.showcase = false;
        this.links.showcase = (_c = config.links) === null || _c === void 0 ? void 0 : _c.showcase;
    }
    // If a value is given, set to that value; otherwise maintain default
    setConfigBoolean(key, config) {
        if (typeof config[key] === 'boolean')
            this[key] = config[key];
    }
}
//# sourceMappingURL=menu-item.js.map