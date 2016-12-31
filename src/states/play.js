/* globals __DEV__ */
import Phaser from 'phaser';
import Config from '../game.config.json';
import Ship from '../sprites/Ship';

// This is where all the game play code goes.
class Play extends Phaser.State {
    init() {
        Config.gameProperties.screenWidth = this.game.world.width;
        Config.gameProperties.screenHeight = this.game.world.height;
        Config.shipProperties.startX = Config.gameProperties.screenWidth * 0.5;
        Config.shipProperties.startY = Config.gameProperties.screenHeight * 0.5;
        Config.asteroidProperties.asteroidLarge.nextSize = Config.graphicAssets.asteroidMedium.name;
        Config.asteroidProperties.asteroidMedium.nextSize = Config.graphicAssets.asteroidSmall.name;

        this.bulletInterval = 0;
        this.score = 0;
        this.asteroidsCount = Config.asteroidProperties.startingAsteroids;
        this.shipLives = Config.shipProperties.startingLives;
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
        this.backgroundSprite = this.game.add.sprite(0, 0, Config.graphicAssets.background.name);
        this.backgroundSprite.width = Config.gameProperties.screenWidth;
        this.backgroundSprite.height = Config.gameProperties.screenHeight;

        this.ship = new Ship({
            game: this.game,
            x: this.game.world.centerX,
            y: this.game.world.centerY,
            asset: Config.graphicAssets.shipsheet.name
        });
        this.game.add.existing(this.ship);

        this.bulletGroup = this.game.add.group();
        this.asteroidGroup = this.game.add.group();

        this.tf_lives = this.game.add.text(20, 10, Config.shipProperties.startingLives, Config.fontAssets.playFontStyle);

        this.tf_score = this.game.add.text(Config.gameProperties.screenWidth - 50, 10, "0", Config.fontAssets.playFontStyle);
        this.tf_score.align = 'right';
        this.tf_score.anchor.set(1, 0);

        this.explosionLargeGroup = this.game.add.group();
        this.explosionLargeGroup.createMultiple(20, Config.graphicAssets.explosionLarge.name, 0);
        this.explosionLargeGroup.setAll('anchor.x', 0.5);
        this.explosionLargeGroup.setAll('anchor.y', 0.5);
        this.explosionLargeGroup.callAll('animations.add', 'animations', 'explode', null, 30);

        this.explosionMediumGroup = this.game.add.group();
        this.explosionMediumGroup.createMultiple(20, Config.graphicAssets.explosionMedium.name, 0);
        this.explosionMediumGroup.setAll('anchor.x', 0.5);
        this.explosionMediumGroup.setAll('anchor.y', 0.5);
        this.explosionMediumGroup.callAll('animations.add', 'animations', 'explode', null, 30);

        this.explosionSmallGroup = this.game.add.group();
        this.explosionSmallGroup.createMultiple(20, Config.graphicAssets.explosionSmall.name, 0);
        this.explosionSmallGroup.setAll('anchor.x', 0.5);
        this.explosionSmallGroup.setAll('anchor.y', 0.5);
        this.explosionSmallGroup.callAll('animations.add', 'animations', 'explode', null, 30);
    }

    initSounds() {
        this.sndDestroyed = this.game.add.audio(Config.soundAssets.destroyed.name);
        this.sndFire = this.game.add.audio(Config.soundAssets.fire.name);
    }

    initPhysics() {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);
        this.ship.body.drag.set(Config.shipProperties.drag);
        this.ship.body.maxVelocity.set(Config.shipProperties.maxVelocity);

        this.bulletGroup.enableBody = true;
        this.bulletGroup.physicsBodyType = Phaser.Physics.ARCADE;
        this.bulletGroup.createMultiple(Config.bulletProperties.maxCount, Config.graphicAssets.bullet.name);
        this.bulletGroup.setAll('anchor.x', 0.5);
        this.bulletGroup.setAll('anchor.y', 0.5);
        this.bulletGroup.setAll('lifespan', Config.bulletProperties.lifespan);

        this.asteroidGroup.enableBody = true;
        this.asteroidGroup.physicsBodyType = Phaser.Physics.ARCADE;
    }

    initKeyboard() {
        this.key_left = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.key_right = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.key_thrust = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.key_fire = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    }

    checkPlayerInput() {
        if (this.key_left.isDown) {
            this.ship.body.angularVelocity = -Config.shipProperties.angularVelocity;
        } else if (this.key_right.isDown) {
            this.ship.body.angularVelocity = Config.shipProperties.angularVelocity;
        } else {
            this.ship.body.angularVelocity = 0;
        }

        if (this.key_thrust.isDown) {
            this.game.physics.arcade.accelerationFromRotation(this.ship.rotation, Config.shipProperties.acceleration, this.ship.body.acceleration);
            this.ship.animations.play('thrust');
        } else {
            this.ship.body.acceleration.set(0);
            this.ship.animations.stop();
            this.ship.frame = 0;
        }

        if (this.key_fire.isDown) {
            this.fire();
        }
    }

    checkBoundaries(sprite) {
        if (sprite.x + Config.gameProperties.padding < 0) {
            sprite.x = Config.gameProperties.screenWidth + Config.gameProperties.padding;
        } else if (sprite.x - Config.gameProperties.padding > Config.gameProperties.screenWidth) {
            sprite.x = -Config.gameProperties.padding;
        }

        if (sprite.y + Config.gameProperties.padding < 0) {
            sprite.y = Config.gameProperties.screenHeight + Config.gameProperties.padding;
        } else if (sprite.y - Config.gameProperties.padding > Config.gameProperties.screenHeight) {
            sprite.y = -Config.gameProperties.padding;
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
                bullet.lifespan = Config.bulletProperties.lifespan;
                bullet.rotation = this.ship.rotation;

                this.game.physics.arcade.velocityFromRotation(this.ship.rotation, Config.bulletProperties.speed, bullet.body.velocity);
                this.bulletInterval = this.game.time.now + Config.bulletProperties.interval;
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
            asteroid.body.angularVelocity = this.game.rnd.integerInRange(Config.asteroidProperties[size].minAngularVelocity, Config.asteroidProperties[size].maxAngularVelocity);

            let randomAngle = this.game.math.degToRad(this.game.rnd.angle());
            let randomVelocity = this.game.rnd.integerInRange(Config.asteroidProperties[size].minVelocity, Config.asteroidProperties[size].maxVelocity);

            this.game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, asteroid.body.velocity);
        }
    }

    resetAsteroids() {
        for (let i = 0; i < this.asteroidsCount; i++) {
            let side = Math.round(Math.random());
            let x = 0;
            let y = 1;

            if (side) {
                x = Math.round(Math.random()) * Config.gameProperties.screenWidth;
                y = Math.random() * Config.gameProperties.screenHeight;
            } else {
                x = Math.random() * Config.gameProperties.screenWidth;
                y = Math.round(Math.random()) * Config.gameProperties.screenHeight;
            }

            this.createAsteroid(x, y, Config.graphicAssets.asteroidLarge.name);
        }
    }

    asteroidCollision(target, asteroid) {
        this.sndDestroyed.play();

        target.kill();
        asteroid.kill();

        if (target.key == Config.graphicAssets.shipsheet.name) {
            this.destroyShip();
        }

        this.splitAsteroid(asteroid);
        this.updateScore(Config.asteroidProperties[asteroid.key].score);

        if (!this.asteroidGroup.countLiving()) {
            this.game.time.events.add(Phaser.Timer.SECOND * Config.gameProperties.delayToStartLevel, this.nextLevel, this);
        }

        let explosionGroup = Config.asteroidProperties[asteroid.key].explosion + "Group";
        let explosion = this[explosionGroup].getFirstExists(false);
        explosion.reset(asteroid.x, asteroid.y);
        explosion.animations.play('explode', null, false, true);
    }

    destroyShip() {
        this.shipLives--;
        this.tf_lives.text = this.shipLives

        if (this.shipLives > 0) {
            this.game.time.events.add(Phaser.Timer.SECOND * Config.shipProperties.timeToReset, this.resetShip, this);
        } else {
            this.game.time.events.add(Phaser.Timer.SECOND * Config.shipProperties.timeToReset, this.endGame, this);
        }

        let explosion = this.explosionLargeGroup.getFirstExists(false);
        explosion.reset(this.ship.x, this.ship.y);
        explosion.animations.play('explode', 30, false, true);
    }

    resetShip() {
        this.shipIsInvulnerable = true;
        this.ship.reset(Config.gameProperties.screenWidth / 2, Config.gameProperties.screenHeight / 2);
        this.ship.angle = -90;

        game.time.events.add(Phaser.Timer.SECOND * Config.shipProperties.timeToReset, this.shipReady, this);
        this.game.time.events.repeat(Phaser.Timer.SECOND * Config.shipProperties.blinkDelay, Config.shipProperties.timeToReset / Config.shipProperties.blinkDelay, this.shipBlink, this);
    }

    shipReady() {
        this.shipIsInvulnerable = false;
        this.ship.visible = true;
    }

    shipBlink() {
        this.ship.visible = !this.ship.visible;
    }

    splitAsteroid(asteroid) {
        if (Config.asteroidProperties[asteroid.key].nextSize) {
            this.createAsteroid(asteroid.x, asteroid.y, Config.asteroidProperties[asteroid.key].nextSize, Config.asteroidProperties[asteroid.key].pieces);
        }
    }

    updateScore(score) {
        this.score += score;
        this.tf_score.text = this.score;
    }

    nextLevel() {
        this.asteroidGroup.removeAll(true);

        if (this.asteroidsCount < Config.asteroidProperties.maxAsteroids) {
            this.asteroidsCount += Config.asteroidProperties.incrementAsteroids;
        }

        this.resetAsteroids();
    }

    endGame() {
        this.game.state.start('GameOver');
    }


    update() {

        this.checkPlayerInput();
        this.checkBoundaries(this.ship);
        this.bulletGroup.forEachExists(this.checkBoundaries, this);
        this.asteroidGroup.forEachExists(this.checkBoundaries, this);

        this.game.physics.arcade.overlap(this.bulletGroup, this.asteroidGroup, this.asteroidCollision, null, this);

        if (!this.shipIsInvulnerable) {
            game.physics.arcade.overlap(this.ship, this.asteroidGroup, this.asteroidCollision, null, this);
        }

        // if (this.game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR)) {
        //     this.game.state.start('GameOver');
        // }
    }

    render() {
        if (__DEV__) {
            //this.game.debug.spriteInfo(this.mushroom, 32, 32);
        }
    }
}

export default Play;
