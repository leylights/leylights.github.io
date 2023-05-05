import { COVIDRegion } from "./region";

interface HealthUnitConfig {
  id: number;
  shortName: string;
  fullName: string;
  // pop: number | "NULL";
  province: string; // e.g. "ON", "QC", "AB"
}

export class COVIDHealthUnit extends COVIDRegion {
  readonly provinceCode: string;

  constructor(config: HealthUnitConfig) {
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
