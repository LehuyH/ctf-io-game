import { Schema, type } from "@colyseus/schema"
import Matter, { Bodies } from "matter-js";
import { IState } from "shared";
import { IKingOfTheKillState, ZoneRadius } from "shared/events/kingOfTheHill"
import { parseID } from "shared/helpers";
import { ServerEventManager } from "..";
import { ServerBody } from "../../../logic/ServerBody";
import ServerPhysics from "../../../logic/ServerPhysics";
import { EventInfo, ServerState } from "../../../schema/state";

export class KingOfTheHillState extends Schema implements IKingOfTheKillState{
    @type("number") x:number;
    @type("number") y:number;
}

export class Zone extends ServerBody{
    constructor(data:IKingOfTheKillState,world:Matter.World){
        const body = Bodies.circle(data.x,data.y,ZoneRadius,{
            isSensor: true,
            label: "event-zone"
        })
        super("event-zone",body,world)
    }
}

export class KingOfTheHillServer extends EventInfo<KingOfTheHillState> implements ServerEventManager<KingOfTheHillState>{
    name = "King Of The Hill";
    id = "kingOfTheHill";
    description = "Contest the zone on the map to earn points for your civilization!";
    duration = 60 * 1000 * 1;
    zone:Zone
    world:Matter.World
    state:IState
    stopCheckPlayerLoop: ()=>void
    @type(KingOfTheHillState) data = new KingOfTheHillState({
        x:2700,
        y:2500
    })

    setup(state:ServerState,world:Matter.World,physics:ServerPhysics){
        this.world = world
        this.state = state
        this.zone = new Zone(this.data,world)
        this.stopCheckPlayerLoop = physics.runner.addRepeatedCallback((delta)=>{
            const collidedPlayers = Object.entries(physics.collisions).map(([playerID,collisions])=>{
                return{
                    playerID,
                    collisions
                }
            })
            .filter(e=>e.playerID.startsWith("player-") && !e.playerID.endsWith("-collider") && e.collisions.includes("event-zone"))

            //Give them points if in hill
            collidedPlayers.forEach(e=>{
                const player = state.players.get(parseID(e.playerID))
                if(!player) return
                const civ = state.civs.get(player.civID)
                civ.influence += 1
            })

            this.duration -= 1000

        },1000)
    }
    cleanup(){
        this.zone.cleanup(this.state,this.world)
        this.stopCheckPlayerLoop()
    }
    update(){}
}