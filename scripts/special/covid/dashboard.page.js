/**
 * @author Cole Stanley
 *
 * A dashboard to analyse COVID-19 data
 *
 * Start date: December 2021
 * End date: February 2022
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cws } from "../../cws.js";
import { Button } from "../../components/button.component.js";
import { COVIDCardGrid } from "./components/card-grid.component.js";
import { COVIDSectionCollection } from "./components/section-collection.component.js";
import { COVIDSection } from "./components/section.component.js";
import { COVIDTimeSeriesChart } from "./components/time-series-chart.component.js";
import { COVIDDataBridge, COVIDRegionLevel } from "./model/covid-data-bridge.js";
import { COVIDHelper } from "./helper.js";
import { COVIDRegionsController } from "./model/regions.controller.js";
import { DarkModeService } from "../../services/dark-mode.service.js";
import { COVIDDataInterface } from "./model/covid-data-interface.js";
class COVIDDashboardPage {
    constructor() {
        this.elements = {
            lastUpdate: document.getElementById('last-update'),
            updateWarning: document.getElementById('update-warning'),
        };
        this.regionsController = new COVIDRegionsController();
        this.grids = [];
        this.mainSectionsCollection = new COVIDSectionCollection(document.getElementById('covid-main'));
        this.sections = {
            home: new COVIDSection('Home', 'Home', [], this.mainSectionsCollection, true),
            canada: new COVIDSection('Canada', 'Canada', [], this.mainSectionsCollection, true),
            ontario: new COVIDSection('Ontario', 'Ontario', [], this.mainSectionsCollection, true),
            london: new COVIDSection('London', 'London', [], this.mainSectionsCollection, true),
            waterloo: new COVIDSection('Waterloo', 'Waterloo', [], this.mainSectionsCollection, true),
            provinceSelect: new COVIDSection('Province Select', 'Province Select', [], this.mainSectionsCollection, true),
            regionSelect: new COVIDSection('Region Select', 'Region Select', [], this.mainSectionsCollection, true),
        };
        DarkModeService.addDarkModeListener({
            config: {
                notifyOnDebugToggle: true,
            },
            listener: (isDark) => {
                const lightLink = cws.getRelativeUrlPath('stylesheets/covid/covid-light.css');
                if (isDark) {
                    Array.from(document.getElementsByTagName('link')).forEach((link) => {
                        if (link.rel == 'stylesheet' && link.href.includes(lightLink.split('/').pop())) {
                            link.remove();
                        }
                    });
                }
                else {
                    document.head.appendChild(cws.createLinkElement(lightLink, 'stylesheet'));
                }
            }
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const me = this;
            const averageDays = 7;
            COVIDDataBridge.preload();
            if (new Date().getHours() === 21)
                this.elements.updateWarning.classList.remove('hidden-warning');
            COVIDDataInterface.getLastUpdate().then((result) => {
                me.elements.lastUpdate.innerText = result;
            });
            yield this.regionsController.init();
            buildHomeDashboard();
            buildCanadaDashboard();
            buildOntarioDashboard();
            buildLondonDashboard();
            buildWaterlooDashboard();
            buildProvinceSelectorDashboard();
            buildRegionalSelectorDashboard();
            if (cws.Object.values(this.sections).filter((section) => section.isSelected).length === 0)
                this.sections.home.select();
            function buildHomeDashboard() {
                function getCaseCount(location, region) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return yield getCount('cases_daily', location, region);
                    });
                }
                function getCount(statistic, location, region) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const count = yield COVIDDataBridge.getSummary(statistic, location, region);
                        return cws.numberToPrettyNumber(count);
                    });
                }
                // Daily case counts
                me.createGrid(me.sections.home, 'Daily new cases', [{
                        title: "CANADA",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () { return getCaseCount('can', COVIDRegionLevel.national); }),
                    }, {
                        title: "ONTARIO",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () { return getCaseCount('ON', COVIDRegionLevel.provincial); }),
                    }, {
                        title: "MIDDLESEX-LONDON",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () { return getCaseCount('3544', COVIDRegionLevel.regional); }),
                    },]);
                buildMainLondonRow(me.sections.home);
                buildMainOntarioRow(me.sections.home);
                buildMainCanadaRow(me.sections.home);
            }
            function buildCanadaDashboard() {
                buildMacroRegionalDashboard(me.sections.canada, me.regionsController.canada, COVIDRegionLevel.national);
            }
            function buildOntarioDashboard() {
                buildMacroRegionalDashboard(me.sections.ontario, me.regionsController.ontario, COVIDRegionLevel.provincial);
            }
            function buildMacroRegionalDashboard(section, province, level) {
                // daily totals
                buildDailyTotalsRow(section, province, level);
                // wavg per day
                buildWavgDailyTotalsRow(section, province, level);
                // cumulative totals
                buildCumulativeRow(section, province, level);
                // comparison
                if (level !== COVIDRegionLevel.national)
                    buildComparisonToCanada(section, province, level);
                // line charts
                buildTimeSeriesAnalysis(section, province, level);
                // vaccines    
                me.createGrid(section, 'Vaccination', [{
                        title: "Vaccine doses administered",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const doses = yield COVIDDataBridge.getSummary('vaccine_administration_total_doses', province.locationId, level);
                            return cws.numberToPrettyNumber(doses);
                        }),
                    }, {
                        title: "Double-vaccinations completed",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const doses = yield COVIDDataBridge.getSummary('vaccine_administration_dose_2', province.locationId, level);
                            return cws.numberToPrettyNumber(doses);
                        }),
                    }, {
                        title: "Population double vaccinated",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const coverage = yield COVIDDataBridge.getSummary('vaccine_coverage_dose_2', province.locationId, level);
                            return COVIDHelper.formatAsPercentage(coverage / 100);
                        }),
                    }, {
                        title: "Population triple vaccinated",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const coverage = yield COVIDDataBridge.getSummary('vaccine_coverage_dose_3', province.locationId, level);
                            return COVIDHelper.formatAsPercentage(coverage / 100);
                        }),
                    }]);
            }
            function buildLondonDashboard() {
                buildRegionalDashboard(me.sections.london, me.regionsController.london);
            }
            function buildWaterlooDashboard() {
                buildRegionalDashboard(me.sections.waterloo, me.regionsController.waterloo);
            }
            function buildRegionalSelectorDashboard() {
                me.sections.regionSelect.appendToBody(cws.createElement({
                    type: 'h2',
                    innerText: 'Select a region:'
                }));
                // health unit select
                const selector = cws.createElement({
                    type: 'select',
                    id: 'health-unit-select',
                    classList: 'covid-region-select',
                });
                me.sections.regionSelect.appendToBody(cws.createElement({
                    type: 'div',
                    children: [selector]
                }));
                me.regionsController.healthUnits.map((r) => {
                    return {
                        name: r.provinceCode + ': ' + r.name,
                        value: r.locationId,
                    };
                }).sort((a, b) => { return a.name < b.name ? -1 : 1; }).forEach((unit) => {
                    selector.appendChild(cws.createElement({
                        type: 'option',
                        innerText: unit.name,
                        otherNodes: [{ type: 'value', value: unit.value }],
                    }));
                });
                const body = cws.createElement({
                    type: 'div',
                    id: 'region-select-body',
                });
                // button
                Button.createByAppending(me.sections.regionSelect.appendableBody, () => {
                    Array.from(body.children).forEach((child) => { child.remove(); });
                    buildRegionalDashboard(body, me.regionsController.getHealthUnitByCode(selector.value));
                }, 'Load', true);
                me.sections.regionSelect.appendToBody(body);
                me.sections.provinceSelect.appendToBody(cws.createElement({ type: 'br' }));
            }
            function buildProvinceSelectorDashboard() {
                me.sections.provinceSelect.appendToBody(cws.createElement({
                    type: 'h2',
                    innerText: 'Select a province:'
                }));
                // province select
                const selector = cws.createElement({
                    type: 'select',
                    classList: 'covid-region-select',
                    id: 'province-select',
                });
                me.sections.provinceSelect.appendToBody(cws.createElement({
                    type: 'div',
                    children: [selector]
                }));
                me.regionsController.provinces.filter((p) => {
                    return !p.isCanada;
                }).map((r) => {
                    return {
                        name: r.name,
                        value: r.locationId,
                    };
                }).sort((a, b) => { return a.name < b.name ? -1 : 1; }).forEach((unit) => {
                    selector.appendChild(cws.createElement({
                        type: 'option',
                        innerText: unit.name,
                        otherNodes: [{ type: 'value', value: unit.value }],
                    }));
                });
                const body = cws.createElement({
                    type: 'div',
                    id: 'region-select-body',
                });
                // button
                Button.createByAppending(me.sections.provinceSelect.appendableBody, () => {
                    Array.from(body.children).forEach((child) => { child.remove(); });
                    buildMacroRegionalDashboard(body, me.regionsController.getProvinceByCode(selector.value), COVIDRegionLevel.provincial);
                }, 'Load', true);
                me.sections.provinceSelect.appendToBody(body);
                me.sections.provinceSelect.appendToBody(cws.createElement({ type: 'br' }));
            }
            function buildRegionalDashboard(section, region) {
                // daily totals
                buildDailyTotalsRow(section, region, COVIDRegionLevel.regional);
                // wavg per day
                buildWavgDailyTotalsRow(section, region, COVIDRegionLevel.regional);
                // cumulative totals
                buildCumulativeRow(section, region, COVIDRegionLevel.regional);
                // comparison
                // @todo Fix if population data is re-added en masse.
                // buildComparisonToProvince(section, region);
                // buildComparisonToCanada(section, region, COVIDRegionLevel.regional);
                // line charts
                buildTimeSeriesAnalysis(section, region, COVIDRegionLevel.regional);
            }
            function buildComparisonToProvince(section, region) {
                return buildComparisonToRegion(section, region, COVIDRegionLevel.regional, me.regionsController.getProvinceByCode(region.provinceCode), COVIDRegionLevel.provincial);
            }
            function buildComparisonToCanada(section, region, level) {
                return buildComparisonToRegion(section, region, level, me.regionsController.canada, COVIDRegionLevel.national);
            }
            function buildComparisonToRegion(section, region, level, comparator, comparatorLevel) {
                /**
                 * Returns the multiplier of the local proportion of the value and the provincial proportion by population
                 * such that local * (getProportionalDifference(...) + 1) = provincial
                 */
                function getProportionalDifference(local, provincial) {
                    const provProportion = provincial / comparator.population, localProportion = local / region.population;
                    const result = localProportion / provProportion - 1;
                    if (provProportion === 0)
                        return COVIDHelper.formatAsPercentage(0);
                    else if (result < 0)
                        return COVIDHelper.formatAsPercentage(result);
                    else
                        return '+' + COVIDHelper.formatAsPercentage(result);
                }
                function compareDailyStat(stat) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const regionalCases = yield COVIDDataBridge.getSummary(stat, region.locationId, level);
                        const provincialCases = yield COVIDDataBridge.getSummary(stat, comparator.locationId, comparatorLevel);
                        return getProportionalDifference(regionalCases, provincialCases);
                    });
                }
                me.createGrid(section, `How ${region.shortName} compares to ${comparator.shortName} per capita`, [{
                        title: "New cases",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () { return compareDailyStat('cases'); }),
                        isSuccess: (response) => { return parseFloat(response) < 0; },
                        isFailure: (response) => { return parseFloat(response) > 0; },
                        isNeutral: (response) => { return parseFloat(response) === 0; },
                    }, {
                        title: "New deaths",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () { return compareDailyStat('deaths'); }),
                        isSuccess: (response) => { return parseFloat(response) < 0; },
                        isFailure: (response) => { return parseFloat(response) > 0; },
                        isNeutral: (response) => { return parseFloat(response) === 0; },
                    }, {
                        title: `Average daily new cases (${averageDays} days)`,
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const regionalCases = yield COVIDDataBridge.getTimeSeries('cases', region.locationId, level);
                            const provincialCases = yield COVIDDataBridge.getTimeSeries('cases', comparator.locationId, comparatorLevel);
                            return getProportionalDifference(COVIDDashboardPage.getTimeSeriesAverage(regionalCases, averageDays, true), COVIDDashboardPage.getTimeSeriesAverage(provincialCases, averageDays, true));
                        }),
                        isSuccess: (response) => { return parseFloat(response) < 0; },
                        isFailure: (response) => { return parseFloat(response) > 0; },
                        isNeutral: (response) => { return parseFloat(response) === 0; },
                    }, {
                        title: `Average daily deaths (${averageDays} days)`,
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const regionalDeaths = yield COVIDDataBridge.getTimeSeries('deaths', region.locationId, level);
                            const provincialDeaths = yield COVIDDataBridge.getTimeSeries('deaths', comparator.locationId, comparatorLevel);
                            return getProportionalDifference(COVIDDashboardPage.getTimeSeriesAverage(regionalDeaths, averageDays, true), COVIDDashboardPage.getTimeSeriesAverage(provincialDeaths, averageDays, true));
                        }),
                        isSuccess: (response) => { return parseFloat(response) < 0; },
                        isFailure: (response) => { return parseFloat(response) > 0; },
                        isNeutral: (response) => { return parseFloat(response) === 0; },
                    }], {
                    maxTwoAcross: true,
                });
            }
            function buildTimeSeriesAnalysis(section, region, level) {
                const CASES_START = new Date('2020-01-25'), DEATHS_START = new Date('2020-03-08'), TODAY = new Date(Date.now() - Date.now() % (24 * 60 * 60 * 1000)), caseDays = cws.daysBetween(CASES_START, TODAY), deathsDays = cws.daysBetween(DEATHS_START, TODAY);
                const title = cws.createElement({ type: 'h2', innerText: 'Time-series analysis' });
                appendToSection(title);
                const appendableBody = section instanceof COVIDSection ? section.appendableBody : section, typeSelector = new COVIDSectionCollection(appendableBody, { setHeightToMax: true }), wavgSection = new COVIDSection(null, `Average (${averageDays} days)`, [], typeSelector), wavgCollection = new COVIDSectionCollection(wavgSection.appendableBody, { setHeightToMax: true }), rawSection = new COVIDSection(null, 'Raw', [], typeSelector), rawCollection = new COVIDSectionCollection(rawSection.appendableBody, { setHeightToMax: true });
                buildCharts(rawCollection, 0);
                buildCharts(wavgCollection, averageDays);
                typeSelector.selectFirstSection();
                function appendToSection(el) {
                    if (section instanceof COVIDSection)
                        return section.appendToBody(el);
                    else
                        return section.appendChild(el);
                }
                function resetHeights() {
                    rawCollection.resetHeight();
                    wavgCollection.resetHeight();
                    typeSelector.resetHeight();
                }
                function buildCharts(collection, baseAverageDays) {
                    createChart({
                        days: caseDays,
                        title: 'New cases per day',
                        shortTitle: 'Cases',
                        type: 'cases',
                    });
                    if (level !== COVIDRegionLevel.regional)
                        createChart({
                            days: caseDays,
                            title: 'Hospitalizations per day',
                            shortTitle: 'Hospitalizations',
                            type: 'hospitalizations',
                        });
                    // debugger;
                    createChart({
                        days: deathsDays,
                        title: 'Deaths per day',
                        shortTitle: 'Deaths',
                        type: 'deaths',
                    });
                    if (level !== COVIDRegionLevel.regional) {
                        createChart({
                            days: caseDays,
                            title: 'First vaccine administered per day',
                            shortTitle: 'Vaccine 1',
                            type: 'vaccine_administration_dose_1',
                            notDaily: true,
                            averageDays: 21
                        });
                        createChart({
                            days: caseDays,
                            title: 'Second vaccine administered per day',
                            shortTitle: 'Vaccine 2',
                            type: 'vaccine_administration_dose_2',
                            notDaily: true,
                            averageDays: 21
                        });
                        createChart({
                            days: caseDays,
                            title: 'Third vaccine administered per day',
                            shortTitle: 'Vaccine 3',
                            type: 'vaccine_administration_dose_3',
                            notDaily: true,
                            averageDays: 21
                        });
                    }
                    function createChart(data) {
                        const avgDays = data.averageDays && baseAverageDays !== 1 ? data.averageDays : baseAverageDays;
                        new COVIDTimeSeriesChart(collection, {
                            days: data.days - avgDays,
                            title: data.title,
                            shortTitle: data.shortTitle,
                            timeSeries: {
                                type: data.type,
                                location: region.locationId,
                                level: level,
                                useDailyValues: data.notDaily === false ? false : true,
                                valueReformatter: (n) => { return Math.max(n, 0); },
                            },
                            averageDays: avgDays,
                        }, () => { resetHeights(); });
                    }
                    collection.selectFirstSection();
                }
            }
            function buildMainLondonRow(section) {
                buildMainRow(section, {
                    title: 'Middlesex-London',
                    locationId: '3544',
                    population: me.regionsController.london.population,
                    level: COVIDRegionLevel.regional
                });
            }
            function buildMainOntarioRow(section) {
                buildMainRow(section, {
                    title: 'Ontario',
                    locationId: 'ON',
                    population: me.regionsController.ontario.population,
                    level: COVIDRegionLevel.provincial
                });
            }
            function buildMainCanadaRow(section) {
                buildMainRow(section, {
                    title: 'Canada',
                    locationId: 'can',
                    population: me.regionsController.canada.population,
                    level: COVIDRegionLevel.national
                });
            }
            function buildDailyTotalsRow(section, region, level) {
                me.createGrid(section, 'Daily totals', [{
                        title: "New cases",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () { return COVIDDataBridge.getSummary('cases_daily', region.locationId, level); }),
                    }, level === COVIDRegionLevel.regional ? null : {
                        title: "Hopsitalizations",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () { return COVIDDataBridge.getSummary('hospitalizations_daily', region.locationId, level); }),
                    }, {
                        title: "Deaths",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () { return COVIDDataBridge.getSummary('deaths_daily', region.locationId, level); }),
                    }]);
            }
            function buildWavgDailyTotalsRow(section, region, level) {
                me.createGrid(section, `Average daily total (past ${averageDays} days)`, [{
                        title: "New cases",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const cases = yield COVIDDataBridge.getTimeSeries('cases', region.locationId, level);
                            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(cases, averageDays, true));
                        }),
                    }, level === COVIDRegionLevel.regional ? null : {
                        title: "Hospitalizations",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const cases = yield COVIDDataBridge.getTimeSeries('hospitalizations', region.locationId, level);
                            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(cases, averageDays, true));
                        }),
                    }, {
                        title: "Deaths",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const deaths = yield COVIDDataBridge.getTimeSeries('deaths', region.locationId, level);
                            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(deaths, averageDays, true));
                        }),
                    }]);
            }
            function buildCumulativeRow(section, region, level) {
                me.createGrid(section, 'Cumulative totals', [
                    {
                        title: "Cases",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            return cws.numberToPrettyNumber(yield COVIDDataBridge.getSummary('cases', region.locationId, level));
                        }),
                    }, level === COVIDRegionLevel.regional ? null : {
                        title: "Hospitalizations",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            return cws.numberToPrettyNumber(yield COVIDDataBridge.getSummary('hospitalizations', region.locationId, level));
                        }),
                    }, {
                        title: "Deaths",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            return cws.numberToPrettyNumber(yield COVIDDataBridge.getSummary('deaths', region.locationId, level));
                        }),
                    }
                ].concat(!region.population ? [] : [{
                        title: "Cases (as % of pop.)",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const ccases = yield COVIDDataBridge.getSummary('cases', region.locationId, level);
                            return COVIDHelper.formatAsPercentage(ccases / region.population);
                        }),
                    }, level === COVIDRegionLevel.regional ? null : {
                        title: "Current Hospitalizations (as % of pop.)",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const value = yield COVIDDataBridge.getSummary('hospitalizations', region.locationId, level);
                            return COVIDHelper.formatAsPercentage(value / region.population);
                        }),
                    }, {
                        title: "Deaths (as % of pop.)",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const cdeaths = yield COVIDDataBridge.getSummary('deaths', region.locationId, level);
                            return COVIDHelper.formatAsPercentage(cdeaths / region.population);
                        }),
                    }
                ]));
            }
            function buildMainRow(section, data) {
                me.createGrid(section, data.title, [{
                        title: "AVERAGE CASES (past 7 days)",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(yield COVIDDataBridge.getTimeSeries('cases', data.locationId, data.level), 7, true));
                        }),
                    }, {
                        title: "DEATHS (past 28 days)",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const deaths = yield COVIDDataBridge.getTimeSeries('deaths', data.locationId, data.level);
                            const end = deaths.length - 1;
                            return (deaths[end].value - deaths[end - 28].value);
                        }),
                    },
                    !data.population ? null : {
                        title: "CUMULATIVE CASES AS % OF POP.",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const ccases = yield COVIDDataBridge.getSummary('cases', data.locationId, data.level);
                            return cws.roundToDecimalPlaces(100 * ccases / data.population, 2) + '% ';
                        }),
                    }
                ]);
            }
        });
    }
    /**
     * Creates a new card grid.
     *
     * If values.noRequest === true, the url will be printed as the final value
     */
    createGrid(section, title, values, config) {
        return __awaiter(this, void 0, void 0, function* () {
            this.grids.push(new COVIDCardGrid(title, values.filter((a) => { return !!a; }), section, config));
        });
    }
    static getTimeSeriesAverage(timeseries, days, is_daily) {
        const lastNDays = timeseries.slice(timeseries.length - days);
        const result = Math.round(lastNDays.reduce((previousValue, day) => {
            return previousValue + day[is_daily ? 'value_daily' : 'value'] / days;
        }, 0));
        return result;
    }
}
window.addEventListener('load', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (new COVIDDashboardPage()).init();
}));
//# sourceMappingURL=dashboard.page.js.map