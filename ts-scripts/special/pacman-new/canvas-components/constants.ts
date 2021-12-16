export class PacmanConstants {
  static GOD_MODE: boolean = false;
  static DRAW_NODES: boolean = false;

  static DISTANCE_BETWEEN_PELLETS: number = 16;

  static CHARACTER_DIAMETER: number = 32;
  static CHARACTER_SPEED: number = 2;
  static RETURN_SPEED: number = 5;
  static CHASE_SPEED: number = 1;

  static START_DELAY: number = 1 * 1000;

  static LEVEL_END_FLASH_DELAY: number = 2 * 1000;
  static LEVEL_END_FLASHING_TIME: number = 2 * 1000 - 1;
  static LEVEL_END_FLASHING_INTERVAL: number = 500;

  static BASE_REVIVES: number = 2;

  static NORMAL_PELLET_SCORE: number = 10;
  static POWER_PELLET_SCORE: number = 50;

  static CHARACTER_ANIMATION_UPDATE_INTERVAL: number = 125;
  static PELLET_ANIMATION_UPDATE_INTERVAL: number = 300;

  static HALL_WIDTH: number = 32;

  static ORANGE_COWER_DISTANCE: number = 120;
  static GHOST_CUTOFF_DISTANCE: number = 70;

  static STUPIDIFER_CYCLE_LENGTH_MS: number = 20 * 1000;
  static STUPIDIFIER_AMPLITUDE: number = 0.25;

  static HITBOX_MULTIPLIER: number = 0.5;

  static CHASE_LEN: number = 6 * 1000;

  static GHOST_DEATH_PAUSE_TIME: number = 0.8 * 1000;
  static GHOST_DEATH_SCORE: number = 200;

  static CYAN_TEXT_COLOR: string = '#1cd9bf';
  static PINK_PELLET_COLOR: string = '#ffb897';

  static FRUIT_RADIUS: number = PacmanConstants.HALL_WIDTH * 0.5;
  static FRUIT_POINTS: number[] = [100, 300, 500, 700, 1000, 2000, 3000, 5000];

  static NODE_ROWS: number[] = [56, 120, 168, 216, 264, 313, 361, 409, 457, 505];
  static NODE_COLS: number[] = [8, 40, 88, 136, 184, 208, 232, 280, 328, 376, 408];

  static LIVES_DISPLAY_SPACING: number = 4;
  static LIVES_DISPLAY_WIDTH: number = PacmanConstants.HALL_WIDTH * 0.75;
  static LIVES_DISPLAY_Y: number = PacmanConstants.NODE_ROWS[PacmanConstants.NODE_ROWS.length - 1] + PacmanConstants.HALL_WIDTH + 12;

  static FRUITS_DISPLAY_SPACING: number = 4;
  static FRUITS_DISPLAY_WIDTH: number = PacmanConstants.HALL_WIDTH * 0.75;

  static GHOST_START_JAIL_NODES = ['bt', 'bo', 'bu'];
}