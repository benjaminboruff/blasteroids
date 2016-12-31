import Phaser from 'phaser';
import Config from '../game.config.json';

class Menu extends Phaser.State {
    create() {
        let startInstructions = 'Click to Start Game :\n\nUP arrow key for thrust.\n\nLEFT and RIGHT arrow keys to turn.\n\nSPACE key to fire.';

        this.tf_start = this.game.add.text(this.game.world.centerX, this.game.world.centerY, startInstructions, Config.fontAssets.menuFontStyle);
        this.tf_start.align = 'center';
        this.tf_start.anchor.set(0.5);

        this.game.input.onDown.addOnce(this.startGame, this);
    }

    startGame () {
        this.game.state.start('Play');
    }
}

export default Menu;
