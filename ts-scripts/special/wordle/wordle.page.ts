import { DarkModeService } from "../../services/dark-mode.service";
import { WordleController } from "./wordle.controller";

class WordlePage {
  static init() {
    this.initStyle();
    this.initController();
  }

  static initController() {
    const controller = new WordleController();
    controller.build(document.body.querySelector('#wordle-container'));
    controller.init();
  }

  static initStyle() {
    DarkModeService.registerStylesheet.light('/stylesheets/wordle/wordle-light.css');
  }
}

WordlePage.init();
