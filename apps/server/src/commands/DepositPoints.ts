import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Client } from "colyseus";

interface IConfig{
    client: Client
}

export class DepositPoints extends Command<BaseRoom, IConfig> {
    validate({client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        if(!player) return false
        
        //Player must be holding points
        if(!player.inventory.get("influencePoints")) return false

        //Check if player is next to their team's headquarters
        const collidedHQ = this.room.physics.getCollisions(`player-${client.sessionId}`).find(c=>c.endsWith("headquarters"))
        if(!collidedHQ) return false

        const hqState = this.state.buildings.get(collidedHQ.split("-")[1])
        if(hqState.ownerCivID !== player.civID) return false
        
        return true
    }

    execute({client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        const collidedHQ = this.room.physics.getCollisions(`player-${client.sessionId}`).find(c=>c.endsWith("headquarters"))
        const hqState = this.state.buildings.get(collidedHQ.split("-")[1])
        const civ = this.state.civs.get(hqState.ownerCivID)

        civ.influence += player.inventory.get("influencePoints")
        player.inventory.set("influencePoints",0)
        player.heldPointsOrigin = {}
    }
}