import Phaser from 'phaser'

class Ship extends Phaser.Sprite {

    constructor({ game, x, y, asset }) {
        super(game, x, y, asset);

        this.game = game;
        // set game config variable data from game cache
        this.Config = this.game.cache.getJSON('config');

        // ship play settings
        this.lives = this.Config.shipProperties.startingLives;
        this.invulnerable = false;
        this.visible = true;

        // ship physics settings
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.drag.set(this.Config.shipProperties.drag);
        this.body.maxVelocity.set(this.Config.shipProperties.maxVelocity);

        // ship sounds settings
        this.sound = {
            fire: this.Config.soundAssets.fire.name
        };

        // ship graphics settings
        this.anchor.set(0.65, 0.5);
        this.angle = -90;
        this.animations.add('thrust', [4, 3, 2, 1, 0], 6, true);
    }

    resetShip() {
        this.invulnerable = true;
        this.reset(this.Config.gameProperties.screenWidth / 2, this.Config.gameProperties.screenHeight / 2);
        this.angle = -90;

        this.game.time.events.add(Phaser.Timer.SECOND * this.Config.shipProperties.timeToReset, this.readyShip, this);
        this.game.time.events.repeat(Phaser.Timer.SECOND * this.Config.shipProperties.blinkDelay, this.Config.shipProperties.timeToReset / this.Config.shipProperties.blinkDelay, this.blinkShip, this);
    }

    readyShip() {
        this.invulnerable = false;
        this.visible = true;
    }

    blinkShip() {
        this.visible = !this.visible;
    }

    destroyShip() {
        this.lives--;

        if (this.lives > 0) {
            this.game.time.events.add(Phaser.Timer.SECOND * this.Config.shipProperties.timeToReset, this.resetShip, this);
        } else {
            this.game.time.events.add(Phaser.Timer.SECOND * this.Config.shipProperties.timeToReset, this.endGame, this);
        }
    }

    moveShip(direction) {
      if(direction === 'left') {
        this.body.angularVelocity = -this.Config.shipProperties.angularVelocity;
      } else if(direction === 'right') {
        this.body.angularVelocity = this.Config.shipProperties.angularVelocity;
      } else {
        this.body.angularVelocity = 0;
      }
    }

    thrustShip(toggle) {
      if(toggle === 'on') {
        this.game.physics.arcade.accelerationFromRotation(this.rotation, this.Config.shipProperties.acceleration, this.body.acceleration);
        this.animations.play('thrust');
      } else {
        this.body.acceleration.set(0);
        this.animations.stop();
        this.frame = 0;
      }
    }

    endGame() {
        this.game.state.start('GameOver');
    }

}

export default Ship;
