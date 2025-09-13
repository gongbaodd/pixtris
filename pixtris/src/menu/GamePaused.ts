
import {Text} from 'pixi.js';

import BaseMenu from './BaseMenu';
import Game from '../Game';

interface ScoreInfo {
    points: number;
    lines: number;
}

interface GamePausedOptions {
    score?: ScoreInfo;
    keepVisible?: boolean;
    [key: string]: any;
}

/**
 * Display Game Paused screen
 */
export default class GamePaused extends BaseMenu {
    scoreInfo: Text;

    constructor(game: Game) {
        super(game, 'PAUSED', 'Press SPACE to continue\nPress ESCAPE to restart');
        
        this.scoreInfo = new Text({ text: 'Last score',  style: this.info.style });
        this.scoreInfo.anchor.set(0.5);
        this.scoreInfo.x = this.game.app.canvas.width * 0.5;
        this.scoreInfo.y = this.game.app.renderer.height * 0.50;
        this.addChild(this.scoreInfo);
    }
    enter(opts?: GamePausedOptions): void {
        if (opts?.score) {
            this.scoreInfo.text = `Score: ${opts.score.points}\nLines: ${opts.score.lines}`;
            this.scoreInfo.visible = true;
        } else {
            this.scoreInfo.visible = false;
        }
    }
    
    update(dt?: number): void {
        super.update(dt);
        
        if (this.game.key.space.trigger()) {
            this.game.setState('play', {restart: false});
        } else if (this.game.key.escape.trigger()) {
            this.game.setState('play', {restart: true});
        }
    }
}
