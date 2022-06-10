import { COVIDRegion } from "./region.js";
export class COVIDHealthUnit extends COVIDRegion {
    constructor(config) {
        super({
            name: config.fullName,
            shortName: config.shortName,
            // population: config.pop == "NULL"
            // ? null
            // : config.pop,
            population: null,
            locationId: config.id + '',
        });
        this.provinceCode = config.province;
    }
}
//# sourceMappingURL=health-unit.js.map