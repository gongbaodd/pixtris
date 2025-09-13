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
  Assets.addBundle('gameBundle', {
    blocks: 'sprites.json'
  });

  // Load the assets
  await Assets.loadBundle('gameBundle');
  
  // Verify textures are loaded
  console.log('Loaded textures:', Assets.get('blocks')?.textures);
  let game = new Game(app);
  game.run();
}