var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
import { cws } from "../../../cws.js";
import { DataBridge } from "../../_components/data-bridge.component.js";
export class COVIDDataBridge {
    static getLastUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                OPENCOVID: yield COVIDDataBridge.apis.OPENCOVID.get('version'),
            };
        });
    }
    static getSummary(type, locationId) {
        return __awaiter(this, void 0, void 0, function* () {
            let internalType = type;
            switch (type) {
                case 'hospitalizations':
                    internalType = 'total_hospitalizations';
                    break;
                case 'mortality':
                    internalType = 'deaths';
                    break;
                case 'vaccine-doses':
                    internalType = 'cumulative_avaccine';
                    break;
                case 'vaccine-completions':
                    internalType = 'cumulative_cvaccine';
                    break;
                case 'cumulative-cases':
                    internalType = 'cumulative_cases';
                    break;
                case 'cumulative-deaths':
                    internalType = 'cumulative_deaths';
                    break;
            }
            if (cws.Array.includes([
                'hospitalizations'
            ], type)) {
                console.error(`NOTE: the api.covid19tracker.ca API has unfriendly CORS policy, and likely will not work.
      Do not make requests to it.  This functionality is left here in case their CORS improves.`);
                if (!isNaN(parseInt(locationId)))
                    return yield COVIDDataBridge.summaryHelper.covid19Tracker.getRegional(locationId, internalType);
                else if (locationId.length === 2)
                    return yield COVIDDataBridge.summaryHelper.covid19Tracker.getProvincial(locationId, internalType);
                else
                    return yield COVIDDataBridge.summaryHelper.covid19Tracker.getNational(internalType);
            }
            else {
                return (yield COVIDDataBridge.apis.OPENCOVID.get(`/summary?loc=${locationId}`)).summary[0][internalType];
            }
        });
    }
    static getTimeSeries(type, locationId) {
        return __awaiter(this, void 0, void 0, function* () {
            let internalType = type;
            switch (type) {
                case 'deaths':
                    internalType = 'mortality';
                    break;
                case 'vaccine-doses':
                    internalType = 'avaccine';
                    break;
            }
            return (yield COVIDDataBridge.apis.OPENCOVID.get(`/timeseries?loc=${locationId}&stat=${internalType}&ymd=true`))[internalType];
        });
    }
    static getSupplementaryData() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                OPENCOVID: yield COVIDDataBridge.apis.OPENCOVID.get('other'),
            };
        });
    }
}
_a = COVIDDataBridge;
COVIDDataBridge.apis = {
    OPENCOVID: new DataBridge('https://api.opencovid.ca/'),
    COVID_19_TRACKER: new DataBridge('https://api.covid19tracker.ca'),
};
COVIDDataBridge.summaryHelper = {
    covid19Tracker: {
        getRegional: (locationId, attribute) => __awaiter(void 0, void 0, void 0, function* () {
            const regions = (yield COVIDDataBridge.apis.COVID_19_TRACKER.get(`/summary/split/hr`)).data, parsedLocationId = parseInt(locationId);
            return regions.find((value) => {
                return value.hr_uid === parsedLocationId;
            })[attribute];
        }),
        getProvincial: (provinceId, attribute) => __awaiter(void 0, void 0, void 0, function* () {
            const provinces = (yield COVIDDataBridge.apis.COVID_19_TRACKER.get(`/summary/split/`)).data;
            return provinces.find((value) => {
                return value.province === provinceId;
            })[attribute];
        }),
        getNational: (attribute) => __awaiter(void 0, void 0, void 0, function* () {
            return (yield COVIDDataBridge.apis.COVID_19_TRACKER.get(`/summary/`)).data[0][attribute];
        })
    }
};
//# sourceMappingURL=covid-data-bridge.js.map