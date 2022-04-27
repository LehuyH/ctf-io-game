import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { events } from "../resolvers/ServerObjectResolver";

export class QueueGameEvent extends Command<BaseRoom> {
    validate(){
        return !this.state.currentEvent
    }
    execute(){
       const allEvents = Object.values(events)

       //Select random event
       const event = allEvents[Math.floor(Math.random()*allEvents.length)]

       this.state.currentEvent = new event()
    }
}