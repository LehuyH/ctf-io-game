import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import buildingsData from 'shared/data/buildings.json'
import buildingBodies from 'shared/bodies'
import { canPay, processPay } from "shared/helpers";
import uniqid from 'uniqid'

interface IConfig{
    type:string;
    playerID: string;
    x: number;
    y: number;
}

export class Build extends Command<BaseRoom, IConfig> {
    validate({ type,playerID,x,y }:IConfig) {
        const building = buildingsData.find(b=>b.type===type)
        const player = this.room.state.players.get(playerID)
        if(!building || !player) return false

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
    execute({ type,playerID,x,y }:IConfig){
        const building = buildingsData.find(b=>b.type===type)
        const player = this.room.state.players.get(playerID)
        const cost = building.cost

        processPay(cost,player.inventory as any)

        this.room.physics.objects.addBuilding({
            id: uniqid(),
            type,
            x,
            y,
            ownerID: playerID,
            health: building.maxHealth,
            maxHealth: building.maxHealth,
        })
    }
}