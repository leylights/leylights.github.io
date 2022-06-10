import { cws } from "../../../cws.js";
import { COVIDDataBridge, COVIDRegionLevel } from "./covid-data-bridge.js";

export class COVIDDataInterface {
  static async getLastUpdate(): Promise<string> {
    return (await COVIDDataBridge.getLastUpdate()).timeseries;
  }

  static getSummary = {
    async cases(locationID: string, region: COVIDRegionLevel) {
      return COVIDDataBridge.getSummary('cases', locationID, region);
    }
  }

  static async getRegionsInfoMap() {
    const promises = {
      fullNames: (COVIDDataBridge.getRegionalSummaries({ nameType: 'full' })),
      shortNames: (COVIDDataBridge.getRegionalSummaries({ nameType: 'short' })),
      IDs: (COVIDDataBridge.getRegionalSummaries({ nameType: 'id' })),
    }

    await Promise.all([cws.Object.values(promises)]);

    const results = {
      fullNames: await promises.fullNames,
      shortNames: await promises.shortNames,
      IDs: await promises.IDs,
    }

    return results.fullNames.data.map((region, index: number) => {
      return {
        fullName: results.fullNames.data[index].sub_region_1,
        shortName: results.shortNames.data[index].sub_region_1,
        id: results.IDs.data[index].sub_region_1,
        province: region.region,
      };
    });
  }

  static async getProvincesInfoMap() {
    const promises = {
      fullNames: (COVIDDataBridge.getProvincialSummaries({ nameType: 'full' })),
      shortNames: (COVIDDataBridge.getProvincialSummaries({ nameType: 'short' })),
      IDs: (COVIDDataBridge.getProvincialSummaries({ nameType: 'id' })),
    }

    await Promise.all([cws.Object.values(promises)]);

    const results = {
      fullNames: await promises.fullNames,
      shortNames: await promises.shortNames,
      IDs: await promises.IDs,
    }

    return results.fullNames.data.map((region, index: number) => {
      return {
        fullName: results.fullNames.data[index].region,
        shortName: results.shortNames.data[index].region,
        id: results.IDs.data[index].region,
      };
    });
  }
}
