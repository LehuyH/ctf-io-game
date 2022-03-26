import ObjectManager from '../logic/ObjectManager'
import ClientRoom  from '../types/ClientRoom'
import ConnectionManagerOffline from '../logic/ConnectionManagerOffline'
import ConnectionManager from '../types/ConnectionManager'
import StateSyncerOffline from '../logic/StateSync'
import ServerEmulator from '../logic/ServerEmulator'
import { setScene } from '~/state'
import BuildingPreview from '../objects/BuildingPreview'

export default class OverworldScene extends Phaser.Scene implements ClientRoom{
    objects: ObjectManager = null as any
    connection:ConnectionManager = null as any
    state:StateSyncerOffline = null as any
    serverEmulator: ServerEmulator = null as any

    preload(){
        this.load.image('grasslandTiles', "/maps/overworld/Grassland_extruded.png")
        this.load.image('woodlandTiles', "/maps/overworld/Woodland_extruded.png")
        this.load.spritesheet('bush',"/maps/overworld/objects/bush1A.png",{frameWidth:32,frameHeight:32,endFrame:10})
        this.load.spritesheet('Tree_bright',"/maps/overworld/objects/tree1A.png",{frameWidth:64,frameHeight:128})
        this.load.spritesheet('Tree_desert',"/maps/overworld/objects/tree2a.png",{frameWidth:64,frameHeight:96})
        this.load.image('wooden_axe','/items/wooden_axe.png')
        this.load.image('wooden_sword','/items/wooden_sword.png')
        this.load.tilemapTiledJSON('overworldMap', "/maps/overworld/overworld.json")
        this.load.image('craftbench',"/maps/overworld/buildings/craftbench.png")
    }
    create(){
        this.objects = new ObjectManager(this)
        this.connection = new ConnectionManagerOffline(this)
        this.state = new StateSyncerOffline(this)
        this.serverEmulator = new ServerEmulator(this)

        this.connection.create()

        this.buildLayers()
        this.buildAnimations()

        this.state.mockGame()

        this.cameras.main.roundPixels = true

        setScene(this)

        //Setup UI neccesities
        const buildingPreview = new BuildingPreview(this)
        this.objects.addObject(buildingPreview)

    }

    update(time: number, delta: number): void {
        this.serverEmulator?.update(delta)
        this.objects.update(time, delta)
        this.connection.update(time, delta)
    }

    buildLayers(){
        const map = this.make.tilemap({key: 'overworldMap'})
        const grasslandSet = map.addTilesetImage('Grassland','grasslandTiles',undefined,undefined,1,2)
        const woodlandSet = map.addTilesetImage('Woodland','woodlandTiles',undefined,undefined,1,2)
        const sadSet = map.addTilesetImage('Sad','grasslandTiles',undefined,undefined,1,2)
        
        const ocean = map.createLayer("Ocean", woodlandSet, 0, 0)
        const middle = map.createLayer("IntGrid_WT", [woodlandSet,grasslandSet], 0, 0)
        const top = map.createLayer("Woodland",woodlandSet, 0, 0)
        const collisions = map.createLayer("COLLISIONS")
        
        collisions.setCollisionByExclusion([-1])
        this.matter.world.convertTilemapLayer(collisions)

        //Add harvestables
        const harvestables = map.getObjectLayer("HARVESTABLES")
        this.state.insertMapHarvestables(harvestables.objects as any)
    }

    buildAnimations(){
        this.anims.create({
            key: "bush-idle",
            frames: this.anims.generateFrameNumbers("bush", {start: 0, end: 9}),
            repeat: -1,
            frameRate: 10
        })
        this.anims.create({
            key: "tree-bright-idle",
            frames: this.anims.generateFrameNumbers("Tree_bright",{start:0,end:9}),
            repeat: -1,
            frameRate: 10
        })
        this.anims.create({
            key: "tree-desert-idle",
            frames: this.anims.generateFrameNumbers("Tree_desert",{start:0,end:9}),
            repeat: -1,
            frameRate: 10
        })
    }
}