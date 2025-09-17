import { css, html, LitElement, unsafeCSS, type PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js"
import daisyCss from "../style.css?inline"
import { Application } from "pixi.js";
import type { ShapeType } from "../play/TetronimoSpawner";
import { $next } from "../store/queue";

@customElement("next-piece")
export class Next extends LitElement {
    static styles = css`${unsafeCSS(daisyCss)}`;

    app = new Application();

    next: ShapeType | undefined = undefined

    render() {
        return html`
<p>Next</p>
<div class="avatar">
  <div class="w-24 rounded">
    <canvas width=24 height=24></canvas>
  </div>
</div>
        `
    }

    unsubscribe?: () => void;

    connectedCallback(): void {
        super.connectedCallback();
        this.unsubscribe = $next.subscribe(next => this.next = next)
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
    }
}