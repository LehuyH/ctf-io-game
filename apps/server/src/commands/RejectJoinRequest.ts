import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Client } from "colyseus";

interface IConfig{
    playerID:string;
    client: Client
}

export class RejectJoinRequest extends Command<BaseRoom, IConfig> {
    validate({playerID,client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        if(!player) return false

        const party = this.state.parties.get(player.partyID)
        if(!party) return false

        //Confirm that player is party leader
        if(player.publicID !== party.partyLeaderPublicID) return false

        //Confirm that request exists
        const requestExists = party.joinRequests.some(p=>p.publicID === playerID)
        return requestExists
    }
    execute({playerID,client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        const party = this.state.parties.get(player.partyID)

        //Remove request to this party
        party.joinRequests = party.joinRequests.filter(p=>p.publicID !== playerID)
    }
}