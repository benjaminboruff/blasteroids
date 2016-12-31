import Phaser from 'phaser'
import WebFont from 'webfontloader'

class Boot extends Phaser.State {
  init () {
    this.fontsReady = false;
    this.fontsLoaded = this.fontsLoaded.bind(this);
  }

  preload () {
    WebFont.load({
      google: {
        families: ['Roboto']
      },
      active: this.fontsLoaded
    })

    let text = this.add.text(this.world.centerX, this.world.centerY, 'loading fonts', { font: '16px Arial', fill: '#ffffff', align: 'center' });
    text.anchor.set(0.5);

    this.game.load.image('loaderBg', './assets/images/loader-bg.png');
    this.game.load.image('loaderBar', './assets/images/loader-bar.png');

    // load game.config.json into game cache
    this.game.load.json('config','src/game.config.json');
  }

  render () {
    if (this.fontsReady) {
      this.game.state.start('Load');
    }
  }

  fontsLoaded () {
    this.fontsReady = true;
  }

}

export default Boot;
