import { COVIDRegion } from "./region.js";
export class COVIDProvince extends COVIDRegion {
    constructor(config) {
        super({
            name: config.province_full,
            shortName: config.province,
            population: config.pop,
            locationId: config.province_short,
        });
    }
}
//# sourceMappingURL=province.js.map