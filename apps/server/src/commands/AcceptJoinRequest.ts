import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Client } from "colyseus";
import { PlayerSummary } from "../schema/state";

interface IConfig{
    playerID:string;
    client: Client
}

export class AcceptJoinRequest extends Command<BaseRoom, IConfig> {
    validate({playerID,client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        const joiningPlayer = Array.from(this.state.players.values()).find(p=>p.publicID === playerID)

        if(!player || !joiningPlayer) return false
        const nation = this.state.nations.get(player.nationID)
        if(!nation) return false

        //Confirm that player is part of the nation
        if(nation.members.findIndex(p=>p.publicID === player.publicID) === -1) return false

        //Confirm that request exists
        const requestExists = nation.joinRequests.some(p=>p.publicID === playerID)
        
        return requestExists
    }
    execute({playerID,client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        const joiningPlayer = Array.from(this.state.players.values()).find(p=>p.publicID === playerID)
        const nation = this.state.nations.get(player.nationID)

        //Remove request to all nations
        this.state.nations.forEach(n=>{
            n.joinRequests = n.joinRequests.filter(p=>p.publicID !== playerID)
        })

        //Add player to nation
        nation.members.push(new PlayerSummary({
            name: joiningPlayer.name,
            publicID: joiningPlayer.publicID
        }))
        joiningPlayer.nationID = nation.id
    }
}