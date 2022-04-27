import { Command } from "@colyseus/command";
import { BaseRoom } from "../rooms/BaseRoom";
import { Wait } from "./Wait";
import { QueueGameEvent } from "./QueueGameEvent";

export class StopGameEvent extends Command<BaseRoom> {
    validate(){
        return !!this.state.currentEvent
    }
    execute():any{
       //@ts-ignore
       this.state.currentEvent.cleanup()
       this.state.currentEvent = null
       return[
           new Wait().setPayload(1* 60 * 1000),
           new QueueGameEvent()
       ]
    }
}