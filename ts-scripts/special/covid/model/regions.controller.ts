import { Molasses } from "../../../molasses.js";
import { COVIDDataInterface } from "./covid-data-interface.js";
import { COVIDHealthUnit } from "./health-unit.js";
import { COVIDProvince } from "./province.js";

export class COVIDRegionsController {
  readonly provinces: COVIDProvince[] = [];
  readonly healthUnits: COVIDHealthUnit[] = [];

  private static readonly LONDON_CODE = '3546';
  private static readonly WATERLOO_CODE = '3568';
  private static readonly ONTARIO_CODE = "ON";
  private static readonly CANADA_CODE = "canada";

  private _waterloo: COVIDHealthUnit = null;
  private _london: COVIDHealthUnit = null;
  private _ontario: COVIDProvince = null;
  private _canada: COVIDProvince = null;

  private readonly SKIPPED_HEALTH_UNITS: number[] = [9999];
  private readonly SKIPPED_PROVINCES: string[] = ["RP"];

  private readonly provincialPopulations = {
    "NL": 522453,
    "PE": 166331,
    "NS": 1002586,
    "NB": 797102,
    "QC": 8639642,
    "ON": 14951825,
    "MB": 1390249,
    "SK": 1183269,
    "AB": 4480486,
    "BC": 5264485,
    "YT": 42982,
    "NT": 45640,
    "NU": 39710,
  }

  async init(this: COVIDRegionsController) {
    const me = this;
    const healthRegions = await COVIDDataInterface.getRegionsInfoMap();
    const provinces = await COVIDDataInterface.getProvincesInfoMap();

    console.log(healthRegions);
    
    // Health units
    healthRegions.forEach(configuration => {
      if (!Molasses.Array.includes(me.SKIPPED_HEALTH_UNITS, configuration.id)) {
        me.healthUnits.push(new COVIDHealthUnit(configuration));
      }

      if (me.healthUnits[me.healthUnits.length - 1].locationId === COVIDRegionsController.LONDON_CODE)
        me._london = me.healthUnits[me.healthUnits.length - 1];
      else if (me.healthUnits[me.healthUnits.length - 1].locationId === COVIDRegionsController.WATERLOO_CODE)
        me._waterloo = me.healthUnits[me.healthUnits.length - 1];
    });

    // Provinces
    provinces.forEach(configuration => {
      if (!Molasses.Array.includes(me.SKIPPED_PROVINCES, configuration.shortName)) {
        me.provinces.push(new COVIDProvince({
          pop: me.provincialPopulations[configuration.shortName],
          province: configuration.fullName,
          province_full: configuration.fullName,
          province_short: configuration.shortName,          
        }));
      }

      const end = me.provinces[me.provinces.length - 1];
      if (end.locationId === COVIDRegionsController.ONTARIO_CODE)
        me._ontario = end;
      if (end.shortName === 'Quebec') {
        end.shortName = 'Québec';
        end.name = 'Québec';
      }
    });

    // Canada
    me.provinces.push(new COVIDProvince({
      pop: 38246108,
      // population source: https://www150.statcan.gc.ca/n1/daily-quotidien/210929/dq210929d-eng.htm
      province: 'Canada',
      province_full: 'Canada',
      province_short: COVIDRegionsController.CANADA_CODE,
    }));

    me._canada = me.provinces[me.provinces.length - 1];
    me._canada.isCanada = true;
  }

  get london(): COVIDHealthUnit {
    if (!this._london) throw new Error("Not initialized.");
    return this._london;
  }

  get waterloo(): COVIDHealthUnit {
    if (!this._waterloo) throw new Error("Not initialized.");
    return this._waterloo;
  }

  get ontario(): COVIDProvince {
    if (!this._ontario) throw new Error("Not initialized.");
    return this._ontario;
  }

  get canada(): COVIDProvince {
    if (!this._canada) throw new Error("Not initialized.");
    return this._canada;
  }

  getHealthUnitByCode(this: COVIDRegionsController, regionCode: string): COVIDHealthUnit {
    const results: COVIDHealthUnit[] = this.healthUnits.filter((hu) => { return hu.locationId == regionCode });

    if (results.length != 1) throw new Error('No health unit found for: ' + regionCode);
    else return results[0];
  }

  getProvinceByCode(this: COVIDRegionsController, provinceCode: string): COVIDProvince {
    const results: COVIDProvince[] = this.provinces.filter((p) => { return p.locationId == provinceCode });

    if (results.length != 1) throw new Error('No province found for: ' + provinceCode);
    else return results[0];
  }
}
