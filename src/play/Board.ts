
type Position = [number, number];
type BlockValue = string | false;
import Tetromino from './Tetromino';

/**
 * Tetris grid model
 */
export default class Board {
    rows: number;
    cols: number;
    grid: BlockValue[][];

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.grid = [];
        
        for (let i = 0; i < this.rows; ++i) {
            let row: BlockValue[] = [];
            for (let j = 0; j < this.cols; ++j) {
                row.push(false);
            }
            this.grid.push(row);
        }
    }
    
    /**
     * Test if any provided position is not empty
     * @param   {Array} positions list of positions in form [row, col]
     * @returns {boolean}  collision status
     */
    collides(positions: Position[]): boolean {
        let row: number, col: number;
        for(let i = 0; i < positions.length; ++i) {
            row = positions[i][0];
            col = positions[i][1];
            if (row < 0 || row >= this.rows ||
                col < 0 || col >= this.cols ||
                this.grid[row][col]) {
                
                return true;
            }
        }
        return false;
    }
    
    /**
     * Test if row is full
     * @param   {Number} row tested row
     * @returns {boolean} test result
     */
    isFull(row: number): boolean {
        return this.grid[row].every(cell => !!cell);
    }
    
    /**
     * Set provided value in board grid for each given position.
     * Additionally, for each changed row, test if its full.
     * @param   {Array} positions list of positions in form [row, col]
     * @param   {Object} val value to set, like block colour name
     * @returns {Array} list of full rows
     */
    setAll(positions: Position[], val: string): number[] {
        let i: number;
        let rowsToCheck = new Set<number>();
        for(i=0; i < positions.length; ++i) {
            this.grid[positions[i][0]][positions[i][1]] = val;
            rowsToCheck.add(positions[i][0]);
        }
        return Array.from(rowsToCheck).filter(this.isFull, this);
    }
    
    /**
     * Clear full rows and move remaining blocks down.
     * @param {Array} rows indexes to clear
     */
    cleanRows(rows: number[]): void {
        rows.sort((a,b) => a - b);
        let emptyRows: BlockValue[][] = [];
        for (let i = rows.length - 1; i >= 0; --i) {
            this.grid.splice(rows[i], 1);
            let row: BlockValue[] = [];
            for (let j = 0; j < this.cols; ++j) {
                row.push(false);
            }
            emptyRows.push(row);
        }
        Array.prototype.unshift.apply(this.grid, emptyRows);
    }
    
    set(row: number, col: number, val: string): number[] {
        this.grid[row][col] = val;
        return (this.isFull(row)) ? [row] : [];
    }
    
    get(row: number, col: number): BlockValue | null {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.grid[row][col];
        } else {
            return null;
        }
    }

    /**
     * Compute the height of a single column measured from the top of the board
     * down to the highest filled cell. Empty columns have height 0.
     * @param {number} col column index
     * @returns {number} height of the column
     */
    getColumnHeight(col: number): number {
        if (col < 0 || col >= this.cols) return 0;
        for (let row = 0; row < this.rows; ++row) {
            if (this.grid[row][col]) {
                return this.rows - row;
            }
        }
        return 0;
    }

    /**
     * Get heights for all columns from left to right.
     * @returns {number[]} array of column heights
     */
    getHeights(): number[] {
        const heights: number[] = [];
        for (let col = 0; col < this.cols; ++col) {
            heights.push(this.getColumnHeight(col));
        }
        return heights;
    }

    /**
     * Sum of all column heights.
     * @returns {number} sum of heights
     */
    getHeightsSum(): number {
        let sum = 0;
        for (let col = 0; col < this.cols; ++col) {
            sum += this.getColumnHeight(col);
        }
        return sum;
    }

    /**
     * Compute the sum of column heights if a given tetromino were dropped
     * from the specified starting column using its current rotation. This
     * does not mutate the board or the tetromino.
     * Returns Infinity if the tetromino cannot be placed at that column.
     * @param {Tetromino} tetromino tetromino with current rotation
     * @param {number} startCol target left-top column for the tetromino
     * @returns {number} heights sum after virtual placement
     */
    getHeightsSumIfDropped(tetromino: Tetromino, startCol: number): number {
        // Compute horizontal shift so that tetromino's top-left is at startCol
        const colShift = startCol - tetromino.col;
        let rowShift = 0;

        // If initial placement is already invalid, bail out
        if (this.collides(tetromino.absolutePos(rowShift, colShift))) {
            return Number.POSITIVE_INFINITY;
        }

        // Drop until the next step would collide
        while (!this.collides(tetromino.absolutePos(rowShift + 1, colShift))) {
            ++rowShift;
        }

        // Compute virtual occupied cells for final placement
        const placed = tetromino.absolutePos(rowShift, colShift);
        const virtual = new Set<string>();
        for (let i = 0; i < placed.length; ++i) {
            virtual.add(placed[i][0] + ',' + placed[i][1]);
        }

        // Helper to compute a column height considering virtual blocks
        const heightWithVirtual = (col: number): number => {
            for (let row = 0; row < this.rows; ++row) {
                if (this.grid[row][col] || virtual.has(row + ',' + col)) {
                    return this.rows - row;
                }
            }
            return 0;
        };

        // Sum heights across all columns
        let sum = 0;
        for (let col = 0; col < this.cols; ++col) {
            sum += heightWithVirtual(col);
        }
        return sum;
    }

    /**
     * Compute how many rows would be cleared if the given tetromino were
     * dropped from the specified starting column using its current rotation.
     * This does not mutate the board or the tetromino.
     * Returns -1 if the tetromino cannot be placed at that column.
     * @param {Tetromino} tetromino tetromino with current rotation
     * @param {number} startCol target left-top column for the tetromino
     * @returns {number} number of rows that would be cleared
     */
    getClearedRowsCountIfDropped(tetromino: Tetromino, startCol: number): number {
        const colShift = startCol - tetromino.col;
        let rowShift = 0;

        // If initial placement is already invalid, bail out
        if (this.collides(tetromino.absolutePos(rowShift, colShift))) {
            return -1;
        }

        // Drop until the next step would collide
        while (!this.collides(tetromino.absolutePos(rowShift + 1, colShift))) {
            ++rowShift;
        }

        // Compute virtual occupied cells for final placement
        const placed = tetromino.absolutePos(rowShift, colShift);
        const virtual = new Set<string>();
        for (let i = 0; i < placed.length; ++i) {
            virtual.add(placed[i][0] + ',' + placed[i][1]);
        }

        // Count rows that become full considering virtual cells
        let cleared = 0;
        for (let row = 0; row < this.rows; ++row) {
            let full = true;
            for (let col = 0; col < this.cols; ++col) {
                if (!this.grid[row][col] && !virtual.has(row + ',' + col)) {
                    full = false;
                    break;
                }
            }
            if (full) ++cleared;
        }
        return cleared;
    }
}
