import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Client } from "colyseus";
import { PlayerSummary } from "../schema/state";

interface IConfig{
    playerID:string;
    client: Client
}

export class RejectJoinRequest extends Command<BaseRoom, IConfig> {
    validate({playerID,client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        if(!player) return false
        const nation = this.state.nations.get(player.nationID)
        if(!nation) return false

        //Confirm that player is part of the nation
        if(nation.members.findIndex(p=>p.id === player.id) === -1) return false

        //Confirm that request exists
        const requestExists = nation.joinRequests.some(p=>p.id === playerID)
        console.log("SEESH")
        return requestExists
    }
    execute({playerID,client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        const nation = this.state.nations.get(player.nationID)

        //Remove request to this nations
        nation.joinRequests = nation.joinRequests.filter(p=>p.id !== playerID)
    }
}