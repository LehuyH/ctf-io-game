import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Client } from "colyseus";
import { PlayerSummary } from "../schema/state";

interface IConfig{
    client: Client
}

export class LeaveNation extends Command<BaseRoom, IConfig> {
    validate({client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        if(!player) return false

        const nation = this.state.nations.get(player.nationID)
        if(!nation) return false
        
        //Make sure player is in a nation
        if(!player.nationID) return false
        const isInNation = nation.members.findIndex(p=>p.id === player.id) !== -1
        if(!isInNation) return false
        
        return true
    }
    execute({client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        const nation = this.state.nations.get(player.nationID)

        nation.members = nation.members.filter(p=>p.id !== player.id)
        player.nationID = null

        //Remove nation if no one is in it
        if(nation.members.length === 0){
            const nationHQ = [...this.state.buildings.values()].find(b=>b.type === "headquarters" && b.ownerNationID === nation.id)
            nationHQ.ownerNationID = null
            nationHQ.ownerPlayerID = player.id

            this.state.nations.delete(nation.id)
        }
    }
}