import * as PIXI from 'pixi.js';

import ScoreTable from './utils/ScoreTable';
import Keyboard from './utils/Keyboard';
import GamePlay from './play/GamePlay';
import GameMenu from './menu/GameMenu';
import GameOver from './menu/GameOver';
import GamePaused from './menu/GamePaused';
import State from './utils/State';
import { TilingSprite } from "pixi.js"

interface StateOptions {
    keepVisible?: boolean;
    [key: string]: any;
}

/**
 * Represent whole game and handles state changes
 */
export default class Game {
    app: PIXI.Application;
    gameStates: { [key: string]: State };
    state: State | null;
    key!: Keyboard;
    scores!: ScoreTable;

    constructor(app: PIXI.Application) {
        this.app = app;
        
        this.gameStates = {};
        this.state = null;
    }
    
    /**
     * start game, execute after all assets are loaded
     */
    run() {
        // Create background using the background texture from the sprite sheet
        const backgroundTexture = PIXI.Assets.get('blocks')?.textures?.['background'];
        let background = new TilingSprite({
            texture: backgroundTexture || PIXI.Texture.EMPTY,
            width: this.app.renderer.width,
            height: this.app.renderer.height,
        })
        this.app.stage.addChild(background);
        
        this.key = new Keyboard();
        this.scores = new ScoreTable();
        
        // define available game states
        this.addState('play', new GamePlay(this));
        this.addState('pause', new GamePaused(this));
        this.addState('menu', new GameMenu(this));
        this.addState('gameover', new GameOver(this));
        
        // set initial state
        this.setState('menu');
        
        // start the updates
        this.app.ticker.add((ticker) => this.update(ticker.deltaTime));
    }
    
    /**
     * Add new state
     * @param {String} stateName
     * @param {State} state     new state instance
     */
    addState(stateName: string, state: State): void {
        this.gameStates[stateName] = state;
        this.app.stage.addChild(state);
    }
    
    /**
     * Handle game update 
     * @param {Number} dt PIXI timer deltaTime
     */
    update(dt: number): void {
        if (this.state) {
            this.state.update(dt);
        }
    }
    
    /**
     * changes current state
     * @param {String} stateName
     * @param {Object} opts additional options passed by previous state                    
     */
    setState(stateName: string, opts?: StateOptions): void {
        let oldState = this.state;
        
        this.state = null;
        
        if (oldState) {
            if (!opts?.keepVisible) {
                oldState.visible = false;
            }
            oldState.exit(opts);
        }
        
        let newState = this.gameStates[stateName];
        newState.enter(opts);
        newState.visible = true;
        this.state = newState;
    }
}
