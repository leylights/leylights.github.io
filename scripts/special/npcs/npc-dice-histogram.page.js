import { Button } from "../components/button.component.js";
import { InputComponent } from "../components/input.component.js";
import { LineChartComponent } from "../components/line-chart.component.js";
import { NPCsDice } from "./helper-repository/general.js";
export class NPCsDiceHistogramPage {
    constructor() {
        this.chart = new LineChartComponent({
            title: 'Distribution of dice rolls',
            parentElement: document.getElementById('canvas-container'),
            points: [],
            showGridlines: true,
        });
        this.diceInput = new InputComponent({ element: document.getElementById('dice-input') });
        this.countInput = new InputComponent({ element: document.getElementById('count-input') });
        this.submit = Button.createByAppending(document.body.querySelector('.content'), () => {
            // sanitize
            if (!this.checkInputs())
                return;
            // submit
            const name = this.submit.HTMLText + '';
            this.submit.HTMLText = 'Rolling...';
            this.rebuildChart();
            this.submit.HTMLText = name;
        }, 'Roll', true);
        // debug
        this.diceInput.value = '2d4';
        this.countInput.value = '1000000';
        this.rebuildChart();
    }
    checkInputs() {
        // diceInput
        const diceMatches = this.diceInput.value.match(/(([0-9]*d[0-9]*)( *))*/g).filter((s) => { return s !== ''; });
        if (!(diceMatches.length === 1 && diceMatches[0] == this.diceInput.value)) {
            this.diceInput.reject();
            return false;
        }
        // countInput
        const countMatches = this.countInput.value.match(/[0-9]*/g).filter((s) => { return s !== ''; });
        if (!(countMatches.length === 1 && countMatches[0] == this.countInput.value)) {
            this.countInput.reject();
            return false;
        }
        return true;
    }
    getRollCounts() {
        let dice;
        try {
            dice = new NPCsDice(this.diceInput.value);
        }
        catch (e) {
            this.diceInput.reject();
            return;
        }
        const len = Math.ceil(parseInt(this.countInput.value));
        const rollCounts = [];
        if (isNaN(len) || len <= 0) {
            this.countInput.reject();
            return;
        }
        for (let i = 0; i < len; i++) {
            const roll = dice.roll();
            if (rollCounts[roll])
                rollCounts[roll]++;
            else
                rollCounts[roll] = 1;
        }
        for (let i = 0; i < rollCounts.length; i++) {
            if (!rollCounts[i])
                rollCounts[i] = 0;
        }
        return rollCounts;
    }
    rebuildChart() {
        const rolls = this.getRollCounts();
        const points = [];
        for (let i = 0; i < rolls.length; i++)
            points[i] = {
                x: i,
                y: rolls[i],
            };
        this.chart.points = points;
    }
}
new NPCsDiceHistogramPage();
//# sourceMappingURL=npc-dice-histogram.page.js.map