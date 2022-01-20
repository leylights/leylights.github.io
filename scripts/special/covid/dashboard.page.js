/**
 * @author Cole Stanley
 *
 * A dashboard to analyse COVID-19 data
 *
 * Start date: December 2021
 * End date: January 2022
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
import { PageBuilder } from "../../build-page.js";
import { cws } from "../../cws.js";
import { Button } from "../components/button.component.js";
import { LineChartComponent } from "../components/line-chart.component.js";
import { COVIDCardGrid } from "./components/card-grid.component.js";
import { COVIDSectionCollection } from "./components/section-collection.component.js";
import { COVIDSection } from "./components/section.component.js";
import { COVIDDataBridge } from "./data-bridge.js";
import { COVIDHelper } from "./helper.js";
import { COVIDRegionsController } from "./model/regions.controller.js";
// Data from: https://opencovid.ca/api/
class COVIDDashboardPage {
    constructor() {
        this.elements = {
            lastUpdate: document.getElementById('last-update'),
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
            this.elements.lastUpdate.innerText = (yield COVIDDataBridge.get('version')).version;
            yield this.regionsController.init();
            buildHomeDashboard();
            buildCanadaDashboard();
            buildOntarioDashboard();
            buildLondonDashboard();
            buildProvinceSelectorDashboard();
            buildRegionalSelectorDashboard();
            this.sections.home.select();
            function buildHomeDashboard() {
                // Daily case counts
                me.createGrid(me.sections.home, 'Daily new cases', [{
                        title: "CANADA",
                        url: '',
                        responseGetter: (response) => { return cws.numberToPrettyNumber(response.summary[0].cases); },
                    }, {
                        title: "ONTARIO",
                        url: 'summary?loc=ON',
                        responseGetter: (response) => { return cws.numberToPrettyNumber(response.summary[0].cases); },
                    }, {
                        title: "MIDDLESEX-LONDON",
                        url: 'summary?loc=3544',
                        responseGetter: (response) => { return cws.numberToPrettyNumber(response.summary[0].cases); },
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
                        url: `/summary?loc=${province.locationId}`,
                        responseGetter: (response) => {
                            return cws.numberToPrettyNumber(response.summary[0].cumulative_avaccine);
                        },
                    }, {
                        title: "Double-vaccinations completed",
                        url: `/summary?loc=${province.locationId}`,
                        responseGetter: (response) => {
                            return cws.numberToPrettyNumber(response.summary[0].cumulative_cvaccine);
                        },
                    }, {
                        title: "Population fully vaccinated",
                        url: `/summary?loc=${province.locationId}`,
                        responseGetter: (response) => {
                            return COVIDHelper.formatAsPercentage(response.summary[0].cumulative_cvaccine / province.population);
                        },
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
                me.createGrid(section, `How ${region.shortName} compares to ${comparator.shortName} per capita`, [{
                        title: "New cases",
                        url: `/summary?loc=${region.locationId}`,
                        responseGetter: (response) => __awaiter(this, void 0, void 0, function* () {
                            const provincialResponse = yield COVIDDataBridge.get(`/summary?loc=${comparator.locationId}`);
                            return getProportionalDifference(response.summary[0].cases, provincialResponse.summary[0].cases);
                        }),
                        isSuccess: (response) => { return parseFloat(response) < 0; },
                        isFailure: (response) => { return parseFloat(response) > 0; },
                        isNeutral: (response) => { return parseFloat(response) === 0; },
                    }, {
                        title: "New deaths",
                        url: `/summary?loc=${region.locationId}`,
                        responseGetter: (response) => __awaiter(this, void 0, void 0, function* () {
                            const provincialResponse = yield COVIDDataBridge.get(`/summary?loc=${comparator.locationId}`);
                            return getProportionalDifference(response.summary[0].deaths, provincialResponse.summary[0].deaths);
                        }),
                        isSuccess: (response) => { return parseFloat(response) < 0; },
                        isFailure: (response) => { return parseFloat(response) > 0; },
                        isNeutral: (response) => { return parseFloat(response) === 0; },
                    }, {
                        title: `Average daily new cases (${averageDays} days)`,
                        url: `/timeseries?loc=${region.locationId}&stat=cases`,
                        responseGetter: (response) => __awaiter(this, void 0, void 0, function* () {
                            const provincialResponse = yield COVIDDataBridge.get(`/timeseries?loc=${comparator.locationId}&stat=cases`);
                            return getProportionalDifference(COVIDDashboardPage.getTimeSeriesAverage(response, averageDays, 'cases', (entry) => { return entry.cases; }), COVIDDashboardPage.getTimeSeriesAverage(provincialResponse, averageDays, 'cases', (entry) => { return entry.cases; }));
                        }),
                        isSuccess: (response) => { return parseFloat(response) < 0; },
                        isFailure: (response) => { return parseFloat(response) > 0; },
                        isNeutral: (response) => { return parseFloat(response) === 0; },
                    }, {
                        title: `Average daily deaths (${averageDays} days)`,
                        url: `/timeseries?loc=${region.locationId}&stat=mortality`,
                        responseGetter: (response) => __awaiter(this, void 0, void 0, function* () {
                            const provincialResponse = yield COVIDDataBridge.get(`/timeseries?loc=${comparator.locationId}&stat=mortality`);
                            return getProportionalDifference(COVIDDashboardPage.getTimeSeriesAverage(response, averageDays, 'mortality', (entry) => { return entry.deaths; }), COVIDDashboardPage.getTimeSeriesAverage(provincialResponse, averageDays, 'mortality', (entry) => { return entry.deaths; }));
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
                if (section instanceof COVIDSection)
                    section.appendToBody(title);
                else
                    section.appendChild(title);
                const appendableBody = section instanceof COVIDSection ? section.appendableBody : section, typeSelector = new COVIDSectionCollection(appendableBody, { setHeightToMax: true }), wavgSection = new COVIDSection(null, `Average (${averageDays} days)`, [], typeSelector), wavgCollection = new COVIDSectionCollection(wavgSection.appendableBody, { setHeightToMax: true }), rawSection = new COVIDSection(null, 'Raw', [], typeSelector), rawCollection = new COVIDSectionCollection(rawSection.appendableBody, { setHeightToMax: true });
                buildCharts(rawCollection, 0);
                buildCharts(wavgCollection, averageDays);
                function resetHeights() {
                    rawCollection.resetHeight();
                    wavgCollection.resetHeight();
                    typeSelector.resetHeight();
                }
                function buildCharts(collection, averageDays) {
                    buildPastNDaysChart(collection, {
                        days: caseDays - averageDays,
                        title: 'New cases per day',
                        shortTitle: 'New cases',
                        timeSeriesURI: `timeseries?loc=${region.locationId}&stat=cases&ymd=true`,
                        responseArrayName: 'cases',
                        responsePropertyName: 'cases',
                        responseTimePropertyName: 'date_report',
                        averageDays: averageDays,
                    }, () => { resetHeights(); });
                    buildPastNDaysChart(collection, {
                        days: deathsDays - averageDays,
                        title: 'Deaths per day',
                        shortTitle: 'Mortality',
                        timeSeriesURI: `timeseries?loc=${region.locationId}&stat=mortality&ymd=true`,
                        responseArrayName: 'mortality',
                        responsePropertyName: 'deaths',
                        responseTimePropertyName: 'date_death_report',
                        averageDays: averageDays,
                    }, () => { resetHeights(); });
                    if (includeActiveCases)
                        buildPastNDaysChart(collection, {
                            days: caseDays - averageDays,
                            title: 'Active cases per day',
                            shortTitle: 'Active cases',
                            timeSeriesURI: `timeseries?loc=${region.locationId}&stat=active&ymd=true`,
                            responseArrayName: 'active',
                            responsePropertyName: 'active_cases',
                            responseTimePropertyName: 'date_active',
                            averageDays: averageDays,
                        }, () => { resetHeights(); });
                    collection.selectFirstSection();
                }
                typeSelector.selectFirstSection();
            }
            function buildMainLondonRow(section) {
                buildMainRow(section, {
                    title: 'Middlesex-London',
                    averageCasesURI: 'timeseries?loc=3544&stat=cases',
                    deathsURI: 'timeseries?loc=3544&stat=mortality',
                    cumulativeCasesURI: 'summary?loc=3544',
                    population: me.regionsController.london.population
                });
            }
            function buildMainOntarioRow(section) {
                buildMainRow(section, {
                    title: 'Ontario',
                    averageCasesURI: 'timeseries?loc=ON&stat=cases',
                    deathsURI: 'timeseries?loc=ON&stat=mortality',
                    cumulativeCasesURI: 'summary?loc=ON',
                    population: me.regionsController.ontario.population
                });
            }
            function buildMainCanadaRow(section) {
                buildMainRow(section, {
                    title: 'Canada',
                    averageCasesURI: 'timeseries?loc=canada&stat=cases',
                    deathsURI: 'timeseries?loc=canada&stat=mortality',
                    cumulativeCasesURI: '',
                    population: me.regionsController.canada.population
                });
            }
            function buildDailyTotalsRow(section, region, includeVaccines) {
                me.createGrid(section, 'Daily totals', [{
                        title: "New cases",
                        url: `/summary?loc=${region.locationId}`,
                        responseGetter: (response) => {
                            return cws.numberToPrettyNumber(response.summary[0].cases);
                        },
                    }, {
                        title: "Deaths",
                        url: `/summary?loc=${region.locationId}`,
                        responseGetter: (response) => {
                            return cws.numberToPrettyNumber(response.summary[0].deaths);
                        },
                    }, includeVaccines ? {
                        title: "Vaccines administered",
                        url: `/summary?loc=${region.locationId}`,
                        responseGetter: (response) => {
                            return cws.numberToPrettyNumber(response.summary[0].avaccine);
                        },
                    } : null]);
            }
            function buildWavgDailyTotalsRow(section, region, includeVaccines) {
                me.createGrid(section, `Average daily total (past ${averageDays} days)`, [{
                        title: "New cases",
                        url: `/timeseries?loc=${region.locationId}&stat=cases`,
                        responseGetter: (response) => {
                            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(response, averageDays, 'cases', (entry) => { return entry.cases; }));
                        },
                    }, {
                        title: "Deaths",
                        url: `/timeseries?loc=${region.locationId}&stat=mortality`,
                        responseGetter: (response) => {
                            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(response, averageDays, 'mortality', (entry) => { return entry.deaths; }));
                        },
                    }, includeVaccines ? {
                        title: "Vaccines administered",
                        url: `/timeseries?loc=${region.locationId}&stat=avaccine`,
                        responseGetter: (response) => {
                            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(response, averageDays, 'avaccine', (entry) => { return entry.avaccine; }));
                        },
                    } : null]);
            }
            function buildCumulativeRow(section, region, includeVaccines) {
                me.createGrid(section, 'Cumulative totals', [
                    {
                        title: "Cases",
                        url: `/summary?loc=${region.locationId}`,
                        responseGetter: (response) => {
                            return cws.numberToPrettyNumber(response.summary[0].cumulative_cases);
                        },
                    }, {
                        title: "Deaths",
                        url: `/summary?loc=${region.locationId}`,
                        responseGetter: (response) => {
                            return cws.numberToPrettyNumber(response.summary[0].cumulative_deaths);
                        },
                    }, includeVaccines ? {
                        title: "Vaccines administered",
                        url: `/summary?loc=${region.locationId}`,
                        responseGetter: (response) => {
                            return cws.numberToPrettyNumber(response.summary[0].cumulative_avaccine);
                        },
                    } : null, {
                        title: "Cases (as % of pop.)",
                        url: `/summary?loc=${region.locationId}`,
                        responseGetter: (response) => {
                            return COVIDHelper.formatAsPercentage(response.summary[0].cumulative_cases / region.population);
                        },
                    }, {
                        title: "Deaths (as % of pop.)",
                        url: `/summary?loc=${region.locationId}`,
                        responseGetter: (response) => {
                            return COVIDHelper.formatAsPercentage(response.summary[0].cumulative_deaths / region.population);
                        },
                    }
                ], includeVaccines
                    ? null
                    : { maxTwoAcross: true });
            }
            function buildMainRow(section, data) {
                me.createGrid(section, data.title, [{
                        title: "AVERAGE CASES (past 7 days)",
                        url: data.averageCasesURI,
                        responseGetter: (response) => {
                            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(response, 7, 'cases', (entry) => { return entry.cases; }));
                        },
                    }, {
                        title: "DEATHS (past 28 days)",
                        url: data.deathsURI,
                        responseGetter: (response) => {
                            const end = response.mortality.length - 1;
                            return (response.mortality[end].cumulative_deaths - response.mortality[end - 28].cumulative_deaths);
                        },
                    },
                    {
                        title: "CUMULATIVE CASES AS % OF POP.",
                        url: data.cumulativeCasesURI,
                        responseGetter: (response) => {
                            return cws.roundToDecimalPlaces(100 * response.summary[0].cumulative_cases / data.population, 2) + '% ';
                        },
                    }]);
            }
            /**
             * @example buildPastNDaysChart(lineChartsSelector, {
                days: 28,
                title: 'New cases per day',
                shortTitle: 'Cases',
                timeSeriesURI: 'timeseries?loc=canada&stat=cases&ymd=true',
                responseArrayName: 'cases',
                responsePropertyName: 'cases',
                responseTimePropertyName: 'date_report',
              });
             * @requires timeSeriesURI gets dates in YYYY-MM-DD format (ymd=true)
             */
            function buildPastNDaysChart(sectionCollection, config, parentResizer) {
                // sanitize input
                if (!config.averageDays || config.averageDays === 0)
                    config.averageDays = 1;
                // create html
                const lineChartContainer = cws.createElement({
                    type: 'div',
                    classList: 'covid-line-chart-container'
                });
                const section = new COVIDSection(null, config.shortTitle, [lineChartContainer], sectionCollection);
                const chart = new LineChartComponent({
                    parentElement: lineChartContainer,
                    title: config.title,
                    points: []
                });
                // get data and parse
                COVIDDataBridge.get(config.timeSeriesURI)
                    .then((response) => {
                    var _a;
                    const timeSeries = response[config.responseArrayName].map((day) => {
                        return {
                            property: day[config.responsePropertyName],
                            date: day[config.responseTimePropertyName],
                        };
                    });
                    const today = new Date(timeSeries[timeSeries.length - 1].date);
                    // may be 5 hours off due to time zones; doesn't cause any issues with calculating time difference 
                    const points = timeSeries
                        .slice(timeSeries.length - ((_a = config.days) !== null && _a !== void 0 ? _a : timeSeries.length) - config.averageDays + 1)
                        // .slice(500)
                        .map((day) => {
                        var _a;
                        return {
                            x: ((_a = config.days) !== null && _a !== void 0 ? _a : timeSeries.length) - cws.daysBetween(today, new Date(day.date)),
                            y: day.property,
                            label: day.date,
                        };
                    });
                    const averagedPoints = [];
                    let currentValue = points
                        .slice(0, config.averageDays)
                        .reduce((previous, current) => {
                        return previous + (current.y / config.averageDays);
                    }, 0);
                    averagedPoints[0] = getAvgPt(currentValue, points[config.averageDays - 1]);
                    for (let i = 1; i < points.length - config.averageDays; i++) {
                        currentValue -= points[i - 1].y / config.averageDays;
                        currentValue += points[i + config.averageDays - 1].y / config.averageDays;
                        averagedPoints[i] = getAvgPt(currentValue, points[i + config.averageDays - 1]);
                    }
                    function getAvgPt(newY, oldPoint) {
                        return {
                            x: oldPoint.x,
                            y: newY,
                            label: oldPoint.label,
                        };
                    }
                    chart.points = averagedPoints;
                    parentResizer();
                });
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
    static getTimeSeriesAverage(timeseries, days, timeseriesName, valueGetter) {
        const lastNDays = timeseries[timeseriesName].slice(timeseries[timeseriesName].length - days);
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