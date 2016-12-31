import Phaser from 'phaser';

class GameOver extends Phaser.State {
  init() {
    // set game config variable data from game cache
    this.Config = this.game.cache.getJSON('config');
  }

  create() {
    //let textStyle = {font: '50px Roboto', align: 'center', fill: '#77BFA3'};

    let title = this.game.add.text(this.game.world.centerX, this.game.world.centerY - 100, 'GAME OVER', this.Config.fontAssets.gameoverFontStyle);
    title.anchor.set(0.5);

    this.Config.fontAssets.gameoverFontStyle.fontSize = 30;

    let instructions = this.game.add.text(this.game.world.centerX, this.game.world.centerY, '"s" key to play again', this.Config.fontAssets.gameoverFontStyle);
    instructions.anchor.set(0.5);

    let sKey = this.game.input.keyboard.addKey(Phaser.KeyCode.S);
    sKey.onDown.addOnce(() => this.game.state.start('Play'));
  }
}

export default GameOver;
