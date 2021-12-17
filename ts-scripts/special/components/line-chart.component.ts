import { PageBuilder } from "../../build-page.js";
import { cws } from "../../cws.js";
import { Canvas, CanvasCreationData } from "./canvas.component.js";

export interface LineChartPoint {
  x: number;
  y: number;
  label?: string;
}

type LineChartAxisData = {
  minPoint: LineChartPoint,
  maxPoint: LineChartPoint,
  title: string,
  divisions: LineChartAxisDivision[]
}

type LineChartAxisDivision = {
  label: string,
  value: number,
}

interface LineChartConfig extends CanvasCreationData {
  title?: string;
  xAxis?: string;
  yAxis?: string;
  labelRoundingDigits?: number;
  showGridlines?: boolean;
  colour?: string;
  points: LineChartPoint[];
};

const MAX_UNIQUE_X_VALUES = 24;
const MAX_UNIQUE_Y_VALUES = 12;

export class LineChartComponent {
  parentElement: HTMLElement;
  container: HTMLElement;
  canvas: Canvas;
  private _points: LineChartPoint[];

  canvasConfig: CanvasCreationData;

  title: string;
  xAxisTitle: string;
  yAxisTitle: string;

  colours: {
    line: string;
    gridlines: string;
    background: string;
  } = {
      line: null,
      gridlines: null,
      background: null,
    };

  labelRoundingDigits: number = 0;
  showGridlines: boolean = true;

  xAxisHeight: number = 40;
  yAxisWidth: number = 60;

  private _isInitialized = false;

  constructor(data: LineChartConfig) {
    const me = this;

    this.parentElement = data.parentElement;
    this._points = data.points.sort((a, b) => {
      return a.x - b.x;
    });

    this.title = data.title;
    this.xAxisTitle = data.xAxis;
    this.yAxisTitle = data.yAxis;
    this.colours.line = data.colour;

    this.labelRoundingDigits = data.labelRoundingDigits ?? this.labelRoundingDigits;
    this.showGridlines = data.showGridlines !== undefined ? data.showGridlines : this.showGridlines;

    this.canvasConfig = data;

    PageBuilder.addDarkModeListener((isDark: boolean, styleSheet: CSSStyleSheet) => {
      me.resetColours(styleSheet);
    });

    this.rebuild();
    this._isInitialized = true;
  }

  private get innerRect(): DOMRect {
    return new DOMRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  getPoints(this: LineChartComponent): LineChartPoint[] {
    return this._points.map((pt) => {
      return {
        x: pt.x,
        y: pt.y,
        label: pt.label,
      };
    });
  }

  set points(pts: LineChartPoint[]) {
    this._points = pts.sort((a, b) => {
      return b.x - a.x;
    });

    this.rebuild();
  }

  get titleSizePx(): number {
    const measurements: TextMetrics = this.canvas.context.measureText(this.title);
    return measurements.actualBoundingBoxAscent - measurements.actualBoundingBoxDescent;
  }

  private generateXAxisData(this: LineChartComponent, divisionsLimit?: number): LineChartAxisData {
    const limit = divisionsLimit !== undefined ? divisionsLimit : MAX_UNIQUE_X_VALUES;
    return this.generateGenericAxisData('x', limit, this.xAxisTitle);
  }

  private generateYAxisData(this: LineChartComponent): LineChartAxisData {
    return this.generateGenericAxisData('y', MAX_UNIQUE_Y_VALUES, this.yAxisTitle);
  }

  private generateGenericAxisData(this: LineChartComponent, pointAttribute: ('x' | 'y'), maximumPoints: number, axisTitle: string): LineChartAxisData {
    const me = this,
      uniqueValues: number[] = [];

    let minPoint: LineChartPoint = this._points[0],
      maxPoint: LineChartPoint = this._points[0],
      shouldGenerateDivisions: boolean = false;

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
        } else if (uniqueValues.length < maximumPoints)
          uniqueValues.push(point[pointAttribute]);
      }
    });

    const divisions: LineChartAxisDivision[] = shouldGenerateDivisions ? generateDivisions() : uniqueValues.map((value: number) => {
      const output: LineChartAxisDivision = {
        label: value + '',
        value: value,
      }
      return output;
    });

    return {
      maxPoint: maxPoint,
      minPoint: minPoint,
      title: axisTitle,
      divisions: divisions,
    }

    function generateDivisions(): LineChartAxisDivision[] {
      const divisionValues: number[] = [],
        middleValuesCount = maximumPoints - 1,
        distanceBetweenDivisions: number = (maxPoint[pointAttribute] - minPoint[pointAttribute]) / middleValuesCount;

      divisionValues.push(minPoint[pointAttribute]);

      for (let i = 1; i <= middleValuesCount; i++) {
        divisionValues.push(minPoint[pointAttribute] + distanceBetweenDivisions * i);
      }

      return divisionValues.map((n: number) => {
        return {
          label: cws.roundToDecimalPlaces(n, me.labelRoundingDigits) + '',
          value: n,
        }
      }).sort((a, b) => {
        return a.value - b.value;
      });
    }
  }

  private getPointXMin(this: LineChartComponent): number {
    if (!this._points[0]) return undefined;
    let min = this._points[0].x;
    this._points.forEach((point) => {
      min = Math.min(point.x, min);
    });
    return min;
  }

  private getPointXMax(this: LineChartComponent): number {
    if (!this._points[0]) return undefined;
    let max = this._points[0].x;
    this._points.forEach((point) => {
      max = Math.max(point.x, max);
    });
    return max;
  }

  private getPointYMax(this: LineChartComponent): number {
    if (!this._points[0]) return undefined;
    let max = this._points[0].y;
    this._points.forEach((point) => {
      max = Math.max(point.y, max);
    });
    return max;
  }

  main(this: LineChartComponent) {
    this.redraw();
  }

  rebuild(this: LineChartComponent) {
    const me = this,
      container = cws.createElement({
        type: 'div',
        classList: 'line-chart-container',
      }),
      firstTime: boolean = !this.canvas,
      xDivisionClassName = 'line-chart-x-axis-division',
      yDivisionClassName = 'line-chart-y-axis-division';

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
    const yAxisData: LineChartAxisData = this.generateYAxisData();

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
    } else {
      this.container.replaceWith(container)
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

    let maxYAxisLabelWidth: number = -1;
    Array.from(yAxis.querySelectorAll(`.${yDivisionClassName}`)).forEach((divider) => {
      maxYAxisLabelWidth = Math.max(maxYAxisLabelWidth, divider.getBoundingClientRect().width);
    });
    yAxis.style.width = Math.max(maxYAxisLabelWidth + 5, this.yAxisWidth) + 'px';

    // rebuild x axis until values fit
    attemptRotateXAxis();

    // set x axis height

    let maxXAxisLabelHeight: number = -1;
    Array.from(xAxis.querySelectorAll(`.${xDivisionClassName}`)).forEach((divider) => {
      maxXAxisLabelHeight = Math.max(maxXAxisLabelHeight, divider.getBoundingClientRect().height);
    });
    xAxis.style.height = Math.max(maxXAxisLabelHeight + 5, this.xAxisHeight) + 'px';

    this.canvas.drawOnce(() => { me.main(); });

    function attemptRotateXAxis(): boolean {
      let lastDivision: HTMLDivElement = null;
      let needsRotation: boolean = false;
      const results = Array.from(xAxis.querySelectorAll(`.${xDivisionClassName}`)).sort((a: HTMLElement, b: HTMLElement) => {
        return a.getBoundingClientRect().x - b.getBoundingClientRect().x;
      }) as HTMLDivElement[];

      for (let i = 0; i < results.length; i++) {
        if (results[i].getBoundingClientRect().x === 0)
          break;
        if (!lastDivision)
          lastDivision = results[i];
        else if (lastDivision.getBoundingClientRect().right > results[i].getBoundingClientRect().x) {
          needsRotation = true;
          break;
        } else
          lastDivision = results[i];
      };

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

    function generateXAxis(limit: number) {
      // debugger;
      const xAxisData: LineChartAxisData = me.generateXAxisData(limit);
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

  redraw(this: LineChartComponent) {
    const me = this,
      minX = this.getPointXMin(),
      maxX = this.getPointXMax(),
      maxY = this.getPointYMax(),
      area = this.innerRect;

    this.canvas.clearColour = this.colours.background;
    this.canvas.clear();

    if (this.showGridlines)
      drawGridlines();

    for (let i = 1; i < this._points.length; i++) {
      const start = convertPoint(this._points[i - 1]),
        end = convertPoint(this._points[i]);
      // debugger;

      console.log("pt #" + this._points[i - 1].x + ", x:" + start.x + ", y" + start.y);
      this.canvas.drawLine(start.x, start.y, end.x, end.y, this.colours.line, 2);
    }

    function drawGridlines() {
      const xData = me.generateXAxisData(),
        yData = me.generateYAxisData();

      let currentX: number = 0;
      for (let i = 1; i < xData.divisions.length; i++) {
        const w = me.canvas.width * ((xData.divisions[i].value - xData.minPoint.x) / (xData.maxPoint.x - xData.minPoint.x));
        if (currentX > w || w === me.canvas.width || w === 0) break;
        currentX = w;
        me.canvas.drawLine(
          w,
          0,
          w,
          me.canvas.height,
          me.colours.gridlines,
          1);
      }

      let currentY: number = 0;
      for (let i = 1; i < yData.divisions.length; i++) {
        const h = me.canvas.height * ((yData.divisions[i].value - yData.minPoint.y) / (yData.maxPoint.y - yData.minPoint.y));
        if (currentY > h || h === me.canvas.height || h === 0) break;
        currentY = h;

        me.canvas.drawLine(
          0,
          h,
          me.canvas.width,
          h,
          me.colours.gridlines,
          1);
      }
    }

    function convertPoint(pt: LineChartPoint): LineChartPoint {
      const output: LineChartPoint = {
        x: area.x + (pt.x - minX) * (area.width / (maxX - minX)),
        y: area.bottom - (pt.y * (area.height / maxY)),
        label: pt.label,
      };
      return output;
    }
  }

  resetColours(this: LineChartComponent, styleSheet: CSSStyleSheet) {
    const style = window.getComputedStyle(document.body);

    this.colours.line = getColourOrError('--accent-color');
    this.colours.gridlines = getColourOrError('--accent-bg-color');
    this.colours.background = getColourOrError('--secondary-bg-color');

    if (this._isInitialized)
      this.redraw();

    console.log('colours reset');

    function getColourOrError(name: string): string {
      const root: CSSStyleRule = Array.from(styleSheet.cssRules).filter((rule: CSSStyleRule) => {
        return rule.selectorText == ':root';
      })[0] as CSSStyleRule;
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