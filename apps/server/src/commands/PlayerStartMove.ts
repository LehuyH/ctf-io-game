import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Client } from "colyseus";

interface IConfig{
    dir:'left'|'right'|'up'|'down';
    client: Client;
}

export class PlayerStartMove extends Command<BaseRoom, IConfig> {
  execute({ client, dir }: IConfig) {
    const player = this.state.players.get(client.sessionId);
    player.move[dir] = true;
  }
}