/* globals __DEV__ */
import Phaser from 'phaser';
import Ship from '../sprites/Ship';

// This is where all the game play code goes.
class Play extends Phaser.State {
    init() {
        // set game config variable data from game cache
        this.Config = this.game.cache.getJSON('config');

        this.Config.gameProperties.screenWidth = this.game.world.width;
        this.Config.gameProperties.screenHeight = this.game.world.height;
        this.Config.shipProperties.startX = this.Config.gameProperties.screenWidth * 0.5;
        this.Config.shipProperties.startY = this.Config.gameProperties.screenHeight * 0.5;
        this.Config.asteroidProperties.asteroidLarge.nextSize = this.Config.graphicAssets.asteroidMedium.name;
        this.Config.asteroidProperties.asteroidMedium.nextSize = this.Config.graphicAssets.asteroidSmall.name;

        this.bulletInterval = 0;
        this.score = 0;
        this.asteroidsCount = this.Config.asteroidProperties.startingAsteroids;

        // start physics system
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
    }
    preload() {}

    create() {
        this.initGraphics();
        this.initSounds();
        this.initPhysics();
        this.initKeyboard();
        this.resetAsteroids();
    }

    initGraphics() {
        this.backgroundSprite = this.game.add.sprite(0, 0, this.Config.graphicAssets.background.name);
        this.backgroundSprite.width = this.Config.gameProperties.screenWidth;
        this.backgroundSprite.height = this.Config.gameProperties.screenHeight;

        this.ship = new Ship({
            game: this.game,
            x: this.game.world.centerX,
            y: this.game.world.centerY,
            asset: this.Config.graphicAssets.shipsheet.name
        });
        this.game.add.existing(this.ship);

        this.bulletGroup = this.game.add.group();
        this.asteroidGroup = this.game.add.group();

        this.tf_lives = this.game.add.text(20, 10, this.ship.lives, this.Config.fontAssets.playFontStyle);

        this.tf_score = this.game.add.text(this.Config.gameProperties.screenWidth - 50, 10, "0", this.Config.fontAssets.playFontStyle);
        this.tf_score.align = 'right';
        this.tf_score.anchor.set(1, 0);

        this.explosionLargeGroup = this.makeExplosionGroup(this.game, 'large');
        this.explosionMediumGroup = this.makeExplosionGroup(this.game, 'medium');
        this.explosionSmallGroup = this.makeExplosionGroup(this.game, 'small');
    }

    initSounds() {
        this.sndDestroyed = this.game.add.audio(this.Config.soundAssets.destroyed.name);
        this.sndFire = this.game.add.audio(this.ship.sound.fire);
    }

    initPhysics() {
        this.bulletGroup.enableBody = true;
        this.bulletGroup.physicsBodyType = Phaser.Physics.ARCADE;
        this.bulletGroup.createMultiple(this.Config.bulletProperties.maxCount, this.Config.graphicAssets.bullet.name);
        this.bulletGroup.setAll('anchor.x', 0.5);
        this.bulletGroup.setAll('anchor.y', 0.5);
        this.bulletGroup.setAll('lifespan', this.Config.bulletProperties.lifespan);

        this.asteroidGroup.enableBody = true;
        this.asteroidGroup.physicsBodyType = Phaser.Physics.ARCADE;
    }

    initKeyboard() {
        this.key_left = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.key_right = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.key_thrust = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.key_fire = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    }

    makeExplosionGroup(game, size) {
      let group = game.add.group();
      let explosionName = "";

      if(size === 'large') {
        explosionName = this.Config.graphicAssets.explosionLarge.name;
      } else if(size === 'medium') {
        explosionName = this.Config.graphicAssets.explosionMedium.name;
      } else {
        explosionName = this.Config.graphicAssets.explosionSmall.name;
      }

      group.createMultiple(20, explosionName, 0);
      group.setAll('anchor.x', 0.5);
      group.setAll('anchor.y', 0.5);
      group.callAll('animations.add', 'animations', 'explode', null, 30);

      return group;
    }

    checkPlayerInput() {
        if (this.key_left.isDown) {
            this.ship.moveShip('left');
        } else if (this.key_right.isDown) {
            this.ship.moveShip('right');
        } else {
            this.ship.moveShip('stop');
        }

        if (this.key_thrust.isDown) {
          this.ship.thrustShip('on');
        } else {
          this.ship.thrustShip('off');
        }

        if (this.key_fire.isDown) {
            this.fire();
        }
    }

    checkBoundaries(sprite) {
        if (sprite.x + this.Config.gameProperties.padding < 0) {
            sprite.x = this.Config.gameProperties.screenWidth + this.Config.gameProperties.padding;
        } else if (sprite.x - this.Config.gameProperties.padding > this.Config.gameProperties.screenWidth) {
            sprite.x = -this.Config.gameProperties.padding;
        }

        if (sprite.y + this.Config.gameProperties.padding < 0) {
            sprite.y = this.Config.gameProperties.screenHeight + this.Config.gameProperties.padding;
        } else if (sprite.y - this.Config.gameProperties.padding > this.Config.gameProperties.screenHeight) {
            sprite.y = -this.Config.gameProperties.padding;
        }
    }

    fire() {
        if (this.game.time.now > this.bulletInterval && this.ship.alive) {
            this.sndFire.play();

            let bullet = this.bulletGroup.getFirstExists(false);

            if (bullet) {
                let length = this.ship.width * 0.5;
                let x = this.ship.x + (Math.cos(this.ship.rotation) * length);
                let y = this.ship.y + (Math.sin(this.ship.rotation) * length);

                bullet.reset(x, y);
                bullet.lifespan = this.Config.bulletProperties.lifespan;
                bullet.rotation = this.ship.rotation;

                this.game.physics.arcade.velocityFromRotation(this.ship.rotation, this.Config.bulletProperties.speed, bullet.body.velocity);
                this.bulletInterval = this.game.time.now + this.Config.bulletProperties.interval;
            }
        }
    }

    createAsteroid(x, y, size, pieces) {
        if (pieces === undefined) {
            pieces = 1;
        }

        for (let i = 0; i < pieces; i++) {
            let asteroid = this.asteroidGroup.create(x, y, size);
            asteroid.anchor.set(0.5);
            asteroid.body.angularVelocity = this.game.rnd.integerInRange(this.Config.asteroidProperties[size].minAngularVelocity, this.Config.asteroidProperties[size].maxAngularVelocity);

            let randomAngle = this.game.math.degToRad(this.game.rnd.angle());
            let randomVelocity = this.game.rnd.integerInRange(this.Config.asteroidProperties[size].minVelocity, this.Config.asteroidProperties[size].maxVelocity);

            this.game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, asteroid.body.velocity);
        }
    }

    resetAsteroids() {
        for (let i = 0; i < this.asteroidsCount; i++) {
            let side = Math.round(Math.random());
            let x = 0;
            let y = 1;

            if (side) {
                x = Math.round(Math.random()) * this.Config.gameProperties.screenWidth;
                y = Math.random() * this.Config.gameProperties.screenHeight;
            } else {
                x = Math.random() * this.Config.gameProperties.screenWidth;
                y = Math.round(Math.random()) * this.Config.gameProperties.screenHeight;
            }

            this.createAsteroid(x, y, this.Config.graphicAssets.asteroidLarge.name);
        }
    }

    asteroidCollision(target, asteroid) {
        this.sndDestroyed.play();

        target.kill();
        asteroid.kill();

        if (target.key == this.Config.graphicAssets.shipsheet.name) {
            this.ship.destroyShip();
            this.tf_lives.text = this.ship.lives;
            let explosion = this.explosionLargeGroup.getFirstExists(false);
            explosion.reset(this.ship.x, this.ship.y);
            explosion.animations.play('explode', 30, false, true);
        }

        this.splitAsteroid(asteroid);
        this.updateScore(this.Config.asteroidProperties[asteroid.key].score);

        if (!this.asteroidGroup.countLiving()) {
            this.game.time.events.add(Phaser.Timer.SECOND * this.Config.gameProperties.delayToStartLevel, this.nextLevel, this);
        }

        let explosionGroup = this.Config.asteroidProperties[asteroid.key].explosion + "Group";
        let explosion = this[explosionGroup].getFirstExists(false);
        explosion.reset(asteroid.x, asteroid.y);
        explosion.animations.play('explode', null, false, true);
    }

    splitAsteroid(asteroid) {
        if (this.Config.asteroidProperties[asteroid.key].nextSize) {
            this.createAsteroid(asteroid.x, asteroid.y, this.Config.asteroidProperties[asteroid.key].nextSize, this.Config.asteroidProperties[asteroid.key].pieces);
        }
    }

    updateScore(score) {
        this.score += score;
        this.tf_score.text = this.score;
    }

    nextLevel() {
        this.asteroidGroup.removeAll(true);

        if (this.asteroidsCount < this.Config.asteroidProperties.maxAsteroids) {
            this.asteroidsCount += this.Config.asteroidProperties.incrementAsteroids;
        }

        this.resetAsteroids();
    }

    update() {

        this.checkPlayerInput();
        this.checkBoundaries(this.ship);
        this.bulletGroup.forEachExists(this.checkBoundaries, this);
        this.asteroidGroup.forEachExists(this.checkBoundaries, this);

        this.game.physics.arcade.overlap(this.bulletGroup, this.asteroidGroup, this.asteroidCollision, null, this);

        if (!this.ship.invulnerable) {
            game.physics.arcade.overlap(this.ship, this.asteroidGroup, this.asteroidCollision, null, this);
        }

    }
}

export default Play;
