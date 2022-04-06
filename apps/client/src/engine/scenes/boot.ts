import mapData from 'shared/maps/overworld.json'
import { uiState } from '~/state'
export default class BootScene extends Phaser.Scene{
    preload(){
      this.load.image('grasslandTiles', "/maps/overworld/Grassland_extruded.png")
      this.load.image('woodlandTiles', "/maps/overworld/Woodland_extruded.png")
      this.load.spritesheet('bush',"/maps/overworld/objects/bush1A.png",{frameWidth:32,frameHeight:32,endFrame:10})
      this.load.spritesheet('Tree_bright',"/maps/overworld/objects/tree1A.png",{frameWidth:64,frameHeight:128})
      this.load.spritesheet('Tree_desert',"/maps/overworld/objects/tree2a.png",{frameWidth:64,frameHeight:96})
      this.load.image('wooden_axe','/items/wooden_axe.png')
      this.load.image('wooden_sword','/items/wooden_sword.png')
      this.load.image('wooden_pickaxe','/items/wooden_pickaxe.png')
      this.load.tilemapTiledJSON('overworldMap', mapData)
      this.load.image('craftbench',"/maps/overworld/buildings/craftbench.png")
      this.load.once('complete',()=>{
        uiState.loaded = true
      })
    }
    create(){
    }
}