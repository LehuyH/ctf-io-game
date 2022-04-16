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

        if(!joiningPlayer){
            //Remove the request to all parties
            this.state.parties.forEach(n=>{
                n.joinRequests = n.joinRequests.filter(p=>p.publicID !== playerID)
            })
        }
        
        if(!player || !joiningPlayer){
            return false
        }
        const party = this.state.parties.get(player.partyID)
        if(!party) return false

        //Player is party leader
        if(party.partyLeaderPublicID !== player.publicID) return false

        //Confirm that player is part of the party
        if(party.members.findIndex(p=>p.publicID === player.publicID) === -1) return false

        //Confirm that request exists
        const requestExists = party.joinRequests.some(p=>p.publicID === playerID)
        
        return requestExists
    }
    execute({playerID,client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        const joiningPlayer = Array.from(this.state.players.values()).find(p=>p.publicID === playerID)
        const party = this.state.parties.get(player.partyID)


        //Remove request to all parties
        this.state.parties.forEach(n=>{
            n.joinRequests = n.joinRequests.filter(p=>p.publicID !== playerID)
        })

        //Add player to party
        party.members.push(new PlayerSummary({
            name: joiningPlayer.name,
            publicID: joiningPlayer.publicID
        }))

        joiningPlayer.partyID = party.id
    }
}