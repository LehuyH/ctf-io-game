import { IPlayer, IHarvestable, PlayerState, PlayerAnimState, ItemType } from 'shared'
import { reactive, watch } from 'vue'
import ClientRoom from '../types/ClientRoom'
import uniqid from 'uniqid'
import { IState, state, resetState, setLocalPlayerID } from '~/state'

export default class StateSyncerOffline {
    state: IState
    scene: ClientRoom
    constructor(scene: ClientRoom) {
        resetState()
        this.scene = scene
        this.state = state
        //Setup Watchers to sync with game objects
        watch(()=>this.state.players,()=>{
            this.verifyType("players",this.scene.objects.players)
        },{deep:true})

        watch(()=>this.state.harvestables,()=>{
            this.verifyType("harvestables",this.scene.objects.harvestables)
        },{deep:true})

        watch(()=>this.state.buildings,()=>{
            this.verifyType("buildings",this.scene.objects.buildings)
        },{deep:true})
    }

    getState<T = any>(type:string,id:string){
        let parsedID = id
        if(id.includes('-')){
            parsedID = id.split('-')[1]
        }

        return (this as any).state[type][parsedID] as T
    }

    removeState<T = any>(type:string,id:string){
        let parsedID = id
        if(id.includes('-')){
            parsedID = id.split('-')[1]
        }

        delete (this as any).state[type][parsedID]
    }

    getPlayer(id:string){
        return this.state.players[id]
    }

    mockGame(){
        this.state.players['a'] = {
            id: 'a',
            x: 2752,
            y: 2752,
            speed:5,
            health: 100,
            maxHealth: 100,
            state: PlayerState.IDLE,
            anim: PlayerAnimState.IDLE,
            velocityX: 0,
            velocityY: 0,
            inventory: {},
            equippedItemIndex: 0,
            items:[{
                name: "Wooden Axe",
                type: ItemType.AXE,
                texture: "wooden_axe",
                damage:10
            },{
                name: "Wooden Sword",
                type: ItemType.SWORD,
                texture: "wooden_sword",
                damage:10
            }]
        }
        setLocalPlayerID('a')
    }

    insertMapHarvestables(objects:Phaser.Types.Tilemaps.TiledObject[]){
        objects.forEach(o=>{
            const id = uniqid()
            const health = o.properties.find((p:any)=>p.name==='health').value as number
            const value = o.properties.find((p:any)=>p.name==='value').value as number
            const resource = o.properties.find((p:any)=>p.name==='resource').value as string

            this.scene.state.state.harvestables[id] = {
                id,
                x: o.x as number,
                y: o.y as number,
                health,
                maxHealth:health,
                type: o.name,
                value,
                resource
            }
        })
    }

    /** Handles the creation and deletion of objects based on state */
    verifyType(type:string,objects:Record<string,any>) {
        const state = (this as any).state[type]
        
        const creatorFunctions = {
            players: 'createPlayer',
            harvestables: 'createHarvestable',
            buildings: 'createBuilding'
        } as Record<string,any>
        
        //Create object locally if it does not exist
        Object.values(state).forEach((ref:any)=>{
            if(!objects[ref.id]){
                (this.scene.objects as any)[creatorFunctions[type]](ref)
            }
        })

        //Remove object locally if it does not exist
        Object.keys(objects).forEach(id=>{
            if(!state[id]){
                objects[id].cleanup()
                delete objects[id]
            }
        })
    }
}