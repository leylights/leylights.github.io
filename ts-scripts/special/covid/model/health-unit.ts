import { COVIDRegion } from "./region.js";

interface HealthUnitConfig {
  HR_UID: number;
  health_region: string;
  health_region_esri: string;
  pop: number | "NULL";
  province: string;
  province_full: string;
  province_short: string; // e.g. "ON", "QC", "AB"
}

export class COVIDHealthUnit extends COVIDRegion {
  readonly province: string;
  readonly provinceCode: string;

  constructor(config: HealthUnitConfig) {
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