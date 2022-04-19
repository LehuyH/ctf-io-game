import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Client } from "colyseus";

interface IConfig{
    client: Client
}

export class StealPoints extends Command<BaseRoom, IConfig> {
    validate({client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        if(!player) return false
        if(player.isStealing) return false

        //Check if player is next to another team's headquarters
        const collidedHQ = this.room.physics.getCollisions(`player-${client.sessionId}`).find(c=>c.endsWith("headquarters"))

        if(!collidedHQ) return false

        const hqState = this.state.buildings.get(collidedHQ.split("-")[1])
        if(hqState.ownerCivID === player.civID) return false
        
        const enemyCiv = this.state.civs.get(hqState.ownerCivID)
        if(!enemyCiv) return false
        if(enemyCiv.influence === 0) return false
    
        return true
    }

    execute({client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        player.isStealing = true

        const expectedCollidedHQ = this.room.physics.getCollisions(`player-${client.sessionId}`).find(c=>c.endsWith("headquarters"))

        //After 2 seconds, check if player is still next to the same headquarters and steal points
        this.room.physics.runner.addDelayedCallback(()=>{
            const collidedHQ = this.room.physics.getCollisions(`player-${client.sessionId}`).find(c=>c.endsWith("headquarters"))
            const playerExists = this.state.players.get(client.sessionId)
            if(!playerExists) return
            if(collidedHQ === expectedCollidedHQ){
                const hqState = this.state.buildings.get(collidedHQ.split("-")[1])
                const enemyCiv = this.state.civs.get(hqState.ownerCivID)
                if(enemyCiv && enemyCiv.influence > 0){
                    enemyCiv.influence -= 1
                    player.inventory.set("influencePoints",(player.inventory.get("influencePoints") || 0) + 1)

                    if(!player.heldPointsOrigin[enemyCiv.id]){
                        player.heldPointsOrigin[enemyCiv.id] = 0
                    }
                    player.heldPointsOrigin[enemyCiv.id] += 1
                }
            }
            player.isStealing = false
        },2000)
    }
}