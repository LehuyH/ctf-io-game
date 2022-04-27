import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { events } from "../resolvers/ServerObjectResolver";
import { Wait } from "./Wait";
import { StopGameEvent } from "./StopGameEvent";

export class QueueGameEvent extends Command<BaseRoom> {
    validate(){
        return !this.state.currentEvent
    }
    execute():any{
       const allEvents = Object.values(events)

       //Select random event
       const event = allEvents[Math.floor(Math.random()*allEvents.length)]
       const newEvent = new event()
       this.room.physics.objects.startGameEvent(newEvent)

       return[
           new Wait().setPayload(newEvent.duration),
           new StopGameEvent()
       ]
    }
}