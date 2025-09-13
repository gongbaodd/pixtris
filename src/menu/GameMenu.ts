
import BaseMenu from './BaseMenu';
import Game from '../Game';

/**
 * Display Main Menu screen
 */
export default class GameMenu extends BaseMenu {
    constructor(game: Game) {
        super(game, 'PIXTRIS');
        
        this.game = game;
    }
    
    update(dt?: number): void {
        super.update(dt);

        if (this.game.key.space.trigger()) {
            this.game.setState('play', {restart: true});
        }
    }
}