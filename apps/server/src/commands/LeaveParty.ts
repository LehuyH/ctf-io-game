import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Client } from "colyseus";

interface IConfig{
    client: Client
}

export class LeaveParty extends Command<BaseRoom, IConfig> {
    validate({client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        if(!player) return false

        const party = this.state.parties.get(player.partyID)
        if(!party) return false
        
        //Make sure player is in a party
        if(!player.partyID) return false
        const isInParty = party.members.findIndex(p=>p.publicID === player.publicID) !== -1
        if(!isInParty) return false
        
        return true
    }
    execute({client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        const party = this.state.parties.get(player.partyID)

        party.members = party.members.filter(p=>p.publicID !== player.publicID)
        player.partyID = null

        //Remove party if no one is in it
        if(party.members.length === 0){
            this.state.parties.delete(party.id)
        }else{
            //Reassign leader if leader leaves
            if(player.publicID === party.partyLeaderPublicID){
                party.partyLeaderPublicID = party.members[0].publicID
            }
        }
    }
}