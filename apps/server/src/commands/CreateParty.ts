import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Client } from "colyseus";
import { Party, PlayerSummary } from "../schema/state";
import uniqid from "uniqid";

interface IConfig{
    name:string;
    client: Client
}

export class CreateParty extends Command<BaseRoom, IConfig> {
    validate({name,client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        if(!player) return false

        //Already in a party
        if(player.partyID) return false

        //Between 3-12 characters alphanumeric
        if(name.length < 3 || name.length > 20) return false

        //Check if name is taken
        const nameTaken = Array.from(this.state.parties.values()).some(n=>n.name.toLowerCase().trim() === name.toLowerCase().trim())
        if(nameTaken) return false

        return true
    }
    execute({name,client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        
        //Add party to state
        const partyID = uniqid()
        const party = new Party({
            name,
            id: partyID,
            partyLeaderPublicID: player.publicID
        })
        party.members.push(
            new PlayerSummary({
                name: player.name,
                publicID: player.publicID
            })
        )
        this.state.parties.set(partyID,party)

        //Add party to player
        player.partyID = partyID
    }
}