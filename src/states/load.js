import Phaser from 'phaser';
import { centerGameObjects } from '../utils';

class Load extends Phaser.State {
    init() {
        // set game Config variable from game cache
        this.Config = this.game.cache.getJSON('config');
    }

    preload() {
        this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg');
        this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar');
        centerGameObjects([this.loaderBg, this.loaderBar]);

        this.game.load.setPreloadSprite(this.loaderBar);

        //
        // Blasteroids assets
        //

        this.game.load.image(this.Config.graphicAssets.asteroidLarge.name, this.Config.graphicAssets.asteroidLarge.URL);
        this.game.load.image(this.Config.graphicAssets.asteroidMedium.name, this.Config.graphicAssets.asteroidMedium.URL);
        this.game.load.image(this.Config.graphicAssets.asteroidSmall.name, this.Config.graphicAssets.asteroidSmall.URL);

        this.game.load.image(this.Config.graphicAssets.bullet.name, this.Config.graphicAssets.bullet.URL);
        this.game.load.image(this.Config.graphicAssets.ship.name, this.Config.graphicAssets.ship.URL);

        this.game.load.audio(this.Config.soundAssets.destroyed.name, this.Config.soundAssets.destroyed.URL);
        this.game.load.audio(this.Config.soundAssets.fire.name, this.Config.soundAssets.fire.URL);

        this.game.load.image(this.Config.graphicAssets.background.name, this.Config.graphicAssets.background.URL);
        this.game.load.spritesheet(this.Config.graphicAssets.explosionLarge.name, this.Config.graphicAssets.explosionLarge.URL, this.Config.graphicAssets.explosionLarge.width, this.Config.graphicAssets.explosionLarge.height, this.Config.graphicAssets.explosionLarge.frames);
        this.game.load.spritesheet(this.Config.graphicAssets.explosionMedium.name, this.Config.graphicAssets.explosionMedium.URL, this.Config.graphicAssets.explosionMedium.width, this.Config.graphicAssets.explosionMedium.height, this.Config.graphicAssets.explosionMedium.frames);
        this.game.load.spritesheet(this.Config.graphicAssets.explosionSmall.name, this.Config.graphicAssets.explosionSmall.URL, this.Config.graphicAssets.explosionSmall.width, this.Config.graphicAssets.explosionSmall.height, this.Config.graphicAssets.explosionSmall.frames);

        this.game.load.atlasJSONHash(this.Config.graphicAssets.shipsheet.name, this.Config.graphicAssets.shipsheet.URL, this.Config.graphicAssets.shipsheet.data);
    }

    create() {
        this.game.state.start('Menu');
    }

}

export default Load;
