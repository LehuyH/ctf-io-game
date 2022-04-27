import { IEventInfo } from "shared"
import ClientRoom from "~/engine/types/ClientRoom";

export abstract class ClientEventManager<T> implements IEventInfo<T>{
    abstract name:string;
    abstract description: string;
    abstract duration: number;
    abstract id: string;
    abstract setup: ()=>void;
    abstract update: (time:number,delta:number)=>void;
    abstract cleanup: ()=>void;
    abstract data: T;
    abstract scene: ClientRoom;
}