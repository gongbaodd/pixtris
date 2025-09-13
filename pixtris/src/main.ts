import "./style.css";

import { Application, Assets } from 'pixi.js';
import config from './config';
import Game from "./Game";

setup();

async function setup(): Promise<void> {
  // create PIXI application
  let app = new Application();
  await app.init({
    width: config.display.width,
    height: config.display.height
  });
  document.body.appendChild(app.canvas);

  await Assets.load('blocks');
  await Assets.load('sprites.json');
  let game = new Game(app);
  game.run();
}