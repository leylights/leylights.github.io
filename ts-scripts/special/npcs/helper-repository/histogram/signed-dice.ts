import { NPCsDice } from "../general.js";

export class NPCsSignedDice extends NPCsDice {
    sign: 1 | -1;

    constructor(diceStr: string, sign: 1 | -1) {
        super(diceStr);
        this.sign = sign;
    }
}