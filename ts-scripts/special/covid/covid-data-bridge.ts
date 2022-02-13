import { DataBridge } from "../_components/data-bridge.component.js";

/**
 * Handles retrieval of data from the API
 */
export class COVIDDataBridge {
  private static apis = {
    OPENCOVID: new DataBridge('https://api.opencovid.ca/'),
  }

  static async getLastUpdate() {
    return {
      OPENCOVID: await COVIDDataBridge.apis.OPENCOVID.get('version'),
    }
  }

  static async getSummary(
    type: 'cases'
      | 'mortality'
      | 'deaths'
      | 'vaccine-completions'
      | 'vaccine-doses'
      | 'cumulative-cases'
      | 'cumulative-deaths',
    locationId: string
  ) {
    let internalType: string = type;
    switch (type) {
      case 'mortality': internalType = 'deaths'; break;
      case 'vaccine-doses': internalType = 'cumulative_avaccine'; break;
      case 'vaccine-completions': internalType = 'cumulative_cvaccine'; break;
      case 'cumulative-cases': internalType = 'cumulative_cases'; break;
      case 'cumulative-deaths': internalType = 'cumulative_deaths'; break;
    }

    return (await COVIDDataBridge.apis.OPENCOVID.get(`/summary?loc=${locationId}`)).summary[0][internalType];
  }

  static async getTimeSeries(type: 'cases' | 'mortality' | 'deaths' | 'active' | 'vaccine-doses', locationId: string): Promise<any[]> {
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