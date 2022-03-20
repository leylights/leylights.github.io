import { cws } from "../../../cws.js";
import { InputComponent } from "../../_components/input.component.js";
import { LineChartComponent } from "../../_components/line-chart.component.js";
import { COVIDDataBridge } from "../model/covid-data-bridge.js";
import { COVIDSection } from "./section.component.js";
export class COVIDTimeSeriesChart {
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
    constructor(sectionCollection, config, parentResizer) {
        const me = this;
        me.config = config;
        me.parentResizer = parentResizer;
        // sanitize input
        if (!config.averageDays || config.averageDays === 0)
            config.averageDays = 1;
        this.averageDays = config.averageDays;
        // create html
        const lineChartContainer = cws.createElement({
            type: 'div',
            classList: 'covid-line-chart-container'
        });
        this.section = new COVIDSection(null, config.shortTitle, [lineChartContainer], sectionCollection);
        this.chart = new LineChartComponent({
            parentElement: lineChartContainer,
            title: config.title,
            points: [],
        });
        // get data and parse
        COVIDDataBridge.getTimeSeries(config.timeSeries.type, config.timeSeries.location)
            .then((response) => { me.handleResponse(response); });
    }
    buildTimeRangeInputs() {
        const me = this, start = new InputComponent({
            element: cws.createElement({
                type: 'input',
                classList: ['time-series-start-date-input', 'time-series-range-input'],
            })
        }), end = new InputComponent({
            element: cws.createElement({
                type: 'input',
                classList: ['time-series-end-date-input', 'time-series-range-input'],
            })
        }), container = cws.createElement({
            type: 'div',
            classList: 'time-series-range-selectors',
            children: [
                buildInputContainer(start, 'Start'),
                buildInputContainer(end, 'End'),
            ],
        });
        me.section.appendChild(container);
        me.inputs = {
            start: start,
            end: end,
        };
        function buildInputContainer(input, name) {
            input.placeholder = 'yyyy-mm-dd';
            return cws.createElement({
                type: 'div',
                classList: 'time-series-range-input-container',
                children: [
                    input.element,
                    cws.createElement({
                        type: 'h3',
                        innerText: name,
                        classList: 'time-series-range-input-title'
                    }),
                ],
            });
        }
    }
    handleResponse(response) {
        var _a;
        const me = this;
        me.fullTimeSeries = response.map((day) => {
            return {
                property: day[me.config.responsePropertyName],
                date: day[me.config.responseTimePropertyName],
            };
        });
        const today = new Date(me.fullTimeSeries[me.fullTimeSeries.length - 1].date);
        // may be 5 hours off due to time zones; doesn't cause any issues with calculating time difference
        //  UTC time is exact 
        const points = me.fullTimeSeries
            .slice(me.fullTimeSeries.length - ((_a = me.config.days) !== null && _a !== void 0 ? _a : me.fullTimeSeries.length) - me.averageDays + 1)
            .map((day) => {
            var _a;
            return {
                x: ((_a = me.config.days) !== null && _a !== void 0 ? _a : me.fullTimeSeries.length) - cws.daysBetween(today, new Date(day.date)),
                y: day.property,
                label: day.date,
            };
        });
        // Get averaged points
        const averagedPoints = [];
        let currentValue = points
            .slice(0, me.averageDays)
            .reduce((previous, current) => {
            return previous + (current.y / me.averageDays);
        }, 0);
        averagedPoints[0] = getAvgPt(currentValue, points[me.averageDays - 1]);
        for (let i = 1; i < points.length - me.averageDays; i++) {
            currentValue -= points[i - 1].y / me.averageDays;
            currentValue += points[i + me.averageDays - 1].y / me.averageDays;
            averagedPoints[i] = getAvgPt(currentValue, points[i + me.averageDays - 1]);
        }
        function getAvgPt(newY, oldPoint) {
            return {
                x: oldPoint.x,
                y: newY,
                label: oldPoint.label,
            };
        }
        // Rebuild html
        me.chart.points = averagedPoints;
        me.parentResizer();
        me.averagedTimeSeries = averagedPoints;
        me.buildTimeRangeInputs();
        me.inputs.start.value = me.fullTimeSeries[me.averageDays - 1].date + '';
        me.inputs.end.value = me.fullTimeSeries[me.fullTimeSeries.length - 1].date + '';
        me.inputs.start.addEventListener('input', () => {
            me.validateAndUpdateRangeInputs(new Date(me.fullTimeSeries[me.averageDays - 1].date), today);
        });
        me.inputs.end.addEventListener('input', () => {
            me.validateAndUpdateRangeInputs(new Date(me.fullTimeSeries[me.averageDays - 1].date), today);
        });
    }
    validateAndUpdateRangeInputs(timeseriesStartDate, today) {
        const me = this;
        if (!(validateDate(me.inputs.start) && validateDate(me.inputs.end)))
            return false;
        if (new Date(me.inputs.start.value.trim()).getTime() >= new Date(me.inputs.end.value.trim()).getTime())
            return false;
        // if valid, then update range
        const start = new Date(me.inputs.start.value.trim()).getTime(), end = new Date(me.inputs.end.value.trim()).getTime();
        const filteredPoints = me.averagedTimeSeries.filter((point) => {
            const day = new Date(point.label).getTime();
            return start <= day && day <= end;
        });
        this.chart.points = filteredPoints;
        function validateDate(input) {
            const date = input.value.trim();
            if (date.length < 10)
                return false;
            const splitValue = date.split('-');
            if (splitValue.length !== 3)
                return reject();
            if (splitValue[0].length !== 4)
                return reject();
            if (splitValue[1].length !== 2)
                return reject();
            if (splitValue[2].length !== 2)
                return reject();
            if (date.match(/[^0-9-]/g))
                return reject(); // bad character
            const givenDate = new Date(date);
            if (isNaN(givenDate.getTime()))
                return reject(); // not a real date
            if (givenDate.getTime() < timeseriesStartDate.getTime())
                return reject(); // before there is data for
            if (today.getTime() < givenDate.getTime())
                return reject(); // in the future
            return true;
            function reject() {
                input.reject();
                return false;
            }
        }
    }
}
//# sourceMappingURL=time-series-chart.component.js.map