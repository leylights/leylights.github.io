import { PageBuilder } from "../../build-page.js";
import { cws } from "../../cws.js";
import { Canvas } from "./canvas.component.js";
;
const MAX_UNIQUE_X_VALUES = 24;
const MAX_UNIQUE_Y_VALUES = 12;
export class LineChartComponent {
    constructor(data) {
        var _a;
        this.colours = {
            line: null,
            gridlines: null,
            background: null,
        };
        this.labelRoundingDigits = 0;
        this.showGridlines = true;
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
        this.labelRoundingDigits = (_a = data.labelRoundingDigits) !== null && _a !== void 0 ? _a : this.labelRoundingDigits;
        this.showGridlines = data.showGridlines !== undefined ? data.showGridlines : this.showGridlines;
        this.canvasConfig = data;
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
        this._points = pts;
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
        return this.generateGenericAxisData('y', MAX_UNIQUE_Y_VALUES, this.yAxisTitle);
    }
    generateGenericAxisData(pointAttribute, maximumPoints, axisTitle) {
        const me = this, uniqueValues = [];
        let minPoint = this._points[0], maxPoint = this._points[0], shouldGenerateDivisions = false;
        this._points.forEach((point) => {
            if (point[pointAttribute] < minPoint[pointAttribute]) {
                minPoint = point;
            }
            if (point[pointAttribute] > maxPoint[pointAttribute]) {
                maxPoint = point;
            }
            if (!cws.Array.contains(uniqueValues, point[pointAttribute])) {
                if (uniqueValues.length >= maximumPoints) {
                    shouldGenerateDivisions = true;
                }
                else if (uniqueValues.length < maximumPoints)
                    uniqueValues.push(point[pointAttribute]);
            }
        });
        const divisions = shouldGenerateDivisions ? generateDivisions() : uniqueValues.map((value) => {
            const output = {
                label: value + '',
                value: value,
            };
            return output;
        });
        return {
            maxPoint: maxPoint,
            minPoint: minPoint,
            title: axisTitle,
            divisions: divisions,
        };
        function generateDivisions() {
            const divisionValues = [], middleValuesCount = maximumPoints - 1, distanceBetweenDivisions = (maxPoint[pointAttribute] - minPoint[pointAttribute]) / middleValuesCount;
            divisionValues.push(minPoint[pointAttribute]);
            for (let i = 1; i <= middleValuesCount; i++) {
                divisionValues.push(minPoint[pointAttribute] + distanceBetweenDivisions * i);
            }
            return divisionValues.map((n) => {
                return {
                    label: cws.roundToDecimalPlaces(n, me.labelRoundingDigits) + '',
                    value: n,
                };
            }).sort((a, b) => {
                return a.value - b.value;
            });
        }
    }
    getPointXMax() {
        if (!this._points[0])
            return undefined;
        let max = this._points[0].x;
        this._points.forEach((point) => {
            max = Math.max(point.x, max);
        });
        return max;
    }
    getPointYMax() {
        if (!this._points[0])
            return undefined;
        let max = this._points[0].y;
        this._points.forEach((point) => {
            max = Math.max(point.y, max);
        });
        return max;
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
                style: `bottom: ${((division.value - yAxisData.minPoint.y) / (yAxisData.maxPoint.y - yAxisData.minPoint.y)) * 100}%`
            });
            yAxis.appendChild(next);
        });
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
                    style: `left: ${((division.value - xAxisData.minPoint.x) / (xAxisData.maxPoint.x - xAxisData.minPoint.x)) * 100}%`
                });
                xAxis.appendChild(next);
            });
        }
    }
    redraw() {
        const me = this, maxX = this.getPointXMax(), maxY = this.getPointYMax(), area = this.innerRect;
        this.canvas.clearColour = this.colours.background;
        this.canvas.clear();
        if (this.showGridlines)
            drawGridlines();
        for (let i = 1; i < this._points.length; i++) {
            const start = convertPoint(this._points[i - 1]), end = convertPoint(this._points[i]);
            this.canvas.drawLine(start.x, start.y, end.x, end.y, this.colours.line, 2);
        }
        function drawGridlines() {
            const xData = me.generateXAxisData(), yData = me.generateYAxisData();
            let currentX = 0;
            for (let i = 1; i < xData.divisions.length; i++) {
                const w = me.canvas.width * ((xData.divisions[i].value - xData.minPoint.x) / (xData.maxPoint.x - xData.minPoint.x));
                if (currentX > w || w === me.canvas.width || w === 0)
                    break;
                currentX = w;
                me.canvas.drawLine(w, 0, w, me.canvas.height, me.colours.gridlines, 1);
            }
            let currentY = 0;
            for (let i = 1; i < yData.divisions.length; i++) {
                const h = me.canvas.height * ((yData.divisions[i].value - yData.minPoint.y) / (yData.maxPoint.y - yData.minPoint.y));
                if (currentY > h || h === me.canvas.height || h === 0)
                    break;
                currentY = h;
                me.canvas.drawLine(0, h, me.canvas.width, h, me.colours.gridlines, 1);
            }
        }
        function convertPoint(pt) {
            const output = {
                x: area.x + pt.x * (area.width / maxX),
                y: area.bottom - (pt.y * (area.height / maxY)),
                label: pt.label,
            };
            return output;
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
                    console.log(split);
                    if (split[0].trim() == name) {
                        console.log(split[1].trim());
                        return split[1].trim();
                    }
                }
            }
            const result = style.getPropertyValue(name);
            console.log(`${name}: ${result}`);
            if (result === '')
                throw new Error('Bad CSS variable name: ' + name);
            return result;
        }
    }
}
//# sourceMappingURL=line-chart.component.js.map