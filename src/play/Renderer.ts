
import * as PIXI from 'pixi.js';
import Board from './Board';
import Tetromino from './Tetromino';

interface SpriteWithBlockColor extends PIXI.Sprite {
    blockColor: string | null;
}

/**
 * Render board and active tetromino using PIXI.js
 */
export default class Renderer extends PIXI.Container {
    rows: number;
    cols: number;
    rowsOffset: number;
    blockSize: number;
    textures: any; // PIXI texture resources
    sprites: SpriteWithBlockColor[][];
    
    /**
     * Initialize renderer
     * @param {Number} rows       Number of visible rows
     * @param {Number} cols       Number of visible columns
     * @param {Number} rowsOffset Number of rows in model to skip from rendering
     * @param {Number} blockSize  Target block size
     */
    constructor(rows: number, cols: number, rowsOffset: number, blockSize: number) {
        super();
        
        this.rows = rows;
        this.cols = cols;
        this.rowsOffset = rowsOffset;
        this.blockSize = blockSize;
        
        // Load textures from the loaded sprite sheet
        this.textures = PIXI.Assets.get('blocks')?.textures || {};        
        this.sprites = [];
        
        for (let i = 0; i < this.rows; ++i) {
            let row: SpriteWithBlockColor[] = [];
            for (let j = 0; j < this.cols; ++j) {
                let spr = new PIXI.Sprite(this.textures['background']) as SpriteWithBlockColor;
                row.push(spr);
                spr.x = j * this.blockSize;
                spr.y = i * this.blockSize;
                spr.blockColor = null;
                this.addChild(spr);
            }
            this.sprites.push(row);
        }
    }
    
    updateColor(row: number, col: number, color: string | false | null): void {
        if(row < 0) return;
        let sprite = this.sprites[row][col];
        const colorString = color ? color : null;
        if (sprite.blockColor != colorString) {
            sprite.blockColor = colorString;
            sprite.texture = (colorString && this.textures[colorString]) ? this.textures[colorString] : this.textures['background'];
        }
    }
    
    updateFromBoard(board: Board): void {
        for (let i = 0; i < this.rows; ++i) {
            for (let j = 0; j < this.cols; ++j) {
                this.updateColor(i, j, board.get(i + this.rowsOffset, j));
            }
        }
    }
    
    updateFromTetromino(tetromino: Tetromino | null): void {
        if (tetromino) {
            tetromino.absolutePos().forEach(pos => {
                this.updateColor(pos[0] - this.rowsOffset, pos[1], tetromino.color);
            });
        }
    }
}