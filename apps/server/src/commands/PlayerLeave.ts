import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Client } from "colyseus";

interface IConfig{
    client: Client
}

export class PlayerLeave extends Command<BaseRoom, IConfig> {
  execute({ client }: IConfig) {
    //Remove player from Physics
    const player = this.state.players.get(client.sessionId);
    this.room.physics.objects.removePlayerBody(player);
    
    //Save player state in storage
    this.room.db.players.savePlayer(player);

    //Remove player from state
    this.state.players.delete(client.sessionId);
  }
}