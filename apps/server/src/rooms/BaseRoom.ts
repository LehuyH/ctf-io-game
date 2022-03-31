import { Room, Client } from "colyseus";
import ServerPhysics from "../logic/ServerPhysics";
import { ServerState } from "../schema/state";
import { Dispatcher } from "@colyseus/command";
import overworldMapJSON from 'shared/maps/overworld.json';

import { PlayerJoin } from "../commands/PlayerJoin";
import { PlayerLeave } from "../commands/PlayerLeave";
import { PlayerStartMove } from "../commands/PlayerStartMove";
import { PlayerStopMove } from "../commands/PlayerStopMove";

import { EventType } from "shared";

export class BaseRoom extends Room<ServerState> {
  physics: ServerPhysics;
  dispatcher = new Dispatcher(this);
  autoDispose = false;

  onCreate(options: any) {
    if (options.key !== process.env.CREATION_KEY) {
      throw new Error("unauthorized");
    }
    this.setMetadata(options.meta)
    this.maxClients = options.maxClients || 40;
    this.setState(new ServerState());
    this.physics = new ServerPhysics(this.state);
    this.physics.loadMapJSON(JSON.stringify(overworldMapJSON));
    this.setSimulationInterval((deltaTime) => this.update(deltaTime), 1000 / 30);


    //Listen to events
    this.onMessage(EventType.PlayerStartMove, (client, message) => {
      this.dispatcher.dispatch(new PlayerStartMove(), {
        dir: message.dir,
        client: client
      })
    });

    this.onMessage(EventType.PlayerStopMove, (client, message) => {
      this.dispatcher.dispatch(new PlayerStopMove(), {
        dir: message.dir,
        client: client
      })
    });
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    this.dispatcher.dispatch(new PlayerJoin(),{
      name: options.name,
      client
    });
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.dispatcher.dispatch(new PlayerLeave(),{
      client
    });
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  update(delta:number){
    //Do not update if the room is empty
    if(Array.from(this.state.players.values()).length === 0) return;

    this.physics.tick(delta);
  }

}