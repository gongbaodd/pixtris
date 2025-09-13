
import Tetromino, { SHAPE_COLORS } from './Tetromino';

type ShapeType = keyof typeof SHAPE_COLORS;

const shapeTypes = Object.keys(SHAPE_COLORS).join('') as string;

/**
 * Provide tetromino shapes queue, that gives fair randomness,
 * but lacks iritating single shape long strikes.
 */
export default class TetronimoSpawner {
    queue: ShapeType[];

    constructor() {
        this.queue = [];
        this.refillQueue();
    }
    
    /**
     * refill tetromino shapes queue, with semi-random ordering
     */
    refillQueue(): void {
        let a = (shapeTypes+shapeTypes+shapeTypes+shapeTypes).split('') as ShapeType[];
        // shuffle
        for (let i = a.length; i > 0; --i) {
            let j = Math.floor(Math.random() * i);
            let tmp = a[i-1];
            a[i-1] = a[j];
            a[j] = tmp;
        }
        this.queue = a.concat(this.queue);
    }
    
    spawn(): Tetromino {
        if(this.queue.length < 2) {
            this.refillQueue();
        }
        const shapeType = this.queue.pop();
        if (!shapeType) {
            throw new Error('No shapes available in queue');
        }
        return new Tetromino(shapeType);
    }
}
