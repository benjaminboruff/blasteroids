import Phaser from 'phaser'

class Ship extends Phaser.Sprite {

  constructor ({ game, x, y, asset }) {
    super(game, x, y, asset)

    this.game = game
    this.anchor.set(0.65,0.5)
    this.angle = -90;
    this.animations.add('thrust', [4, 3, 2, 1, 0], 6, true);
  }

  // update () {
  //   this.angle += 1
  // }

}

export default Ship;
