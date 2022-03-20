import { cws } from "../../../cws.js";
import { COVIDDataBridge } from "./covid-data-bridge.js";
import { COVIDHealthUnit } from "./health-unit.js";
import { COVIDProvince } from "./province.js";

interface RegionsRepsonse {
  age_cases: any[];
  age_mortality: any[];
  hr: any[];
  prov: any[];
}

export class COVIDRegionsController {
  readonly provinces: COVIDProvince[] = [];
  readonly healthUnits: COVIDHealthUnit[] = [];
  
  private static readonly LONDON_CODE = '3544';
  private static readonly WATERLOO_CODE = '3565';
  private static readonly ONTARIO_CODE = "ON";
  private static readonly CANADA_CODE = "canada";

  private _waterloo: COVIDHealthUnit = null;
  private _london: COVIDHealthUnit = null;
  private _ontario: COVIDProvince = null;
  private _canada: COVIDProvince = null;

  private readonly SKIPPED_HEALTH_UNITS: number[] = [9999];
  private readonly SKIPPED_PROVINCES: string[] = ["RP"];

  async init(this: COVIDRegionsController) {
    const me = this,
      data: RegionsRepsonse = (await COVIDDataBridge.getSupplementaryData()).OPENCOVID;

    // Health units
    data.hr.forEach(configuration => {
      if (!cws.Array.includes(me.SKIPPED_HEALTH_UNITS, configuration.HR_UID)) {
        me.healthUnits.push(new COVIDHealthUnit(configuration));
      }

      if (me.healthUnits[me.healthUnits.length - 1].locationId === COVIDRegionsController.LONDON_CODE)
        me._london = me.healthUnits[me.healthUnits.length - 1];
      else if (me.healthUnits[me.healthUnits.length - 1].locationId === COVIDRegionsController.WATERLOO_CODE)
        me._waterloo = me.healthUnits[me.healthUnits.length - 1];
    });

    // Provinces
    data.prov.forEach(configuration => {
      if (!cws.Array.includes(me.SKIPPED_PROVINCES, configuration.province_short)) {
        me.provinces.push(new COVIDProvince(configuration));
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
