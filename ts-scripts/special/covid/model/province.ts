import { COVIDRegion } from "./region";

interface ProvinceConfig {
  pop: number;
  province: string;
  province_full: string;
  province_short: string;
}

export class COVIDProvince extends COVIDRegion {
  constructor(config: ProvinceConfig) {
    super({
      name: config.province_full,
      shortName: config.province,
      population: config.pop,
      locationId: config.province_short,
    });
  }
}
