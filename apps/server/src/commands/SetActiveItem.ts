import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Client } from "colyseus";

interface IConfig{
    index:number;
    client: Client
}

export class SetActiveItem extends Command<BaseRoom, IConfig> {
    validate({index,client}:IConfig){
        const player = this.state.players.get(client.sessionId)

        if(!player) return false
        if(!player.items[index]) return false

        return true
    }
    execute({index,client}:IConfig){
        const player = this.state.players.get(client.sessionId)
        player.equippedItemIndex = index
    }
}