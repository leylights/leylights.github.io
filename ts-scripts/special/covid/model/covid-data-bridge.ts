import { cws } from "../../../cws.js";
import { DataBridge } from "../../_components/data-bridge.component.js";

/**
 * Handles retrieval of data from the API
 */
export type COVIDSummaryType = 'cases'
  | 'mortality'
  | 'hospitalizations'
  | 'deaths'
  | 'vaccine-completions'
  | 'vaccine-doses'
  | 'cumulative-cases'
  | 'cumulative-deaths';

export type COVIDTimeSeriesType = 'cases'
  | 'mortality'
  | 'deaths'
  | 'active'
  | 'vaccine-doses';

export class COVIDDataBridge {
  private static readonly apis = {
    OPENCOVID: new DataBridge('https://api.opencovid.ca/'),
    COVID_19_TRACKER: new DataBridge('https://api.covid19tracker.ca'),
  }

  static async getLastUpdate() {
    return {
      OPENCOVID: await COVIDDataBridge.apis.OPENCOVID.get('version'),
    }
  }

  static async getSummary(
    type: COVIDSummaryType,
    locationId: string
  ) {
    let internalType: string = type;
    switch (type) {
      case 'hospitalizations': internalType = 'total_hospitalizations'; break;
      case 'mortality': internalType = 'deaths'; break;
      case 'vaccine-doses': internalType = 'cumulative_avaccine'; break;
      case 'vaccine-completions': internalType = 'cumulative_cvaccine'; break;
      case 'cumulative-cases': internalType = 'cumulative_cases'; break;
      case 'cumulative-deaths': internalType = 'cumulative_deaths'; break;
    }

    if (cws.Array.includes([
      'hospitalizations'
    ], type)) {
      console.error(`NOTE: the api.covid19tracker.ca API has unfriendly CORS policy, and likely will not work.
      Do not make requests to it.  This functionality is left here in case their CORS improves.`);

      if (!isNaN(parseInt(locationId))) return await COVIDDataBridge.summaryHelper.covid19Tracker.getRegional(locationId, internalType);
      else if (locationId.length === 2) return await COVIDDataBridge.summaryHelper.covid19Tracker.getProvincial(locationId, internalType);
      else return await COVIDDataBridge.summaryHelper.covid19Tracker.getNational(internalType);
    } else {
      return (await COVIDDataBridge.apis.OPENCOVID.get(`/summary?loc=${locationId}`)).summary[0][internalType];
    }
  }

  private static summaryHelper = {
    covid19Tracker: {
      getRegional: async (locationId: string, attribute: string) => {
        const regions: any[] = (await COVIDDataBridge.apis.COVID_19_TRACKER.get(`/summary/split/hr`)).data,
          parsedLocationId = parseInt(locationId);

        return regions.find((value) => {
          return value.hr_uid === parsedLocationId;
        })[attribute];
      },

      getProvincial: async (provinceId: string, attribute: string) => {
        const provinces: any[] = (await COVIDDataBridge.apis.COVID_19_TRACKER.get(`/summary/split/`)).data;

        return provinces.find((value) => {
          return value.province === provinceId;
        })[attribute];
      },

      getNational: async (attribute: string) => {
        return (await COVIDDataBridge.apis.COVID_19_TRACKER.get(`/summary/`)).data[0][attribute];
      }
    }
  }

  static async getTimeSeries(type: COVIDTimeSeriesType, locationId: string): Promise<any[]> {
    let internalType: string = type;
    switch (type) {
      case 'deaths': internalType = 'mortality'; break;
      case 'vaccine-doses': internalType = 'avaccine'; break;
    }

    return (await COVIDDataBridge.apis.OPENCOVID.get(`/timeseries?loc=${locationId}&stat=${internalType}&ymd=true`))[internalType];
  }

  static async getSupplementaryData() {
    return {
      OPENCOVID: await COVIDDataBridge.apis.OPENCOVID.get('other'),
    }
  }
}