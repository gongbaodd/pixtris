
export interface GameConfig {
    cols: number;
    rows: number;
    hiddenRows: number;
    fallSpeed: number;
    fallSpeedMin: number;
    fallSpeedupStep: number;
    fallSpeedupDelay: number;
    dropModifier: number;
}

export const game: GameConfig = {
    // board dimensions
    cols: 10,
    rows: 20,
    hiddenRows: 2,
    // number of frames between block falls one row
    fallSpeed: 30,
    fallSpeedMin: 3,
    fallSpeedupStep: 2,
    fallSpeedupDelay: 1800,
    // block will fall this time faster when drop key pressed
    dropModifier: 10
}

const SPRITE_SIZE = 32;

export interface DisplayConfig {
    blockSize: number;
    width: number;
    height: number;
}

export const display: DisplayConfig = {
    // currently hardcoded block sprite size
    blockSize: SPRITE_SIZE,
    width: game.cols * SPRITE_SIZE,
    height: game.rows * SPRITE_SIZE
}

export interface ControlsConfig {
    repeatDelay: number;
    initialRepeatDelay: number;
}

export const controls: ControlsConfig = {
    // controls key repeat speed
    repeatDelay: 2,
    initialRepeatDelay: 500
}

export interface Config {
    game: GameConfig;
    display: DisplayConfig;
    controls: ControlsConfig;
}

export default {game, display, controls} as Config;
