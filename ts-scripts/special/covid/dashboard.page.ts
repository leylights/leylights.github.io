/**
 * @author Cole Stanley
 * 
 * A dashboard to analyse COVID-19 data
 * 
 * Start date: December 2021
 * End date: February 2022
 */


import { cws } from "../../cws.js";
import { Button } from "../_components/button.component.js";
import { COVIDCardGrid, COVIDGridCardConfig } from "./components/card-grid.component.js";
import { COVIDSectionCollection } from "./components/section-collection.component.js";
import { COVIDSection } from "./components/section.component.js";
import { COVIDTimeSeriesChart } from "./components/time-series-chart.component.js";
import { COVIDDataBridge, COVIDRegionLevel, COVIDSummaryResponse, COVIDTimeSeriesDayResponse, COVIDTimeSeriesType } from "./model/covid-data-bridge.js";
import { COVIDHelper } from "./helper.js";
import { COVIDHealthUnit } from "./model/health-unit.js";
import { COVIDProvince } from "./model/province.js";
import { COVIDRegion } from "./model/region.js";
import { COVIDRegionsController } from "./model/regions.controller.js";
import { DarkModeService } from "../_services/dark-mode.service.js";
import { COVIDDataInterface } from "./model/covid-data-interface.js";

class COVIDDashboardPage {
  private elements: {
    lastUpdate: HTMLSpanElement;
    updateWarning: HTMLElement;
  } = {
      lastUpdate: document.getElementById('last-update'),
      updateWarning: document.getElementById('update-warning'),
    }

  private regionsController: COVIDRegionsController = new COVIDRegionsController();

  private grids: COVIDCardGrid[] = [];
  private mainSectionsCollection: COVIDSectionCollection = new COVIDSectionCollection(document.getElementById('covid-main'))
  private sections: {
    home: COVIDSection,
    canada: COVIDSection,
    ontario: COVIDSection,
    london: COVIDSection,
    waterloo: COVIDSection,
    provinceSelect: COVIDSection,
    regionSelect: COVIDSection,
  } = {
      home: new COVIDSection('Home', 'Home', [], this.mainSectionsCollection, true),
      canada: new COVIDSection('Canada', 'Canada', [], this.mainSectionsCollection, true),
      ontario: new COVIDSection('Ontario', 'Ontario', [], this.mainSectionsCollection, true),
      london: new COVIDSection('London', 'London', [], this.mainSectionsCollection, true),
      waterloo: new COVIDSection('Waterloo', 'Waterloo', [], this.mainSectionsCollection, true),
      provinceSelect: new COVIDSection('Province Select', 'Province Select', [], this.mainSectionsCollection, true),
      regionSelect: new COVIDSection('Region Select', 'Region Select', [], this.mainSectionsCollection, true),
    };

  constructor() {
    DarkModeService.addDarkModeListener({
      config: {
        notifyOnDebugToggle: true,
      },
      listener: (isDark: boolean) => {
        const lightLink = cws.getRelativeUrlPath('stylesheets/covid/covid-light.css');
        if (isDark) {
          Array.from(document.getElementsByTagName('link')).forEach((link: HTMLLinkElement) => {
            if (link.rel == 'stylesheet' && link.href.includes(lightLink.split('/').pop())) {
              link.remove();
            }
          });
        } else {
          document.head.appendChild(cws.createLinkElement(lightLink, 'stylesheet'));
        }
      }
    });
  }

  async init(this: COVIDDashboardPage): Promise<void> {
    const me = this;
    const averageDays: number = 7;

    COVIDDataBridge.preload();

    if (new Date().getHours() === 21) this.elements.updateWarning.classList.remove('hidden-warning');
    COVIDDataInterface.getLastUpdate().then((result) => {
      me.elements.lastUpdate.innerText = result;
    });

    await this.regionsController.init();

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
      async function getCaseCount(location: string, region: COVIDRegionLevel): Promise<string> {
        return await getCount('cases_daily', location, region);
      }
      async function getCount(statistic: keyof COVIDSummaryResponse, location: string, region: COVIDRegionLevel): Promise<string> {
        const count = await COVIDDataBridge.getSummary(statistic, location, region) as number;
        return cws.numberToPrettyNumber(count);
      }

      // Daily case counts
      me.createGrid(
        me.sections.home,
        'Daily new cases',
        [{
          title: "CANADA",
          responseGetter: async () => getCaseCount('can', COVIDRegionLevel.national),
        }, {
          title: "ONTARIO",
          responseGetter: async () => getCaseCount('ON', COVIDRegionLevel.provincial),
        }, {
          title: "MIDDLESEX-LONDON",
          responseGetter: async () => getCaseCount('3544', COVIDRegionLevel.regional),
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

    function buildMacroRegionalDashboard(section: COVIDSection | HTMLElement, province: COVIDProvince, level: COVIDRegionLevel) {
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
      me.createGrid(
        section,
        'Vaccination',
        [{
          title: "Vaccine doses administered",
          responseGetter: async () => {
            const doses = await COVIDDataBridge.getSummary('vaccine_administration_total_doses', province.locationId, level) as number;
            return cws.numberToPrettyNumber(doses);
          },
        }, {
          title: "Double-vaccinations completed",
          responseGetter: async () => {
            const doses = await COVIDDataBridge.getSummary('vaccine_administration_dose_2', province.locationId, level) as number;
            return cws.numberToPrettyNumber(doses);
          },
        }, {
          title: "Population double vaccinated",
          responseGetter: async () => {
            const coverage = await COVIDDataBridge.getSummary('vaccine_coverage_dose_2', province.locationId, level) as number;
            return COVIDHelper.formatAsPercentage(coverage / 100);
          },
        }, {
          title: "Population triple vaccinated",
          responseGetter: async () => {
            const coverage = await COVIDDataBridge.getSummary('vaccine_coverage_dose_3', province.locationId, level) as number;
            return COVIDHelper.formatAsPercentage(coverage / 100);
          },
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
        }
      }).sort((a, b) => { return a.name < b.name ? -1 : 1 }).forEach((unit) => {
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
        Array.from(body.children).forEach((child) => { child.remove() });

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
        }
      }).sort((a, b) => { return a.name < b.name ? -1 : 1 }).forEach((unit) => {
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
        Array.from(body.children).forEach((child) => { child.remove() });

        buildMacroRegionalDashboard(body, me.regionsController.getProvinceByCode(selector.value), COVIDRegionLevel.provincial);
      }, 'Load', true);

      me.sections.provinceSelect.appendToBody(body);
      me.sections.provinceSelect.appendToBody(cws.createElement({ type: 'br' }));
    }

    function buildRegionalDashboard(section: COVIDSection | HTMLElement, region: COVIDHealthUnit) {
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

    function buildComparisonToProvince(section: COVIDSection | HTMLElement, region: COVIDHealthUnit) {
      return buildComparisonToRegion(section, region, COVIDRegionLevel.regional, me.regionsController.getProvinceByCode(region.provinceCode), COVIDRegionLevel.provincial);
    }

    function buildComparisonToCanada(section: COVIDSection | HTMLElement, region: COVIDRegion, level: COVIDRegionLevel) {
      return buildComparisonToRegion(section, region, level, me.regionsController.canada, COVIDRegionLevel.national);
    }

    function buildComparisonToRegion(section: COVIDSection | HTMLElement, region: COVIDRegion, level: COVIDRegionLevel, comparator: COVIDRegion, comparatorLevel: COVIDRegionLevel) {
      /**
       * Returns the multiplier of the local proportion of the value and the provincial proportion by population 
       * such that local * (getProportionalDifference(...) + 1) = provincial
       */
      function getProportionalDifference(local: number, provincial: number): string {
        const provProportion: number = provincial / comparator.population,
          localProportion: number = local / region.population;

        const result: number = localProportion / provProportion - 1;

        if (provProportion === 0)
          return COVIDHelper.formatAsPercentage(0);
        else if (result < 0)
          return COVIDHelper.formatAsPercentage(result);
        else
          return '+' + COVIDHelper.formatAsPercentage(result);
      }

      async function compareDailyStat(stat: 'cases' | 'deaths') {
        const regionalCases = await COVIDDataBridge.getSummary(stat, region.locationId, level);
        const provincialCases = await COVIDDataBridge.getSummary(stat, comparator.locationId, comparatorLevel);
        return getProportionalDifference(regionalCases, provincialCases);
      }

      me.createGrid(
        section,
        `How ${region.shortName} compares to ${comparator.shortName} per capita`,
        [{
          title: "New cases",
          responseGetter: async () => compareDailyStat('cases'),
          isSuccess: (response: string | number) => { return parseFloat(response as string) < 0; },
          isFailure: (response: string | number) => { return parseFloat(response as string) > 0; },
          isNeutral: (response: string | number) => { return parseFloat(response as string) === 0; },
        }, {
          title: "New deaths",
          responseGetter: async () => compareDailyStat('deaths'),
          isSuccess: (response: string | number) => { return parseFloat(response as string) < 0; },
          isFailure: (response: string | number) => { return parseFloat(response as string) > 0; },
          isNeutral: (response: string | number) => { return parseFloat(response as string) === 0; },
        }, {
          title: `Average daily new cases (${averageDays} days)`,
          responseGetter: async () => {
            const regionalCases = await COVIDDataBridge.getTimeSeries('cases', region.locationId, level);
            const provincialCases = await COVIDDataBridge.getTimeSeries('cases', comparator.locationId, comparatorLevel);

            return getProportionalDifference(
              COVIDDashboardPage.getTimeSeriesAverage(regionalCases, averageDays, true),
              COVIDDashboardPage.getTimeSeriesAverage(provincialCases, averageDays, true)
            );
          },
          isSuccess: (response: string | number) => { return parseFloat(response as string) < 0; },
          isFailure: (response: string | number) => { return parseFloat(response as string) > 0; },
          isNeutral: (response: string | number) => { return parseFloat(response as string) === 0; },
        }, {
          title: `Average daily deaths (${averageDays} days)`,
          responseGetter: async () => {
            const regionalDeaths = await COVIDDataBridge.getTimeSeries('deaths', region.locationId, level);
            const provincialDeaths = await COVIDDataBridge.getTimeSeries('deaths', comparator.locationId, comparatorLevel);
            return getProportionalDifference(
              COVIDDashboardPage.getTimeSeriesAverage(regionalDeaths, averageDays, true),
              COVIDDashboardPage.getTimeSeriesAverage(provincialDeaths, averageDays, true)
            )
          },
          isSuccess: (response: string | number) => { return parseFloat(response as string) < 0; },
          isFailure: (response: string | number) => { return parseFloat(response as string) > 0; },
          isNeutral: (response: string | number) => { return parseFloat(response as string) === 0; },
        }],
        {
          maxTwoAcross: true,
        });
    }

    function buildTimeSeriesAnalysis(section: COVIDSection | HTMLElement, region: COVIDRegion, level: COVIDRegionLevel) {
      const CASES_START: Date = new Date('2020-01-25'),
        DEATHS_START: Date = new Date('2020-03-08'),
        TODAY: Date = new Date(Date.now() - Date.now() % (24 * 60 * 60 * 1000)),
        caseDays = cws.daysBetween(CASES_START, TODAY),
        deathsDays = cws.daysBetween(DEATHS_START, TODAY);

      const title = cws.createElement({ type: 'h2', innerText: 'Time-series analysis' });
      appendToSection(title);

      const appendableBody: HTMLElement = section instanceof COVIDSection ? section.appendableBody : section,
        typeSelector: COVIDSectionCollection = new COVIDSectionCollection(appendableBody, { setHeightToMax: true }),
        wavgSection = new COVIDSection(null, `Average (${averageDays} days)`, [], typeSelector),
        wavgCollection = new COVIDSectionCollection(wavgSection.appendableBody, { setHeightToMax: true }),
        rawSection = new COVIDSection(null, 'Raw', [], typeSelector),
        rawCollection = new COVIDSectionCollection(rawSection.appendableBody, { setHeightToMax: true });

      buildCharts(rawCollection, 0);
      buildCharts(wavgCollection, averageDays);

      typeSelector.selectFirstSection();

      function appendToSection(el: HTMLElement) {
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

      function buildCharts(collection: COVIDSectionCollection, baseAverageDays: number) {
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

        function createChart(data: {
          days: number,
          title: string,
          shortTitle: string,
          type: COVIDTimeSeriesType,
          notDaily?: boolean,
          averageDays?: number,
          valueReformatter?: (n: number) => number,
        }) {
          const avgDays: number = data.averageDays && baseAverageDays !== 1 ? data.averageDays : baseAverageDays;
          new COVIDTimeSeriesChart(collection, {
            days: data.days - avgDays,
            title: data.title,
            shortTitle: data.shortTitle,
            timeSeries: {
              type: data.type,
              location: region.locationId,
              level: level,
              useDailyValues: data.notDaily === false ? false : true,
              valueReformatter: (n: number) => { return Math.max(n, 0); },
            },
            averageDays: avgDays,
          }, () => { resetHeights(); });
        }

        collection.selectFirstSection();
      }
    }

    function buildMainLondonRow(section: COVIDSection) {
      buildMainRow(section, {
        title: 'Middlesex-London',
        locationId: '3544',
        population: me.regionsController.london.population,
        level: COVIDRegionLevel.regional
      });
    }

    function buildMainOntarioRow(section: COVIDSection) {
      buildMainRow(section, {
        title: 'Ontario',
        locationId: 'ON',
        population: me.regionsController.ontario.population,
        level: COVIDRegionLevel.provincial
      });
    }

    function buildMainCanadaRow(section: COVIDSection) {
      buildMainRow(section, {
        title: 'Canada',
        locationId: 'can',
        population: me.regionsController.canada.population,
        level: COVIDRegionLevel.national
      });
    }

    function buildDailyTotalsRow(section: COVIDSection | HTMLElement, region: COVIDRegion, level: COVIDRegionLevel) {
      me.createGrid(
        section,
        'Daily totals',
        [{
          title: "New cases",
          responseGetter: async () => COVIDDataBridge.getSummary('cases_daily', region.locationId, level),
        }, level === COVIDRegionLevel.regional ? null : {
          title: "Hopsitalizations",
          responseGetter: async () => COVIDDataBridge.getSummary('hospitalizations_daily', region.locationId, level),
        }, {
          title: "Deaths",
          responseGetter: async () => COVIDDataBridge.getSummary('deaths_daily', region.locationId, level),
        }]);
    }

    function buildWavgDailyTotalsRow(section: COVIDSection | HTMLElement, region: COVIDRegion, level: COVIDRegionLevel) {
      me.createGrid(
        section,
        `Average daily total (past ${averageDays} days)`,
        [{
          title: "New cases",
          responseGetter: async () => {
            const cases = await COVIDDataBridge.getTimeSeries('cases', region.locationId, level);
            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(cases, averageDays, true));
          },
        }, level === COVIDRegionLevel.regional ? null : {
          title: "Hospitalizations",
          responseGetter: async () => {
            const cases = await COVIDDataBridge.getTimeSeries('hospitalizations', region.locationId, level);
            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(cases, averageDays, true));
          },
        }, {
          title: "Deaths",
          responseGetter: async () => {
            const deaths = await COVIDDataBridge.getTimeSeries('deaths', region.locationId, level);
            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(deaths, averageDays, true));
          },
        }]);
    }

    function buildCumulativeRow(section: COVIDSection | HTMLElement, region: COVIDRegion, level: COVIDRegionLevel) {
      me.createGrid(
        section,
        'Cumulative totals',
        [
          {
            title: "Cases",
            responseGetter: async () => {
              return cws.numberToPrettyNumber(await COVIDDataBridge.getSummary('cases', region.locationId, level));
            },
          }, level === COVIDRegionLevel.regional ? null : {
            title: "Hospitalizations",
            responseGetter: async () => {
              return cws.numberToPrettyNumber(await COVIDDataBridge.getSummary('hospitalizations', region.locationId, level));
            },
          }, {
            title: "Deaths",
            responseGetter: async () => {
              return cws.numberToPrettyNumber(await COVIDDataBridge.getSummary('deaths', region.locationId, level));
            },
          }].concat(!region.population ? [] : [{
            title: "Cases (as % of pop.)",
            responseGetter: async () => {
              const ccases = await COVIDDataBridge.getSummary('cases', region.locationId, level);
              return COVIDHelper.formatAsPercentage(ccases / region.population);
            },
          }, level === COVIDRegionLevel.regional ? null : {
            title: "Current Hospitalizations (as % of pop.)",
            responseGetter: async () => {
              const value = await COVIDDataBridge.getSummary('hospitalizations', region.locationId, level);
              return COVIDHelper.formatAsPercentage(value / region.population);
            },
          }, {
            title: "Deaths (as % of pop.)",
            responseGetter: async () => {
              const cdeaths = await COVIDDataBridge.getSummary('deaths', region.locationId, level);
              return COVIDHelper.formatAsPercentage(cdeaths / region.population);
            },
          }
          ]
          )
      );
    }

    function buildMainRow(section: COVIDSection, data: {
      title: string,
      locationId: string,
      level: COVIDRegionLevel,
      population: number,
    }) {
      me.createGrid(
        section,
        data.title,
        [{
          title: "AVERAGE CASES (past 7 days)",
          responseGetter: async () => {
            return cws.numberToPrettyNumber(
              COVIDDashboardPage.getTimeSeriesAverage(
                await COVIDDataBridge.getTimeSeries('cases', data.locationId, data.level), 7, true));
          },
        }, {
          title: "DEATHS (past 28 days)",
          responseGetter: async () => {
            const deaths = await COVIDDataBridge.getTimeSeries('deaths', data.locationId, data.level);
            const end: number = deaths.length - 1;
            return (deaths[end].value - deaths[end - 28].value);
          },
        },
        !data.population ? null : {
          title: "CUMULATIVE CASES AS % OF POP.",
          responseGetter: async () => {
            const ccases = await COVIDDataBridge.getSummary('cases', data.locationId, data.level) as number;
            return cws.roundToDecimalPlaces(100 * ccases / data.population, 2) + '% ';
          },
        }
        ]);
    }
  }

  /**
   * Creates a new card grid. 
   * 
   * If values.noRequest === true, the url will be printed as the final value  
   */
  private async createGrid(
    section: COVIDSection | HTMLElement,
    title: string,
    values: COVIDGridCardConfig[],
    config?: {
      maxTwoAcross: boolean;
    }
  ) {
    this.grids.push(new COVIDCardGrid(
      title,
      values.filter((a) => { return !!a }),
      section,
      config));
  }

  private static getTimeSeriesAverage(timeseries: any[], days: number, is_daily: boolean): number {
    const lastNDays: any[] = timeseries.slice(timeseries.length - days);
    const result = Math.round(lastNDays.reduce((previousValue: number, day: COVIDTimeSeriesDayResponse) => {
      return previousValue + day[is_daily ? 'value_daily' : 'value'] / days;
    }, 0));

    return result;
  }
}

window.addEventListener('load', async () => {
  await (new COVIDDashboardPage()).init();
});
