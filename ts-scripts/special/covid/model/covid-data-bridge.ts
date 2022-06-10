import { DataBridge } from "../../_components/data-bridge.component.js";

/**
 * Handles retrieval of data from the API
 */
export type COVIDTimeSeriesType =
  'cases'
  | 'deaths'
  | 'hospitalizations'
  | 'icu'
  | 'tests_completed'
  | 'vaccine_coverage_dose_1'
  | 'vaccine_coverage_dose_2'
  | 'vaccine_coverage_dose_3'
  | 'vaccine_coverage_dose_4'
  | 'vaccine_administration_total_doses'
  | 'vaccine_administration_dose_1'
  | 'vaccine_administration_dose_2'
  | 'vaccine_administration_dose_3';

export enum COVIDRegionLevel {
  regional = 'hr',
  provincial = 'pt',
  national = 'can',
}

export type COVIDSummaryResponse = {
  "region": string,
  "date": string,
  "cases": number,
  "cases_daily": number,
  "deaths": number,
  "deaths_daily": number,
  "hospitalizations": number,
  "hospitalizations_daily": number,
  "icu": number,
  "icu_daily": number,
  "tests_completed": number,
  "tests_completed_daily": number,
  "vaccine_coverage_dose_1": number,
  "vaccine_coverage_dose_1_daily": number,
  "vaccine_coverage_dose_2": number,
  "vaccine_coverage_dose_2_daily": number,
  "vaccine_coverage_dose_3": number,
  "vaccine_coverage_dose_3_daily": number,
  "vaccine_coverage_dose_4": number,
  "vaccine_coverage_dose_4_daily": number,
  "vaccine_administration_total_doses": number,
  "vaccine_administration_total_doses_daily": number,
  "vaccine_administration_dose_1": number,
  "vaccine_administration_dose_1_daily": number,
  "vaccine_administration_dose_2": number,
  "vaccine_administration_dose_2_daily": number,
  "vaccine_administration_dose_3": number,
  "vaccine_administration_dose_3_daily": number
}

export type COVIDTimeSeriesDayResponse = {
  "name": string,
  "region": string,
  "sub_region_1": string,
  "date": string,
  "value": number,
  "value_daily": number
}

export class COVIDDataBridge {
  private static readonly API = new DataBridge('https://api.opencovid.ca');

  static get(url: string): Promise<any> {
    return COVIDDataBridge.API.get(url);
  }

  static async getLastUpdate() {
    return await COVIDDataBridge.API.get('/version');
  }

  static async getSummary(
    type: keyof COVIDSummaryResponse,
    locationId: string,
    region: COVIDRegionLevel
  ) {
    return ((await COVIDDataBridge.API.get(`/summary?geo=${region}&loc=${locationId}`)).data[0] as COVIDSummaryResponse)[type] as number;
  }

  static async getProvincialSummaries(config?: { nameType?: 'full' | 'id' | 'short' }): Promise<{ data: any[] }> {
    let _nameType: string;
    switch (config?.nameType) {
      case 'full': _nameType = 'canonical'; break;
      case 'short': _nameType = 'short'; break;
      case 'id':
      default: _nameType = 'pruid'; break;
    }

    return COVIDDataBridge.get(`/summary?geo=pt&pt_names=${_nameType}`) as Promise<{
      data: any[]
    }>;
  }

  static async getRegionalSummaries(config?: { nameType?: 'full' | 'id' | 'short' }): Promise<{ data: any[] }> {
    let _nameType: string;
    switch (config?.nameType) {
      case 'full': _nameType = 'canonical'; break;
      case 'short': _nameType = 'short'; break;
      case 'id':
      default: _nameType = 'hruid'; break;
    }

    return COVIDDataBridge.get(`/summary?geo=hr&hr_names=${_nameType}`) as Promise<{
      data: any[]
    }>;
  }

  static async getTimeSeries(type: COVIDTimeSeriesType, locationId: string, level: COVIDRegionLevel): Promise<COVIDTimeSeriesDayResponse[]> {
    return ((await COVIDDataBridge.API.get(`/timeseries?geo=${level}&loc=${locationId}&stat=${type}&ymd=true`))).data[type] as COVIDTimeSeriesDayResponse[];
  }
}
