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

    //Remove player from party
    const party = this.state.parties.get(player.partyID);
    if (party) {
      party.members = party.members.filter(p => p.publicID !== player.publicID);
      if (party.members.length === 0) {
        this.state.parties.delete(player.partyID);
      }
    }

    //Remove player from civ
    const civ = this.state.civs.get(player.civID);
    civ.members = civ.members.filter(p => p.publicID !== player.publicID);
    player.civID = null;

    //Save player state in storage
    this.room.db.players.savePlayer(player);

    //Remove player from state
    this.state.players.delete(client.sessionId);
  }
}