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
import { Button } from "../_components/button.component.js";
import { PageBuilder } from "../_services/page-builder.service.js";
import { COVIDCardGrid } from "./components/card-grid.component.js";
import { COVIDSectionCollection } from "./components/section-collection.component.js";
import { COVIDSection } from "./components/section.component.js";
import { COVIDTimeSeriesChart } from "./components/time-series-chart.component.js";
import { COVIDDataBridge } from "./model/covid-data-bridge.js";
import { COVIDHelper } from "./helper.js";
import { COVIDRegionsController } from "./model/regions.controller.js";
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
            provinceSelect: new COVIDSection('Province Select', 'Province Select', [], this.mainSectionsCollection, true),
            regionSelect: new COVIDSection('Region Select', 'Region Select', [], this.mainSectionsCollection, true),
        };
        PageBuilder.addDarkModeListener({
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
            if (new Date().getHours() === 21)
                this.elements.updateWarning.classList.remove('hidden-warning');
            this.elements.lastUpdate.innerText = (yield COVIDDataBridge.getLastUpdate()).OPENCOVID.version;
            yield this.regionsController.init();
            buildHomeDashboard();
            buildCanadaDashboard();
            buildOntarioDashboard();
            buildLondonDashboard();
            buildProvinceSelectorDashboard();
            buildRegionalSelectorDashboard();
            this.sections.home.select();
            function buildHomeDashboard() {
                function getCaseCount(location) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return yield getCount('cases', location);
                    });
                }
                function getCount(statistic, location) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const count = yield COVIDDataBridge.getSummary(statistic, location);
                        return cws.numberToPrettyNumber(count);
                    });
                }
                // Daily case counts
                me.createGrid(me.sections.home, 'Daily new cases', [{
                        title: "CANADA",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () { return getCaseCount('canada'); }),
                    }, {
                        title: "ONTARIO",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () { return getCaseCount('ON'); }),
                    }, {
                        title: "MIDDLESEX-LONDON",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () { return getCaseCount('3544'); }),
                    },]);
                buildMainLondonRow(me.sections.home);
                buildMainOntarioRow(me.sections.home);
                buildMainCanadaRow(me.sections.home);
            }
            function buildCanadaDashboard() {
                buildProvincialDashboard(me.sections.canada, me.regionsController.canada, false);
            }
            function buildOntarioDashboard() {
                buildProvincialDashboard(me.sections.ontario, me.regionsController.ontario, true);
            }
            function buildProvincialDashboard(section, province, compareToCanada) {
                // daily totals
                buildDailyTotalsRow(section, province, true);
                // wavg per day
                buildWavgDailyTotalsRow(section, province, true);
                // cumulative totals
                buildCumulativeRow(section, province, true);
                // comparison
                if (compareToCanada)
                    buildComparisonToCanada(section, province);
                // line charts
                buildTimeSeriesAnalysis(section, province, true);
                // vaccines    
                me.createGrid(section, 'Vaccination', [{
                        title: "Vaccine doses administered",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const doses = yield COVIDDataBridge.getSummary('vaccine-doses', province.locationId);
                            return cws.numberToPrettyNumber(doses);
                        }),
                    }, {
                        title: "Double-vaccinations completed",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const vaccinated = yield COVIDDataBridge.getSummary('vaccine-completions', province.locationId);
                            return cws.numberToPrettyNumber(vaccinated);
                        }),
                    }, {
                        title: "Population fully vaccinated",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const vaccinated = yield COVIDDataBridge.getSummary('vaccine-completions', province.locationId);
                            return COVIDHelper.formatAsPercentage(vaccinated / province.population);
                        }),
                    }]);
            }
            function buildLondonDashboard() {
                buildRegionalDashboard(me.sections.london, me.regionsController.london);
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
                        name: r.province + ': ' + r.name,
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
                    buildProvincialDashboard(body, me.regionsController.getProvinceByCode(selector.value), true);
                }, 'Load', true);
                me.sections.provinceSelect.appendToBody(body);
                me.sections.provinceSelect.appendToBody(cws.createElement({ type: 'br' }));
            }
            function buildRegionalDashboard(section, region) {
                // daily totals
                buildDailyTotalsRow(section, region, false);
                // wavg per day
                buildWavgDailyTotalsRow(section, region, false);
                // cumulative totals
                buildCumulativeRow(section, region, false);
                // comparison
                buildComparisonToProvince(section, region);
                buildComparisonToCanada(section, region);
                // line charts
                buildTimeSeriesAnalysis(section, region, false);
            }
            function buildComparisonToProvince(section, region) {
                return buildComparisonToRegion(section, region, me.regionsController.getProvinceByCode(region.provinceCode));
            }
            function buildComparisonToCanada(section, region) {
                return buildComparisonToRegion(section, region, me.regionsController.canada);
            }
            function buildComparisonToRegion(section, region, comparator) {
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
                        const regionalCases = yield COVIDDataBridge.getSummary(stat, region.locationId);
                        const provincialCases = yield COVIDDataBridge.getSummary(stat, comparator.locationId);
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
                            const regionalCases = yield COVIDDataBridge.getTimeSeries('cases', region.locationId);
                            const provincialCases = yield COVIDDataBridge.getTimeSeries('cases', comparator.locationId);
                            return getProportionalDifference(COVIDDashboardPage.getTimeSeriesAverage(regionalCases, averageDays, (entry) => { return entry.cases; }), COVIDDashboardPage.getTimeSeriesAverage(provincialCases, averageDays, (entry) => { return entry.cases; }));
                        }),
                        isSuccess: (response) => { return parseFloat(response) < 0; },
                        isFailure: (response) => { return parseFloat(response) > 0; },
                        isNeutral: (response) => { return parseFloat(response) === 0; },
                    }, {
                        title: `Average daily deaths (${averageDays} days)`,
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const regionalDeaths = yield COVIDDataBridge.getTimeSeries('deaths', region.locationId);
                            const provincialDeaths = yield COVIDDataBridge.getTimeSeries('deaths', comparator.locationId);
                            return getProportionalDifference(COVIDDashboardPage.getTimeSeriesAverage(regionalDeaths, averageDays, (entry) => { return entry.deaths; }), COVIDDashboardPage.getTimeSeriesAverage(provincialDeaths, averageDays, (entry) => { return entry.deaths; }));
                        }),
                        isSuccess: (response) => { return parseFloat(response) < 0; },
                        isFailure: (response) => { return parseFloat(response) > 0; },
                        isNeutral: (response) => { return parseFloat(response) === 0; },
                    }], {
                    maxTwoAcross: true,
                });
            }
            function buildTimeSeriesAnalysis(section, region, includeActiveCases) {
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
                function buildCharts(collection, averageDays) {
                    new COVIDTimeSeriesChart(collection, {
                        days: caseDays - averageDays,
                        title: 'New cases per day',
                        shortTitle: 'New cases',
                        timeSeries: {
                            type: 'cases',
                            location: region.locationId,
                        },
                        responsePropertyName: 'cases',
                        responseTimePropertyName: 'date_report',
                        averageDays: averageDays,
                    }, () => { resetHeights(); });
                    new COVIDTimeSeriesChart(collection, {
                        days: deathsDays - averageDays,
                        title: 'Deaths per day',
                        shortTitle: 'Mortality',
                        timeSeries: {
                            type: 'mortality',
                            location: region.locationId,
                        },
                        responsePropertyName: 'deaths',
                        responseTimePropertyName: 'date_death_report',
                        averageDays: averageDays,
                    }, () => { resetHeights(); });
                    if (includeActiveCases)
                        new COVIDTimeSeriesChart(collection, {
                            days: caseDays - averageDays,
                            title: 'Active cases per day',
                            shortTitle: 'Active cases',
                            timeSeries: {
                                type: 'active',
                                location: region.locationId,
                            },
                            responsePropertyName: 'active_cases',
                            responseTimePropertyName: 'date_active',
                            averageDays: averageDays,
                        }, () => { resetHeights(); });
                    collection.selectFirstSection();
                }
            }
            function buildMainLondonRow(section) {
                buildMainRow(section, {
                    title: 'Middlesex-London',
                    locationId: '3544',
                    population: me.regionsController.london.population
                });
            }
            function buildMainOntarioRow(section) {
                buildMainRow(section, {
                    title: 'Ontario',
                    locationId: 'ON',
                    population: me.regionsController.ontario.population
                });
            }
            function buildMainCanadaRow(section) {
                buildMainRow(section, {
                    title: 'Canada',
                    locationId: 'canada',
                    population: me.regionsController.canada.population
                });
            }
            function buildDailyTotalsRow(section, region, includeVaccines) {
                me.createGrid(section, 'Daily totals', [{
                        title: "New cases",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () { return COVIDDataBridge.getSummary('cases', region.locationId); }),
                    }, {
                        title: "Deaths",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () { return COVIDDataBridge.getSummary('deaths', region.locationId); }),
                    }, includeVaccines ? {
                        title: "Vaccines administered",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () { return cws.numberToPrettyNumber(yield COVIDDataBridge.getSummary('vaccine-doses', region.locationId)); }),
                    } : null]);
            }
            function buildWavgDailyTotalsRow(section, region, includeVaccines) {
                me.createGrid(section, `Average daily total (past ${averageDays} days)`, [{
                        title: "New cases",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const cases = yield COVIDDataBridge.getTimeSeries('cases', region.locationId);
                            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(cases, averageDays, (entry) => { return entry.cases; }));
                        }),
                    }, {
                        title: "Deaths",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const deaths = yield COVIDDataBridge.getTimeSeries('deaths', region.locationId);
                            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(deaths, averageDays, (entry) => { return entry.deaths; }));
                        }),
                    }, includeVaccines ? {
                        title: "Vaccines administered",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const vaccines = yield COVIDDataBridge.getTimeSeries('vaccine-doses', region.locationId);
                            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(vaccines, averageDays, (entry) => { return entry.avaccine; }));
                        }),
                    } : null]);
            }
            function buildCumulativeRow(section, region, includeVaccines) {
                me.createGrid(section, 'Cumulative totals', [
                    {
                        title: "Cases",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            return cws.numberToPrettyNumber(yield COVIDDataBridge.getSummary('cases', region.locationId));
                        }),
                    }, {
                        title: "Deaths",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            return cws.numberToPrettyNumber(yield COVIDDataBridge.getSummary('deaths', region.locationId));
                        }),
                    }, includeVaccines ? {
                        title: "Vaccines administered",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            return cws.numberToPrettyNumber(yield COVIDDataBridge.getSummary('vaccine-doses', region.locationId));
                        }),
                    } : null, {
                        title: "Cases (as % of pop.)",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const ccases = yield COVIDDataBridge.getSummary('cumulative-cases', region.locationId);
                            return COVIDHelper.formatAsPercentage(ccases / region.population);
                        }),
                    }, {
                        title: "Deaths (as % of pop.)",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const cdeaths = yield COVIDDataBridge.getSummary('cumulative-deaths', region.locationId);
                            return COVIDHelper.formatAsPercentage(cdeaths / region.population);
                        }),
                    }
                ], includeVaccines
                    ? null
                    : { maxTwoAcross: true });
            }
            function buildMainRow(section, data) {
                me.createGrid(section, data.title, [{
                        title: "AVERAGE CASES (past 7 days)",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(yield COVIDDataBridge.getTimeSeries('cases', data.locationId), 7, (entry) => { return entry.cases; }));
                        }),
                    }, {
                        title: "DEATHS (past 28 days)",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const deaths = yield COVIDDataBridge.getTimeSeries('deaths', data.locationId);
                            const end = deaths.length - 1;
                            return (deaths[end].cumulative_deaths - deaths[end - 28].cumulative_deaths);
                        }),
                    },
                    {
                        title: "CUMULATIVE CASES AS % OF POP.",
                        responseGetter: () => __awaiter(this, void 0, void 0, function* () {
                            const ccases = yield COVIDDataBridge.getSummary('cumulative-cases', data.locationId);
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
    static getTimeSeriesAverage(timeseries, days, valueGetter) {
        const lastNDays = timeseries.slice(timeseries.length - days);
        const result = Math.round(lastNDays.reduce((previousValue, currentValue) => {
            return previousValue + valueGetter(currentValue) / days;
        }, 0));
        return result;
    }
}
window.addEventListener('load', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (new COVIDDashboardPage()).init();
}));
//# sourceMappingURL=dashboard.page.js.map