
import {Text, TextStyle, Graphics} from 'pixi.js';

import State from '../utils/State';
import Game from '../Game';

export const fancyTextStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 42,
    fontWeight: 'bold',
    fill: [0xFD79A8, 0x34AEFC, 0xFC1051],
    stroke:{
        color: 0x000000,
        width: 4
    },
});

export const simpleTextStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 18,
    fill: 0xFFF1E9,
    stroke:{
        color: 0x000000,
        width: 4
    },
});



/**
 * Display Game Over screen
 */
export default class BaseMenu extends State {
    game: Game;
    background: Graphics;
    title: Text;
    info: Text;
    infoVisibilityCounter: number;
    constructor(game: Game, titleText: string = 'PIXTRIS', infoText: string = 'Press SPACE to play') {
        super();
        
        this.game = game;
        
        this.background = new Graphics();
        this.background.fill({
            color: 0x000000,
            alpha: 0.5,
        })
        this.background.rect(0, 0, this.game.app.renderer.width, this.game.app.renderer.height);
        this.addChild(this.background);

        this.title = new Text({
            text: titleText,
            style: fancyTextStyle,
        });
        this.title.anchor.set(0.5);
        this.title.x = this.game.app.canvas.width * 0.5;
        this.title.y = this.game.app.renderer.height * 0.20;
        this.addChild(this.title);
        
        this.info = new Text({ text: infoText, style: simpleTextStyle });
        this.info.anchor.set(0.5);
        this.info.x = this.game.app.canvas.width * 0.5;
        this.info.y = this.game.app.renderer.height * 0.90;
        this.addChild(this.info);
        this.infoVisibilityCounter = 20;
        
    }
    
    update(_dt?: number): void {
        if (--this.infoVisibilityCounter == 0) {
            this.infoVisibilityCounter = 45;
            this.info.visible = !this.info.visible;
        }
    }
}
