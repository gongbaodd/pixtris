
import { Container } from 'pixi.js';


/**
 * Base class for game states.
 * Extends PIXI.Container for easy state switching.
 */
export default class State extends Container {
    constructor() {
        super();
        
        this.visible = false;
    }

    enter(opts?: any): void {}

    exit(opts?: any): void {}

    update(dt?: number): void {}
}
