import { cws } from "../../cws.js";
import { DarkModeService } from "../_services/dark-mode.service.js";
import { Canvas } from "./canvas.component.js";
const MAX_UNIQUE_X_VALUES = 24;
const MAX_UNIQUE_Y_VALUES = 12;
export class LineChartComponent {
    constructor(data) {
        var _a, _b, _c, _d, _e;
        this.colours = {
            line: null,
            gridlines: null,
            background: null,
        };
        this.yDigitRoundedTo = 2;
        this.limits = {
            x: {
                min: null,
                max: null,
            },
            y: {
                min: null,
                max: null,
            }
        };
        this.autoRoundYAxis = false;
        this.showGridlines = true;
        this.majorGridlineThickness = 3;
        this.xAxisHeight = 40;
        this.yAxisWidth = 60;
        this._isInitialized = false;
        this.axisDataGeneratorHelpers = {
            areAllValuesIntegers(values) {
                for (let i = 0; i < values.length; i++) {
                    if (!cws.isInteger(values[i]))
                        return false;
                }
                return true;
            },
            generateNewDivisions(me, min, max, divisors, labelDivisions, pointAttribute) {
                const initialMax = max;
                let space = -1;
                // find an integer spacing that creates a reasonable number of divisors
                if (me.axisDataGeneratorHelpers.areAllValuesIntegers(me._points.map(p => p[pointAttribute]))) {
                    let success = false;
                    while (!success) {
                        for (let i = 0; i < divisors.length; i++) {
                            if (cws.isInteger((max - min) / divisors[i])) {
                                space = (max - min) / divisors[i];
                                success = true;
                                break;
                            }
                        }
                        max++;
                    }
                }
                else {
                    space = (max - min) / divisors[Math.floor(divisors.length / 2)];
                }
                const values = [];
                // generate divisors
                for (let x = min; x <= initialMax; x += space) {
                    values.push(x);
                    if (space === 0)
                        break;
                }
                // round divisors
                const roundingDigit = values.length > 0 ? Math.round(values[values.length - 1]).toString().length - 3 : 0;
                const output = [];
                values.forEach((n) => {
                    n = cws.roundToNthDigit(n, roundingDigit);
                    output.push({
                        label: labelDivisions
                            ? me.axisDataGeneratorHelpers.findLabelFor(me, n, pointAttribute)
                            : cws.numberToPrettyNumber(n),
                        value: n,
                    });
                });
                return output;
            },
            findLabelFor(me, value, pointAttribute) {
                for (let i = 0; i < me._points.length; i++) {
                    if (me._points[i][pointAttribute] == value) {
                        if (me._points[i].label) {
                            return me._points[i].label;
                        }
                        else {
                            return cws.numberToPrettyNumber(value);
                        }
                    }
                }
                return value + '';
            },
            getUniqueValues(me, pointAttribute, maximumPoints) {
                const uniqueValues = [];
                let fail = false;
                me._points.forEach((point) => {
                    if (!cws.Array.contains(uniqueValues, point, (a, b) => {
                        return a[pointAttribute] === b[pointAttribute];
                    })) {
                        if (uniqueValues.length >= maximumPoints) {
                            fail = true;
                        }
                        else if (uniqueValues.length < maximumPoints)
                            uniqueValues.push(point);
                    }
                });
                return !fail ? uniqueValues : null;
            },
            generateFewXDivisions(values, limits) {
                return values.filter((value) => {
                    return limits.x.min <= value.x && value.x <= limits.x.max;
                }).map((value) => {
                    const output = {
                        label: value.label,
                        value: value.x,
                    };
                    return output;
                }).sort((a, b) => {
                    return a.value - b.value;
                });
            }
        };
        this.rebuildHelpers = {
            generateXAxis(me, limit, xAxis) {
                const xAxisData = me.generateXAxisData(limit);
                xAxis.innerHTML = '';
                xAxisData.divisions.forEach((division) => {
                    const next = cws.createElement({
                        type: 'div',
                        classList: LineChartComponent.DIVISION_CLASS_NAMES.x,
                        children: [cws.createElement({
                                type: 'span',
                                innerText: division.label
                            })],
                        style: `left: ${((division.value - xAxisData.limits.x.min) / (xAxisData.limits.x.max - xAxisData.limits.x.min)) * 100}%`
                    });
                    xAxis.appendChild(next);
                });
            }
        };
        const me = this;
        this.parentElement = data.parentElement;
        this._points = data.points.sort((a, b) => {
            return a.x - b.x;
        });
        this.title = data.title;
        this.xAxisTitle = data.xAxis;
        this.yAxisTitle = data.yAxis;
        this.colours.line = data.colour;
        this.yDigitRoundedTo = (_a = data.yDigitRoundedTo) !== null && _a !== void 0 ? _a : this.yDigitRoundedTo;
        this.showGridlines = data.showGridlines !== undefined ? data.showGridlines : this.showGridlines;
        this.canvasConfig = data;
        this.limits.x.min = ((_b = data.limits) === null || _b === void 0 ? void 0 : _b.x) ? data.limits.x.min : null;
        this.limits.x.max = ((_c = data.limits) === null || _c === void 0 ? void 0 : _c.x) ? data.limits.x.max : null;
        this.limits.y.min = ((_d = data.limits) === null || _d === void 0 ? void 0 : _d.y) ? data.limits.x.min : null;
        this.limits.y.max = ((_e = data.limits) === null || _e === void 0 ? void 0 : _e.y) ? data.limits.x.max : null;
        DarkModeService.addDarkModeListener({
            config: {
                notifyOnDebugToggle: true
            },
            listener: () => {
                me.resetColours();
                if (me.container)
                    me.redraw();
            }
        });
        this.rebuild();
        this._isInitialized = true;
    }
    get innerRect() {
        return new DOMRect(0, 0, this.canvas.width, this.canvas.height);
    }
    getPoints() {
        return this._points.map((pt) => {
            return {
                x: pt.x,
                y: pt.y,
                label: pt.label,
            };
        });
    }
    set points(pts) {
        this._points = pts.sort((a, b) => {
            return b.x - a.x;
        });
        pts.forEach((pt) => {
            if (isNaN(pt.x) || isNaN(pt.y)) {
                throw new Error(`Bad point: (${pt.x}, ${pt.y})`);
            }
        });
        this.rebuild();
    }
    get titleSizePx() {
        const measurements = this.canvas.context.measureText(this.title);
        return measurements.actualBoundingBoxAscent - measurements.actualBoundingBoxDescent;
    }
    generateXAxisData(divisionsLimit) {
        const limit = divisionsLimit !== undefined ? divisionsLimit : MAX_UNIQUE_X_VALUES;
        return this.generateGenericAxisData('x', limit, this.xAxisTitle);
    }
    generateYAxisData() {
        const me = this, result = this.generateGenericAxisData('y', MAX_UNIQUE_Y_VALUES, this.yAxisTitle);
        result.divisions = result.divisions.sort((a, b) => { return a.value - b.value; });
        result.divisions = result.divisions.map((a) => {
            if (me.autoRoundYAxis) {
                const result = {
                    label: cws.roundToNthDigit(a.value, me.yDigitRoundedTo) + '',
                    value: cws.roundToNthDigit(a.value, me.yDigitRoundedTo),
                };
                return result;
            }
            else
                return a;
        });
        return result;
    }
    generateGenericAxisData(pointAttribute, maximumPoints, axisTitle) {
        const me = this, allLimits = this.getLimits(), trueLimits = this.getTrueLimits();
        let uniqueValues;
        let shouldGenerateDivisions = false;
        if (pointAttribute == 'x' && (trueLimits.x.min > allLimits.x.min || trueLimits.x.max < allLimits.x.max)) {
            shouldGenerateDivisions = true;
        }
        if (!shouldGenerateDivisions)
            uniqueValues = me.axisDataGeneratorHelpers.getUniqueValues(me, pointAttribute, maximumPoints);
        if (!uniqueValues)
            shouldGenerateDivisions = true;
        let divisions;
        if (this._points.length == 0) {
            divisions = [];
        }
        else if (pointAttribute == 'x') {
            if (shouldGenerateDivisions)
                divisions = me.axisDataGeneratorHelpers.generateNewDivisions(me, allLimits.x.min, allLimits.x.max, [10, 11, 12, 13, 14], true, pointAttribute);
            else {
                divisions = me.axisDataGeneratorHelpers.generateFewXDivisions(uniqueValues, allLimits);
            }
        }
        else { // y axis
            divisions = me.axisDataGeneratorHelpers.generateNewDivisions(me, allLimits.y.min, allLimits.y.max, [8, 9, 10, 11, 12], false, pointAttribute);
        }
        return {
            limits: allLimits,
            title: axisTitle,
            divisions: divisions,
        };
    }
    getLimits() {
        var _a, _b, _c, _d;
        if (!this._points[0])
            throw new Error("No points");
        const output = this.getTrueLimits();
        output.x.min = (_a = this.limits.x.min) !== null && _a !== void 0 ? _a : output.x.min;
        output.x.max = (_b = this.limits.x.max) !== null && _b !== void 0 ? _b : output.x.max;
        output.y.min = (_c = this.limits.y.min) !== null && _c !== void 0 ? _c : output.y.min;
        output.y.max = (_d = this.limits.y.max) !== null && _d !== void 0 ? _d : output.y.max;
        return output;
    }
    // Returns the true limits of the dataset; not considering client-defined limits
    getTrueLimits() {
        if (!this._points[0])
            throw new Error("No points");
        const output = {
            x: {
                min: this._points[0].x,
                max: this._points[0].x,
            },
            y: {
                min: this._points[0].y,
                max: this._points[0].y
            }
        };
        this._points.forEach((point) => {
            output.x.min = Math.min(point.x, output.x.min);
            output.x.max = Math.max(point.x, output.x.max);
            output.y.min = Math.min(point.y, output.y.min);
            output.y.max = Math.max(point.y, output.y.max);
        });
        return output;
    }
    main() {
        this.redraw();
    }
    rebuild() {
        const me = this, container = cws.createElement({
            type: 'div',
            classList: 'line-chart-container',
        }), firstTime = !this.canvas;
        if (!firstTime)
            this.canvas.stop();
        // develop HTML
        const titleContainer = cws.createElement({
            type: 'div',
            classList: 'line-chart-title-container',
            children: [cws.createElement({
                    type: 'h2',
                    classList: 'line-chart-title',
                    innerText: this.title,
                })]
        }), xAxis = cws.createElement({
            type: 'div',
            classList: ['line-chart-axis', 'line-chart-x-axis'],
            style: `min-height: ${this.xAxisHeight}`,
        }), yAxis = cws.createElement({
            type: 'div',
            classList: ['line-chart-axis', 'line-chart-y-axis'],
            style: `min-width: ${this.yAxisWidth}`,
        });
        if (this._points.length > 0) {
            this.rebuildHelpers.generateXAxis(me, MAX_UNIQUE_X_VALUES, xAxis);
            const yAxisData = this.generateYAxisData();
            yAxisData.divisions.forEach((division) => {
                const next = cws.createElement({
                    type: 'div',
                    classList: LineChartComponent.DIVISION_CLASS_NAMES.y,
                    children: [cws.createElement({
                            type: 'span',
                            innerText: division.label
                        })],
                    style: `bottom: ${((division.value - yAxisData.limits.y.min) / (yAxisData.limits.y.max - yAxisData.limits.y.min)) * 100}%`
                });
                yAxis.appendChild(next);
            });
        }
        container.appendChild(titleContainer);
        container.appendChild(xAxis);
        container.appendChild(yAxis);
        if (firstTime) {
            this.parentElement.appendChild(container);
        }
        else {
            this.container.replaceWith(container);
        }
        this.container = container;
        this.canvasConfig.parentElement = this.container;
        this.canvasConfig.clearColour = 'fromCSS';
        this.canvas = new Canvas(this.canvasConfig);
        // remove overlapping y axis dividers
        Array.from(yAxis.querySelectorAll(`.${LineChartComponent.DIVISION_CLASS_NAMES.y}`)).forEach((a) => {
            Array.from(yAxis.querySelectorAll(`.${LineChartComponent.DIVISION_CLASS_NAMES.y}`)).forEach((b) => {
                if (!a.isEqualNode(b) && cws.rectanglesCollide(a.getBoundingClientRect(), b.getBoundingClientRect()))
                    b.remove();
            });
        });
        // set y axis width
        let maxYAxisLabelWidth = -1;
        Array.from(yAxis.querySelectorAll(`.${LineChartComponent.DIVISION_CLASS_NAMES.y}`)).forEach((divider) => {
            maxYAxisLabelWidth = Math.max(maxYAxisLabelWidth, divider.getBoundingClientRect().width);
        });
        yAxis.style.width = Math.max(maxYAxisLabelWidth + 5, this.yAxisWidth) + 'px';
        // rebuild x axis until values fit
        attemptRotateXAxis();
        // set x axis height
        let maxXAxisLabelHeight = -1;
        Array.from(xAxis.querySelectorAll(`.${LineChartComponent.DIVISION_CLASS_NAMES.x}`)).forEach((divider) => {
            maxXAxisLabelHeight = Math.max(maxXAxisLabelHeight, divider.getBoundingClientRect().height);
        });
        xAxis.style.height = Math.max(maxXAxisLabelHeight + 5, this.xAxisHeight) + 'px';
        this.canvas.drawOnce(() => { me.main(); });
        // Rotates x axis labels when necessary
        function attemptRotateXAxis() {
            let lastDivision = null;
            let needsRotation = false;
            // Determine if the rotation is necessary
            const results = Array.from(xAxis.querySelectorAll(`.${LineChartComponent.DIVISION_CLASS_NAMES.x}`)).sort((a, b) => {
                return a.getBoundingClientRect().x - b.getBoundingClientRect().x;
            });
            for (let i = 0; i < results.length; i++) {
                if (results[i].getBoundingClientRect().x === 0)
                    break;
                if (!lastDivision)
                    lastDivision = results[i];
                else if (lastDivision.getBoundingClientRect().right > results[i].getBoundingClientRect().x) {
                    needsRotation = true;
                    break;
                }
                else
                    lastDivision = results[i];
            }
            if (results.length > 0 && results[results.length - 1].getBoundingClientRect().right > me.container.getBoundingClientRect().right)
                needsRotation = true;
            // If rotation is necessary, rotate using css
            if (needsRotation) {
                results.forEach((divider) => {
                    divider.style.writingMode = 'vertical-rl';
                });
            }
            else
                results.forEach((divider) => {
                    divider.style.writingMode = '';
                });
            return needsRotation;
        }
    }
    redraw() {
        const me = this, area = this.innerRect;
        this.resetColours();
        this.canvas.clearColour = this.colours.background;
        this.canvas.clear();
        if (this._points.length > 0) {
            const limits = this.getLimits();
            if (this.showGridlines)
                drawGridlines();
            for (let i = 1; i < this._points.length; i++) {
                const start = convertPoint(this._points[i - 1], limits), end = convertPoint(this._points[i], limits);
                this.canvas.drawLine(start.x, start.y, end.x, end.y, this.colours.line, 2);
            }
        }
        function convertPoint(pt, limits) {
            const output = {
                x: limits.x.max - limits.x.min != 0 ? area.x + (pt.x - limits.x.min) * (area.width / (limits.x.max - limits.x.min)) : area.x + area.width / 2,
                y: limits.y.max - limits.y.min != 0 ? area.bottom - ((pt.y - limits.y.min) * (area.height / (limits.y.max - limits.y.min))) : area.top + area.height / 2,
                label: pt.label,
            };
            return output;
        }
        function drawGridlines() {
            const xData = me.generateXAxisData(), yData = me.generateYAxisData();
            let currentX = 0;
            for (let i = 1; i < xData.divisions.length; i++) {
                const x = me.canvas.width * ((xData.divisions[i].value - xData.limits.x.min) / (xData.limits.x.max - xData.limits.x.min));
                const thickness = xData.divisions[i].label === '0' ? me.majorGridlineThickness : 1;
                if (x < 0)
                    continue;
                if (currentX > x || x === me.canvas.width)
                    break; // prevent x from going backwards
                currentX = x;
                me.canvas.drawLine(x, 0, x, me.canvas.height, me.colours.gridlines, thickness);
            }
            let currentY = 0;
            for (let i = 1; i < yData.divisions.length; i++) {
                const h = me.canvas.height * ((yData.divisions[i].value - yData.limits.y.min) / (yData.limits.y.max - yData.limits.y.min));
                const thickness = yData.divisions[i].value == 0 ? me.majorGridlineThickness : 1;
                if (currentY > h || h === me.canvas.height || h === 0)
                    break; // prevent y from going back down
                if (h - currentY < 20)
                    continue; // skip heavy overlaps
                currentY = h;
                const top = me.canvas.height - h;
                me.canvas.drawLine(0, top, me.canvas.width, top, me.colours.gridlines, thickness);
            }
        }
    }
    resetColours() {
        this.colours.line = getColourOrError('--accent-color');
        this.colours.gridlines = getColourOrError('--accent-bg-color');
        this.colours.background = getColourOrError('--secondary-bg-color');
        function getColourOrError(name) {
            return window.getComputedStyle(document.body).getPropertyValue(name);
        }
    }
}
LineChartComponent.DIVISION_CLASS_NAMES = {
    x: 'line-chart-x-axis-division',
    y: 'line-chart-y-axis-division',
};
//# sourceMappingURL=line-chart.component.js.map