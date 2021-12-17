import { cws } from "../../cws.js";
import { Button } from "../components/button.component.js";
import { InputComponent } from "../components/input.component.js";
import { LineChartComponent, LineChartPoint } from "../components/line-chart.component.js";
import { BadInput } from "../errors/bad-input.error.js";
import { NPCsSignedDice } from "./helper-repository/histogram/signed-dice.js";

export class NPCsDiceHistogramPage {
  text = {
    rolling: 'Rolling...',
    roll: 'Roll',
  };

  chart: LineChartComponent = new LineChartComponent({
    title: 'Distribution of dice rolls',
    parentElement: document.getElementById('canvas-container'),
    points: [],
    showGridlines: true,
  });
  diceInput: InputComponent = new InputComponent({ element: document.getElementById('dice-input') as HTMLInputElement });
  countInput: InputComponent = new InputComponent({ element: document.getElementById('count-input') as HTMLInputElement });
  submit: Button = Button.createByAppending(document.body.querySelector('.content'), async () => {
    // sanitize
    try {
      this.checkInputs();
    } catch (e) {
      if (e instanceof BadInput) {
        this.submit.reject();
        return;
      } else {
        throw e;
      }
    }

    // submit
    this.submit.HTMLText = this.text.rolling;
    await this.rebuildChart();
    this.submit.HTMLText = this.text.roll;
  }, 'Roll', true);

  constructor() {
    // debug
    this.diceInput.value = '2d4-4d6';
    this.countInput.value = '1000000';
    this.rebuildChart();
  }

  // Will throw BadInput if the input verification fails.
  private checkInputs(this: NPCsDiceHistogramPage): boolean {
    const me = this;

    function rejectDiceInput() {
      me.diceInput.reject();
      throw new BadInput();
    }
    // diceInput
    const diceMatches = this.getDiceStrings();
    if (diceMatches.length <= 0) {
      rejectDiceInput();
    } else if (diceMatches.length >= 1 && diceMatches.join('') != this.diceInput.value.split(' ').join('')) {
      rejectDiceInput();
    } else if (cws.orEquals(this.diceInput.value[this.diceInput.value.length - 1], ['+', '-'])) {
      rejectDiceInput();
    }

    if (diceMatches.length > 1) {
      me.submit.warn();
    }

    // countInput
    const countMatches = this.countInput.value.match(/[0-9]*/g).filter((s: string): boolean => { return s !== '' });
    if (!(countMatches.length === 1 && countMatches[0] == this.countInput.value)) {
      this.countInput.reject();
      throw new BadInput();
    }

    return true;
  }

  private getDiceStrings(this: NPCsDiceHistogramPage): string[] {
    return this.diceInput.value.match(/([+-]?([0-9]*d[0-9]*))/g).filter((s: string) => { return s !== '' });
  }

  private getRollCounts(this: NPCsDiceHistogramPage): { pos: number[], neg: number[] } {
    const dice: NPCsSignedDice[] = [];
    const strings: string[] = this.getDiceStrings();
    let breakOut = false;

    strings.forEach((s: string) => {
      try {
        if (cws.orEquals(s[0], ['+', '-'])) {
          if (s[0] === '-') {
            dice.push(new NPCsSignedDice(s.substring(1), -1));
          } else {
            dice.push(new NPCsSignedDice(s.substring(1), 1));
          }
        } else {
          dice.push(new NPCsSignedDice(s, 1));
        }
      } catch (e) {
        this.diceInput.reject();
        breakOut = true;
      }
    });

    if (breakOut) return;

    const len = Math.ceil(parseInt(this.countInput.value));
    const rollCounts: number[] = [];
    const negativeRollCounts: number[] = [];
    if (isNaN(len) || len <= 0) {
      this.countInput.reject();
      return;
    }

    for (let i = 0; i < len; i++) {
      let roll = 0;
      dice.forEach((d: NPCsSignedDice) => {
        roll += d.roll() * d.sign;
      });

      if (roll < 0) {
        if (negativeRollCounts[Math.abs(roll)]) negativeRollCounts[Math.abs(roll)]++;
        else negativeRollCounts[Math.abs(roll)] = 1;
      } else {
        if (rollCounts[roll]) rollCounts[roll]++;
        else rollCounts[roll] = 1;
      }
    }

    for (let i = 0; i < rollCounts.length; i++) {
      if (!rollCounts[i]) rollCounts[i] = 0;
    }
    for (let i = 0; i < negativeRollCounts.length; i++) {
      if (!negativeRollCounts[i]) negativeRollCounts[i] = 0;
    }

    return {
      pos: rollCounts,
      neg: negativeRollCounts
    };
  }

  private async rebuildChart(this: NPCsDiceHistogramPage) {
    const rolls: { pos: number[], neg: number[] } = this.getRollCounts();
    const points: LineChartPoint[] = [];

    for (let i = 0; i < rolls.pos.length; i++)
      points[i] = {
        x: i,
        y: rolls.pos[i],
      }
    for (let i = 1; i < rolls.neg.length; i++)
      points[i + rolls.pos.length - 1] = {
        x: -i,
        y: rolls.neg[i],
      }

    this.chart.points = points;
  }
}

new NPCsDiceHistogramPage();