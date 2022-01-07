export class COVIDRegion {
  population: number | null;
  name: string;
  shortName: string;
  locationId: string;
  isCanada: boolean;

  constructor(config: {
    name: string,
    shortName: string,
    population: number | null,
    locationId: string,
    isCanada?: boolean,
  }) {
    this.name = config.name;
    this.shortName = config.shortName;
    this.population = config.population;
    this.locationId = config.locationId;
    this.isCanada = config.isCanada ?? false;
  }
}