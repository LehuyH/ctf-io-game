import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import buildingsData from 'shared/data/buildings.json'
import buildingBodies from 'shared/bodies'
import { canPay, processPay } from "shared/helpers";
import uniqid from 'uniqid'
import { Client } from "colyseus";

interface IConfig{
    type:string;
    client: Client;
    x: number;
    y: number;
}

export class Build extends Command<BaseRoom, IConfig> {
    validate({ type,client,x,y }:IConfig) {
        const building = buildingsData.find(b=>b.type===type)
        const player = this.room.state.players.get(client.sessionId)
        if(!building || !player) return false

        if(type !== 'headquarters' && !player.nationID) return false

        //Only one headquarters per nation
        if(type === 'headquarters'){
            if(player.nationID){
                const nationHQ = [...this.state.buildings.values()].find(b=>b.type === "headquarters" && b.ownerNationID === player.nationID)
                if(nationHQ) return false
            }
        }

        //Check if they have enough resources
        const cost = building.cost
        if(!canPay(cost,player.inventory as any)) return false
        //Check if there is a collision
        const body = buildingBodies[type]({x,y})
        const width = body[2]
        const height = body[3]
        const collision = this.room.physics.checks.collidesWithAny({
            x,
            y,
            width,
            height
        })
        if(collision) return false

        //Check if touches water
        const water = this.room.physics.checks.touchesWater({
            x,
            y,
            width,
            height
        })

        if(water) return false

        return true

    }
    execute({ type,client,x,y }:IConfig){
        const building = buildingsData.find(b=>b.type===type)
        const player = this.room.state.players.get(client.sessionId)
        const cost = building.cost

        processPay(cost,player.inventory as any)

        this.room.physics.objects.addBuilding({
            id: uniqid(),
            type,
            x,
            y,
            ownerPlayerID: client.sessionId,
            ownerNationID: player.nationID,
            health: building.maxHealth,
            maxHealth: building.maxHealth,
        })
    }
}