import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Client } from "colyseus";
import { PlayerSummary } from "../schema/state";

interface IConfig{
    nationID:string;
    client: Client
}

export class RequestJoinNation extends Command<BaseRoom, IConfig> {
    validate({nationID,client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        const nation = this.state.nations.get(nationID)

        if(!player || !nation) return false
        
        //Already in a nation
        if(player.nationID) return false

        //Request already exists
        const requestExists = nation.joinRequests.some(p=>p.id === player.id)
        if(requestExists) return false
        
        return true
    }
    execute({nationID,client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        const nation = this.state.nations.get(nationID)

        nation.joinRequests.push(new PlayerSummary({
            name: player.name,
            id: player.id
        }))
    }
}