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
import { COVIDDataBridge, COVIDSummaryType } from "./model/covid-data-bridge.js";
import { COVIDHelper } from "./helper.js";
import { COVIDHealthUnit } from "./model/health-unit.js";
import { COVIDProvince } from "./model/province.js";
import { COVIDRegion } from "./model/region.js";
import { COVIDRegionsController } from "./model/regions.controller.js";
import { DarkModeService } from "../_services/dark-mode.service.js";

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

    if (new Date().getHours() === 21) this.elements.updateWarning.classList.remove('hidden-warning');
    this.elements.lastUpdate.innerText = (await COVIDDataBridge.getLastUpdate()).OPENCOVID.version;

    await this.regionsController.init();

    buildHomeDashboard();
    buildCanadaDashboard();
    buildOntarioDashboard();
    buildLondonDashboard();
    buildWaterlooDashboard();
    buildProvinceSelectorDashboard();
    buildRegionalSelectorDashboard();

    this.sections.home.select();

    function buildHomeDashboard() {
      async function getCaseCount(location: string): Promise<string> {
        return await getCount('cases', location);
      }
      async function getCount(statistic: COVIDSummaryType, location: string): Promise<string> {
        const count = await COVIDDataBridge.getSummary(statistic, location);
        return cws.numberToPrettyNumber(count);
      }

      // Daily case counts
      me.createGrid(
        me.sections.home,
        'Daily new cases',
        [{
          title: "CANADA",
          responseGetter: async () => getCaseCount('canada'),
        }, {
          title: "ONTARIO",
          responseGetter: async () => getCaseCount('ON'),
        }, {
          title: "MIDDLESEX-LONDON",
          responseGetter: async () => getCaseCount('3544'),
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

    function buildProvincialDashboard(section: COVIDSection | HTMLElement, province: COVIDProvince, compareToCanada: boolean) {
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
      me.createGrid(
        section,
        'Vaccination',
        [{
          title: "Vaccine doses administered",
          responseGetter: async () => {
            const doses = await COVIDDataBridge.getSummary('vaccine-doses', province.locationId);
            return cws.numberToPrettyNumber(doses);
          },
        }, {
          title: "Double-vaccinations completed",
          responseGetter: async () => {
            const vaccinated = await COVIDDataBridge.getSummary('vaccine-completions', province.locationId);
            return cws.numberToPrettyNumber(vaccinated);
          },
        }, {
          title: "Population fully vaccinated",
          responseGetter: async () => {
            const vaccinated = await COVIDDataBridge.getSummary('vaccine-completions', province.locationId);
            return COVIDHelper.formatAsPercentage(vaccinated / province.population);
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
          name: r.province + ': ' + r.name,
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

        buildProvincialDashboard(body, me.regionsController.getProvinceByCode(selector.value), true);
      }, 'Load', true);

      me.sections.provinceSelect.appendToBody(body);
      me.sections.provinceSelect.appendToBody(cws.createElement({ type: 'br' }));
    }

    function buildRegionalDashboard(section: COVIDSection | HTMLElement, region: COVIDHealthUnit) {
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

    function buildComparisonToProvince(section: COVIDSection | HTMLElement, region: COVIDHealthUnit) {
      return buildComparisonToRegion(section, region, me.regionsController.getProvinceByCode(region.provinceCode));
    }

    function buildComparisonToCanada(section: COVIDSection | HTMLElement, region: COVIDRegion) {
      return buildComparisonToRegion(section, region, me.regionsController.canada);
    }

    function buildComparisonToRegion(section: COVIDSection | HTMLElement, region: COVIDRegion, comparator: COVIDRegion) {
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
        const regionalCases = await COVIDDataBridge.getSummary(stat, region.locationId);
        const provincialCases = await COVIDDataBridge.getSummary(stat, comparator.locationId);
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
            const regionalCases = await COVIDDataBridge.getTimeSeries('cases', region.locationId);
            const provincialCases = await COVIDDataBridge.getTimeSeries('cases', comparator.locationId);
            return getProportionalDifference(
              COVIDDashboardPage.getTimeSeriesAverage(regionalCases, averageDays, (entry) => { return entry.cases }),
              COVIDDashboardPage.getTimeSeriesAverage(provincialCases, averageDays, (entry) => { return entry.cases })
            );
          },
          isSuccess: (response: string | number) => { return parseFloat(response as string) < 0; },
          isFailure: (response: string | number) => { return parseFloat(response as string) > 0; },
          isNeutral: (response: string | number) => { return parseFloat(response as string) === 0; },
        }, {
          title: `Average daily deaths (${averageDays} days)`,
          responseGetter: async () => {
            const regionalDeaths = await COVIDDataBridge.getTimeSeries('deaths', region.locationId);
            const provincialDeaths = await COVIDDataBridge.getTimeSeries('deaths', comparator.locationId);
            return getProportionalDifference(
              COVIDDashboardPage.getTimeSeriesAverage(regionalDeaths, averageDays, (entry) => { return entry.deaths }),
              COVIDDashboardPage.getTimeSeriesAverage(provincialDeaths, averageDays, (entry) => { return entry.deaths })
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

    function buildTimeSeriesAnalysis(section: COVIDSection | HTMLElement, region: COVIDRegion, includeActiveCases: boolean) {
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

      function buildCharts(collection: COVIDSectionCollection, averageDays: number) {
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

    function buildMainLondonRow(section: COVIDSection) {
      buildMainRow(section, {
        title: 'Middlesex-London',
        locationId: '3544',
        population: me.regionsController.london.population
      });
    }

    function buildMainOntarioRow(section: COVIDSection) {
      buildMainRow(section, {
        title: 'Ontario',
        locationId: 'ON',
        population: me.regionsController.ontario.population
      });
    }

    function buildMainCanadaRow(section: COVIDSection) {
      buildMainRow(section, {
        title: 'Canada',
        locationId: 'canada',
        population: me.regionsController.canada.population
      });
    }

    function buildDailyTotalsRow(section: COVIDSection | HTMLElement, region: COVIDRegion, includeVaccines: boolean) {
      me.createGrid(
        section,
        'Daily totals',
        [{
          title: "New cases",
          responseGetter: async () => COVIDDataBridge.getSummary('cases', region.locationId),
        }, {
          title: "Deaths",
          responseGetter: async () => COVIDDataBridge.getSummary('deaths', region.locationId),
        }, includeVaccines ? {
          title: "Vaccines administered",
          responseGetter: async () => cws.numberToPrettyNumber(await COVIDDataBridge.getSummary('vaccine-doses', region.locationId)),
        } : null]);
    }

    function buildWavgDailyTotalsRow(section: COVIDSection | HTMLElement, region: COVIDRegion, includeVaccines: boolean) {
      me.createGrid(
        section,
        `Average daily total (past ${averageDays} days)`,
        [{
          title: "New cases",
          responseGetter: async () => {
            const cases = await COVIDDataBridge.getTimeSeries('cases', region.locationId);
            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(cases, averageDays, (entry) => { return entry.cases }));
          },
        }, {
          title: "Deaths",
          responseGetter: async () => {
            const deaths = await COVIDDataBridge.getTimeSeries('deaths', region.locationId);
            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(deaths, averageDays, (entry) => { return entry.deaths }));
          },
        }, includeVaccines ? {
          title: "Vaccines administered",
          responseGetter: async () => {
            const vaccines = await COVIDDataBridge.getTimeSeries('vaccine-doses', region.locationId);
            return cws.numberToPrettyNumber(COVIDDashboardPage.getTimeSeriesAverage(vaccines, averageDays, (entry) => { return entry.avaccine }));
          },
        } : null]);

    }

    function buildCumulativeRow(section: COVIDSection | HTMLElement, region: COVIDRegion, includeVaccines: boolean) {
      me.createGrid(
        section,
        'Cumulative totals',
        [
          {
            title: "Cases",
            responseGetter: async () => {
              return cws.numberToPrettyNumber(await COVIDDataBridge.getSummary('cases', region.locationId));
            },
          }, {
            title: "Deaths",
            responseGetter: async () => {
              return cws.numberToPrettyNumber(await COVIDDataBridge.getSummary('deaths', region.locationId));
            },
          }, includeVaccines ? {
            title: "Vaccines administered",
            responseGetter: async () => {
              return cws.numberToPrettyNumber(await COVIDDataBridge.getSummary('vaccine-doses', region.locationId));
            },
          } : null, {
            title: "Cases (as % of pop.)",
            responseGetter: async () => {
              const ccases = await COVIDDataBridge.getSummary('cumulative-cases', region.locationId);
              return COVIDHelper.formatAsPercentage(ccases / region.population);
            },
          }, {
            title: "Deaths (as % of pop.)",
            responseGetter: async () => {
              const cdeaths = await COVIDDataBridge.getSummary('cumulative-deaths', region.locationId);
              return COVIDHelper.formatAsPercentage(cdeaths / region.population);
            },
          }
        ],
        includeVaccines
          ? null
          : { maxTwoAcross: true });
    }

    function buildMainRow(section: COVIDSection, data: {
      title: string,
      locationId: string,
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
                await COVIDDataBridge.getTimeSeries('cases', data.locationId), 7, (entry) => { return entry.cases }));
          },
        }, {
          title: "DEATHS (past 28 days)",
          responseGetter: async () => {
            const deaths = await COVIDDataBridge.getTimeSeries('deaths', data.locationId);
            const end: number = deaths.length - 1;
            return (deaths[end].cumulative_deaths - deaths[end - 28].cumulative_deaths);
          },
        },
        {
          title: "CUMULATIVE CASES AS % OF POP.",
          responseGetter: async () => {
            const ccases = await COVIDDataBridge.getSummary('cumulative-cases', data.locationId);
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

  private static getTimeSeriesAverage(timeseries: any[], days: number, valueGetter: (dateEntry: any) => number): number {
    const lastNDays: any[] = timeseries.slice(timeseries.length - days);
    const result = Math.round(lastNDays.reduce((previousValue: number, currentValue) => {
      return previousValue + valueGetter(currentValue) / days;
    }, 0));
    return result;
  }
}

window.addEventListener('load', async () => {
  await (new COVIDDashboardPage()).init();
});
