var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cws } from "../../../cws.js";
import { COVIDDataBridge } from "./covid-data-bridge.js";
export class COVIDDataInterface {
    static getLastUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield COVIDDataBridge.getLastUpdate()).timeseries;
        });
    }
    static getRegionsInfoMap() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = {
                fullNames: (COVIDDataBridge.getRegionalSummaries({ nameType: 'full' })),
                shortNames: (COVIDDataBridge.getRegionalSummaries({ nameType: 'short' })),
                IDs: (COVIDDataBridge.getRegionalSummaries({ nameType: 'id' })),
            };
            yield Promise.all([cws.Object.values(promises)]);
            const results = {
                fullNames: yield promises.fullNames,
                shortNames: yield promises.shortNames,
                IDs: yield promises.IDs,
            };
            return results.fullNames.data.map((region, index) => {
                return {
                    fullName: results.fullNames.data[index].sub_region_1,
                    shortName: results.shortNames.data[index].sub_region_1,
                    id: results.IDs.data[index].sub_region_1,
                    province: region.region,
                };
            });
        });
    }
    static getProvincesInfoMap() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = {
                fullNames: (COVIDDataBridge.getProvincialSummaries({ nameType: 'full' })),
                shortNames: (COVIDDataBridge.getProvincialSummaries({ nameType: 'short' })),
                IDs: (COVIDDataBridge.getProvincialSummaries({ nameType: 'id' })),
            };
            yield Promise.all([cws.Object.values(promises)]);
            const results = {
                fullNames: yield promises.fullNames,
                shortNames: yield promises.shortNames,
                IDs: yield promises.IDs,
            };
            return results.fullNames.data.map((region, index) => {
                return {
                    fullName: results.fullNames.data[index].region,
                    shortName: results.shortNames.data[index].region,
                    id: results.IDs.data[index].region,
                };
            });
        });
    }
}
COVIDDataInterface.getSummary = {
    cases(locationID, region) {
        return __awaiter(this, void 0, void 0, function* () {
            return COVIDDataBridge.getSummary('cases', locationID, region);
        });
    }
};
//# sourceMappingURL=covid-data-interface.js.map