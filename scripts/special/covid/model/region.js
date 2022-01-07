export class COVIDRegion {
    constructor(config) {
        var _a;
        this.name = config.name;
        this.shortName = config.shortName;
        this.population = config.population;
        this.locationId = config.locationId;
        this.isCanada = (_a = config.isCanada) !== null && _a !== void 0 ? _a : false;
    }
}
//# sourceMappingURL=region.js.map