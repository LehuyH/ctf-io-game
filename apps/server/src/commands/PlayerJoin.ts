import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Item, Player } from "../schema/state";
import { Client } from "colyseus";
import { ItemType } from 'shared'

interface IConfig{
    name:string;
    client: Client
}

export class PlayerJoin extends Command<BaseRoom, IConfig> {
  execute({ name, client }: IConfig) {
    //Add player to state
    this.state.players.set(client.sessionId, new Player({
        name,
        id: client.sessionId,
        x: 2752,
        y: 2752,
        equippedItemIndex: 0,
    }));
    const newPlayer = this.state.players.get(client.sessionId);
    newPlayer.items.push(new Item({
      name: "Wooden Axe",
      type: ItemType.AXE,
      texture: "wooden_axe",
      damage:10
   }))
    //Add player to physics
    this.room.physics.objects.addPlayerBody(this.state.players.get(client.sessionId) as Player);
  }
}