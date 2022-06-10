var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { DataBridge } from "../../_components/data-bridge.component.js";
export var COVIDRegionLevel;
(function (COVIDRegionLevel) {
    COVIDRegionLevel["regional"] = "hr";
    COVIDRegionLevel["provincial"] = "pt";
    COVIDRegionLevel["national"] = "can";
})(COVIDRegionLevel || (COVIDRegionLevel = {}));
export class COVIDDataBridge {
    static get(url) {
        return COVIDDataBridge.API.get(url);
    }
    static getLastUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield COVIDDataBridge.API.get('/version');
        });
    }
    static getSummary(type, locationId, region) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield COVIDDataBridge.API.get(`/summary?geo=${region}&loc=${locationId}`)).data[0][type];
        });
    }
    static getProvincialSummaries(config) {
        return __awaiter(this, void 0, void 0, function* () {
            let _nameType;
            switch (config === null || config === void 0 ? void 0 : config.nameType) {
                case 'full':
                    _nameType = 'canonical';
                    break;
                case 'short':
                    _nameType = 'short';
                    break;
                case 'id':
                default:
                    _nameType = 'pruid';
                    break;
            }
            return COVIDDataBridge.get(`/summary?geo=pt&pt_names=${_nameType}`);
        });
    }
    static getRegionalSummaries(config) {
        return __awaiter(this, void 0, void 0, function* () {
            let _nameType;
            switch (config === null || config === void 0 ? void 0 : config.nameType) {
                case 'full':
                    _nameType = 'canonical';
                    break;
                case 'short':
                    _nameType = 'short';
                    break;
                case 'id':
                default:
                    _nameType = 'hruid';
                    break;
            }
            return COVIDDataBridge.get(`/summary?geo=hr&hr_names=${_nameType}`);
        });
    }
    static getTimeSeries(type, locationId, level) {
        return __awaiter(this, void 0, void 0, function* () {
            return ((yield COVIDDataBridge.API.get(`/timeseries?geo=${level}&loc=${locationId}&stat=${type}&ymd=true`))).data[type];
        });
    }
}
COVIDDataBridge.API = new DataBridge('https://api.opencovid.ca');
//# sourceMappingURL=covid-data-bridge.js.map