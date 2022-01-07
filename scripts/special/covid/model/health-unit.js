import { COVIDRegion } from "./region.js";
export class COVIDHealthUnit extends COVIDRegion {
    constructor(config) {
        super({
            name: config.health_region_esri,
            shortName: config.health_region,
            population: config.pop == "NULL"
                ? null
                : config.pop,
            locationId: config.HR_UID + '',
        });
        this.province = config.province;
        this.provinceCode = config.province_short;
    }
}
//# sourceMappingURL=health-unit.js.map