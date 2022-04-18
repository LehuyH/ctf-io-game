import mapData from 'shared/maps/overworld.json'
import { uiState } from '~/state'
export default class BootScene extends Phaser.Scene{
    preload(){
      this.load.image('grasslandTiles', "/maps/overworld/Grassland_extruded.png")
      this.load.image('woodlandTiles', "/maps/overworld/Woodland_extruded.png")
      this.load.spritesheet('bush',"/maps/overworld/objects/bush1A.png",{frameWidth:32,frameHeight:32,endFrame:10})
      this.load.spritesheet('Tree_bright_0',"/maps/overworld/objects/tree1A.png",{frameWidth:64,frameHeight:128})
      this.load.spritesheet('Tree_bright_1',"/maps/overworld/objects/tree1B.png",{frameWidth:64,frameHeight:96})
      this.load.spritesheet('Tree_desert',"/maps/overworld/objects/tree2a.png",{frameWidth:64,frameHeight:96})
      this.load.spritesheet('male_player_1','/sprites/male_player_1.png',{frameWidth:32,frameHeight:48})
      this.load.image('wooden_axe','/items/wooden_axe.png')
      this.load.image('wooden_sword','/items/wooden_sword.png')
      this.load.image('wooden_pickaxe','/items/wooden_pickaxe.png')
      this.load.tilemapTiledJSON('overworldMap', mapData)
      this.load.image('craftbench',"/maps/overworld/buildings/craftbench.png")
      this.load.image('headquarters',"/maps/overworld/buildings/headquarters.png")
      this.load.spritesheet('campfire',"/maps/overworld/buildings/campfire.png",{frameWidth:32,frameHeight:32})
      this.load.once('complete',()=>{
        uiState.loaded = true
      })
    }
    create(){
    }
}