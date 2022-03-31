
/** Handles the creation, deletion and syncing of Matter bodies to state */
import { buildings, harvestables } from "../resolvers/ServerObjectResolver";
import { ServerBody } from "../logic/ServerBody";
import { Building, Harvestable, Player } from "../schema/state";
import { IState, IBuilding, IHarvestable, IPlayer } from "shared";
import { Composite } from "matter-js";
import PlayerBody from "../objects/Player.server";

export default class ServerObjects{
    buildings: Record<string,ServerBody> = {};
    harvestables: Record<string,ServerBody> = {};
    world: Matter.World;
    state: IState

    constructor(state: IState,world: Matter.World){
        this.state = state;
        this.world = world;
    }

    insertServerBody(body: ServerBody){
        Composite.add(this.world,body.body);
    }

    removeServerBody(body: ServerBody){
        Composite.remove(this.world,body.body);
    }

    addBuilding(config: IBuilding){
        const body = buildings[config.type]
        if(!body) return;
        
        const serverBody = new body(config);
        //Add body ref to objects
        this.buildings[config.id] = serverBody;
        //Add state ref
        this.state.buildings[config.id] = new Building(config);
        //Add body to world for physics
        this.insertServerBody(serverBody)
    }

    addHarvestable(config: IHarvestable){
        const body = harvestables[config.type]
        if(!body) return;
        
        const serverBody = new body(config);
        //Add body ref to objects
        this.harvestables[config.id] = serverBody;
        //Add state ref
        this.state.harvestables[config.id] = new Harvestable(config);
        //Add body to world for physics
        this.insertServerBody(serverBody)
    }
    /** Gives a player in the server state a body */
    addPlayerBody(player: Player){
        const body = new PlayerBody(player);
        player.body = body;
        this.insertServerBody(body);
    }

    /** Removes a player's body */
    removePlayerBody(player: Player){
        this.removeServerBody(player.body);
        player.body = null;
    }

    removeBuilding(id: string){
        const body = this.buildings[id];
        if(!body) return;

        body.cleanup && body.cleanup(this.state)
        delete this.buildings[id];
        delete this.state.buildings[id];
    }

    removeHarvestable(id: string){
        const body = this.harvestables[id];
        if(!body) return;

        body.cleanup && body.cleanup(this.state)
        delete this.harvestables[id];
        delete this.state.harvestables[id];
    }

    removeBody(type:string,id: string){
        if(type === "buildings"){
            this.removeBuilding(id);
        }else if(type === "harvestables"){
            this.removeHarvestable(id);
        }
    }
    
    update(delta: number){
        const updateQueue = ["buildings","harvestables"] as any[]

        //Update players
        this.state.players.forEach((player:Player)=>{
            if(!player.body) return;
            player.body.update(delta,this.state);
        })
        
        //Runs down each type of object
        updateQueue.forEach(type=>{
            const manager = this as any
            const objects = manager[type]
            //Loops through each object
            for(const id in objects){
                const object = objects[id]
                if(!object.update) continue;
                object.update(delta,this.state)
            }
        })
    }

    sync(){
        const syncQueue = ["buildings","harvestables"] as any[]

        //Sync players
        this.state.players.forEach((player:Player)=>{
            if(!player.body) return;
            player.body.sync(this.state);
        })

        //Runs down each type of object
        syncQueue.forEach(type=>{
            const manager = this as any
            const objects = manager[type]
            //Loops through each object
            for(const id in objects){
               const object = objects[id]
               if(!object.sync) continue;
               object.sync(this.state)
            }
        })  

    }

}