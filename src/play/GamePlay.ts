import config from '../config';
import State from '../utils/State';
import Board from './Board';
import Renderer from './Renderer';
import TetronimoSpawner from './TetronimoSpawner';
import Tetromino from './Tetromino';
import Game from '../Game';
import { $score, $lines, $scorePlayer, $linesPlayer, $scoreAI, $linesAI, $turn } from '../store/score';
import { $next } from '../store/queue';

interface GamePlayOptions {
    restart?: boolean;
    keepVisible?: boolean;
    [key: string]: any;
}

/**
 * GamePlay state provides main game logic
 */
export default class GamePlay extends State {
    game: Game;
    board: Board | null;
    spawner: TetronimoSpawner | null;
    tetromino: Tetromino | null;
    renderer: Renderer;
    
    // Game timing variables
    tetrominoFallSpeed!: number;
    tetrominoFallSpeedMin!: number;
    tetrominoFallSpeedupStep!: number;
    tetrominoFallSpeedupDelay!: number;
    tetrominoDropModifier!: number;
    tetrominoFallTimer!: number;
    tetrominoFallSpeedupTimer!: number;
    
    // Game state variables
    rowsCleared!: number;
    score!: number;

    constructor(game: Game) {
        super();
        
        this.game = game;
        
        this.board = null;
        this.spawner = null;
        this.tetromino = null;
        
        this.renderer = new Renderer(config.game.rows, config.game.cols, config.game.hiddenRows, config.display.blockSize);
        this.addChild(this.renderer);
    }
    
    /**
     * Reset game
     */
    enter(opts?: GamePlayOptions): void {
        if (opts?.restart || this.board == null) {
            this.board = new Board(config.game.rows + config.game.hiddenRows, config.game.cols);
            this.spawner = new TetronimoSpawner();

            this.tetromino = null;
            this.tetrominoFallSpeed = config.game.fallSpeed;
            this.tetrominoFallSpeedMin = config.game.fallSpeedMin;
            this.tetrominoFallSpeedupStep = config.game.fallSpeedupStep;
            this.tetrominoFallSpeedupDelay = config.game.fallSpeedupDelay;
            this.tetrominoDropModifier = config.game.dropModifier;

            this.tetrominoFallTimer = this.tetrominoFallSpeed;
            this.tetrominoFallSpeedupTimer = this.tetrominoFallSpeedupDelay;

            this.rowsCleared = 0;
            this.score = 0;
            
            // Reset score store
            $score.set(0);
            $lines.set(0);
            $scorePlayer.set(0);
            $linesPlayer.set(0);
            $scoreAI.set(0);
            $linesAI.set(0);
            $turn.set(1);
            if (this.board) {
                console.log('Turn', 1, 'grid:', this.board.grid);
            }

            this.spawnTetromino();
        }
    }
    
    /**
     * Main update funcion
     * @param {Number} dt pixi timer deltaTime
     */
    update(_dt?: number): void {
        if (this.game.key.escape.trigger() || this.game.key.space.trigger()) {
            this.game.setState('pause', {
                keepVisible: true,
                score:{
                    points: this.score,
                    lines: this.rowsCleared
                }});
        }
        
        if (this.tetromino) {
            this.updateTetromino();
        }
        
        if (this.board) {
            this.renderer.updateFromBoard(this.board);
        }
        this.renderer.updateFromTetromino(this.tetromino);
    }
    
    /**
     * Spawn new active tetromino and test for end game condition
     */
    spawnTetromino(): void {
        if (!this.spawner || !this.board) return;
        
        this.tetromino = this.spawner.spawn();
        this.tetromino.row = 0;
        this.tetromino.col = this.board.cols / 2 - 2;
        
        if (this.board.collides(this.tetromino.absolutePos(0, 0))) {
            this.lockTetromino();
            this.gameOver();
        }
    }
    
    /**
     * merge active tetromino with board
     */
    lockTetromino(): void {
        if (!this.tetromino || !this.board) return;
        let fullRows = this.board.setAll(this.tetromino.absolutePos(), this.tetromino.color);
        this.tetromino = null;
        
        if (fullRows.length > 0) {
            this.updateScore(fullRows.length);
            this.board.cleanRows(fullRows);
        }

        // Advance turn after locking a piece (regardless of cleared rows)
        const nextTurn = $turn.get() + 1;
        $turn.set(nextTurn);

        if (this.board) {
            console.log('Turn', nextTurn, 'grid:', this.board.getHeightsSum());
            const nextTetromino = new Tetromino($next.get()!);
            console.log('Next Tetromino', nextTetromino);
            const nextClearedRowstSum = this.board.getPlacementEvaluationMap(nextTetromino);
            console.log('Next Tetromino Height Sum', nextClearedRowstSum);
        }
    }
    
    /**
     * handle game ending
     */
    gameOver(): void {
        this.game.scores.add(this.rowsCleared, this.score);
        this.game.setState('gameover', {keepVisible: true});
    }
    
    /**
     * Update terominos falling and handle user input
     */
    updateTetromino(): void {
        if (!this.tetromino || !this.board) return;
        
        if (this.game.key.up.trigger()) {
            if (!this.board.collides(this.tetromino.absolutePos(0, 0, true))) {
                this.tetromino.rotate();
            } else if (!this.board.collides(this.tetromino.absolutePos(0, -1, true))) {
                --this.tetromino.col;
                this.tetromino.rotate();
            } else if (!this.board.collides(this.tetromino.absolutePos(0, 1, true))) {
                ++this.tetromino.col;
                this.tetromino.rotate();
            }
        }
        
        if (this.game.key.left.trigger() && !this.board.collides(this.tetromino.absolutePos(0, -1))) {
            --this.tetromino.col;
        }
        if (this.game.key.right.trigger() && !this.board.collides(this.tetromino.absolutePos(0, 1))) {
            ++this.tetromino.col;
        }
         
        let tickMod = this.game.key.down.pressed ? this.tetrominoDropModifier : 1;
        if ((--this.tetrominoFallSpeedupTimer) <= 0) {
            this.tetrominoFallSpeed = Math.max(this.tetrominoFallSpeedMin, this.tetrominoFallSpeed - this.tetrominoFallSpeedupStep);
            this.tetrominoFallSpeedupTimer = this.tetrominoFallSpeedupDelay;
            console.log('speed: ', this.tetrominoFallSpeed);
        }
        if ((this.tetrominoFallTimer -= tickMod) <= 0) {
            if (this.board.collides(this.tetromino.absolutePos(1, 0))) {
                this.lockTetromino();
                this.spawnTetromino();
            } else {
                ++this.tetromino.row;
                this.tetrominoFallTimer = this.tetrominoFallSpeed;
            }
        }
    }
    
    /**
     * Update score based on number of cleared rows
     * @param {Number} rows count of rows cleared in one move
     */
    updateScore(rows: number): void {
        // Determine actor by current turn before it advances
        const turn = $turn.get();
        const isPlayerTurn = (turn % 2) === 1;

        // Points for this clear
        const points = this.getPointsForRows(rows);

        // Update per-actor stores
        if (isPlayerTurn) {
            const newPlayerScore = $scorePlayer.get() + points;
            const newPlayerLines = $linesPlayer.get() + rows;
            $scorePlayer.set(newPlayerScore);
            $linesPlayer.set(newPlayerLines);
        } else {
            const newAIScore = $scoreAI.get() + points;
            const newAILines = $linesAI.get() + rows;
            $scoreAI.set(newAIScore);
            $linesAI.set(newAILines);
        }

        // Update aggregated totals maintained by this state for menus and legacy UI
        this.rowsCleared += rows;
        this.score += points;
        $score.set(this.score);
        $lines.set(this.rowsCleared);
    }
    
    /**
     * Get points for clearing specific number of rows
     * @param {Number} rows count of rows cleared
     * @returns {Number} points awarded
     */
    private getPointsForRows(rows: number): number {
        switch (rows) {
            case 1: return 100;  // Single
            case 2: return 300;  // Double
            case 3: return 500;  // Triple
            case 4: return 800;  // Tetris
            default: return 0;
        }
    }
}
