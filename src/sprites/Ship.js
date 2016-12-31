import Phaser from 'phaser'

class Ship extends Phaser.Sprite {

    constructor({ game, x, y, asset }) {
        super(game, x, y, asset);

        this.game = game;
        // set game config variable data from game cache
        this.Config = this.game.cache.getJSON('config');

        // ship play settings
        this.lives = this.Config.shipProperties.startingLives;

        // ship graphics settings
        this.anchor.set(0.65, 0.5);
        this.angle = -90;
        this.animations.add('thrust', [4, 3, 2, 1, 0], 6, true);
    }

}

export default Ship;
