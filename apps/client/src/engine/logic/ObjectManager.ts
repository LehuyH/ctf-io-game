import { IHarvestable,IBuilding, IPlayer } from "shared"
import Harvestable from "../objects/harvestables"
import Player from "../objects/Player"
import ClientRoom from "../types/ClientRoom"
import HarvestableResolver from "../resolvers/HarvestableResolver.client"
import BuildingResolver from "../resolvers/BuildingResolver.client"
import EventResolver from "../resolvers/EventResolver.client"

import { useLocalPlayer, useLocalPlayerID } from "~/state"
import Building from "../objects/buildings"
import { ClientEventManager } from "../objects/events"

export default class ObjectManager{
    scene: ClientRoom
    players: Record<string,Player> = {}
    currentEvent: ClientEventManager<any>|null = null;
    harvestables: Record<string,Harvestable> = {}
    buildings: Record<string,Building> = {}
    localPlayerID: string = ""
    misc: Phaser.GameObjects.GameObject[] = []

    constructor(scene: ClientRoom){
        this.scene = scene
    }

    addObject(object:Phaser.GameObjects.GameObject){
        this.misc.push(object)
        this.scene.add.existing(object)
    }

    createPlayer(config:IPlayer){
       const p = new Player(this.scene, config)
       this.players[p.name] = p
    }

    createHarvestable(harvestable:IHarvestable){
        const h = new HarvestableResolver[harvestable.type](this.scene,harvestable)
        h.create()
        this.harvestables[h.name] = h
    }

    createBuilding(building:IBuilding){
        const b = new BuildingResolver[building.type](this.scene,building)
        b.create()
        this.buildings[b.name] = b
    }

    clearEvent(){
        this.currentEvent?.cleanup()
        this.currentEvent = null
    }

    setEvent(id:string){
        const EventManagerClass = EventResolver[id]
        if(!EventManagerClass) return;
        this.currentEvent = new EventManagerClass(this.scene,this.scene.state.state.currentEvent) as ClientEventManager<any>
        this.currentEvent.setup()
    }

    sync(target:Phaser.GameObjects.GameObject,type:string){
        const targetState = this.scene.state.getState(type,target.name)
        const currentState = target.data.getAll() 
        if(!targetState) return

        //Generate only differences
        const diff = Object.keys(targetState).reduce((acc,key)=>{
            if(targetState[key] !== currentState[key]){
                acc[key] = targetState[key]
            }
            return acc
        },{} as Record<string,any>)

        //If value does not exist in targetState, explicitly set it to null
        for(const key in currentState){
            if(targetState[key] === undefined){
                diff[key] = null
            }
        }

        if(Object.keys(diff).length === 0) return
        if(targetState){
            target.setData(diff)
        }
    }

    get localPlayer(){
        return this.players[useLocalPlayerID()]
    }

    update(time: number, delta: number): void {
        const updateQueue = ["players","harvestables","buildings"] as any[]

        updateQueue.forEach(type=>{
            const manager = this as any
            const objects = manager[type]

            for(const id in objects){
                const object = objects[id]
                this.sync(objects[id],type)
                object.update(time,delta)
            }
        })

        this.misc.forEach(object=>{
            object.update(time,delta)
        })

        this.currentEvent?.update(time,delta)
    }
}