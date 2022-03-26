import Phaser from "phaser"

import BootScene from "./scenes/boot"
import OverworldScene from "./scenes/overworld"

export const game = new Phaser.Game({
    type: Phaser.WEBGL,
    pixelArt: true,
    width: 640,
    height: 360,
    backgroundColor: "black",
    physics:{
        default: 'matter',
        matter:{
            gravity: {
                y: 0
            },
            autoUpdate: false,
            enableSleeping: true
        }
    },
    scale:{
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    canvas: document.querySelector<HTMLCanvasElement>('#game-canvas') || undefined
})


game.scene.add('Boot', BootScene)
game.scene.add('Overworld', OverworldScene)


game.scene.start('Overworld')

//@ts-ignore
window.game = game