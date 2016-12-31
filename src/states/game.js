import 'pixi';
import 'p2';
import Phaser from 'phaser';

import BootState from './boot';
import LoadState from './load';
import MenuState from './menu';
import PlayState from './play';
import GameOver from './gameover';

class Game extends Phaser.Game {

  constructor () {
    let width = '100%';
    let height = '100%';

    super(width, height, Phaser.AUTO, 'root', null)

    this.state.add('Boot', BootState, false);
    this.state.add('Load', LoadState, false);
    this.state.add('Menu', MenuState, false);
    this.state.add('Play', PlayState, false);
    this.state.add('GameOver', GameOver, false);

    this.state.start('Boot');
  }
}

export default Game;
