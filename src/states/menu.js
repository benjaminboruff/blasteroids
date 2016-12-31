import Phaser from 'phaser';

class Menu extends Phaser.State {
    init() {
      // set game config variable data from game cache
      this.Config = this.game.cache.getJSON('config');
    }
    create() {

        let startInstructions = 'Click to Start Game :\n\nUP arrow key for thrust.\n\nLEFT and RIGHT arrow keys to turn.\n\nSPACE key to fire.';

        this.tf_start = this.game.add.text(this.game.world.centerX, this.game.world.centerY, startInstructions, this.Config.fontAssets.menuFontStyle);
        this.tf_start.align = 'center';
        this.tf_start.anchor.set(0.5);

        this.game.input.onDown.addOnce(this.startGame, this);
    }

    startGame() {
        this.game.state.start('Play');
    }
}

export default Menu;
