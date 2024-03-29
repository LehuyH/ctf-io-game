import ObjectManager from '../logic/ObjectManager'
import ClientRoom  from '../types/ClientRoom'
import ConnectionManagerOffline from '../logic/ConnectionManagerOffline'
import ConnectionManager from '../types/ConnectionManager'
import StateSyncerOffline from '../logic/StateSync'
import ServerEmulator from '../logic/ServerEmulator'
import { setScene } from '~/state'
import BuildingPreview from '../objects/BuildingPreview'
import TileStorage from 'shared/helpers/tiles'

export default class OverworldScene extends Phaser.Scene implements ClientRoom{
    objects: ObjectManager = null as any
    connection:ConnectionManager = null as any
    state:StateSyncerOffline = null as any
    serverEmulator: ServerEmulator = null as any
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

        //Sync to TileStorage
        this.serverEmulator.tiles = new TileStorage(map.layers[0].width,map.layers[0].height,32)
        this.serverEmulator.tiles.importMapPhaser(map)

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