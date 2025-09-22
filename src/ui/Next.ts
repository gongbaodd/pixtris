import { css, html, LitElement, unsafeCSS, type PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js"
import daisyCss from "../style.css?inline"
import { Application } from "pixi.js";
import type { ShapeType } from "../play/TetronimoSpawner";
import { $next } from "../store/queue";
import { $score, $lines, $scorePlayer, $linesPlayer, $scoreAI, $linesAI, $turn } from "../store/score";
import Tetromino from "../play/Tetromino";

@customElement("next-piece")
export class Next extends LitElement {
    static styles = css`${unsafeCSS(daisyCss)}`;

    app = new Application();

    @state()
    next?: ShapeType

    @state()
    score: number = 0

    @state()
    lines: number = 0

    @state()
    scorePlayer: number = 0

    @state()
    linesPlayer: number = 0

    @state()
    scoreAI: number = 0

    @state()
    linesAI: number = 0

    @state()
    turn: number = 1

    render() {
        const next = this.next

        if (!next) return ""

        const tetromino = new Tetromino(next)

        console.log(tetromino)

        const isPlayerTurn = (this.turn % 2) === 1
        const playerHighlight = isPlayerTurn ? 'bg-primary/10 ring-1 ring-primary rounded-md' : ''
        const aiHighlight = !isPlayerTurn ? 'bg-secondary/10 ring-1 ring-secondary rounded-md' : ''
        return html`
<div class="space-y-4">
  <div>
    <p class="text-lg font-bold">Next</p>
    <p class="text-sm text-base-content/70">${this.next}</p>
  </div>
  
  <div class="avatar">
    <div class="w-24 rounded">
      <canvas width=24 height=24></canvas>
    </div>
  </div>
  
  <div class="stats shadow bg-base-200 rounded-lg">
    <div class="stat py-2 px-3 ${playerHighlight}">
      <div class="stat-title text-xs">Player Score</div>
      <div class="stat-value text-lg ${isPlayerTurn ? 'text-primary' : ''}">${this.scorePlayer.toLocaleString()}</div>
      <div class="stat-desc text-xs">Lines: ${this.linesPlayer}</div>
    </div>
    <div class="stat py-2 px-3 ${aiHighlight}">
      <div class="stat-title text-xs">AI Score</div>
      <div class="stat-value text-lg ${!isPlayerTurn ? 'text-secondary' : ''}">${this.scoreAI.toLocaleString()}</div>
      <div class="stat-desc text-xs">Lines: ${this.linesAI}</div>
    </div>
  </div>
  <div class="text-xs text-base-content/70">Turn: ${this.turn} • ${isPlayerTurn ? 'Player' : 'AI'}</div>
  
  <div class="text-xs space-y-1">
    <div class="flex justify-between">
      <span>1 Row:</span>
      <span class="font-bold">100 pts</span>
    </div>
    <div class="flex justify-between">
      <span>2 Rows:</span>
      <span class="font-bold">300 pts</span>
    </div>
    <div class="flex justify-between">
      <span>3 Rows:</span>
      <span class="font-bold">500 pts</span>
    </div>
    <div class="flex justify-between">
      <span>Tetris:</span>
      <span class="font-bold text-primary">800 pts</span>
    </div>
  </div>
</div>
        `
    }

    unsubscribe?: () => void;
    unsubscribeScore?: () => void;
    unsubscribeLines?: () => void;
    unsubscribeScorePlayer?: () => void;
    unsubscribeLinesPlayer?: () => void;
    unsubscribeScoreAI?: () => void;
    unsubscribeLinesAI?: () => void;
    unsubscribeTurn?: () => void;

    connectedCallback(): void {
        super.connectedCallback();
        this.unsubscribe = $next.subscribe(next => {
            this.next = next
        });
        this.unsubscribeScore = $score.subscribe(score => { this.score = score });
        this.unsubscribeLines = $lines.subscribe(lines => { this.lines = lines });
        this.unsubscribeScorePlayer = $scorePlayer.subscribe(score => { this.scorePlayer = score });
        this.unsubscribeLinesPlayer = $linesPlayer.subscribe(lines => { this.linesPlayer = lines });
        this.unsubscribeScoreAI = $scoreAI.subscribe(score => { this.scoreAI = score });
        this.unsubscribeLinesAI = $linesAI.subscribe(lines => { this.linesAI = lines });
        this.unsubscribeTurn = $turn.subscribe(turn => { this.turn = turn });
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        const canvas = this.renderRoot.querySelector("canvas") as HTMLCanvasElement;

        this.app.init({
            canvas,
            backgroundAlpha: 0,
            width: 96,
            height: 96,
        });
    }

    disconnectedCallback(): void {
        super.disconnectedCallback()

        this.app?.destroy(true, { children: true, texture: true })
        this.unsubscribe?.();
        this.unsubscribeScore?.();
        this.unsubscribeLines?.();
        this.unsubscribeScorePlayer?.();
        this.unsubscribeLinesPlayer?.();
        this.unsubscribeScoreAI?.();
        this.unsubscribeLinesAI?.();
        this.unsubscribeTurn?.();
    }
}