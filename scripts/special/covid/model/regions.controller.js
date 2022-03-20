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
import { COVIDHealthUnit } from "./health-unit.js";
import { COVIDProvince } from "./province.js";
export class COVIDRegionsController {
    constructor() {
        this.provinces = [];
        this.healthUnits = [];
        this._waterloo = null;
        this._london = null;
        this._ontario = null;
        this._canada = null;
        this.SKIPPED_HEALTH_UNITS = [9999];
        this.SKIPPED_PROVINCES = ["RP"];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const me = this, data = (yield COVIDDataBridge.getSupplementaryData()).OPENCOVID;
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
        });
    }
    get london() {
        if (!this._london)
            throw new Error("Not initialized.");
        return this._london;
    }
    get waterloo() {
        if (!this._waterloo)
            throw new Error("Not initialized.");
        return this._waterloo;
    }
    get ontario() {
        if (!this._ontario)
            throw new Error("Not initialized.");
        return this._ontario;
    }
    get canada() {
        if (!this._canada)
            throw new Error("Not initialized.");
        return this._canada;
    }
    getHealthUnitByCode(regionCode) {
        const results = this.healthUnits.filter((hu) => { return hu.locationId == regionCode; });
        if (results.length != 1)
            throw new Error('No health unit found for: ' + regionCode);
        else
            return results[0];
    }
    getProvinceByCode(provinceCode) {
        const results = this.provinces.filter((p) => { return p.locationId == provinceCode; });
        if (results.length != 1)
            throw new Error('No province found for: ' + provinceCode);
        else
            return results[0];
    }
}
COVIDRegionsController.LONDON_CODE = '3544';
COVIDRegionsController.WATERLOO_CODE = '3565';
COVIDRegionsController.ONTARIO_CODE = "ON";
COVIDRegionsController.CANADA_CODE = "canada";
//# sourceMappingURL=regions.controller.js.map