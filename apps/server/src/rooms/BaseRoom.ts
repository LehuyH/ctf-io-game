import { Room, Client } from "colyseus";
import ServerPhysics from "../logic/ServerPhysics";
import { ServerState } from "../schema/state";
import { Dispatcher } from "@colyseus/command";
import overworldMapJSON from 'shared/maps/overworld.json';

import { PlayerJoin } from "../commands/PlayerJoin";
import { PlayerLeave } from "../commands/PlayerLeave";
import { PlayerStartMove } from "../commands/PlayerStartMove";
import { PlayerStopMove } from "../commands/PlayerStopMove";
import { UseActiveTool } from "../commands/UseActiveTool";
import { Build } from "../commands/Build";
import { CraftItem } from "../commands/CraftItem";
import { SetActiveItem } from "../commands/SetActiveItem";
import { CreateParty } from "../commands/CreateParty";
import { RequestJoinParty } from "../commands/RequestJoinParty";
import { AcceptJoinRequest } from "../commands/AcceptJoinRequest";
import { RejectJoinRequest } from "../commands/RejectJoinRequest";
import { LeaveParty } from "../commands/LeaveParty";
import { BuildCivs } from "../commands/BuildCivs";
import { StealPoints } from "../commands/StealPoints";
import { DepositPoints } from "../commands/DepositPoints";
import { QueueGameEvent } from "../commands/QueueGameEvent";

import { EventType } from "shared";
import Database from "../logic/Database";

export class BaseRoom extends Room<ServerState> {
  physics: ServerPhysics;
  dispatcher = new Dispatcher(this);
  db = new Database();
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

    //Build civs
    this.dispatcher.dispatch(new BuildCivs());

    //Queue First Event
    this.dispatcher.dispatch(new QueueGameEvent())

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

    this.onMessage(EventType.UseActiveTool, (client, message) => {
      this.dispatcher.dispatch(new UseActiveTool(), {
        client: client
      })
    });

    this.onMessage(EventType.Build, (client, message) => {
      this.dispatcher.dispatch(new Build(), {
        type: message.type,
        client,
        x: message.x,
        y: message.y
      })
    });

    this.onMessage(EventType.CraftItem, (client, message) => {
      this.dispatcher.dispatch(new CraftItem(), {
        client,
        itemName: message.itemName,
        buildingName: message.buildingName
      })
    });

    this.onMessage(EventType.SetActiveItem, (client, message) => {
      this.dispatcher.dispatch(new SetActiveItem(), {
        client,
        index: message.index
      })
    })

    this.onMessage(EventType.CreateParty, (client, message) => {
      this.dispatcher.dispatch(new CreateParty(), {
        client,
        name: message.name
      })
    })

    this.onMessage(EventType.RequestJoinParty, (client, message) => {
      this.dispatcher.dispatch(new RequestJoinParty(), {
        client,
      partyID: message.partyID
      })
    })

    this.onMessage(EventType.AcceptJoinParty, (client, message) => {
      this.dispatcher.dispatch(new AcceptJoinRequest(), {
        client,
        playerID: message.playerID
      })
    })

    this.onMessage(EventType.RejectJoinParty, (client, message) => {
      this.dispatcher.dispatch(new RejectJoinRequest(), {
        client,
        playerID: message.playerID
      })
    })

    this.onMessage(EventType.LeaveParty, (client) => {
      this.dispatcher.dispatch(new LeaveParty(), {
        client
      })
    })

    this.onMessage(EventType.StealPoints, (client) => {
      this.dispatcher.dispatch(new StealPoints(), {
        client
      })
    })

    this.onMessage(EventType.DepositPoints, (client) => {
      this.dispatcher.dispatch(new DepositPoints(), {
        client
      })
    })
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    this.dispatcher.dispatch(new PlayerJoin(),{
      name: options.name,
      authID: options.authID,
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
