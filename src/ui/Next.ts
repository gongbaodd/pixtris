import { css, html, LitElement, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js"
import daisyCss from "../style.css?inline"

@customElement("next-piece")
export class Next extends LitElement {
    static styles = css`${unsafeCSS(daisyCss)}`;
    render() {
        return html`
<div class="avatar">
  <div class="w-24 rounded">
    <img src="https://img.daisyui.com/images/profile/demo/batperson@192.webp" />
  </div>
</div>
        `
    }
}