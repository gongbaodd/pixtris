
import {Text} from 'pixi.js';

import BaseMenu from './BaseMenu';
import Game from '../Game';

interface StateOptions {
    keepVisible?: boolean;
    [key: string]: any;
}

/**
 * Display Game Over screen
 */
export default class GameOver extends BaseMenu {
    scoreInfo: Text;

    constructor(game: Game) {
        super(game, 'GAME\nOVER');
        
        this.scoreInfo = new Text({text: 'Last score', style: this.info.style });
        this.scoreInfo.anchor.set(0.5);
        this.scoreInfo.x = this.game.app.canvas.width * 0.5;
        this.scoreInfo.y = this.game.app.renderer.height * 0.50;
        this.addChild(this.scoreInfo);
    }
    
    enter(_opts?: StateOptions): void {
        let score = this.game.scores.getNewest();
        if (score) {
            this.scoreInfo.text = `Score: ${score.points}\nLines: ${score.lines}`;
        } else {
            this.scoreInfo.text = 'No score available';
        }
    }
    
    update(dt?: number): void {
        super.update(dt);
        
        if (this.game.key.space.trigger()) {
            this.game.setState('play', {restart: true});
        }
    }
}
