import { PageBuilder } from "../../build-page.js";
import { cws } from "../../cws.js";
import { Canvas } from "./canvas.component.js";
;
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
        PageBuilder.addDarkModeListener((isDark, styleSheet) => {
            me.resetColours(styleSheet);
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
        const me = this, uniqueValues = [], allLimits = this.getLimits(), trueLimits = this.getTrueLimits();
        let shouldGenerateDivisions = false;
        if (pointAttribute == 'x' && (trueLimits.minX > allLimits.minX || trueLimits.maxX < allLimits.maxX)) {
            shouldGenerateDivisions = true;
        }
        if (!shouldGenerateDivisions)
            this._points.forEach((point) => {
                if (!cws.Array.contains(uniqueValues, point[pointAttribute])) {
                    if (uniqueValues.length >= maximumPoints) {
                        shouldGenerateDivisions = true;
                    }
                    else if (uniqueValues.length < maximumPoints)
                        uniqueValues.push(point[pointAttribute]);
                }
            });
        let divisions;
        if (this._points.length == 0) {
            divisions = [];
        }
        else if (pointAttribute == 'x') {
            if (shouldGenerateDivisions)
                divisions = generateNewDiv(allLimits.minX, allLimits.maxX, [10, 11, 12, 13, 14]);
            else {
                divisions = uniqueValues.filter((value) => {
                    return allLimits.minX <= value && value <= allLimits.maxX;
                }).map((value) => {
                    const output = {
                        label: value + '',
                        value: value,
                    };
                    return output;
                }).sort((a, b) => {
                    return a.value - b.value;
                });
            }
        }
        else { // y axis
            divisions = generateNewDiv(allLimits.minY, allLimits.maxY, [8, 9, 10, 11, 12]);
        }
        // const divisions = this._points.length > 0 ? pointAttribute == 'x' ? generateEvenDivisions() : generateNewYDiv() : [];
        function generateNewDiv(min, max, divisors) {
            const initialMax = max;
            let space = -1;
            let success = false;
            // find an integer spacing that creates a reasonable number of divisors
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
            const values = [];
            // generate divisors
            for (let x = min; x <= initialMax; x += space) {
                values.push(x);
            }
            // round divisors
            const roundingDigit = values.length > 0 ? values[values.length - 1].toString().length - 3 : 0;
            const output = [];
            values.forEach((n) => {
                n = cws.roundToNthDigit(n, roundingDigit);
                output.push({
                    label: n + '',
                    value: n,
                });
            });
            return output;
        }
        return {
            limits: {
                minX: allLimits.minX,
                minY: allLimits.minY,
                maxX: allLimits.maxX,
                maxY: allLimits.maxY,
            },
            title: axisTitle,
            divisions: divisions,
        };
    }
    getLimits() {
        var _a, _b, _c, _d;
        if (!this._points[0])
            throw new Error("No points");
        const output = this.getTrueLimits();
        output.minX = (_a = this.limits.x.min) !== null && _a !== void 0 ? _a : output.minX;
        output.maxX = (_b = this.limits.x.max) !== null && _b !== void 0 ? _b : output.maxX;
        output.minY = (_c = this.limits.y.min) !== null && _c !== void 0 ? _c : output.minY;
        output.maxY = (_d = this.limits.y.max) !== null && _d !== void 0 ? _d : output.maxY;
        return output;
    }
    // Returns the true limits of the dataset; not considering client-defined limits
    getTrueLimits() {
        if (!this._points[0])
            throw new Error("No points");
        const output = {
            minX: this._points[0].x,
            minY: this._points[0].y,
            maxX: this._points[0].x,
            maxY: this._points[0].y
        };
        this._points.forEach((point) => {
            output.minX = Math.min(point.x, output.minX);
            output.minY = Math.min(point.y, output.minY);
            output.maxX = Math.max(point.x, output.maxX);
            output.maxY = Math.max(point.y, output.maxY);
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
        }), firstTime = !this.canvas, xDivisionClassName = 'line-chart-x-axis-division', yDivisionClassName = 'line-chart-y-axis-division';
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
            generateXAxis(MAX_UNIQUE_X_VALUES);
            const yAxisData = this.generateYAxisData();
            yAxisData.divisions.forEach((division) => {
                const next = cws.createElement({
                    type: 'div',
                    classList: yDivisionClassName,
                    children: [cws.createElement({
                            type: 'span',
                            innerText: division.label
                        })],
                    style: `bottom: ${((division.value - yAxisData.limits.minY) / (yAxisData.limits.maxY - yAxisData.limits.minY)) * 100}%`
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
        Array.from(yAxis.querySelectorAll(`.${yDivisionClassName}`)).forEach((a) => {
            Array.from(yAxis.querySelectorAll(`.${yDivisionClassName}`)).forEach((b) => {
                if (!a.isEqualNode(b) && cws.rectanglesCollide(a.getBoundingClientRect(), b.getBoundingClientRect()))
                    b.remove();
            });
        });
        // set y axis width
        let maxYAxisLabelWidth = -1;
        Array.from(yAxis.querySelectorAll(`.${yDivisionClassName}`)).forEach((divider) => {
            maxYAxisLabelWidth = Math.max(maxYAxisLabelWidth, divider.getBoundingClientRect().width);
        });
        yAxis.style.width = Math.max(maxYAxisLabelWidth + 5, this.yAxisWidth) + 'px';
        // rebuild x axis until values fit
        attemptRotateXAxis();
        // set x axis height
        let maxXAxisLabelHeight = -1;
        Array.from(xAxis.querySelectorAll(`.${xDivisionClassName}`)).forEach((divider) => {
            maxXAxisLabelHeight = Math.max(maxXAxisLabelHeight, divider.getBoundingClientRect().height);
        });
        xAxis.style.height = Math.max(maxXAxisLabelHeight + 5, this.xAxisHeight) + 'px';
        this.canvas.drawOnce(() => { me.main(); });
        function attemptRotateXAxis() {
            let lastDivision = null;
            let needsRotation = false;
            const results = Array.from(xAxis.querySelectorAll(`.${xDivisionClassName}`)).sort((a, b) => {
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
            ;
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
        function generateXAxis(limit) {
            // debugger;
            const xAxisData = me.generateXAxisData(limit);
            xAxis.innerHTML = '';
            xAxisData.divisions.forEach((division) => {
                const next = cws.createElement({
                    type: 'div',
                    classList: xDivisionClassName,
                    children: [cws.createElement({
                            type: 'span',
                            innerText: division.label
                        })],
                    style: `left: ${((division.value - xAxisData.limits.minX) / (xAxisData.limits.maxX - xAxisData.limits.minX)) * 100}%`
                });
                xAxis.appendChild(next);
            });
        }
    }
    redraw() {
        const me = this, area = this.innerRect;
        this.canvas.clearColour = this.colours.background;
        this.canvas.clear();
        if (this._points.length > 0) {
            const limits = this.getLimits();
            if (this.showGridlines)
                drawGridlines();
            function convertPoint(pt) {
                const output = {
                    x: limits.maxX - limits.minX != 0 ? area.x + (pt.x - limits.minX) * (area.width / (limits.maxX - limits.minX)) : area.x + area.width / 2,
                    y: limits.maxY - limits.minY != 0 ? area.bottom - ((pt.y - limits.minY) * (area.height / (limits.maxY - limits.minY))) : area.top + area.height / 2,
                    label: pt.label,
                };
                return output;
            }
            for (let i = 1; i < this._points.length; i++) {
                const start = convertPoint(this._points[i - 1]), end = convertPoint(this._points[i]);
                this.canvas.drawLine(start.x, start.y, end.x, end.y, this.colours.line, 2);
            }
        }
        function drawGridlines() {
            const xData = me.generateXAxisData(), yData = me.generateYAxisData();
            let currentX = 0;
            for (let i = 1; i < xData.divisions.length; i++) {
                const x = me.canvas.width * ((xData.divisions[i].value - xData.limits.minX) / (xData.limits.maxX - xData.limits.minX));
                const thickness = xData.divisions[i].label == '0' ? me.majorGridlineThickness : 1;
                if (x < 0)
                    continue;
                if (currentX > x || x === me.canvas.width)
                    break; // prevent x from going backwards
                currentX = x;
                me.canvas.drawLine(x, 0, x, me.canvas.height, me.colours.gridlines, thickness);
            }
            let currentY = 0;
            for (let i = 1; i < yData.divisions.length; i++) {
                const h = me.canvas.height * ((yData.divisions[i].value - yData.limits.minY) / (yData.limits.maxY - yData.limits.minY));
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
    resetColours(styleSheet) {
        const style = window.getComputedStyle(document.body);
        this.colours.line = getColourOrError('--accent-color');
        this.colours.gridlines = getColourOrError('--accent-bg-color');
        this.colours.background = getColourOrError('--secondary-bg-color');
        if (this._isInitialized)
            this.redraw();
        console.log('colours reset');
        function getColourOrError(name) {
            const root = Array.from(styleSheet.cssRules).filter((rule) => {
                return rule.selectorText == ':root';
            })[0];
            // debugger;
            if (root) {
                const definedRules = root.style.cssText.split(';');
                for (let i = 0; i < definedRules.length; i++) {
                    const split = definedRules[i].split(':');
                    if (split[0].trim() == name) {
                        return split[1].trim();
                    }
                }
            }
            const result = style.getPropertyValue(name);
            if (result === '')
                throw new Error('Bad CSS variable name: ' + name);
            return result;
        }
    }
}
//# sourceMappingURL=line-chart.component.js.map