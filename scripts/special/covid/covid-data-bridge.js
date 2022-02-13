var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { DataBridge } from "../_components/data-bridge.component.js";
/**
 * Handles retrieval of data from the API
 */
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
            return (yield COVIDDataBridge.apis.OPENCOVID.get(`/summary?loc=${locationId}`)).summary[0][internalType];
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
COVIDDataBridge.apis = {
    OPENCOVID: new DataBridge('https://api.opencovid.ca/'),
};
//# sourceMappingURL=covid-data-bridge.js.map