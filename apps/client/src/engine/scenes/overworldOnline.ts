import ObjectManager from '../logic/ObjectManager'
import ClientRoom  from '../types/ClientRoom'
import ConnectionManagerOnline from '../logic/ConnectionManagerOnline'
import ConnectionManager from '../types/ConnectionManager'
import StateSyncerOffline from '../logic/StateSync'
import { setScene } from '~/state'
import BuildingPreview from '../objects/BuildingPreview'
import TileStorage from 'shared/helpers/tiles'
import Runner from 'shared/physics/runner'

export default class OverworldSceneOnline extends Phaser.Scene implements ClientRoom{
    objects: ObjectManager = null as any
    connection:ConnectionManager = null as any
    state:StateSyncerOffline = null as any
    runner: Runner = null as any
    create(){
        this.objects = new ObjectManager(this)
        this.state = new StateSyncerOffline(this)
        this.connection = new ConnectionManagerOnline(this)
        

        this.connection.create()

        this.buildLayers()
        this.buildAnimations()
        setScene(this)

        //Setup UI neccesities
        const buildingPreview = new BuildingPreview(this)
        this.objects.addObject(buildingPreview)
        this.runner = new Runner(this.matter.world,this.state.state)
    }

    update(time: number, delta: number): void {
        this.connection.update(time, delta)
        this.objects.update(time, delta)
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
        this.anims.create({
            key: "male_player_1_walkX",
            frames: this.anims.generateFrameNumbers("male_player_1",{start:4,end:6}),
            frameRate:10
        })
        this.anims.create({
            key: "male_player_1_walkDown",
            frames: this.anims.generateFrameNumbers("male_player_1",{start:12,end:14}),
            frameRate:10
        })
        this.anims.create({
            key: "male_player_1_walkUp",
            frames: this.anims.generateFrameNumbers("male_player_1",{start:18,end:22}),
            frameRate:10
        })
        this.anims.create({
            key: "male_player_1_idle",
            frames: this.anims.generateFrameNumbers("male_player_1",{start:1,end:3}),
            frameRate:10
        })
        this.anims.create({
            key:"campfire_idle",
            frames: this.anims.generateFrameNumbers("campfire",{start:0,end:5}),
            repeat: -1,
            frameRate:10
        })
    }
}