import { PageBuilder } from "../../build-page.js";
import { cws } from "../../cws.js";
import { Canvas, CanvasCreationData } from "./canvas.component.js";

export interface LineChartPoint {
  x: number;
  y: number;
  label?: string;
}

type LineChartAxisData = {
  limits: {
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  }
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

  // Digit rounding:
  // -2 => 123.45
  // 0 => 123
  // 2 => 100
  yDigitRoundedTo?: number;
  showGridlines?: boolean;
  colour?: string;
  points: LineChartPoint[];
  limits?: {
    x?: {
      min: number,
      max: number,
    },
    y?: {
      min: number,
      max: number,
    }
  }
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

  yDigitRoundedTo: number = 2;

  limits: { x: { min: number, max: number }, y: { min: number, max: number } } = {
    x: {
      min: null,
      max: null,
    },
    y: {
      min: null,
      max: null,
    }
  };

  autoRoundYAxis: boolean = false;

  showGridlines: boolean = true;
  majorGridlineThickness: number = 3;

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

    this.yDigitRoundedTo = data.yDigitRoundedTo ?? this.yDigitRoundedTo;
    this.showGridlines = data.showGridlines !== undefined ? data.showGridlines : this.showGridlines;

    this.canvasConfig = data;

    this.limits.x.min = data.limits?.x ? data.limits.x.min : null;
    this.limits.x.max = data.limits?.x ? data.limits.x.max : null;
    this.limits.y.min = data.limits?.y ? data.limits.x.min : null;
    this.limits.y.max = data.limits?.y ? data.limits.x.max : null;

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
    const me = this,
      result = this.generateGenericAxisData('y', MAX_UNIQUE_Y_VALUES, this.yAxisTitle);
    result.divisions = result.divisions.sort((a, b) => { return a.value - b.value });

    result.divisions = result.divisions.map((a: LineChartAxisDivision) => {
      if (me.autoRoundYAxis) {
        const result: LineChartAxisDivision = {
          label: cws.roundToNthDigit(a.value, me.yDigitRoundedTo) + '',
          value: cws.roundToNthDigit(a.value, me.yDigitRoundedTo),
        }
        return result;
      } else
        return a;
    });
    return result;
  }

  private generateGenericAxisData(
    this: LineChartComponent,
    pointAttribute: ('x' | 'y'),
    maximumPoints: number,
    axisTitle: string
  ): LineChartAxisData {
    const me = this,
      uniqueValues: number[] = [],
      allLimits = this.getLimits(),
      trueLimits = this.getTrueLimits();

    let shouldGenerateDivisions: boolean = false;

    if (pointAttribute == 'x' && (trueLimits.minX > allLimits.minX || trueLimits.maxX < allLimits.maxX)) {
      shouldGenerateDivisions = true;
    }

    if (!shouldGenerateDivisions)
      this._points.forEach((point) => {
        if (!cws.Array.contains(uniqueValues, point[pointAttribute])) {
          if (uniqueValues.length >= maximumPoints) {
            shouldGenerateDivisions = true;
          } else if (uniqueValues.length < maximumPoints)
            uniqueValues.push(point[pointAttribute]);
        }
      });

    let divisions: LineChartAxisDivision[];
    if (this._points.length == 0) {
      divisions = [];
    } else if (pointAttribute == 'x') {
      if (shouldGenerateDivisions)
        divisions = generateNewDiv(allLimits.minX, allLimits.maxX, [10, 11, 12, 13, 14]);
      else {
        divisions = uniqueValues.filter((value: number) => {
          return allLimits.minX <= value && value <= allLimits.maxX;
        }).map((value: number) => {
          const output: LineChartAxisDivision = {
            label: value + '',
            value: value,
          }
          return output;
        }).sort((a, b) => {
          return a.value - b.value;
        });
      }
    } else { // y axis
      divisions = generateNewDiv(allLimits.minY, allLimits.maxY, [8, 9, 10, 11, 12]);
    }
    // const divisions = this._points.length > 0 ? pointAttribute == 'x' ? generateEvenDivisions() : generateNewYDiv() : [];

    function generateNewDiv(min: number, max: number, divisors: number[]): LineChartAxisDivision[] {
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

      const values: number[] = [];

      // generate divisors
      for (let x = min; x <= initialMax; x += space) {
        values.push(x);
      }

      // round divisors
      const roundingDigit = values.length > 0 ? values[values.length - 1].toString().length - 3 : 0;
      const output: LineChartAxisDivision[] = [];

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
    }
  }

  private getLimits(this: LineChartComponent): {
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  } {
    if (!this._points[0]) throw new Error("No points");

    const output = this.getTrueLimits();

    output.minX = this.limits.x.min ?? output.minX;
    output.maxX = this.limits.x.max ?? output.maxX;
    output.minY = this.limits.y.min ?? output.minY;
    output.maxY = this.limits.y.max ?? output.maxY;

    return output;
  }

  // Returns the true limits of the dataset; not considering client-defined limits
  private getTrueLimits(this: LineChartComponent): {
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  } {
    if (!this._points[0]) throw new Error("No points");

    const output = {
      minX: this._points[0].x,
      minY: this._points[0].y,
      maxX: this._points[0].x,
      maxY: this._points[0].y
    }

    this._points.forEach((point) => {
      output.minX = Math.min(point.x, output.minX);
      output.minY = Math.min(point.y, output.minY);
      output.maxX = Math.max(point.x, output.maxX);
      output.maxY = Math.max(point.y, output.maxY);
    });

    return output;
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

    if (this._points.length > 0) {
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
          style: `left: ${((division.value - xAxisData.limits.minX) / (xAxisData.limits.maxX - xAxisData.limits.minX)) * 100}%`
        });

        xAxis.appendChild(next);
      });
    }
  }

  redraw(this: LineChartComponent) {
    const me = this,
      area = this.innerRect;

    this.canvas.clearColour = this.colours.background;
    this.canvas.clear();

    if (this._points.length > 0) {
      const limits = this.getLimits();

      if (this.showGridlines)
        drawGridlines();

      function convertPoint(pt: LineChartPoint): LineChartPoint {
        const output: LineChartPoint = {
          x: limits.maxX - limits.minX != 0 ? area.x + (pt.x - limits.minX) * (area.width / (limits.maxX - limits.minX)) : area.x + area.width / 2,
          y: limits.maxY - limits.minY != 0 ? area.bottom - ((pt.y - limits.minY) * (area.height / (limits.maxY - limits.minY))) : area.top + area.height / 2,
          label: pt.label,
        };
        return output;
      }

      for (let i = 1; i < this._points.length; i++) {
        const start = convertPoint(this._points[i - 1]),
          end = convertPoint(this._points[i]);
        this.canvas.drawLine(start.x, start.y, end.x, end.y, this.colours.line, 2);
      }
    }

    function drawGridlines() {
      const xData = me.generateXAxisData(),
        yData = me.generateYAxisData();

      let currentX: number = 0;
      for (let i = 1; i < xData.divisions.length; i++) {
        const x = me.canvas.width * ((xData.divisions[i].value - xData.limits.minX) / (xData.limits.maxX - xData.limits.minX));
        const thickness = xData.divisions[i].label == '0' ? me.majorGridlineThickness : 1;
        if (x < 0) continue;
        if (currentX > x || x === me.canvas.width) break; // prevent x from going backwards
        currentX = x;
        me.canvas.drawLine(
          x,
          0,
          x,
          me.canvas.height,
          me.colours.gridlines,
          thickness);
      }

      let currentY: number = 0;
      for (let i = 1; i < yData.divisions.length; i++) {
        const h = me.canvas.height * ((yData.divisions[i].value - yData.limits.minY) / (yData.limits.maxY - yData.limits.minY));
        const thickness = yData.divisions[i].value == 0 ? me.majorGridlineThickness : 1;
        if (currentY > h || h === me.canvas.height || h === 0) break; // prevent y from going back down
        if (h - currentY < 20) continue; // skip heavy overlaps
        currentY = h;

        const top = me.canvas.height - h;

        me.canvas.drawLine(
          0,
          top,
          me.canvas.width,
          top,
          me.colours.gridlines,
          thickness);
      }
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