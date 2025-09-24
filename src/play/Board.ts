
type Position = [number, number];
type BlockValue = string | false;
type Branch = Map<number, Map<number, number | Branch>>;
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
     * Place one or more tetromino specs virtually and return the set of occupied cells.
     * If any placement is invalid, returns { invalid: true }.
     */
    private computeVirtualPlacement(specs: { tetromino: Tetromino, startCol: number }[]): { virtual: Set<string>, invalid: boolean } {
        const virtual = new Set<string>();
        for (let s = 0; s < specs.length; ++s) {
            const { tetromino, startCol } = specs[s];
            const colShift = startCol - tetromino.col;
            let rowShift = 0;

            // Collision check against base grid and current virtual cells
            const collidesWithVirtual = (positions: Position[]): boolean => {
                for (let i = 0; i < positions.length; ++i) {
                    const r = positions[i][0];
                    const c = positions[i][1];
                    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return true;
                    if (this.grid[r][c]) return true;
                    if (virtual.has(r + ',' + c)) return true;
                }
                return false;
            };

            if (collidesWithVirtual(tetromino.absolutePos(rowShift, colShift))) {
                return { virtual, invalid: true };
            }

            while (!collidesWithVirtual(tetromino.absolutePos(rowShift + 1, colShift))) {
                ++rowShift;
            }

            const placed = tetromino.absolutePos(rowShift, colShift);
            for (let i = 0; i < placed.length; ++i) {
                virtual.add(placed[i][0] + ',' + placed[i][1]);
            }
        }
        return { virtual, invalid: false };
    }

    /**
     * Compute the sum of column heights if the given tetromino specs were dropped sequentially.
     * Returns Infinity if any placement is invalid.
     * @param specs Array of {tetromino, startCol}
     */
    getHeightsSumIfDropped(specs: { tetromino: Tetromino, startCol: number }[]): number {
        const { virtual, invalid } = this.computeVirtualPlacement(specs);
        if (invalid) return Number.POSITIVE_INFINITY;

        const heightWithVirtual = (col: number): number => {
            for (let row = 0; row < this.rows; ++row) {
                if (this.grid[row][col] || virtual.has(row + ',' + col)) {
                    return this.rows - row;
                }
            }
            return 0;
        };

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
    getClearedRowsCountIfDropped(specs: { tetromino: Tetromino, startCol: number }[]): number {
        const { virtual, invalid } = this.computeVirtualPlacement(specs);
        if (invalid) return -1;

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

	    /**
	     * Compute how many holes would exist if the given tetromino were dropped
	     * from the specified starting column using its current rotation. A hole is
	     * an empty cell that has at least one filled cell above it in the same column.
	     * This does not mutate the board or the tetromino.
	     * Returns -1 if the tetromino cannot be placed at that column.
	     * @param {Tetromino} tetromino tetromino with current rotation
	     * @param {number} startCol target left-top column for the tetromino
	     * @returns {number} number of holes after virtual placement
	     */
	    getHolesCountIfDropped(specs: { tetromino: Tetromino, startCol: number }[]): number {
	        const { virtual, invalid } = this.computeVirtualPlacement(specs);
	        if (invalid) return -1;

	        let holes = 0;
	        for (let col = 0; col < this.cols; ++col) {
	            let seenFilledAbove = false;
	            for (let row = 0; row < this.rows; ++row) {
	                const occupied = !!this.grid[row][col] || virtual.has(row + ',' + col);
	                if (occupied) {
	                    seenFilledAbove = true;
	                } else if (seenFilledAbove) {
	                    ++holes;
	                }
	            }
	        }
	        return holes;
	    }
		
		/**
		 * Compute the sum of absolute differences between adjacent column heights
		 * if the given tetromino were dropped from the specified starting column
		 * using its current rotation. This does not mutate the board or the tetromino.
		 * Returns -1 if the tetromino cannot be placed at that column.
		 * The value computed is: sum(|h0 - h1| + |h1 - h2| + ... + |h(n-2) - h(n-1)|)
		 * where hX are the column heights after the virtual placement.
		 * @param {Tetromino} tetromino tetromino with current rotation
		 * @param {number} startCol target left-top column for the tetromino
		 * @returns {number} sum of adjacent column height differences
		 */
		getAdjacentHeightDiffSumIfDropped(specs: { tetromino: Tetromino, startCol: number }[]): number {
			const { virtual, invalid } = this.computeVirtualPlacement(specs);
			if (invalid) return -1;

			const heightWithVirtual = (col: number): number => {
				for (let row = 0; row < this.rows; ++row) {
					if (this.grid[row][col] || virtual.has(row + ',' + col)) {
						return this.rows - row;
					}
				}
				return 0;
			};

			let sum = 0;
			let prevHeight = heightWithVirtual(0);
			for (let col = 1; col < this.cols; ++col) {
				const h = heightWithVirtual(col);
				sum += Math.abs(prevHeight - h);
				prevHeight = h;
			}
			return sum;
		}

	/**
	 * Build an evaluation map for all columns and rotations for a given tetromino.
	 * The returned Map has keys as column indices. Each value is a Map whose keys
	 * are rotation indices (0..3) and values are the evaluation score computed as:
	 *   -0.510066 * getHeightsSumIfDropped
	 * +  0.760666 * getClearedRowsCountIfDropped
	 * + -0.35663  * getHolesCountIfDropped
	 * + -0.184483 * getAdjacentHeightDiffSumIfDropped
	 * Invalid placements are scored as Number.NEGATIVE_INFINITY.
	 *
	 * This method does not mutate the provided tetromino or the board.
    */
    getPlacementEvaluationMap(tetrominoes: Tetromino[]): Branch {
        const evaluateSpecs = (specs: { tetromino: Tetromino, startCol: number }[]): number => {
            const heightsSum = this.getHeightsSumIfDropped(specs);
            const cleared = this.getClearedRowsCountIfDropped(specs);
            const holes = this.getHolesCountIfDropped(specs);
            const adjDiff = this.getAdjacentHeightDiffSumIfDropped(specs);

            if (!isFinite(heightsSum) || cleared < 0 || holes < 0 || adjDiff < 0) {
                return Number.NEGATIVE_INFINITY;
            }
            return (-0.510066 * heightsSum)
                + (0.760666 * cleared)
                + (-0.35663 * holes)
                + (-0.184483 * adjDiff);
        };

        const buildBranch = (index: number, placed: { tetromino: Tetromino, startCol: number }[]): Branch => {
            const branch: Branch = new Map<number, Map<number, number | Branch>>();
            for (let col = 0; col < this.cols; ++col) {
                const rotationMap = new Map<number, number | Branch>();
                for (let rot = 0; rot < 4; ++rot) {
                    const base = tetrominoes[index];
                    const t = new Tetromino(base.shapeType);
                    t.row = 0;
                    t.col = 0;
                    for (let r = 0; r < rot; ++r) t.rotate();

                    const nextPlaced = placed.concat({ tetromino: t, startCol: col });
                    if (index === tetrominoes.length - 1) {
                        rotationMap.set(rot, evaluateSpecs(nextPlaced));
                    } else {
                        rotationMap.set(rot, buildBranch(index + 1, nextPlaced));
                    }
                }
                branch.set(col, rotationMap);
            }
            return branch;
        };

        return buildBranch(0, []);
    }

	/**
	 * Find the best move route using a minimax strategy over the placement evaluation tree.
	 * Strategy for two pieces (generalizes to N):
	 *  - For each of our possible moves (col, rot), assume the opponent picks the
	 *    child that maximizes the score.
	 *  - We then pick the move that minimizes that opponent-best score.
	 *
	 * Concretely for depth=2 as in the example:
	 *  - Compute max(A1, A2) and max(B1, B2), then choose the smaller of those two.
	 *
	 * Returns the chosen route as a list of [startColumn, rotation] for each depth.
	 */
	findBestMove(tetrominoes: Tetromino[]): [number, number][] {
		const root: Branch = this.getPlacementEvaluationMap(tetrominoes);

		type RouteResult = { score: number, route: [number, number][] };

		const isNumber = (v: number | Branch): v is number => typeof v === 'number';

		const minimax = (node: Branch, isMinimizing: boolean): RouteResult => {
			let best: RouteResult | null = null;
			for (const [col, rotMap] of node) {
				for (const [rot, child] of rotMap) {
					let result: RouteResult;
					if (isNumber(child)) {
						result = { score: child, route: [] };
					} else {
						result = minimax(child, !isMinimizing);
					}
					// Prepend current move to child route
					const candidate: RouteResult = {
						score: result.score,
						route: [[col, rot] as [number, number]].concat(result.route)
					};

					if (best === null) {
						best = candidate;
					} else if (isMinimizing) {
						if (candidate.score < best.score) best = candidate;
					} else {
						if (candidate.score > best.score) best = candidate;
					}
				}
			}
			// Fallback if no children (should not happen): neutral score
			return best ?? { score: Number.NEGATIVE_INFINITY, route: [] };
		};

        const result = minimax(root, true);
        console.log('Result', result);
		return result.route;
	}
}
