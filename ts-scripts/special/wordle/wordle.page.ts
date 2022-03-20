import { WordleController } from "./wordle.controller.js";

const controller = new WordleController();
controller.build(document.body.querySelector('#wordle-container'));
controller.init();
