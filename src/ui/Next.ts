import { css, html, LitElement, unsafeCSS, type PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js"
import daisyCss from "../style.css?inline"
import { Application } from "pixi.js";
import type { ShapeType } from "../play/TetronimoSpawner";
import { $next } from "../store/queue";
import { $score, $lines } from "../store/score";
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

    render() {
        const next = this.next

        if (!next) return ""

        const tetromino = new Tetromino(next)

        console.log(tetromino)

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
    <div class="stat py-2 px-3">
      <div class="stat-title text-xs">Score</div>
      <div class="stat-value text-lg">${this.score.toLocaleString()}</div>
    </div>
    <div class="stat py-2 px-3">
      <div class="stat-title text-xs">Lines</div>
      <div class="stat-value text-lg">${this.lines}</div>
    </div>
  </div>
  
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

    connectedCallback(): void {
        super.connectedCallback();
        this.unsubscribe = $next.subscribe(next => {
            this.next = next
        });
        this.unsubscribeScore = $score.subscribe(score => {
            this.score = score
        });
        this.unsubscribeLines = $lines.subscribe(lines => {
            this.lines = lines
        });
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
    }
}