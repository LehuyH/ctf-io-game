import { Schema, type } from "@colyseus/schema"
import { Bodies } from "matter-js";
import { IState } from "shared";
import { IKingOfTheKillState, ZoneRadius } from "shared/events/kingOfTheHill"
import { ServerEventManager } from "..";
import { ServerBody } from "../../../logic/ServerBody";
import { EventInfo } from "../../../schema/state";

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
    duration = 60 * 1000 * 2;
    zone:Zone
    @type(KingOfTheHillState) data = new KingOfTheHillState({
        x:2700,
        y:2500
    })

    setup(state:IState,world:MatterJS.World){
        
    }
    update(){

    }
    cleanup(){

    }

}