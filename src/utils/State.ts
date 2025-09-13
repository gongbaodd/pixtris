
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

    enter(): void {}

    exit(): void {}

    update(): void {}
}
