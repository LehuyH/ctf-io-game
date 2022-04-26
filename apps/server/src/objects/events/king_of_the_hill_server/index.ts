import { Schema, type } from "@colyseus/schema"
import { Bodies } from "matter-js";
import { IKingOfTheKillState, ZoneRadius } from "shared/events/kingOfTheHill"
import { ServerEventManager } from "..";
import { ServerBody } from "../../../logic/ServerBody";

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

export class KingOfTheHillServer extends Schema implements ServerEventManager<KingOfTheHillState>{
    @type("string") name = "King Of The Hill";
    @type("string") description = "Contest the zone on the map to earn points for your civilization!";
    @type("number") duration = 60 * 1000 * 2;
    zone:Zone
    @type(KingOfTheHillState) data = new KingOfTheHillState({
        x:2700,
        y:2500
    })

    setup(){
        
    }
    update(){

    }
    cleanup(){

    }

}