import { WiresConstants } from "./constants.js";

export enum WiresWinStateEnum {
  win = 1,
  ongoing = -1,
  loss = 0
}

export class WiresState {
  static now: number = Date.now();

  static minW = 3;
  static minH = 3;
  static maxW = 0;
  static maxH = 0;

  static tileWidth: number = 64;

  static isCompetitive: boolean = false;
  static score: number = 0;

  static remainingAttempts: number = 3;
  static lastSolutionTime: number = 0;
  static stopTime: number = -1;
  static deadline: number = -1;
  static isWon: WiresWinStateEnum = WiresWinStateEnum.ongoing;

  static showRed: boolean = false;
  static showAns: boolean = false;

  static get livesCounterOuterWidth(): number {
    return WiresState.isCompetitive ? WiresConstants.LIVES_COUNTER.INNER_WIDTH + WiresConstants.BORDER.WIDTH * 2 : 0;
  }

  static get elapsedWins(): number {
    if (WiresState.isCompetitive)
      return WiresState.elapsedCompetitiveWins;
    else
      return WiresState.elapsedRelaxedWins;
  }
  static set elapsedWins(n: number) {
    if (WiresState.isCompetitive)
      WiresState.elapsedCompetitiveWins = n;
    else
      WiresState.elapsedRelaxedWins = n;
  }

  private static readonly winsKey = 'wiresScore';
  static get elapsedRelaxedWins(): number {
    const result = localStorage.getItem(WiresState.winsKey);
    if (!result)
      return 0;
    else
      return parseInt(result);
  }
  static set elapsedRelaxedWins(n: number) {
    localStorage.setItem(WiresState.winsKey, n + '');
  }

  private static readonly competitiveWinsKey = 'wiresCompScore';
  static get elapsedCompetitiveWins(): number {
    const result = localStorage.getItem(WiresState.competitiveWinsKey);
    if (!result)
      return 0;
    else
      return parseInt(result);
  }
  static set elapsedCompetitiveWins(n: number) {
    localStorage.setItem(WiresState.competitiveWinsKey, n + '');
  }

  private static readonly competitiveHSKey = 'wiresCompHS';
  static get elapsedCompetitiveWinsHighScore(): number {
    const result = localStorage.getItem(WiresState.competitiveHSKey);
    if (!result)
      return 0;
    else
      return parseInt(result);
  }
  static set elapsedCompetitiveWinsHighScore(n: number) {
    localStorage.setItem(WiresState.competitiveHSKey, n + '');
  }
}