import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Client } from "colyseus";
import { PlayerSummary } from "../schema/state";

interface IConfig{
    partyID:string;
    client: Client
}

export class RequestJoinParty extends Command<BaseRoom, IConfig> {
    validate({partyID,client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        const party = this.state.parties.get(partyID)

        if(!player || !party) return false
        
        //Already in a party
        if(player.partyID) return false

        //Request already exists
        const requestExists = party.joinRequests.some(p=>p.publicID === player.publicID)
        if(requestExists) return false
        
        return true
    }
    execute({partyID,client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        const party = this.state.parties.get(partyID)

        party.joinRequests.push(new PlayerSummary({
            name: player.name,
            publicID: player.publicID
        }))
    }
}