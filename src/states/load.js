import Phaser from 'phaser';
import Config from '../game.config.json';
import { centerGameObjects } from '../utils';

class Load extends Phaser.State {
    init() {

    }

    preload() {
        this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg');
        this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar');
        centerGameObjects([this.loaderBg, this.loaderBar]);

        this.game.load.setPreloadSprite(this.loaderBar);

        //
        // Blasteroids assets
        //

        this.game.load.image(Config.graphicAssets.asteroidLarge.name, Config.graphicAssets.asteroidLarge.URL);
        this.game.load.image(Config.graphicAssets.asteroidMedium.name, Config.graphicAssets.asteroidMedium.URL);
        this.game.load.image(Config.graphicAssets.asteroidSmall.name, Config.graphicAssets.asteroidSmall.URL);

        this.game.load.image(Config.graphicAssets.bullet.name, Config.graphicAssets.bullet.URL);
        this.game.load.image(Config.graphicAssets.ship.name, Config.graphicAssets.ship.URL);

        this.game.load.audio(Config.soundAssets.destroyed.name, Config.soundAssets.destroyed.URL);
        this.game.load.audio(Config.soundAssets.fire.name, Config.soundAssets.fire.URL);

        this.game.load.image(Config.graphicAssets.background.name, Config.graphicAssets.background.URL);
        this.game.load.spritesheet(Config.graphicAssets.explosionLarge.name, Config.graphicAssets.explosionLarge.URL, Config.graphicAssets.explosionLarge.width, Config.graphicAssets.explosionLarge.height, Config.graphicAssets.explosionLarge.frames);
        this.game.load.spritesheet(Config.graphicAssets.explosionMedium.name, Config.graphicAssets.explosionMedium.URL, Config.graphicAssets.explosionMedium.width, Config.graphicAssets.explosionMedium.height, Config.graphicAssets.explosionMedium.frames);
        this.game.load.spritesheet(Config.graphicAssets.explosionSmall.name, Config.graphicAssets.explosionSmall.URL, Config.graphicAssets.explosionSmall.width, Config.graphicAssets.explosionSmall.height, Config.graphicAssets.explosionSmall.frames);

        this.game.load.atlasJSONHash(Config.graphicAssets.shipsheet.name, Config.graphicAssets.shipsheet.URL, Config.graphicAssets.shipsheet.data);
    }

    create() {
        this.game.state.start('Menu');
    }

}

export default Load;
