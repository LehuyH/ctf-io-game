/** Handles the creation, deletion and syncing of Matter bodies to state */
import { buildings, harvestables } from "../resolvers/ServerObjectResolver";
import { ServerBody } from "../logic/ServerBody";
import { Building, Harvestable, Player, ServerState } from "../schema/state";
import { IState, IBuilding, IHarvestable, IPlayer } from "shared";
import { Composite, Constraint } from "matter-js";
import PlayerBody from "../objects/Player.server";
import { ServerEventManager } from "../objects/events";
import ServerPhysics from "./ServerPhysics";

export default class ServerObjects{
    buildings: Record<string,ServerBody> = {};
    harvestables: Record<string,ServerBody> = {};
    world: Matter.World;
    state: IState;
    physics: ServerPhysics;

    constructor(state: IState,world: Matter.World,physics:ServerPhysics){
        this.state = state;
        this.world = world;
        this.physics = physics;
    }

    removeServerBody(body: ServerBody){
        Composite.remove(this.world,body.body);
    }

    addBuilding(config: IBuilding){
        const body = buildings[config.type]
        if(!body) return;
        
        const serverBody = new body(config,this.world);
        //Add body ref to objects
        this.buildings[config.id] = serverBody;
        //Add state ref
        this.state.buildings[config.id] = new Building(config);
    }

    addHarvestable(config: IHarvestable){
        const body = harvestables[config.type]
        if(!body) return;
        
        const serverBody = new body(config,this.world);
        //Add body ref to objects
        this.harvestables[config.id] = serverBody;
        //Add state ref
        this.state.harvestables[config.id] = new Harvestable(config);
    }
    /** Gives a player in the server state a body */
    addPlayerBody(player: Player){
        const body = new PlayerBody(player,this.world);
        player.body = body;


        //Connect to collider
        const constraint = Constraint.create({
            bodyA: body.interactBody,
            bodyB: body.body 
        })
        Composite.add(this.world,body.interactBody);
        Composite.add(this.world,constraint);
    }

    startGameEvent(eventManager:ServerEventManager<any>){
        this.state.currentEvent = eventManager
        this.state.currentEvent.setup(this.state,this.world,this.physics)
    }

    /** Removes a player's body */
    removePlayerBody(player: Player){
        this.removeServerBody(player.body);
        player.body = null;
    }

    removeBuilding(id: string){
        const body = this.buildings[id];
        if(!body) return;

        body.cleanup(this.state,this.world)
        delete this.buildings[id];
        (this.state as ServerState).buildings.delete(id);
    }

    removeHarvestable(id: string){
        const body = this.harvestables[id];
        if(!body) return;

        body.cleanup(this.state,this.world)
        delete this.harvestables[id];
        (this.state as ServerState).harvestables.delete(id);
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

        this.state.currentEvent?.update(this.state,this.world,this.physics)
        
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